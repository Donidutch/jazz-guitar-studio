import type { NoteName, Semitones } from "@/types";
import { chromaticIndex, spellInterval, transposeNote } from "./notes";

// Maps interval shorthand to semitone count
export const INTERVAL_SEMITONES: Record<string, number> = {
  "1P": 0,  "R": 0,
  "b2": 1,  "m2": 1,
  "2M": 2,  "2": 2,
  "b3": 3,  "m3": 3,  "#2": 3,
  "3M": 4,  "3": 4,
  "b4": 4,
  "4P": 5,  "4": 5,   "11": 5,
  "#4": 6,  "b5": 6,  "A4": 6,
  "5P": 7,  "5": 7,
  "#5": 8,  "b6": 8,
  "6M": 9,  "6": 9,   "13": 9,
  "b7": 10, "m7": 10, "7m": 10,
  "7M": 11, "7": 11,  "maj7": 11,
  "8P": 12, "8": 12,
  "b9": 13,
  "9M": 14, "9": 14,
  "#9": 15,
  "b10": 15,
  "10M": 16,
  "11P": 17,
  "#11": 18,
  "b13": 20,
  "13M": 21,
};

// Human-readable interval names
export const INTERVAL_NAMES: Record<number, string> = {
  0: "Unison",
  1: "Minor 2nd",
  2: "Major 2nd",
  3: "Minor 3rd",
  4: "Major 3rd",
  5: "Perfect 4th",
  6: "Tritone",
  7: "Perfect 5th",
  8: "Minor 6th",
  9: "Major 6th",
  10: "Minor 7th",
  11: "Major 7th",
  12: "Octave",
  13: "Minor 9th",
  14: "Major 9th",
  15: "Augmented 9th",
  16: "Minor 10th",
  17: "Perfect 11th",
  18: "Augmented 11th",
  20: "Minor 13th",
  21: "Major 13th",
};

// Short display name (for voicing labels, ear training choices)
export const INTERVAL_SHORT: Record<number, string> = {
  0: "Unison",
  1: "b2",
  2: "M2",
  3: "m3",
  4: "M3",
  5: "P4",
  6: "TT",
  7: "P5",
  8: "m6",
  9: "M6",
  10: "m7",
  11: "M7",
  12: "Oct",
  13: "b9",
  14: "M9",
  15: "#9",
  16: "m10",
  17: "P11",
  18: "#11",
  20: "b13",
  21: "M13",
};

export function semitonesBetween(from: NoteName, to: NoteName): Semitones {
  const a = chromaticIndex(from);
  const b = chromaticIndex(to);
  return ((b - a) + 12) % 12;
}

export function intervalSemitones(interval: string): number {
  const val = INTERVAL_SEMITONES[interval];
  if (val !== undefined) return val;
  throw new Error(`Unknown interval: ${interval}`);
}

// Which scale degree each interval names (2 for b2, b9, #9; 4 for #11), so a
// note is spelled by letter: a minor third above C is Eb, never D#.
const INTERVAL_DEGREES: Record<string, number> = {
  "1P": 1, "R": 1, "8P": 1, "8": 1,
  "b2": 2, "m2": 2, "2M": 2, "2": 2, "#2": 2, "b9": 2, "9M": 2, "9": 2, "#9": 2,
  "b3": 3, "m3": 3, "3M": 3, "3": 3, "b10": 3, "10M": 3,
  "b4": 4, "4P": 4, "4": 4, "11": 4, "#4": 4, "A4": 4, "11P": 4, "#11": 4,
  "b5": 5, "5P": 5, "5": 5, "#5": 5,
  "b6": 6, "6M": 6, "6": 6, "13": 6, "b13": 6, "13M": 6,
  "b7": 7, "m7": 7, "7m": 7, "7M": 7, "7": 7, "maj7": 7,
};

export function applyInterval(root: NoteName, interval: string, preferFlats = false): NoteName {
  const semitones = intervalSemitones(interval);
  const spelled = spellInterval(root, INTERVAL_DEGREES[interval] ?? 1, semitones);
  // A triple accidental (e.g. a diminished interval above a double flat) has
  // no spelling worth showing; fall back to the plain chromatic name.
  return spelled ?? transposeNote(root, semitones, preferFlats);
}

export function intervalFromSemitones(semitones: Semitones): string {
  return INTERVAL_SHORT[semitones] ?? `+${semitones}`;
}

export function intervalName(semitones: Semitones): string {
  return INTERVAL_NAMES[semitones] ?? `${semitones} semitones`;
}

// Chord-tone label for display (e.g., "R", "3", "b7", "#11")
export const DEGREE_LABELS: Record<string, string> = {
  "1P": "R",  "R": "R",
  "b2": "b2", "m2": "b2",
  "2M": "2",  "9": "9",
  "b3": "b3", "m3": "b3", "#2": "b3",
  "3M": "3",  "3": "3",
  "4P": "4",  "4": "4",  "11": "11",
  "#4": "#4", "b5": "b5", "#11": "#11",
  "5P": "5",  "5": "5",
  "#5": "#5", "b13": "b13",
  "6M": "6",  "6": "6",   "13": "13",
  "b7": "b7", "m7": "b7",
  "7M": "7",  "7": "7",  "maj7": "7",
};

export function degreeLabel(interval: string): string {
  return DEGREE_LABELS[interval] ?? interval;
}
