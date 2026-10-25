import type { ChordQuality, FretPosition, NoteName, ScaleDefinition, ScaleNeckPosition, ScaleType, StringNumber } from "@/types";
import { applyInterval } from "./intervals";
import { normalizeNote, preferFlatsForKey, chromaticIndex } from "./notes";
import { fretToMidi, STANDARD_TUNING } from "./guitar";
import type { GuitarTuning } from "@/types";
import { midiToNoteName } from "./notes";

// ─── Scale Formulas ────────────────────────────────────────────────────────────

export const SCALE_FORMULAS: Record<ScaleType, string[]> = {
  "major":            ["1P", "2M", "3M", "4P", "5P", "6M", "7M"],
  "natural-minor":    ["1P", "2M", "b3", "4P", "5P", "b6", "b7"],
  "harmonic-minor":   ["1P", "2M", "b3", "4P", "5P", "b6", "7M"],
  "melodic-minor":    ["1P", "2M", "b3", "4P", "5P", "6M", "7M"],
  "dorian":           ["1P", "2M", "b3", "4P", "5P", "6M", "b7"],
  "phrygian":         ["1P", "b2", "b3", "4P", "5P", "b6", "b7"],
  "lydian":           ["1P", "2M", "3M", "#4", "5P", "6M", "7M"],
  "mixolydian":       ["1P", "2M", "3M", "4P", "5P", "6M", "b7"],
  "aeolian":          ["1P", "2M", "b3", "4P", "5P", "b6", "b7"],
  "locrian":          ["1P", "b2", "b3", "4P", "b5", "b6", "b7"],
  "lydian-dominant":  ["1P", "2M", "3M", "#4", "5P", "6M", "b7"],
  "altered":          ["1P", "b2", "b3", "b4", "b5", "b6", "b7"],
  "half-diminished":  ["1P", "2M", "b3", "4P", "b5", "b6", "b7"],
  "phrygian-dominant":["1P", "b2", "3M", "4P", "5P", "b6", "b7"],
  "whole-tone":       ["1P", "2M", "3M", "#4", "#5", "b7"],
  "half-whole-dim":   ["1P", "b2", "#2", "3M", "#4", "5P", "6M", "b7"],
  "whole-half-dim":   ["1P", "2M", "b3", "4P", "b5", "#5", "6M", "7M"],
  "major-pentatonic": ["1P", "2M", "3M", "5P", "6M"],
  "minor-pentatonic": ["1P", "b3", "4P", "5P", "b7"],
  "major-bebop":      ["1P", "2M", "3M", "4P", "5P", "#5", "6M", "7M"],
  "dominant-bebop":   ["1P", "2M", "3M", "4P", "5P", "6M", "b7", "7M"],
  "minor-bebop":      ["1P", "2M", "b3", "3M", "4P", "5P", "6M", "b7"],
  "blues":            ["1P", "b3", "4P", "b5", "5P", "b7"],
};

export const SCALE_NAMES: Record<ScaleType, string> = {
  "major":              "Major (Ionian)",
  "natural-minor":      "Natural Minor (Aeolian)",
  "harmonic-minor":     "Harmonic Minor",
  "melodic-minor":      "Melodic Minor",
  "dorian":             "Dorian",
  "phrygian":           "Phrygian",
  "lydian":             "Lydian",
  "mixolydian":         "Mixolydian",
  "aeolian":            "Aeolian",
  "locrian":            "Locrian",
  "lydian-dominant":    "Lydian Dominant",
  "altered":            "Altered (Super Locrian)",
  "half-diminished":    "Locrian #2 (Half-Diminished)",
  "phrygian-dominant":  "Phrygian Dominant",
  "whole-tone":         "Whole Tone",
  "half-whole-dim":     "Half-Whole Diminished",
  "whole-half-dim":     "Whole-Half Diminished",
  "major-pentatonic":   "Major Pentatonic",
  "minor-pentatonic":   "Minor Pentatonic",
  "major-bebop":        "Major Bebop",
  "dominant-bebop":     "Dominant Bebop",
  "minor-bebop":        "Minor Bebop",
  "blues":              "Blues Scale",
};

