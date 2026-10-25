import { describe, expect, it } from "vitest";
import {
  DROP_D_TUNING,
  fingeringDifficulty,
  fretSpan,
  fretToMidi,
  fretToNote,
  isPlayable,
  midiToFretPositions,
  notePositionsOnNeck,
  STANDARD_TUNING,
  stringIndex,
} from "./guitar";

describe("fret to pitch", () => {
  it("uses the player convention: string 6 is low E, string 1 is high e", () => {
    expect(stringIndex(6)).toBe(0);
    expect(fretToMidi(STANDARD_TUNING, 6, 0)).toBe(40); // E2
    expect(fretToMidi(STANDARD_TUNING, 1, 0)).toBe(64); // E4
  });

  it("finds known notes", () => {
    expect(fretToNote(STANDARD_TUNING, 6, 3).note).toBe("G");
    expect(fretToNote(STANDARD_TUNING, 5, 3).note).toBe("C");
    expect(fretToNote(STANDARD_TUNING, 2, 1)).toMatchObject({ note: "C", octave: 4, midi: 60 });
  });

  it("follows the tuning", () => {
    expect(fretToNote(DROP_D_TUNING, 6, 0).note).toBe("D");
  });
});

describe("finding notes on the neck", () => {
  it("finds every place to play middle C up to fret 15", () => {
    const places = midiToFretPositions(60, STANDARD_TUNING)
      .map((p) => `${p.string}:${p.fret}`)
      .sort();
    expect(places).toEqual(["2:1", "3:5", "4:10", "5:15"]);
  });

  it("finds a note in every octave on each string", () => {
    const a = notePositionsOnNeck("A", STANDARD_TUNING, 12);
    expect(a.every((p) => p.note === "A")).toBe(true);
    // Open A string and fret 12 on the A string.
    expect(a.filter((p) => p.string === 5).map((p) => p.fret)).toEqual([0, 12]);
  });
});

describe("playability", () => {
  it("ignores open strings when measuring a stretch", () => {
    expect(fretSpan([0, 2, 2, 1, 0])).toBe(1);
    expect(fretSpan([3])).toBe(0);
  });

  it("rejects stretches wider than four frets", () => {
    expect(isPlayable([{ string: 6, fret: 1 }, { string: 1, fret: 5 }])).toBe(true);
    expect(isPlayable([{ string: 6, fret: 1 }, { string: 1, fret: 6 }])).toBe(false);
  });

  it("rates open chords easiest and high, wide, skipping shapes hardest", () => {
    expect(fingeringDifficulty([{ string: 4, fret: 0 }, { string: 3, fret: 0 }])).toBe(1);
    expect(
      fingeringDifficulty([
        { string: 6, fret: 10 },
        { string: 4, fret: 13 },
        { string: 2, fret: 14 },
      ]),
    ).toBe(5);
  });
});
