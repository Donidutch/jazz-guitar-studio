import type { ChordDefinition, GuitarTuning, Voicing, VoiceLeadingResult, VoiceMovement, VoicingNote } from "@/types";
import { intervalFromSemitones } from "./intervals";
import { generateVoicings } from "./voicings";

// ─── Optimal Voice Pairing ─────────────────────────────────────────────────────

function findOptimalPairing(
  from: VoicingNote[],
  to: VoicingNote[]
): [VoicingNote, VoicingNote][] {
  // Sort both by midi pitch ascending
  const sortedFrom = [...from].sort((a, b) => a.midi - b.midi);
  const sortedTo = [...to].sort((a, b) => a.midi - b.midi);

  // Greedy nearest-neighbor: pair each "to" voice with the closest unused "from" voice
  const usedFrom = new Set<number>();
  const pairs: [VoicingNote, VoicingNote][] = [];

  for (const toNote of sortedTo) {
    let bestIdx = -1;
    let bestDist = Infinity;
    for (let i = 0; i < sortedFrom.length; i++) {
      if (usedFrom.has(i)) continue;
      const dist = Math.abs(toNote.midi - sortedFrom[i].midi);
      if (dist < bestDist) {
        bestDist = dist;
        bestIdx = i;
      }
    }
    if (bestIdx !== -1) {
      usedFrom.add(bestIdx);
      pairs.push([sortedFrom[bestIdx], toNote]);
    }
  }

  return pairs;
}

// ─── Parallel Motion Detection ─────────────────────────────────────────────────

function detectParallelMotion(
  pairs: [VoicingNote, VoicingNote][]
): { parallelFifths: boolean; parallelOctaves: boolean } {
  let parallelFifths = false;
  let parallelOctaves = false;

  for (let i = 0; i < pairs.length; i++) {
    for (let j = i + 1; j < pairs.length; j++) {
      const [fromA, toA] = pairs[i];
      const [fromB, toB] = pairs[j];

      const fromInterval = Math.abs(fromA.midi - fromB.midi) % 12;
      const toInterval = Math.abs(toA.midi - toB.midi) % 12;

      const directionA = Math.sign(toA.midi - fromA.midi);
      const directionB = Math.sign(toB.midi - fromB.midi);
      const parallel = directionA === directionB && directionA !== 0;

      if (parallel) {
        if (fromInterval === 7 && toInterval === 7) parallelFifths = true;
        if (fromInterval === 0 && toInterval === 0) parallelOctaves = true;
      }
    }
  }

  return { parallelFifths, parallelOctaves };
}

// ─── Public API ────────────────────────────────────────────────────────────────

export function computeVoiceLeading(
  fromVoicing: Voicing,
  toVoicing: Voicing
): VoiceLeadingResult {
  const fromNotes = [...fromVoicing.notes];
  const toNotes = [...toVoicing.notes];

  const pairs = findOptimalPairing(fromNotes, toNotes);

  const movements: VoiceMovement[] = pairs.map(([fromNote, toNote]) => {
    const semitoneDistance = toNote.midi - fromNote.midi;
    const direction: "up" | "down" | "static" =
      semitoneDistance > 0 ? "up" : semitoneDistance < 0 ? "down" : "static";
    return {
      fromNote,
      toNote,
      semitoneDistance,
      direction,
      intervalName: intervalFromSemitones(Math.abs(semitoneDistance)),
    };
  });

  const totalDistance = movements.reduce((sum, m) => sum + Math.abs(m.semitoneDistance), 0);
  const maxPossible = pairs.length * 12;
  const smoothnessScore = maxPossible > 0
    ? Math.round(100 * (1 - totalDistance / maxPossible))
    : 100;

  const { parallelFifths, parallelOctaves } = detectParallelMotion(pairs);

  return {
    fromVoicing,
    toVoicing,
    movements,
    totalDistance,
    hasParallelFifths: parallelFifths,
    hasParallelOctaves: parallelOctaves,
    smoothnessScore,
  };
}

// Find the best voicing for a target chord given a source voicing
export function bestNextVoicing(
  fromVoicing: Voicing,
  targetChord: ChordDefinition,
  tuning: GuitarTuning
): { voicing: Voicing; result: VoiceLeadingResult } | null {
  const candidates = generateVoicings(targetChord, tuning);
  if (candidates.length === 0) return null;

  let best: { voicing: Voicing; result: VoiceLeadingResult } | null = null;

  for (const candidate of candidates) {
    const result = computeVoiceLeading(fromVoicing, candidate);
    if (!best || result.smoothnessScore > best.result.smoothnessScore) {
      best = { voicing: candidate, result };
    }
  }

  return best;
}

// Auto voice-lead an entire progression
export function autoVoiceProgression(
  chords: ChordDefinition[],
  tuning: GuitarTuning
): Voicing[] {
  if (chords.length === 0) return [];

  const allCandidates = chords.map((c) => generateVoicings(c, tuning));

  // Start with the easiest voicing of the first chord
  const result: Voicing[] = [allCandidates[0][0]];

  for (let i = 1; i < chords.length; i++) {
    const prev = result[i - 1];
    const candidates = allCandidates[i];
    if (candidates.length === 0) continue;

    let bestVoicing = candidates[0];
    let bestScore = -1;

    for (const candidate of candidates) {
      const vl = computeVoiceLeading(prev, candidate);
      if (vl.smoothnessScore > bestScore) {
        bestScore = vl.smoothnessScore;
        bestVoicing = candidate;
      }
    }

    result.push(bestVoicing);
  }

  return result;
}
