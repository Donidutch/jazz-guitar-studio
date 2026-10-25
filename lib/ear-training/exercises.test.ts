import { afterEach, describe, expect, it, vi } from "vitest";
import type { ExerciseResult } from "@/types";
import { noteToMidi } from "@/lib/theory/notes";
import {
  calculateAccuracy,
  calculateStreak,
  generateChordQualityExercise,
  generateIntervalExercise,
  generateMelodicDictationExercise,
  weightedRandomInterval,
} from "./exercises";

afterEach(() => vi.restoreAllMocks());

const result = (correct: boolean) => ({ correct }) as ExerciseResult;

describe("generateIntervalExercise", () => {
  it.each(["ascending", "harmonic"] as const)("plays the root then the interval (%s)", (direction) => {
    for (let i = 0; i < 20; i++) {
      const ex = generateIntervalExercise("beginner", direction);
      expect(noteToMidi(ex.note2) - noteToMidi(ex.note1)).toBeGreaterThan(0);
    }
  });

  it("plays the upper note first when descending, never the same note twice", () => {
    for (let i = 0; i < 20; i++) {
      const ex = generateIntervalExercise("beginner", "descending");
      expect(noteToMidi(ex.note1) - noteToMidi(ex.note2)).toBeGreaterThan(0);
    }
  });
});

describe("other generators", () => {
  it("builds a chord-quality exercise from a real voicing of the right quality", () => {
    const ex = generateChordQualityExercise("beginner");
    expect(ex.voicing.chord.quality).toBe(ex.correctQuality);
    expect(ex.voicing.notes.length).toBeGreaterThanOrEqual(3);
  });

  it("writes a melody of the requested length in the key, starting on the tonic", () => {
    const ex = generateMelodicDictationExercise("G", 6, "advanced");
    expect(ex.notes).toHaveLength(6);
    expect(ex.notes[0]).toBe("G4");
    expect(ex.correctDegrees[0]).toBe("1P");
  });
});

describe("scoring", () => {
  it("computes accuracy and the current streak", () => {
    const results = [result(false), result(true), result(true)];
    expect(calculateAccuracy(results)).toBeCloseTo(2 / 3);
    expect(calculateStreak(results)).toBe(2);
    expect(calculateAccuracy([])).toBe(0);
    expect(calculateStreak([result(false)])).toBe(0);
  });

  it("practises the interval you miss most more often", () => {
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    // "m2" is missed 90% of the time, "P5" 10%.
    expect(weightedRandomInterval({ m2: 0.9, P5: 0.1 }, ["m2", "P5"])).toBe("m2");
    expect(weightedRandomInterval({ m2: 0.1, P5: 0.9 }, ["m2", "P5"])).toBe("P5");
  });
});
