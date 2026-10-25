import { describe, expect, it } from "vitest";
import type { ChordQuality } from "@/types";
import {
  buildChord,
  buildSlashChord,
  CHORD_FORMULAS,
  chordScales,
  intervalInChord,
  isChordTone,
} from "./chords";
import { chromaticIndex } from "./notes";

// Compare by pitch, so a spelling choice (D# vs Eb) cannot hide a wrong note.
const pitches = (notes: readonly string[]) => notes.map((n) => chromaticIndex(n));

describe("buildChord", () => {
  it.each<[string, ChordQuality, string[]]>([
    ["C", "maj7", ["C", "E", "G", "B"]],
    ["C", "m7", ["C", "Eb", "G", "Bb"]],
    ["G", "7", ["G", "B", "D", "F"]],
    ["B", "m7b5", ["B", "D", "F", "A"]],
    ["C", "dim7", ["C", "Eb", "Gb", "A"]],
    ["F", "6", ["F", "A", "C", "D"]],
    ["D", "7sus4", ["D", "G", "A", "C"]],
    ["C", "aug", ["C", "E", "G#"]],
    ["G", "7alt", ["G", "B", "Db", "F", "Ab", "A#"]],
  ])("%s%s has the right notes", (root, quality, expected) => {
    expect(pitches(buildChord(root, quality).notes)).toEqual(pitches(expected));
  });

  it("starts every chord on its root", () => {
    for (const quality of Object.keys(CHORD_FORMULAS) as ChordQuality[]) {
      const chord = buildChord("Eb", quality);
      expect(chord.notes[0]).toBe("Eb");
      expect(chord.notes).toHaveLength(CHORD_FORMULAS[quality].length);
    }
  });

  it("names the chord and keeps slash-chord bass notes", () => {
    expect(buildChord("Bb", "maj7").symbol).toBe("Bbmaj7");
    expect(buildSlashChord("C", "7", "E").bassNote).toBe("E");
  });

  it.todo("spells Cm7 as C Eb G Bb rather than C D# G A#");
});

describe("isChordTone and intervalInChord", () => {
  const cm7 = buildChord("C", "m7");

  it("recognises chord tones whatever their spelling", () => {
    expect(isChordTone("Eb", cm7)).toBe(true);
    expect(isChordTone("D#", cm7)).toBe(true);
    expect(isChordTone("E", cm7)).toBe(false);
  });

  it("labels the degree of a chord tone", () => {
    expect(intervalInChord("Bb", cm7)).toBe("b7");
    expect(intervalInChord("G", cm7)).toBe("5");
    expect(intervalInChord("A", cm7)).toBeNull();
  });
});

describe("chordScales", () => {
  it("suggests the standard chord-scales", () => {
    expect(chordScales("m7")).toContain("dorian");
    expect(chordScales("7alt")).toEqual(["altered"]);
    expect(chordScales("m7b5")).toContain("locrian");
  });

  it("falls back to major for unmapped qualities", () => {
    expect(chordScales("6/9")).toEqual(["major"]);
  });
});
