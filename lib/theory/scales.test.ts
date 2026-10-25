import { describe, expect, it } from "vitest";
import type { ScaleType } from "@/types";
import { buildScale, SCALE_FORMULAS, scaleNeckPositions } from "./scales";
import { chromaticIndex } from "./notes";
import { intervalSemitones } from "./intervals";

const pitchSet = (notes: readonly string[]) =>
  [...new Set(notes.map((n) => chromaticIndex(n)))].sort((a, b) => a - b);

describe("buildScale", () => {
  it.each<[ScaleType, string[]]>([
    ["major", ["C", "D", "E", "F", "G", "A", "B"]],
    ["dorian", ["C", "D", "Eb", "F", "G", "A", "Bb"]],
    ["lydian", ["C", "D", "E", "F#", "G", "A", "B"]],
    ["altered", ["C", "Db", "Eb", "E", "Gb", "Ab", "Bb"]],
    ["half-whole-dim", ["C", "Db", "Eb", "E", "F#", "G", "A", "Bb"]],
    ["whole-tone", ["C", "D", "E", "F#", "G#", "A#"]],
    ["blues", ["C", "Eb", "F", "Gb", "G", "Bb"]],
    // Barry Harris / David Baker: the major scale plus a #5 passing tone.
    ["major-bebop", ["C", "D", "E", "F", "G", "G#", "A", "B"]],
    // Mixolydian plus a natural 7 passing tone.
    ["dominant-bebop", ["C", "D", "E", "F", "G", "A", "Bb", "B"]],
  ])("C %s has the right notes", (type, expected) => {
    expect(pitchSet(buildScale("C", type).notes)).toEqual(pitchSet(expected));
  });

  it("lists every formula in ascending order without repeats", () => {
    for (const [type, formula] of Object.entries(SCALE_FORMULAS)) {
      const steps = formula.map((iv) => intervalSemitones(iv));
      const ascending = [...steps].sort((a, b) => a - b);
      expect(steps, type).toEqual(ascending);
      expect(new Set(steps).size, type).toBe(steps.length);
    }
  });
});

describe("scaleNeckPositions", () => {
  const positions = scaleNeckPositions(buildScale("G", "major"));

  it("only places scale notes, within a six-fret window per position", () => {
    const allowed = new Set(buildScale("G", "major").notes.map((n) => chromaticIndex(n)));
    expect(positions.length).toBeGreaterThan(0);
    for (const position of positions) {
      expect(position.highestFret - position.lowestFret).toBe(5);
      for (const note of position.notes) {
        expect(allowed.has(note.midi % 12)).toBe(true);
        expect(note.fret).toBeGreaterThanOrEqual(position.lowestFret);
        expect(note.fret).toBeLessThanOrEqual(position.highestFret);
      }
    }
  });

  it("anchors a position on the G at fret 3 of the low E string", () => {
    expect(positions.some((p) => p.rootPositions.some((r) => r.string === 6 && r.fret === 3))).toBe(true);
  });
});