export const SCALE_DESCRIPTIONS: Record<ScaleType, string> = {
  "major":              "The foundation of tonal music. Used over maj7 chords and in major key contexts.",
  "natural-minor":      "The relative minor of the major scale. Used over m7 chords.",
  "harmonic-minor":     "Natural minor with raised 7th. Creates a strong V-i pull in minor keys.",
  "melodic-minor":      "Jazz's most versatile parent scale — each mode has critical jazz applications.",
  "dorian":             "Minor scale with raised 6th. The go-to choice for m7 chords in jazz.",
  "phrygian":           "Minor scale with b2. Used for m7 chords in flamenco and modal contexts.",
  "lydian":             "Major scale with #4. Dreamy, floating quality. Perfect for maj7#11 chords.",
  "mixolydian":         "Major scale with b7. The dominant scale. Essential for blues and jazz dominants.",
  "aeolian":            "Same as natural minor. Common in rock and modal jazz.",
  "locrian":            "Diminished feel scale. Theoretical mode for the VII chord.",
  "lydian-dominant":    "Mixolydian with #4. Rothko, Hancock, jazz meets Lydian = exotic dominant.",
  "altered":            "All altered tensions (b9, #9, b5, #5). The ultimate dominant tension scale.",
  "half-diminished":    "Mode II of melodic minor. Natural choice for m7b5 (half-diminished) chords.",
  "phrygian-dominant":  "Mode V of harmonic minor. Flamenco, Middle-Eastern, and Spanish flavors.",
  "whole-tone":         "All whole steps — no half steps. Symmetrical, floaty, used for dom7+5 chords.",
  "half-whole-dim":     "8-note symmetrical scale. Two shapes cover the whole neck. Used over dom7b9.",
  "whole-half-dim":     "8-note symmetrical scale (whole first). Used over dim7 chords.",
  "major-pentatonic":   "5 notes, no half steps. Safe and singable over major contexts.",
  "minor-pentatonic":   "The blues backbone. Works over m7 and dominant chords alike.",
  "major-bebop":        "Major scale + chromatic passing tone (#5). Creates smooth 8-note patterns.",
  "dominant-bebop":     "Mixolydian + maj7 chromatic tone. Every other beat lands on a chord tone.",
  "minor-bebop":        "Dorian + maj3 passing tone. Keeps chord tones on the beat in fast lines.",
  "blues":              "Minor pentatonic + b5 blue note. Essential for jazz and blues vocabulary.",
};

export const SCALE_CHORD_CONTEXTS: Partial<Record<ScaleType, ChordQuality[]>> = {
  "major":              ["maj7", "maj9", "maj13", "6", "6/9"],
  "natural-minor":      ["m7", "m9"],
  "harmonic-minor":     ["m/maj7", "m7"],
  "melodic-minor":      ["m/maj7"],
  "dorian":             ["m7", "m9", "m11"],
  "phrygian":           ["m7", "m11"],
  "lydian":             ["maj7#11", "maj7"],
  "mixolydian":         ["7", "9", "13"],
  "locrian":            ["m7b5"],
  "lydian-dominant":    ["7#11", "9#11"],
  "altered":            ["7alt", "7#9", "7b9#9"],
  "half-diminished":    ["m7b5"],
  "phrygian-dominant":  ["7b9"],
  "whole-tone":         ["7", "aug7"],
  "half-whole-dim":     ["7b9", "13b9", "dim7"],
  "whole-half-dim":     ["dim7"],
  "major-pentatonic":   ["maj7", "6"],
  "minor-pentatonic":   ["m7", "7"],
  "major-bebop":        ["maj7", "6"],
  "dominant-bebop":     ["7", "9", "13"],
  "minor-bebop":        ["m7", "m9"],
  "blues":              ["7", "m7"],
};

