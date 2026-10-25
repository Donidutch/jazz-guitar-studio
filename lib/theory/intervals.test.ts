import { describe, expect, it } from "vitest";
import {
  applyInterval,
  degreeLabel,
  intervalFromSemitones,
  intervalName,
  intervalSemitones,
  semitonesBetween,
} from "./intervals";

describe("semitonesBetween", () => {
  it("counts upward within one octave", () => {
    expect(semitonesBetween("C", "G")).toBe(7);
    expect(semitonesBetween("G", "C")).toBe(5);
    expect(semitonesBetween("E", "E")).toBe(0);
  });
});

describe("intervalSemitones", () => {
  it("knows simple and compound intervals", () => {
    expect(intervalSemitones("3M")).toBe(4);
    expect(intervalSemitones("b7")).toBe(10);
    expect(intervalSemitones("#11")).toBe(18);
    expect(intervalSemitones("b13")).toBe(20);
  });

  it("throws on an unknown interval", () => {
    expect(() => intervalSemitones("x9")).toThrow(/Unknown interval/);
  });
});

describe("applyInterval", () => {
  it("builds notes above a root", () => {
    expect(applyInterval("C", "5P")).toBe("G");
    expect(applyInterval("F", "4P", true)).toBe("Bb");
    expect(applyInterval("A", "b3")).toBe("C");
  });
});

describe("names and labels", () => {
  it("names intervals and falls back for unnamed ones", () => {
    expect(intervalName(6)).toBe("Tritone");
    expect(intervalName(19)).toBe("19 semitones");
    expect(intervalFromSemitones(7)).toBe("P5");
    expect(intervalFromSemitones(19)).toBe("+19");
    expect(degreeLabel("b3")).toBe("b3");
    expect(degreeLabel("1P")).toBe("R");
  });
});
