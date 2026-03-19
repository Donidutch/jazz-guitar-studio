import type { ChordDefinition, ChordQuality, NoteName } from "@/types";
import { applyInterval, degreeLabel } from "./intervals";
import { normalizeNote, preferFlatsForKey } from "./notes";

// ─── Chord Formula Dictionary ─────────────────────────────────────────────────
// Each quality maps to an array of interval strings

export const CHORD_FORMULAS: Record<ChordQuality, string[]> = {
  // Major
  "maj7":       ["1P", "3M", "5P", "7M"],
  "maj9":       ["1P", "3M", "5P", "7M", "2M"],
  "maj7#11":    ["1P", "3M", "5P", "7M", "#4"],
  "maj13":      ["1P", "3M", "5P", "7M", "2M", "6M"],
  "maj7#5":     ["1P", "3M", "#5", "7M"],

  // Dominant
  "7":          ["1P", "3M", "5P", "b7"],
  "9":          ["1P", "3M", "5P", "b7", "2M"],
  "11":         ["1P", "3M", "5P", "b7", "2M", "4P"],
  "13":         ["1P", "3M", "5P", "b7", "2M", "6M"],
  "7b9":        ["1P", "3M", "5P", "b7", "b2"],
  "7#9":        ["1P", "3M", "5P", "b7", "#2"],
  "7b9#9":      ["1P", "3M", "5P", "b7", "b2", "#2"],
  "7alt":       ["1P", "3M", "b5", "b7", "b2", "#2"],
  "7#11":       ["1P", "3M", "5P", "b7", "#4"],
  "7b13":       ["1P", "3M", "5P", "b7", "#5"],
  "7#11b13":    ["1P", "3M", "5P", "b7", "#4", "#5"],
  "9#11":       ["1P", "3M", "5P", "b7", "2M", "#4"],
  "13b9":       ["1P", "3M", "5P", "b7", "b2", "6M"],
  "13#11":      ["1P", "3M", "5P", "b7", "2M", "#4", "6M"],

  // Minor
  "m7":         ["1P", "b3", "5P", "b7"],
  "m9":         ["1P", "b3", "5P", "b7", "2M"],
  "m11":        ["1P", "b3", "5P", "b7", "2M", "4P"],
  "m13":        ["1P", "b3", "5P", "b7", "2M", "6M"],
  "m7b5":       ["1P", "b3", "b5", "b7"],
  "m/maj7":     ["1P", "b3", "5P", "7M"],
  "m6":         ["1P", "b3", "5P", "6M"],

  // Diminished
  "dim7":       ["1P", "b3", "b5", "6M"],  // 6M = dim7
  "dim":        ["1P", "b3", "b5"],

  // Sixth
  "6":          ["1P", "3M", "5P", "6M"],
  "6/9":        ["1P", "3M", "5P", "6M", "2M"],

  // Suspended
  "sus4":       ["1P", "4P", "5P"],
  "sus2":       ["1P", "2M", "5P"],
  "7sus4":      ["1P", "4P", "5P", "b7"],
  "9sus4":      ["1P", "4P", "5P", "b7", "2M"],

  // Augmented
  "aug":        ["1P", "3M", "#5"],
  "aug7":       ["1P", "3M", "#5", "b7"],
};

// Human-readable chord quality names
export const CHORD_QUALITY_NAMES: Record<ChordQuality, string> = {
  "maj7": "Major 7",       "maj9": "Major 9",       "maj7#11": "Major 7#11",
  "maj13": "Major 13",     "maj7#5": "Major 7#5",
  "7": "Dominant 7",       "9": "Dominant 9",        "11": "Dominant 11",
  "13": "Dominant 13",     "7b9": "7b9",             "7#9": "7#9",
  "7b9#9": "7b9#9",        "7alt": "7alt",           "7#11": "7#11",
  "7b13": "7b13",          "7#11b13": "7#11b13",     "9#11": "9#11",
  "13b9": "13b9",          "13#11": "13#11",
  "m7": "Minor 7",         "m9": "Minor 9",          "m11": "Minor 11",
  "m13": "Minor 13",       "m7b5": "Half-Diminished","m/maj7": "Minor/Major 7",
  "m6": "Minor 6",
  "dim7": "Diminished 7",  "dim": "Diminished",
  "6": "Major 6",          "6/9": "6/9",
  "sus4": "Sus4",          "sus2": "Sus2",           "7sus4": "7sus4",
  "9sus4": "9sus4",
  "aug": "Augmented",      "aug7": "Augmented 7",
};

