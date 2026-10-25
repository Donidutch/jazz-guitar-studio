import { describe, expect, it } from "vitest";
import type { StringNumber, Voicing } from "@/types";
import { buildChord } from "./chords";
import { STANDARD_TUNING } from "./guitar";
import { midiToNoteName } from "./notes";
import { autoVoiceProgression, bestNextVoicing, computeVoiceLeading } from "./voiceLeading";
import { generateVoicings } from "./voicings";

// A minimal voicing from MIDI pitches; only the pitches matter for voice leading.
function voicing(midis: number[]): Voicing {
  const notes = midis.map((midi, i) => ({
    string: (6 - i) as StringNumber,
    fret: 0,
    note: midiToNoteName(midi),
    octave: Math.floor(midi / 12) - 1,
    midi,
    intervalName: "",
    muted: false,
  }));
  return {
    id: midis.join("-"),
    chord: buildChord("C", "maj7"),
    notes,
    type: "close",
    lowestFret: 0,
    highestFret: 0,
    span: 0,
    stringSet: notes.map((n) => n.string),
    position: 1,
    bassNote: notes[0].note,
    topNote: notes[notes.length - 1].note,
    inversion: 0,
    difficulty: 1,
  };
}

describe("computeVoiceLeading", () => {
  it("scores staying put as perfectly smooth", () => {
    const v = voicing([48, 52, 55, 59]);
    const result = computeVoiceLeading(v, v);
    expect(result.totalDistance).toBe(0);
    expect(result.smoothnessScore).toBe(100);
    expect(result.movements.every((m) => m.direction === "static")).toBe(true);
  });

  it("pairs each voice with its nearest neighbour", () => {
    // Dm7 (D F A C) to G7 (D F G B): A falls a step to G, C falls a half step to B.
    const result = computeVoiceLeading(voicing([50, 53, 57, 60]), voicing([50, 53, 55, 59]));
    expect(result.totalDistance).toBe(3);
    const moves = result.movements.map((m) => m.semitoneDistance).sort((a, b) => a - b);
    expect(moves).toEqual([-2, -1, 0, 0]);
  });

  it("flags parallel fifths and octaves", () => {
    // C-G moving to D-A: both voices up a whole step, a fifth apart.
    expect(computeVoiceLeading(voicing([48, 55]), voicing([50, 57])).hasParallelFifths).toBe(true);
    // C-C moving to D-D.
    expect(computeVoiceLeading(voicing([48, 60]), voicing([50, 62])).hasParallelOctaves).toBe(true);
  });

  it("does not flag fifths approached in contrary motion", () => {
    // C-G to D-F: the voices move in opposite directions.
    const result = computeVoiceLeading(voicing([48, 55]), voicing([50, 53]));
    expect(result.hasParallelFifths).toBe(false);
  });
});

describe("choosing voicings", () => {
  const dm7 = buildChord("D", "m7");
  const g7 = buildChord("G", "7");

  it("picks the next voicing with the smoothest movement", () => {
    const from = generateVoicings(dm7, STANDARD_TUNING)[0];
    const best = bestNextVoicing(from, g7, STANDARD_TUNING);
    expect(best).not.toBeNull();
    for (const candidate of generateVoicings(g7, STANDARD_TUNING)) {
      expect(computeVoiceLeading(from, candidate).smoothnessScore).toBeLessThanOrEqual(
        best!.result.smoothnessScore,
      );
    }
  });

  it("voices a whole ii-V-I, one voicing per chord", () => {
    const chords = [dm7, g7, buildChord("C", "maj7")];
    const voiced = autoVoiceProgression(chords, STANDARD_TUNING);
    expect(voiced.map((v) => v.chord.symbol)).toEqual(chords.map((c) => c.symbol));
  });

  it("returns nothing for an empty progression", () => {
    expect(autoVoiceProgression([], STANDARD_TUNING)).toEqual([]);
  });
});
