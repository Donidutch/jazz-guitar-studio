import type { FretNumber, FretPosition, GuitarTuning, MidiNote, NoteName, StringNumber } from "@/types";
import { midiToNote, midiToNoteName, noteToMidi, normalizeNote, chromaticIndex } from "./notes";

// ─── Standard Tunings ─────────────────────────────────────────────────────────

export const STANDARD_TUNING: GuitarTuning = {
  name: "Standard (EADGBe)",
  strings: ["E2", "A2", "D3", "G3", "B3", "E4"], // index 0 = string 6 (low E), index 5 = string 1 (high e)
};

export const DROP_D_TUNING: GuitarTuning = {
  name: "Drop D",
  strings: ["D2", "A2", "D3", "G3", "B3", "E4"],
};

export const OPEN_G_TUNING: GuitarTuning = {
  name: "Open G",
  strings: ["D2", "G2", "D3", "G3", "B3", "D4"],
};

export const OPEN_D_TUNING: GuitarTuning = {
  name: "Open D",
  strings: ["D2", "A2", "D3", "F#3", "A3", "D4"],
};

export const ALL_TUNINGS: GuitarTuning[] = [STANDARD_TUNING, DROP_D_TUNING, OPEN_G_TUNING, OPEN_D_TUNING];

// ─── Fret / Pitch Calculations ────────────────────────────────────────────────

// String numbers: 1 = high e, 6 = low E (player convention)
// Array index: 0 = string 6 (low E), 5 = string 1 (high e)

export function stringIndex(stringNumber: StringNumber): number {
  return 6 - stringNumber; // string 6 → index 0, string 1 → index 5
}

export function fretToMidi(tuning: GuitarTuning, string: StringNumber, fret: FretNumber): MidiNote {
  const idx = stringIndex(string);
  const openMidi = noteToMidi(tuning.strings[idx]);
  return openMidi + fret;
}

export function fretToNote(tuning: GuitarTuning, string: StringNumber, fret: FretNumber, preferFlats = false): FretPosition {
  const midi = fretToMidi(tuning, string, fret);
  const octave = Math.floor(midi / 12) - 1;
  const note = midiToNoteName(midi, preferFlats);
  return { string, fret, note, octave, midi };
}

// All fret positions on the neck for a given MIDI note
export function midiToFretPositions(
  midi: MidiNote,
  tuning: GuitarTuning,
  maxFret = 15,
  preferFlats = false
): FretPosition[] {
  const positions: FretPosition[] = [];
  for (let s = 1; s <= 6; s++) {
    const openMidi = fretToMidi(tuning, s as StringNumber, 0);
    const fret = midi - openMidi;
    if (fret >= 0 && fret <= maxFret) {
      const octave = Math.floor(midi / 12) - 1;
      const note = midiToNoteName(midi, preferFlats);
      positions.push({ string: s as StringNumber, fret, note, octave, midi });
    }
  }
  return positions;
}

// All fret positions for a given note name (all octaves within maxFret range)
export function notePositionsOnNeck(
  note: NoteName,
  tuning: GuitarTuning,
  maxFret = 15,
  preferFlats = false
): FretPosition[] {
  const noteIdx = chromaticIndex(normalizeNote(note));
  const positions: FretPosition[] = [];
  for (let s = 1; s <= 6; s++) {
    const openMidi = fretToMidi(tuning, s as StringNumber, 0);
    const openIdx = openMidi % 12;
    let fret = ((noteIdx - openIdx) + 12) % 12;
    while (fret <= maxFret) {
      const midi = openMidi + fret;
      const octave = Math.floor(midi / 12) - 1;
      positions.push({ string: s as StringNumber, fret, note: midiToNoteName(midi, preferFlats), octave, midi });
      fret += 12;
    }
  }
  return positions;
}

// All positions for a set of notes (e.g., chord tones or scale notes)
export function noteSetPositionsOnNeck(
  notes: readonly NoteName[],
  tuning: GuitarTuning,
  maxFret = 15,
  preferFlats = false
): FretPosition[] {
  const noteIndices = new Set(notes.map((n) => chromaticIndex(normalizeNote(n))));
  const positions: FretPosition[] = [];
  for (let s = 1; s <= 6; s++) {
    const openMidi = fretToMidi(tuning, s as StringNumber, 0);
    for (let f = 0; f <= maxFret; f++) {
      const midi = openMidi + f;
      if (noteIndices.has(midi % 12)) {
        const octave = Math.floor(midi / 12) - 1;
        const note = midiToNoteName(midi, preferFlats);
        positions.push({ string: s as StringNumber, fret: f, note, octave, midi });
      }
    }
  }
  return positions;
}

// All notes on a single string
export function notesOnString(
  tuning: GuitarTuning,
  string: StringNumber,
  maxFret = 15,
  preferFlats = false
): FretPosition[] {
  const positions: FretPosition[] = [];
  for (let f = 0; f <= maxFret; f++) {
    positions.push(fretToNote(tuning, string, f, preferFlats));
  }
  return positions;
}

// ─── Playability Checks ────────────────────────────────────────────────────────

export function fretSpan(frets: FretNumber[]): number {
  const nonOpen = frets.filter((f) => f > 0);
  if (nonOpen.length <= 1) return 0;
  return Math.max(...nonOpen) - Math.min(...nonOpen);
}

export function isPlayable(
  notes: { string: StringNumber; fret: FretNumber }[],
  maxSpan = 4
): boolean {
  const span = fretSpan(notes.map((n) => n.fret));
  return span <= maxSpan;
}

export function playabilityScore(notes: { string: StringNumber; fret: FretNumber }[]): number {
  const nonOpen = notes.filter((n) => n.fret > 0);
  if (nonOpen.length === 0) return 100;
  const span = fretSpan(notes.map((n) => n.fret));
  const minFret = Math.min(...nonOpen.map((n) => n.fret));
  const positionPenalty = minFret > 7 ? (minFret - 7) * 0.5 : 0;
  const spanPenalty = span * 10;
  return Math.max(0, 100 - spanPenalty - positionPenalty);
}

// Difficulty 1-5 (1 = easiest)
export function fingeringDifficulty(
  notes: { string: StringNumber; fret: FretNumber }[]
): 1 | 2 | 3 | 4 | 5 {
  const nonOpen = notes.filter((n) => n.fret > 0);
  if (nonOpen.length === 0) return 1;
  const span = fretSpan(notes.map((n) => n.fret));
  const minFret = Math.min(...nonOpen.map((n) => n.fret));
  let score = 0;
  score += span; // 0-4
  score += Math.max(0, minFret - 5); // penalty for high positions
  // String skip penalty
  const strings = notes.map((n) => n.string).sort((a, b) => a - b);
  for (let i = 1; i < strings.length; i++) {
    if (strings[i] - strings[i - 1] > 1) score += 1;
  }
  if (score <= 1) return 1;
  if (score <= 3) return 2;
  if (score <= 5) return 3;
  if (score <= 7) return 4;
  return 5;
}

// ─── Inlay Positions ──────────────────────────────────────────────────────────

export const FRET_INLAYS: Record<number, "single" | "double"> = {
  3: "single", 5: "single", 7: "single", 9: "single",
  12: "double", 15: "single", 17: "single", 19: "single",
  21: "single", 24: "double",
};
