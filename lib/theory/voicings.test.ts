import { beforeEach, describe, expect, it } from "vitest";
import { buildChord } from "./chords";
import { STANDARD_TUNING } from "./guitar";
import { chromaticIndex } from "./notes";
import { clearVoicingCache, filterVoicings, generateVoicings } from "./voicings";

const cmaj7 = buildChord("C", "maj7");

beforeEach(() => clearVoicingCache());

describe("generateVoicings", () => {
  const voicings = generateVoicings(cmaj7, STANDARD_TUNING);

  it("finds many voicings, each made only of chord tones and playable", () => {
    const chordPitches = new Set(cmaj7.notes.map((n) => chromaticIndex(n)));
    expect(voicings.length).toBeGreaterThan(20);
    for (const v of voicings) {
      expect(v.notes.length).toBeGreaterThanOrEqual(3);
      expect(v.span).toBeLessThanOrEqual(4);
      for (const note of v.notes) expect(chordPitches.has(note.midi % 12)).toBe(true);
    }
  });

  it("gives each voicing a unique id and sorts easiest first", () => {
    expect(new Set(voicings.map((v) => v.id)).size).toBe(voicings.length);
    const difficulties = voicings.map((v) => v.difficulty);
    expect(difficulties).toEqual([...difficulties].sort((a, b) => a - b));
  });

  it("includes the textbook drop-2 shape on the top four strings", () => {
    // G (D string, 5) C (G string, 5) E (B string, 5) B (high e, 7).
    const shape = voicings.find((v) => v.id === "4:5-3:5-2:5-1:7");
    expect(shape).toBeDefined();
    expect(shape?.bassNote).toBe("G");
    expect(shape?.inversion).toBe(2); // fifth in the bass
    expect(shape?.type).toBe("drop2");
  });

  it("classifies a close-position shape as close", () => {
    // C E G B stacked within an octave: C (A string, 15) E (D string, 14) G (G string, 12) B (B string, 12).
    const close = voicings.find((v) => v.id === "5:15-4:14-3:12-2:12");
    expect(close?.type).toBe("close");
  });

  it("returns the cached result for the same chord", () => {
    const first = generateVoicings(cmaj7, STANDARD_TUNING);
    expect(generateVoicings(cmaj7, STANDARD_TUNING)).toBe(first);
  });
});

describe("filterVoicings", () => {
  const voicings = generateVoicings(cmaj7, STANDARD_TUNING);

  it("filters by string count, difficulty and inversion together", () => {
    const picked = filterVoicings(voicings, { stringSet: 4, maxDifficulty: 2, inversion: 0 });
    expect(picked.length).toBeGreaterThan(0);
    for (const v of picked) {
      expect(v.stringSet).toHaveLength(4);
      expect(v.difficulty).toBeLessThanOrEqual(2);
      expect(v.inversion).toBe(0);
    }
  });

  it("returns nothing when no voicing matches", () => {
    expect(filterVoicings(voicings, { maxPosition: 0 })).toEqual([]);
  });
});
