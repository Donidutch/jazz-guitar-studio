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

export function chromaticIndex(note: NoteName): number {
  const normalized = normalizeNote(note);
  const sharpIdx = CHROMATIC_SHARPS.indexOf(normalized as typeof CHROMATIC_SHARPS[number]);
  if (sharpIdx !== -1) return sharpIdx;
  const flatIdx = CHROMATIC_FLATS.indexOf(normalized as typeof CHROMATIC_FLATS[number]);
  return flatIdx;
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
  const match = noteWithOctave.match(/^([A-G][#b]?)(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${noteWithOctave}`);
  const noteName = match[1];
  const octave = parseInt(match[2], 10);
  const idx = chromaticIndex(noteName);
  if (idx === -1) throw new Error(`Unknown note: ${noteName}`);
  return (octave + 1) * 12 + idx;
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
  const match = noteWithOctave.match(/^[A-G][#b]?(-?\d+)$/);
  if (!match) throw new Error(`Invalid note: ${noteWithOctave}`);
  return parseInt(match[1], 10);
}

export function noteName(noteWithOctave: NoteWithOctave): NoteName {
  const match = noteWithOctave.match(/^([A-G][#b]?)-?\d+$/);
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
