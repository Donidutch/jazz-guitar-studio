import { describe, expect, it } from "vitest";
import { buildChord } from "./chords";
import { chromaticIndex } from "./notes";
import { analyzeChordInKey, commonProgression, createProgression, harmonicFunction } from "./progressions";

const roots = (chords: { chord: { root: string } }[]) => chords.map((c) => chromaticIndex(c.chord.root));
const pitches = (names: string[]) => names.map((n) => chromaticIndex(n));

describe("analyzeChordInKey", () => {
  it.each([
    ["D", "m7", "II", "subdominant"],
    ["G", "7", "V", "dominant"],
    ["C", "maj7", "I", "tonic"],
    ["A", "m7", "VI", "tonic"],
    ["B", "m7b5", "VII", "dominant"],
    ["F", "maj7", "IV", "subdominant"],
  ] as const)("%s%s in C is %s (%s)", (root, quality, numeral, fn) => {
    const analysis = analyzeChordInKey(buildChord(root, quality), "C");
    expect(analysis.romanNumeral).toBe(numeral);
    expect(analysis.harmonicFunction).toBe(fn);
  });

  it("calls the borrowed iv chord modal interchange", () => {
    expect(harmonicFunction("IV", buildChord("F", "m7"), "C")).toBe("modal-interchange");
  });

  it("names secondary dominants by their target", () => {
    const a7 = analyzeChordInKey(buildChord("A", "7"), "C");
    expect(a7.harmonicFunction).toBe("secondary-dominant");
    expect(a7.secondaryFunction).toBe("V/II");
  });
});

describe("commonProgression", () => {
  it("builds a ii-V-I in F", () => {
    const chords = commonProgression("ii-V-I", "F");
    expect(roots(chords)).toEqual(pitches(["G", "C", "F"]));
    expect(chords.map((c) => c.chord.quality)).toEqual(["m7", "7", "maj7"]);
  });

  it("builds twelve bars of blues: I I I I IV IV I I V IV I V", () => {
    const chords = commonProgression("blues", "C");
    expect(chords.reduce((beats, c) => beats + c.durationBeats, 0)).toBe(48);
    const bars = chords.flatMap((c) => Array(c.durationBeats / 4).fill(c.chord.root));
    expect(pitches(bars)).toEqual(pitches(["C", "C", "C", "C", "F", "F", "C", "C", "G", "F", "C", "G"]));
  });

  it("builds the rhythm-changes bridge as III7 VI7 II7 V7", () => {
    // In Bb: D7 G7 C7 F7.
    const chords = commonProgression("rhythm-changes-B", "Bb");
    expect(roots(chords)).toEqual(pitches(["D", "G", "C", "F"]));
    expect(chords.every((c) => c.chord.quality === "7")).toBe(true);
  });
});

describe("createProgression", () => {
  it("analyses every chord and keeps the key", () => {
    const progression = createProgression("Turnaround", "C", commonProgression("I-VI-II-V", "C"));
    expect(progression.key).toBe("C");
    expect(progression.chords.map((c) => c.romanNumeral)).toEqual(["I", "VI", "II", "V"]);
    expect(progression.chords[1].secondaryFunction).toBe("V/II");
  });
});
