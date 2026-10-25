import type { ChordDefinition, ChordQuality, NoteName, Substitution, SubstitutionType } from "@/types";
import { buildChord } from "./chords";
import { normalizeNote, chromaticIndex } from "./notes";
import { applyInterval, semitonesBetween } from "./intervals";

// ─── Common Tones ─────────────────────────────────────────────────────────────

function findCommonTones(a: ChordDefinition, b: ChordDefinition): NoteName[] {
  const aIndices = new Set(a.notes.map((n) => chromaticIndex(normalizeNote(n))));
  return b.notes.filter((n) => aIndices.has(chromaticIndex(normalizeNote(n))));
}

function voiceLeadingScore(a: ChordDefinition, b: ChordDefinition): number {
  const aNotes = a.notes;
  const bNotes = b.notes;
  const total = Math.min(aNotes.length, bNotes.length);
  let movement = 0;
  for (let i = 0; i < total; i++) {
    // semitonesBetween counts upward (0-11); a voice moves the shorter way.
    const up = semitonesBetween(aNotes[i], bNotes[i % bNotes.length]);
    movement += Math.min(up, 12 - up);
  }
  const maxPossible = total * 6;
  return Math.max(0, Math.round(100 * (1 - movement / maxPossible)));
}

// ─── Substitution Rules ────────────────────────────────────────────────────────

export function tritoneSub(chord: ChordDefinition): Substitution | null {
  const isDominant = chord.quality === "7" || chord.quality === "9" || chord.quality === "13"
    || chord.quality === "7b9" || chord.quality === "7#9" || chord.quality === "7alt"
    || chord.quality === "7#11" || chord.quality === "9#11";
  if (!isDominant) return null;

  const subRoot = applyInterval(chord.root, "b5"); // G7 -> Db7, not C#7
  const sub = buildChord(subRoot, "7");
  const commonTones = findCommonTones(chord, sub);

  return {
    type: "tritone-sub",
    originalChord: chord,
    substitutionChord: sub,
    explanation: `Tritone substitution: ${subRoot}7 shares the 3rd and b7 (as b7 and 3) with ${chord.symbol}. Both resolve to the same target with strong chromatic voice leading.`,
    commonTones,
    voiceLeadingScore: 90,
  };
}

export function secondaryDominants(chord: ChordDefinition, key: NoteName): Substitution[] {
  // For each diatonic chord in the key, compute its V7 (secondary dominant)
  const k = normalizeNote(key);
  const subs: Substitution[] = [];

  // Check if chord is a diatonic target that could have a secondary dominant applied to it
  // V7 of this chord = dominant 7 a perfect 5th above chord root
  const v7Root = applyInterval(chord.root, "5P");
  const v7 = buildChord(v7Root, "7");
  const semitones = semitonesBetween(k, chord.root);

  // Only emit if the secondary dominant doesn't coincide with the natural V7 of the key
  if (semitones !== 7) {
    const commonTones = findCommonTones(chord, v7);
    subs.push({
      type: "secondary-dominant",
      originalChord: chord,
      substitutionChord: v7,
      explanation: `${v7.symbol} is the V7 of ${chord.symbol}. Inserting it before ${chord.symbol} creates a local ii-V-I feel and adds harmonic motion.`,
      commonTones,
      voiceLeadingScore: voiceLeadingScore(chord, v7),
    });
  }

  return subs;
}

