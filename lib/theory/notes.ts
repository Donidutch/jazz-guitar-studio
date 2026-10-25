import type { MidiNote, NoteName, NoteWithOctave, Semitones } from "@/types";

// Canonical note names (sharps preferred for most computations)
const CHROMATIC_SHARPS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;
const CHROMATIC_FLATS = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"] as const;

// Enharmonic equivalents map
const ENHARMONICS: Record<string, string> = {
  "C#": "Db", "Db": "C#",
  "D#": "Eb", "Eb": "D#",
  "F#": "Gb", "Gb": "F#",
  "G#": "Ab", "Ab": "G#",
  "A#": "Bb", "Bb": "A#",
  // double accidentals occasionally needed
  "E#": "F", "Fb": "E",
  "B#": "C", "Cb": "B",
};

// Keys where flats are preferred
const FLAT_KEYS = new Set(["F", "Bb", "Eb", "Ab", "Db", "Gb"]);

const LETTERS = ["C", "D", "E", "F", "G", "A", "B"] as const;
const LETTER_SEMITONES: Record<string, number> = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };

// Semitones above C before wrapping, so Cb is -1 and B# is 12. Handles single
// and double sharps and flats; null for anything else.
function spelledOffset(note: NoteName): number | null {
  const match = note.trim().match(/^([A-Ga-g])(#{1,2}|b{1,2})?$/);
  if (!match) return null;
  const accidental = match[2] ?? "";
  const shift = accidental.startsWith("#") ? accidental.length : -accidental.length;
  return LETTER_SEMITONES[match[1].toUpperCase()] + shift;
}

export function chromaticIndex(note: NoteName): number {
  const offset = spelledOffset(note);
  return offset === null ? -1 : ((offset % 12) + 12) % 12;
}

// The note `degree` letters above root (1 = unison, 3 = a third) that lies
// `semitones` above it, e.g. (C, 3, 3) is Eb and (Db, 7, 10) is Cb. Null when
// that would need more than two sharps or flats.
export function spellInterval(root: NoteName, degree: number, semitones: Semitones): NoteName | null {
  const rootPitch = chromaticIndex(root);
  if (rootPitch === -1) return null;
  const letterIndex = LETTERS.indexOf(root.trim()[0].toUpperCase() as (typeof LETTERS)[number]);
  const letter = LETTERS[(letterIndex + degree - 1) % 7];
  const target = (((rootPitch + semitones) % 12) + 12) % 12;
  let shift = (((target - LETTER_SEMITONES[letter]) % 12) + 12) % 12;
  if (shift > 6) shift -= 12;
  if (Math.abs(shift) > 2) return null;
  return letter + (shift > 0 ? "#".repeat(shift) : "b".repeat(-shift));
}

export function normalizeNote(note: NoteName): NoteName {
  if (!note) return "C";
  const trimmed = note.trim();
  const letter = trimmed[0].toUpperCase();
  const acc = trimmed.slice(1).replace("b", "b").replace("#", "#");
  const candidate = letter + acc;
  // Resolve double sharps / double flats for simple cases
  if (candidate in ENHARMONICS && CHROMATIC_SHARPS.indexOf(candidate as typeof CHROMATIC_SHARPS[number]) === -1 &&
      CHROMATIC_FLATS.indexOf(candidate as typeof CHROMATIC_FLATS[number]) === -1) {
    return ENHARMONICS[candidate];
  }
  return candidate;
}

export function noteToMidi(noteWithOctave: NoteWithOctave): MidiNote {
  // Parse e.g. "C4", "Bb3", "F#5"
  const match = noteWithOctave.match(/^([A-G](?:#{1,2}|b{1,2})?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${noteWithOctave}`);
  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  const offset = spelledOffset(noteName);
  if (offset === null) throw new Error(`Unknown note: ${noteName}`);
  // Unwrapped, so Cb4 is the B just below C4 and B#3 is C4.
  return (octave + 1) * 12 + offset;
}

export function midiToNote(midi: MidiNote, preferFlats = false): NoteWithOctave {
  const octave = Math.floor(midi / 12) - 1;
  const idx = midi % 12;
  const note = preferFlats ? CHROMATIC_FLATS[idx] : CHROMATIC_SHARPS[idx];
  return `${note}${octave}`;
}

export function midiToNoteName(midi: MidiNote, preferFlats = false): NoteName {
  const idx = midi % 12;
  return preferFlats ? CHROMATIC_FLATS[idx] : CHROMATIC_SHARPS[idx];
}

export function enharmonicEquivalent(note: NoteName): NoteName | null {
  const normalized = normalizeNote(note);
  return ENHARMONICS[normalized] ?? null;
}

export function preferFlatsForKey(key: NoteName): boolean {
  return FLAT_KEYS.has(normalizeNote(key));
}

export function transposeNote(note: NoteName, semitones: Semitones, preferFlats = false): NoteName {
  const idx = chromaticIndex(note);
  // chromaticIndex returns -1 for unknown names; transposing that would yield B.
  if (idx === -1) throw new Error(`Unknown note: ${note}`);
  const newIdx = ((idx + semitones) % 12 + 12) % 12;
  return preferFlats ? CHROMATIC_FLATS[newIdx] : CHROMATIC_SHARPS[newIdx];
}

export function noteOctave(noteWithOctave: NoteWithOctave): number {
  const match = noteWithOctave.match(/^[A-G](?:#{1,2}|b{1,2})?(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${noteWithOctave}`);
  return parseInt(match[1], 10);
}

export function noteName(noteWithOctave: NoteWithOctave): NoteName {
  const match = noteWithOctave.match(/^([A-G](?:#{1,2}|b{1,2})?)-?\d+$/);
  if (!match) throw new Error(`Invalid note: ${noteWithOctave}`);
  return match[1];
}

export function noteWithOctave(note: NoteName, octave: number): NoteWithOctave {
  return `${note}${octave}`;
}

export function areEnharmonic(a: NoteName, b: NoteName): boolean {
  return chromaticIndex(a) === chromaticIndex(b);
}

export const ALL_NOTE_NAMES: readonly NoteName[] = [
  ...CHROMATIC_SHARPS.filter((n) => !n.includes("#")),
  "C#", "Eb", "F#", "Ab", "Bb",
] as readonly NoteName[];

export const CHROMATIC_NOTES_SHARPS = CHROMATIC_SHARPS;
export const CHROMATIC_NOTES_FLATS = CHROMATIC_FLATS;
