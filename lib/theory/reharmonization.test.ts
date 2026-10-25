import { describe, expect, it } from "vitest";
import { buildChord } from "./chords";
import { chromaticIndex } from "./notes";
import {
  allSubstitutions,
  backCycle,
  deceptiveResolution,
  modalInterchangeSubs,
  passingDiminished,
  secondaryDominants,
  tritoneSub,
} from "./reharmonization";

const pc = (note: string) => chromaticIndex(note);
const pcs = (notes: readonly string[]) => notes.map(pc).sort((a, b) => a - b);

describe("tritoneSub", () => {
  it("replaces G7 with the dominant a tritone away, sharing B and F", () => {
    const sub = tritoneSub(buildChord("G", "7"));
    expect(sub).not.toBeNull();
    expect(sub!.substitutionChord.symbol).toBe("Db7");
    expect(pcs(sub!.commonTones)).toEqual(pcs(["B", "F"]));
  });

  it("only applies to dominant chords", () => {
    expect(tritoneSub(buildChord("C", "maj7"))).toBeNull();
  });
});

describe("voice-leading scores", () => {
  it("measures movement the short way round", () => {
    // Cmaj7 to Abmaj7: every voice moves four semitones down (not eight up).
    const bVI = modalInterchangeSubs(buildChord("C", "maj7"), "C").find(
      (s) => pc(s.substitutionChord.root) === pc("Ab"),
    );
    expect(bVI?.voiceLeadingScore).toBe(33);
  });

  it("scores a secondary dominant above zero", () => {
    const [sub] = secondaryDominants(buildChord("D", "m7"), "C");
    expect(pc(sub.substitutionChord.root)).toBe(pc("A"));
    expect(sub.voiceLeadingScore).toBeGreaterThan(0);
  });
});

describe("other substitutions", () => {
  it("skips a secondary dominant that is just the key's own V7", () => {
    expect(secondaryDominants(buildChord("G", "7"), "C")).toEqual([]);
  });

  it("back-cycles G7 through D7 and A7", () => {
    const chain = backCycle(buildChord("G", "7"), 2).map((s) => pc(s.substitutionChord.root));
    expect(chain).toEqual([pc("D"), pc("A")]);
  });

  it("offers diminished chords a half step either side", () => {
    const roots = passingDiminished(buildChord("C", "maj7")).map((s) => pc(s.substitutionChord.root));
    expect(roots).toEqual([pc("B"), pc("Db")]);
  });

  it("resolves only the real V7 deceptively, to vi", () => {
    expect(pc(deceptiveResolution(buildChord("G", "7"), "C")!.substitutionChord.root)).toBe(pc("A"));
    expect(deceptiveResolution(buildChord("D", "7"), "C")).toBeNull();
  });

  it("sorts all substitutions by voice-leading score", () => {
    const scores = allSubstitutions(buildChord("G", "7"), "C").map((s) => s.voiceLeadingScore);
    expect(scores).toEqual([...scores].sort((a, b) => b - a));
  });
});
