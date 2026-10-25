import type {
  ChordDefinition, ChordQuality, HarmonicFunction, NoteName,
  Progression, ProgressionChord, RomanNumeral
} from "@/types";
import { buildChord } from "./chords";
import { normalizeNote, transposeNote, chromaticIndex } from "./notes";
import { semitonesBetween } from "./intervals";

// ─── Roman Numeral Definitions ────────────────────────────────────────────────

const MAJOR_SCALE_DEGREES: Record<number, string> = {
  0: "I", 2: "II", 4: "III", 5: "IV", 7: "V", 9: "VI", 11: "VII",
};

const SEMITONE_TO_ROMAN_MAJOR: Record<number, string> = {
  0: "I", 1: "bII", 2: "II", 3: "bIII", 4: "III", 5: "IV",
  6: "#IV", 7: "V", 8: "bVI", 9: "VI", 10: "bVII", 11: "VII",
};

const DEFAULT_QUALITY_FOR_DEGREE: Record<string, ChordQuality> = {
  "I": "maj7", "II": "m7", "III": "m7", "IV": "maj7",
  "V": "7", "VI": "m7", "VII": "m7b5",
  "bII": "7", "bIII": "maj7", "bVI": "maj7", "bVII": "7",
};

// ─── Analysis ──────────────────────────────────────────────────────────────────

export function romanNumeralFromChord(
  chord: ChordDefinition,
  key: NoteName,
  mode = "major"
): string {
  const semitones = semitonesBetween(normalizeNote(key), normalizeNote(chord.root));
  const rn = SEMITONE_TO_ROMAN_MAJOR[semitones] ?? `?${semitones}`;
  return rn;
}