export const SCALE_GROUPS: { label: string; scales: ScaleType[] }[] = [
  { label: "Modal (Major Family)", scales: ["major", "dorian", "phrygian", "lydian", "mixolydian", "aeolian", "locrian"] },
  { label: "Melodic Minor Modes", scales: ["melodic-minor", "lydian-dominant", "altered", "half-diminished", "phrygian-dominant"] },
  { label: "Minor", scales: ["natural-minor", "harmonic-minor"] },
  { label: "Diminished / Symmetric", scales: ["whole-tone", "half-whole-dim", "whole-half-dim"] },
  { label: "Pentatonic / Blues", scales: ["major-pentatonic", "minor-pentatonic", "blues"] },
  { label: "Bebop", scales: ["major-bebop", "dominant-bebop", "minor-bebop"] },
];

// ─── Scale Construction ────────────────────────────────────────────────────────

export function buildScale(root: NoteName, type: ScaleType): ScaleDefinition {
  const normalRoot = normalizeNote(root);
  const useFlats = preferFlatsForKey(normalRoot);
  const intervals = SCALE_FORMULAS[type];
  const notes = intervals.map((iv) => applyInterval(normalRoot, iv, useFlats));

  return {
    name: SCALE_NAMES[type],
    root: normalRoot,
    type,
    intervals,
    notes,
    chordScaleContext: (SCALE_CHORD_CONTEXTS[type] ?? []) as ChordQuality[],
    description: SCALE_DESCRIPTIONS[type],
  };
}

export function scaleNotes(root: NoteName, type: ScaleType): readonly NoteName[] {
  return buildScale(root, type).notes;
}

// ─── Neck Position Generation ─────────────────────────────────────────────────

export function scaleNeckPositions(
  scale: ScaleDefinition,
  tuning: GuitarTuning = STANDARD_TUNING,
  maxFret = 17
): ScaleNeckPosition[] {
  const spelled = new Map(scale.notes.map((n) => [chromaticIndex(n), n] as const));
  const rootIndex = chromaticIndex(scale.root);
  const preferFlats = preferFlatsForKey(scale.root);

  // Collect all fret positions for scale notes across entire neck
  const allPositions: FretPosition[] = [];
  for (let s = 1; s <= 6; s++) {
    const openMidi = fretToMidi(tuning, s as StringNumber, 0);
    for (let f = 0; f <= maxFret; f++) {
      const midi = openMidi + f;
      if (spelled.has(midi % 12)) {
        const note = spelled.get(midi % 12) ?? midiToNoteName(midi, preferFlats);
        const octave = Math.floor(midi / 12) - 1;
        allPositions.push({ string: s as StringNumber, fret: f, note, octave, midi });
      }
    }
  }

  // Group into box positions (6-fret windows)
  const rootPositions = allPositions.filter((p) => p.midi % 12 === rootIndex);

  // Identify position anchor frets (where root appears on low strings, strings 5-6)
  const lowStringRoots = rootPositions.filter((p) => p.string >= 5);
  const anchorFrets = [...new Set(lowStringRoots.map((p) => p.fret))].sort((a, b) => a - b);

  if (anchorFrets.length === 0) {
    // Fallback: evenly space positions across the neck
    const positions: ScaleNeckPosition[] = [];
    for (let i = 0; i < 5; i++) {
      const lo = i * 2;
      const hi = lo + 5;
      const notes = allPositions.filter((p) => p.fret >= lo && p.fret <= hi);
      if (notes.length > 0) {
        positions.push({
          positionIndex: i,
          label: `Position ${i + 1}`,
          lowestFret: lo,
          highestFret: hi,
          notes,
          rootPositions: rootPositions.filter((p) => p.fret >= lo && p.fret <= hi),
        });
      }
    }
    return positions;
  }

  return anchorFrets.slice(0, 7).map((anchorFret, i) => {
    const lo = Math.max(0, anchorFret - 1);
    const hi = lo + 5;
    const notes = allPositions.filter((p) => p.fret >= lo && p.fret <= hi);
    return {
      positionIndex: i,
      label: `Position ${i + 1} (fret ${anchorFret})`,
      lowestFret: lo,
      highestFret: hi,
      notes,
      rootPositions: rootPositions.filter((p) => p.fret >= lo && p.fret <= hi),
    };
  });
}