export function modalInterchangeSubs(chord: ChordDefinition, key: NoteName): Substitution[] {
  const subs: Substitution[] = [];
  const k = normalizeNote(key);

  // Borrowed chords from parallel minor (natural minor = Aeolian mode)
  // bVII maj7 (borrowed from Aeolian)
  const bVIIRoot = applyInterval(k, "b7");
  const bVII = buildChord(bVIIRoot, "maj7");

  // bVI maj7 (borrowed from Aeolian)
  const bVIRoot = applyInterval(k, "b6");
  const bVI = buildChord(bVIRoot, "maj7");

  // iv minor (borrowed from parallel minor)
  const ivRoot = applyInterval(k, "4P");
  const iv = buildChord(ivRoot, "m7");

  for (const sub of [bVII, bVI, iv]) {
    const commonTones = findCommonTones(chord, sub);
    subs.push({
      type: "modal-interchange",
      originalChord: chord,
      substitutionChord: sub,
      explanation: `${sub.symbol} is borrowed from the parallel ${sub.quality.startsWith("m") ? "minor" : "Aeolian"} mode. Adds a darker, more complex color without leaving the tonal center.`,
      commonTones,
      voiceLeadingScore: voiceLeadingScore(chord, sub),
    });
  }

  return subs;
}

export function passingDiminished(chord: ChordDefinition): Substitution[] {
  // Diminished chord a half-step below or above
  // A half step below is the leading tone (B below C); above is the b2 (Db).
  const below = buildChord(applyInterval(chord.root, "7M"), "dim7");
  const above = buildChord(applyInterval(chord.root, "b2"), "dim7");
  const subs: Substitution[] = [];

  for (const sub of [below, above]) {
    const commonTones = findCommonTones(chord, sub);
    subs.push({
      type: "passing-diminished",
      originalChord: chord,
      substitutionChord: sub,
      explanation: `${sub.symbol} acts as a chromatic passing chord approaching ${chord.symbol} by half-step. Creates tension and forward motion through the symmetrical diminished sound.`,
      commonTones,
      voiceLeadingScore: 70,
    });
  }

  return subs;
}

export function backCycle(chord: ChordDefinition, steps = 2): Substitution[] {
  // Back-cycling: chain of ii-V substitutions going backward in the circle of fifths
  const subs: Substitution[] = [];
  let current = chord;

  for (let i = 0; i < steps; i++) {
    const backedRoot = applyInterval(current.root, "5P"); // up a fifth = back one step in cycle
    const backed = buildChord(backedRoot, "7");
    const commonTones = findCommonTones(current, backed);
    subs.push({
      type: "back-cycle",
      originalChord: chord,
      substitutionChord: backed,
      explanation: `Back-cycling: ${backed.symbol} → ${current.symbol} forms a V7-I resolution. This creates a chain of dominants approaching the original chord.`,
      commonTones,
      voiceLeadingScore: 80,
    });
    current = backed;
  }

  return subs;
}

export function deceptiveResolution(chord: ChordDefinition, key: NoteName): Substitution | null {
  // Replace a dominant V7 with a resolution to vi instead of I (deceptive cadence)
  const k = normalizeNote(key);
  const semitones = semitonesBetween(k, chord.root);
  if (semitones !== 7) return null; // only works for the actual V7

  const viRoot = applyInterval(k, "6M");
  const vi = buildChord(viRoot, "m7");
  const commonTones = findCommonTones(chord, vi);

  return {
    type: "deceptive-resolution",
    originalChord: chord,
    substitutionChord: vi,
    explanation: `Deceptive cadence: instead of resolving ${chord.symbol} to ${key}maj7, resolve to ${vi.symbol} (vi). Creates surprise by denying the expected resolution.`,
    commonTones,
    voiceLeadingScore: 75,
  };
}

// ─── Aggregate ────────────────────────────────────────────────────────────────

export function allSubstitutions(chord: ChordDefinition, key: NoteName): Substitution[] {
  const subs: Substitution[] = [];

  const tritone = tritoneSub(chord);
  if (tritone) subs.push(tritone);

  subs.push(...secondaryDominants(chord, key));
  subs.push(...modalInterchangeSubs(chord, key));
  subs.push(...passingDiminished(chord));
  subs.push(...backCycle(chord, 1));

  const deceptive = deceptiveResolution(chord, key);
  if (deceptive) subs.push(deceptive);

  // Sort by voice leading score descending
  return subs.sort((a, b) => b.voiceLeadingScore - a.voiceLeadingScore);
}
