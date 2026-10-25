import { describe, expect, it } from "vitest";
import {
  areEnharmonic,
  chromaticIndex,
  enharmonicEquivalent,
  midiToNote,
  noteToMidi,
  normalizeNote,
  preferFlatsForKey,
  spellInterval,
  transposeNote,
} from "./notes";

describe("noteToMidi / midiToNote", () => {
  it("maps middle C and A440 to their MIDI numbers", () => {
    expect(noteToMidi("C4")).toBe(60);
    expect(noteToMidi("A4")).toBe(69);
    expect(noteToMidi("E2")).toBe(40); // guitar low E
  });

  it("round-trips across octaves, preferring flats when asked", () => {
    expect(midiToNote(61)).toBe("C#4");
    expect(midiToNote(61, true)).toBe("Db4");
    expect(noteToMidi(midiToNote(35))).toBe(35);
  });

  it("rejects malformed note names", () => {
    expect(() => noteToMidi("H4")).toThrow();
    expect(() => noteToMidi("C")).toThrow();
  });
});

describe("normalizeNote and enharmonics", () => {
  it("resolves enharmonic spellings outside the chromatic tables", () => {
    expect(normalizeNote("E#")).toBe("F");
    expect(normalizeNote("Cb")).toBe("B");
    expect(chromaticIndex("Bb")).toBe(chromaticIndex("A#"));
  });

  it("knows which notes are the same pitch", () => {
    expect(areEnharmonic("Gb", "F#")).toBe(true);
    expect(areEnharmonic("G", "F#")).toBe(false);
    expect(enharmonicEquivalent("Eb")).toBe("D#");
    expect(enharmonicEquivalent("D")).toBeNull();
  });

  it("prefers flats in flat keys only", () => {
    expect(preferFlatsForKey("Bb")).toBe(true);
    expect(preferFlatsForKey("G")).toBe(false);
  });
});

describe("spelled notes", () => {
  it("reads double sharps and flats as pitches", () => {
    expect(chromaticIndex("F##")).toBe(chromaticIndex("G"));
    expect(chromaticIndex("Dbb")).toBe(chromaticIndex("C"));
    expect(chromaticIndex("X")).toBe(-1);
  });

  it("keeps octaves right across the B-C boundary", () => {
    expect(noteToMidi("Cb4")).toBe(59); // the B below middle C
    expect(noteToMidi("B#3")).toBe(60); // middle C
  });

  it("spells intervals by letter", () => {
    expect(spellInterval("C", 3, 3)).toBe("Eb");
    expect(spellInterval("Db", 7, 10)).toBe("Cb");
    expect(spellInterval("A", 6, 9)).toBe("F#");
    expect(spellInterval("Gb", 7, 9)).toBe("Fbb");
    expect(spellInterval("Cbb", 3, 3)).toBeNull(); // Ebbb: a triple flat
  });
});

describe("transposeNote", () => {
  it("wraps around the octave in both directions", () => {
    expect(transposeNote("A", 3)).toBe("C");
    expect(transposeNote("C", -1)).toBe("B");
    expect(transposeNote("G", 6, true)).toBe("Db");
  });

  it("refuses an unknown note instead of turning it into B", () => {
    expect(() => transposeNote("H", 0)).toThrow(/Unknown note/);
  });
});