// Grouped for UI display
export const CHORD_QUALITY_GROUPS: { label: string; qualities: ChordQuality[] }[] = [
  {
    label: "Major",
    qualities: ["maj7", "maj9", "maj7#11", "maj13", "maj7#5", "6", "6/9"],
  },
  {
    label: "Dominant",
    qualities: ["7", "9", "13", "7b9", "7#9", "7alt", "7#11", "7b13", "9#11", "13b9", "13#11", "7b9#9", "7#11b13"],
  },
  {
    label: "Minor",
    qualities: ["m7", "m9", "m11", "m13", "m6", "m/maj7"],
  },
  {
    label: "Half-Dim / Dim",
    qualities: ["m7b5", "dim7", "dim"],
  },
  {
    label: "Suspended",
    qualities: ["sus4", "sus2", "7sus4", "9sus4"],
  },
  {
    label: "Augmented",
    qualities: ["aug", "aug7"],
  },
];

// ─── Chord Construction ────────────────────────────────────────────────────────

export function buildChord(root: NoteName, quality: ChordQuality): ChordDefinition {
  const normalRoot = normalizeNote(root);
  const useFlats = preferFlatsForKey(normalRoot);
  const intervals = CHORD_FORMULAS[quality];
  const notes = intervals.map((iv) => applyInterval(normalRoot, iv, useFlats));

  return {
    symbol: `${normalRoot}${quality}`,
    root: normalRoot,
    quality,
    intervals,
    notes,
  };
}

export function buildSlashChord(root: NoteName, quality: ChordQuality, bassNote: NoteName): ChordDefinition {
  const chord = buildChord(root, quality);
  return { ...chord, bassNote: normalizeNote(bassNote), symbol: `${chord.symbol}/${bassNote}` };
}

export function chordNotes(chord: ChordDefinition): NoteName[] {
  return [...chord.notes];
}

export function isChordTone(note: NoteName, chord: ChordDefinition): boolean {
  const normalNote = normalizeNote(note);
  return chord.notes.some((n) => n === normalNote);
}

export function intervalInChord(note: NoteName, chord: ChordDefinition): string | null {
  const normalNote = normalizeNote(note);
  const idx = chord.notes.indexOf(normalNote);
  if (idx === -1) return null;
  return degreeLabel(chord.intervals[idx]);
}

// ─── Chord Scale Suggestions ────────────────────────────────────────────────────

import type { ScaleType } from "@/types";

export function chordScales(quality: ChordQuality): ScaleType[] {
  const map: Partial<Record<ChordQuality, ScaleType[]>> = {
    "maj7":    ["major", "lydian"],
    "maj7#11": ["lydian"],
    "maj9":    ["major", "lydian"],
    "maj13":   ["major", "lydian"],
    "7":       ["mixolydian", "dominant-bebop", "half-whole-dim", "whole-tone"],
    "9":       ["mixolydian", "dominant-bebop"],
    "13":      ["mixolydian", "dominant-bebop"],
    "7#11":    ["lydian-dominant"],
    "7alt":    ["altered"],
    "7b9":     ["half-whole-dim", "phrygian-dominant"],
    "7#9":     ["altered", "half-whole-dim"],
    "m7":      ["dorian", "minor-pentatonic", "minor-bebop"],
    "m9":      ["dorian"],
    "m11":     ["dorian", "phrygian"],
    "m7b5":    ["half-diminished", "locrian"],
    "dim7":    ["whole-half-dim", "half-whole-dim"],
    "m/maj7":  ["melodic-minor", "harmonic-minor"],
    "sus4":    ["mixolydian", "dorian"],
    "7sus4":   ["mixolydian"],
  };
  return map[quality] ?? ["major"];
}
