import type {
  ChordDefinition, FretNumber, GuitarTuning, MidiNote,
  NoteName, StringNumber, Voicing, VoicingNote, VoicingType,
} from "@/types";
import { chromaticIndex, midiToNoteName, normalizeNote, preferFlatsForKey } from "./notes";
import { degreeLabel, intervalSemitones } from "./intervals";
import { fretToMidi, fingeringDifficulty, isPlayable, STANDARD_TUNING } from "./guitar";

// ─── Voicing Generation Engine ────────────────────────────────────────────────

const MAX_FRET = 15;
const MAX_SPAN = 4;

// String sets to enumerate (expressed as arrays of StringNumbers, low to high)
// Each string in the set must be played (no muting within a set)
const STRING_SETS: StringNumber[][] = [
  [6, 5, 4, 3],    // low 4 strings
  [5, 4, 3, 2],    // middle 4 strings
  [4, 3, 2, 1],    // high 4 strings
  [6, 5, 4, 3, 2], // 5 strings (no 1)
  [5, 4, 3, 2, 1], // 5 strings (no 6)
];

// ─── Chord Tone Mapping ───────────────────────────────────────────────────────

interface ChordTonePosition {
  readonly string: StringNumber;
  readonly fret: FretNumber;
  readonly midi: MidiNote;
  readonly note: NoteName;
  readonly octave: number;
  readonly intervalName: string; // "R", "3", "b7", etc.
  readonly intervalIndex: number; // which chord tone (0=root, 1=3rd, etc.)
}

function buildChordToneMap(
  chord: ChordDefinition,
  tuning: GuitarTuning
): Map<StringNumber, ChordTonePosition[]> {
  const useFlats = preferFlatsForKey(chord.root);
  const chordNoteIndices = chord.notes.map((n) => chromaticIndex(normalizeNote(n)));
  const map = new Map<StringNumber, ChordTonePosition[]>();

  for (let s = 1; s <= 6; s++) {
    const string = s as StringNumber;
    const positions: ChordTonePosition[] = [];
    for (let f = 0; f <= MAX_FRET; f++) {
      const midi = fretToMidi(tuning, string, f);
      const noteIdx = midi % 12;
      const chordIdx = chordNoteIndices.indexOf(noteIdx);
      if (chordIdx !== -1) {
        // Show the chord's spelling (Eb in Cm7), not a key-wide sharp/flat choice.
        const note = chord.notes[chordIdx] ?? midiToNoteName(midi, useFlats);
        const octave = Math.floor(midi / 12) - 1;
        const intervalName = degreeLabel(chord.intervals[chordIdx]);
        positions.push({ string, fret: f, midi, note, octave, intervalName, intervalIndex: chordIdx });
      }
    }
    map.set(string, positions);
  }

  return map;
}

// ─── Voicing Type Classification ─────────────────────────────────────────────

function classifyVoicingType(notes: ChordTonePosition[], chord: ChordDefinition): VoicingType {
  const sortedByMidi = [...notes].sort((a, b) => a.midi - b.midi);
  const hasRoot = notes.some((n) => n.intervalIndex === 0);
  const intervalIndices = notes.map((n) => n.intervalIndex);

  // Guide tone: only 3rd and 7th (indices 1 and 3 in 4-note chords)
  const has3rd = intervalIndices.includes(1);
  const has7th = chord.intervals.length >= 4 && intervalIndices.includes(3);
  if (notes.length === 2 && has3rd && has7th) return "guideTone";

  // Shell: root, 3rd, 7th (3 notes)
  if (notes.length === 3 && hasRoot && has3rd && has7th) return "shell";

  // Rootless: no root (index 0)
  if (!hasRoot) return "rootless";

  // Quartal: check if intervals between adjacent voices are predominantly 4ths (5 semitones)
  if (sortedByMidi.length >= 3) {
    const intervals = [];
    for (let i = 1; i < sortedByMidi.length; i++) {
      intervals.push((sortedByMidi[i].midi - sortedByMidi[i - 1].midi) % 12);
    }
    const quartalCount = intervals.filter((iv) => iv === 5 || iv === 6).length;
    if (quartalCount >= intervals.length - 1) return "quartal";
  }

  // Drop voicings: a close-position chord with a voice lowered an octave.
  // Undo the drop (raise those voices back up) and check for close position.
  // Drop 2 lowers the 2nd voice from the top, which becomes the lowest voice.
  if (sortedByMidi.length === 4) {
    const midis = sortedByMidi.map((n) => n.midi);
    // Already close: raising the bass would also look "close", so check first.
    if (isClosePosition(midis)) return "close";
    if (isClosePosition(raiseByOctave(midis, [0]))) return "drop2";
    if (isClosePosition(raiseByOctave(midis, [1]))) return "drop3";
    if (isClosePosition(raiseByOctave(midis, [0, 2]))) return "drop2-4";
  }

  // Close position: all voices within an octave
  const span = sortedByMidi[sortedByMidi.length - 1].midi - sortedByMidi[0].midi;
  if (span <= 12) return "close";

  return "open";
}

function raiseByOctave(midis: number[], indices: number[]): number[] {
  return midis.map((m, i) => (indices.includes(i) ? m + 12 : m)).sort((a, b) => a - b);
}

// Close position: distinct voices, all within one octave.
function isClosePosition(midis: number[]): boolean {
  return new Set(midis).size === midis.length && midis[midis.length - 1] - midis[0] < 12;
}

// ─── Deterministic ID ─────────────────────────────────────────────────────────

