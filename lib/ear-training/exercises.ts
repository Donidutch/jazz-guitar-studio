import type {
  ChordQuality, EarTrainingMode, Exercise, ExerciseResult,
  IntervalExercise, ChordQualityExercise, MelodicDictationExercise,
  NoteWithOctave, Voicing
} from "@/types";
import { buildChord } from "@/lib/theory/chords";
import { generateVoicings } from "@/lib/theory/voicings";
import { buildScale } from "@/lib/theory/scales";
import { STANDARD_TUNING } from "@/lib/theory/guitar";
import { noteToMidi, midiToNote } from "@/lib/theory/notes";
import { INTERVAL_SHORT } from "@/lib/theory/intervals";

const ALL_ROOTS = ["C", "D", "E", "F", "G", "A", "B", "Db", "Eb", "F#", "Ab", "Bb"];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Interval Exercise ────────────────────────────────────────────────────────

const BEGINNER_INTERVALS = ["m2", "M2", "m3", "M3", "P4", "P5", "m6", "M6", "m7", "M7"];
const ADVANCED_INTERVALS = [...BEGINNER_INTERVALS, "TT", "Oct"];

export function generateIntervalExercise(
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate",
  direction: "ascending" | "descending" | "harmonic" | "random" = "random"
): IntervalExercise {
  const intervals = difficulty === "beginner" ? BEGINNER_INTERVALS : ADVANCED_INTERVALS;
  const rootMidi = 48 + Math.floor(Math.random() * 12); // C3 to B3
  const intervalName = randomFrom(intervals);

  const semitoneMap: Record<string, number> = {
    "m2": 1, "M2": 2, "m3": 3, "M3": 4, "P4": 5, "TT": 6,
    "P5": 7, "m6": 8, "M6": 9, "m7": 10, "M7": 11, "Oct": 12,
  };
  const semitones = semitoneMap[intervalName] ?? 5;

  const dir = direction === "random"
    ? randomFrom<"ascending" | "descending" | "harmonic">(["ascending", "descending", "harmonic"])
    : direction;

  const root = midiToNote(rootMidi);
  const upper = midiToNote(rootMidi + semitones);

  // Players sound note1 then note2, so a descending interval starts on top.
  return {
    type: "interval",
    note1: dir === "descending" ? upper : root,
    note2: dir === "descending" ? root : upper,
    direction: dir,
    correctInterval: intervalName,
  };
}

// ─── Chord Quality Exercise ────────────────────────────────────────────────────

const BEGINNER_QUALITIES: ChordQuality[] = ["maj7", "m7", "7", "m7b5", "dim7"];
const INTERMEDIATE_QUALITIES: ChordQuality[] = ["maj7", "maj9", "m7", "m9", "7", "9", "m7b5", "dim7", "7b9"];
const ADVANCED_QUALITIES: ChordQuality[] = [
  "maj7", "maj7#11", "m7", "m9", "m/maj7",
  "7", "9", "7alt", "7b9", "7#9", "7#11",
  "m7b5", "dim7", "sus4", "7sus4",
];

export function generateChordQualityExercise(
  difficulty: "beginner" | "intermediate" | "advanced" = "intermediate"
): ChordQualityExercise {
  const qualities = difficulty === "beginner" ? BEGINNER_QUALITIES
    : difficulty === "intermediate" ? INTERMEDIATE_QUALITIES
    : ADVANCED_QUALITIES;

  const quality = randomFrom(qualities);
  const root = randomFrom(ALL_ROOTS);
  const chord = buildChord(root, quality);

  const voicings = generateVoicings(chord, STANDARD_TUNING);
  const voicing = voicings.find((v) => v.type === "drop2" || v.type === "shell") ?? voicings[0];

  if (!voicing) {
    // Fallback: create a minimal voicing from chord notes
    const fallbackVoicing: Voicing = {
      id: `fallback-${chord.symbol}`,
      chord,
      notes: chord.notes.slice(0, 4).map((note, i) => ({
        string: (i + 3) as any,
        fret: 5,
        note,
        octave: 4,
        midi: noteToMidi(`${note}4`),
        intervalName: chord.intervals[i] ?? "R",
        muted: false,
      })),
      type: "close",
      lowestFret: 5,
      highestFret: 8,
      span: 3,
      stringSet: [3, 4, 5, 6],
      position: 5,
      bassNote: chord.root,
      topNote: chord.notes[chord.notes.length - 1],
      inversion: 0,
      difficulty: 2,
    };
    return { type: "chordQuality", voicing: fallbackVoicing, correctQuality: quality, rootHidden: false };
  }

  return { type: "chordQuality", voicing, correctQuality: quality, rootHidden: Math.random() > 0.7 };
}

// ─── Melodic Dictation Exercise ────────────────────────────────────────────────

export function generateMelodicDictationExercise(
  key = "C",
  length: 2 | 3 | 4 | 6 | 8 = 4,
  difficulty: "beginner" | "intermediate" | "advanced" = "beginner"
): MelodicDictationExercise {
  const scale = buildScale(key, "major");
  const scaleNotes = scale.notes;
  const octave = 4;

  const notes: NoteWithOctave[] = [];
  const degrees: string[] = [];
  let currentIdx = 0; // start on root

  for (let i = 0; i < length; i++) {
    notes.push(`${scaleNotes[currentIdx]}${octave}`);
    degrees.push(scale.intervals[currentIdx] ?? "1P");

    // Move to next note
    const maxStep = difficulty === "beginner" ? 1 : difficulty === "intermediate" ? 2 : 3;
    const step = Math.floor(Math.random() * (maxStep * 2 + 1)) - maxStep;
    currentIdx = ((currentIdx + step) % scaleNotes.length + scaleNotes.length) % scaleNotes.length;
  }

  return {
    type: "melodicDictation",
    notes,
    key,
    correctDegrees: degrees,
  };
}

// ─── Session Scoring ──────────────────────────────────────────────────────────

export function calculateAccuracy(results: ExerciseResult[]): number {
  if (results.length === 0) return 0;
  const correct = results.filter((r) => r.correct).length;
  return correct / results.length;
}

export function calculateStreak(results: ExerciseResult[]): number {
  let streak = 0;
  for (let i = results.length - 1; i >= 0; i--) {
    if (results[i].correct) streak++;
    else break;
  }
  return streak;
}

// Adaptive weighting: items with lower accuracy get higher weight
export function weightedRandomInterval(
  missRates: Record<string, number>,
  available: string[]
): string {
  const weights = available.map((item) => {
    const rate = missRates[item] ?? 0.5;
    return Math.exp(2 * rate); // higher miss rate = higher weight
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let rand = Math.random() * total;
  for (let i = 0; i < available.length; i++) {
    rand -= weights[i];
    if (rand <= 0) return available[i];
  }
  return available[available.length - 1];
}