export function harmonicFunction(
  romanNumeral: string,
  chord: ChordDefinition,
  key: NoteName
): HarmonicFunction {
  const rn = romanNumeral.replace(/b|#/g, "");
  const dominant7 = chord.quality === "7" || chord.quality.startsWith("7") || chord.quality === "9" || chord.quality === "13";
  const diminished = chord.quality === "dim7" || chord.quality === "m7b5";
  const minor = chord.quality.startsWith("m") && !chord.quality.startsWith("maj");
  const major = chord.quality === "maj7" || chord.quality.startsWith("maj");

  // Tonic function: I, III, VI (in major)
  if (["I", "III", "VI"].includes(rn) && (major || minor)) return "tonic";

  // Dominant function: V (especially dominant 7), VII, diminished
  if (rn === "V" && dominant7) return "dominant";
  if (rn === "VII" || diminished) return "dominant";

  // Secondary dominant: a dominant 7 chord that's not diatonically dominant
  if (dominant7 && rn !== "V") return "secondary-dominant";

  // Modal interchange: chords borrowed from the parallel minor (bVII, bIII,
  // bVI, and iv). A major IV is diatonic, so only a minor iv is borrowed.
  if (["bVII", "bIII", "bVI"].includes(romanNumeral) && (minor || major)) return "modal-interchange";
  if (romanNumeral === "IV" && minor) return "modal-interchange";

  // Subdominant function: II, IV
  if (["II", "IV"].includes(rn)) return "subdominant";

  return "chromatic";
}

export function analyzeChordInKey(
  chord: ChordDefinition,
  key: NoteName,
  mode = "major"
): { romanNumeral: string; harmonicFunction: HarmonicFunction; secondaryFunction?: string } {
  const rn = romanNumeralFromChord(chord, key, mode);
  const fn = harmonicFunction(rn, chord, key);

  // Check for secondary dominant (V/X)
  let secondaryFunction: string | undefined;
  if (fn === "secondary-dominant") {
    // The resolution target is a perfect 4th up from chord root
    const resolutionRoot = transposeNote(chord.root, 5);
    const resolutionSemitones = semitonesBetween(normalizeNote(key), normalizeNote(resolutionRoot));
    const resolutionRoman = SEMITONE_TO_ROMAN_MAJOR[resolutionSemitones];
    if (resolutionRoman) secondaryFunction = `V/${resolutionRoman}`;
  }

  return { romanNumeral: rn, harmonicFunction: fn, secondaryFunction };
}

// ─── Progression Builder ────────────────────────────────────────────────────────

export function createProgression(
  name: string,
  key: NoteName,
  chordSymbols: { chord: ChordDefinition; durationBeats: number }[]
): Progression {
  const id = `prog-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const now = Date.now();

  const progressionChords: ProgressionChord[] = chordSymbols.map(({ chord, durationBeats }, i) => {
    const analysis = analyzeChordInKey(chord, key);
    return {
      id: `chord-${id}-${i}`,
      chord,
      durationBeats,
      romanNumeral: analysis.romanNumeral,
      harmonicFunction: analysis.harmonicFunction,
      secondaryFunction: analysis.secondaryFunction,
    };
  });

  return {
    id,
    name,
    key: normalizeNote(key),
    mode: "major",
    timeSignature: [4, 4],
    bpm: 120,
    swing: 0,
    chords: progressionChords,
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Common Jazz Progressions ─────────────────────────────────────────────────

export function commonProgression(
  type: "ii-V-I" | "I-VI-II-V" | "blues" | "rhythm-changes-A" | "rhythm-changes-B" | "modal-vamp",
  key: NoteName
): { chord: ChordDefinition; durationBeats: number }[] {
  const k = normalizeNote(key);
  const T = (semitones: number) => transposeNote(k, semitones);

  switch (type) {
    case "ii-V-I":
      return [
        { chord: buildChord(T(2), "m7"), durationBeats: 2 },
        { chord: buildChord(T(7), "7"), durationBeats: 2 },
        { chord: buildChord(k, "maj7"), durationBeats: 4 },
      ];

    case "I-VI-II-V":
      return [
        { chord: buildChord(k, "maj7"), durationBeats: 2 },
        { chord: buildChord(T(9), "7"), durationBeats: 2 },
        { chord: buildChord(T(2), "m7"), durationBeats: 2 },
        { chord: buildChord(T(7), "7"), durationBeats: 2 },
      ];

    case "blues":
      return [
        { chord: buildChord(k, "7"), durationBeats: 4 },
        { chord: buildChord(k, "7"), durationBeats: 4 },
        { chord: buildChord(k, "7"), durationBeats: 4 },
        { chord: buildChord(k, "7"), durationBeats: 4 },
        { chord: buildChord(T(5), "7"), durationBeats: 4 },
        { chord: buildChord(T(5), "7"), durationBeats: 4 },
        { chord: buildChord(k, "7"), durationBeats: 4 },
        { chord: buildChord(k, "7"), durationBeats: 4 },
        { chord: buildChord(T(7), "7"), durationBeats: 4 },
        { chord: buildChord(T(5), "7"), durationBeats: 4 },
        { chord: buildChord(k, "7"), durationBeats: 4 },
        { chord: buildChord(T(7), "7"), durationBeats: 4 },
      ];

    case "rhythm-changes-A":
      return [
        { chord: buildChord(k, "maj7"), durationBeats: 2 },
        { chord: buildChord(T(9), "7"), durationBeats: 2 },
        { chord: buildChord(T(2), "m7"), durationBeats: 2 },
        { chord: buildChord(T(7), "7"), durationBeats: 2 },
        { chord: buildChord(k, "6"), durationBeats: 2 },
        { chord: buildChord(T(2), "m7"), durationBeats: 1 },
        { chord: buildChord(T(7), "7"), durationBeats: 1 },
        { chord: buildChord(k, "6"), durationBeats: 4 },
      ];

    case "rhythm-changes-B":
      return [
        { chord: buildChord(T(4), "7"), durationBeats: 4 }, // III7
        { chord: buildChord(T(9), "7"), durationBeats: 4 }, // VI7
        { chord: buildChord(T(2), "7"), durationBeats: 4 }, // II7 (V/V)
        { chord: buildChord(T(7), "7"), durationBeats: 4 }, // V7
      ];

    case "modal-vamp":
      return [
        { chord: buildChord(k, "m7"), durationBeats: 4 },
        { chord: buildChord(T(10), "7"), durationBeats: 4 }, // bVII7
      ];
  }
}

export const COMMON_PROGRESSION_NAMES = {
  "ii-V-I": "ii-V-I",
  "I-VI-II-V": "I-VI-ii-V (Turnaround)",
  "blues": "12-Bar Blues",
  "rhythm-changes-A": "Rhythm Changes (A section)",
  "rhythm-changes-B": "Rhythm Changes (B section — bridge)",
  "modal-vamp": "Modal Vamp (Dorian)",
} as const;