function voicingId(stringFretPairs: { string: StringNumber; fret: FretNumber }[]): string {
  return stringFretPairs
    .sort((a, b) => b.string - a.string)
    .map((p) => `${p.string}:${p.fret}`)
    .join("-");
}

// ─── Core Enumeration ─────────────────────────────────────────────────────────

function enumerateStringSet(
  stringSet: StringNumber[],
  chordToneMap: Map<StringNumber, ChordTonePosition[]>,
  chord: ChordDefinition,
  tuning: GuitarTuning
): Voicing[] {
  const useFlats = preferFlatsForKey(chord.root);
  const perString = stringSet.map((s) => chordToneMap.get(s) ?? []);

  // For 4+ note chords we want to cover all chord tones; for fewer strings, allow omissions
  // but we must have at least root+3rd+7th (or at least 2 distinct chord tones)

  const voicings: Voicing[] = [];
  const seen = new Set<string>();
  // How many distinct chord-tone intervals must be covered
  const requiredIntervals = chord.intervals.length;

  function recurse(
    stringIdx: number,
    chosen: ChordTonePosition[],
    coveredIntervalIndices: Set<number>
  ): void {
    if (stringIdx === perString.length) {
      if (chosen.length < 3) return; // minimum 3 notes
      // Must cover all unique chord tones (or all available if chord has fewer notes than strings)
      const requiredCoverage = Math.min(requiredIntervals, perString.length);
      if (coveredIntervalIndices.size < requiredCoverage) return;
      if (!isPlayable(chosen, MAX_SPAN)) return;

      const id = voicingId(chosen);
      if (seen.has(id)) return;
      seen.add(id);

      const sortedByString = [...chosen].sort((a, b) => b.string - a.string);
      const sortedByMidi = [...chosen].sort((a, b) => a.midi - b.midi);
      const nonOpenFrets = chosen.filter((n) => n.fret > 0).map((n) => n.fret);
      const lowestFret = nonOpenFrets.length > 0 ? Math.min(...nonOpenFrets) : 0;
      const highestFret = nonOpenFrets.length > 0 ? Math.max(...nonOpenFrets) : 0;
      const span = highestFret - lowestFret;

      // Inversion: based on bass note
      const bassNote = sortedByMidi[0];
      const inversion = bassNote.intervalIndex as 0 | 1 | 2 | 3;

      const voicingNotes: VoicingNote[] = sortedByString.map((n) => ({
        string: n.string,
        fret: n.fret,
        note: n.note,
        octave: n.octave,
        midi: n.midi,
        intervalName: n.intervalName,
        muted: false,
      }));

      const type = classifyVoicingType(chosen, chord);
      const difficulty = fingeringDifficulty(chosen);
      const position = lowestFret === 0 ? 1 : Math.max(1, lowestFret);

      voicings.push({
        id,
        chord,
        notes: voicingNotes,
        type,
        lowestFret,
        highestFret,
        span,
        stringSet: stringSet.slice(),
        position,
        bassNote: bassNote.note,
        topNote: sortedByMidi[sortedByMidi.length - 1].note,
        inversion,
        difficulty,
      });
      return;
    }

    const options = perString[stringIdx];
    // Each string in the set must play exactly one chord tone (no muting within the set)
    // If no chord tone is available on this string, skip the whole branch
    if (options.length === 0) return;

    for (const pos of options) {
      const newCovered = new Set(coveredIntervalIndices);
      newCovered.add(pos.intervalIndex);
      recurse(stringIdx + 1, [...chosen, pos], newCovered);
    }
  }

  recurse(0, [], new Set());
  return voicings;
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const voicingCache = new Map<string, Voicing[]>();

// ─── Public API ───────────────────────────────────────────────────────────────

export function generateVoicings(
  chord: ChordDefinition,
  tuning: GuitarTuning = STANDARD_TUNING
): Voicing[] {
  const cacheKey = `${chord.symbol}-${tuning.name}`;
  if (voicingCache.has(cacheKey)) return voicingCache.get(cacheKey)!;

  const chordToneMap = buildChordToneMap(chord, tuning);
  const allVoicings: Voicing[] = [];

  for (const stringSet of STRING_SETS) {
    const voicings = enumerateStringSet(stringSet, chordToneMap, chord, tuning);
    allVoicings.push(...voicings);
  }

  // Deduplicate across string sets (same fret pattern may appear in multiple string sets)
  const seen = new Set<string>();
  const unique = allVoicings.filter((v) => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });

  // Sort by: difficulty asc, then position asc
  const sorted = unique.sort((a, b) => {
    if (a.difficulty !== b.difficulty) return a.difficulty - b.difficulty;
    return a.position - b.position;
  });

  voicingCache.set(cacheKey, sorted);
  return sorted;
}

export function filterVoicings(
  voicings: Voicing[],
  filters: {
    type?: VoicingType;
    maxDifficulty?: number;
    stringSet?: number; // number of strings: 3,4,5,6
    maxPosition?: number;
    inversion?: 0 | 1 | 2 | 3;
  }
): Voicing[] {
  return voicings.filter((v) => {
    if (filters.type && v.type !== filters.type) return false;
    if (filters.maxDifficulty !== undefined && v.difficulty > filters.maxDifficulty) return false;
    if (filters.stringSet !== undefined && v.stringSet.length !== filters.stringSet) return false;
    if (filters.maxPosition !== undefined && v.position > filters.maxPosition) return false;
    if (filters.inversion !== undefined && v.inversion !== filters.inversion) return false;
    return true;
  });
}

export function clearVoicingCache(): void {
  voicingCache.clear();
}
