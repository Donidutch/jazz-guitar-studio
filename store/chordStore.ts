import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import type { ChordDefinition, ChordQuality, NoteName, Voicing, VoicingType } from "@/types";
import { buildChord } from "@/lib/theory/chords";
import { normalizeNote } from "@/lib/theory/notes";

interface ChordFilters {
  type?: VoicingType;
  maxDifficulty: number;
  stringSet?: number;
  maxPosition?: number;
  inversion?: 0 | 1 | 2 | 3;
}

interface ChordState {
  readonly root: NoteName;
  readonly quality: ChordQuality;
  readonly chord: ChordDefinition;
  readonly selectedVoicingId: string | null;
  readonly compareVoicingId: string | null;
  readonly filters: ChordFilters;

  setRoot: (root: NoteName) => void;
  setQuality: (quality: ChordQuality) => void;
  setSelectedVoicing: (id: string | null) => void;
  setCompareVoicing: (id: string | null) => void;
  setFilters: (filters: Partial<ChordFilters>) => void;
}

export const useChordStore = create<ChordState>()(
  immer((set) => ({
    root: "C",
    quality: "maj7",
    chord: buildChord("C", "maj7"),
    selectedVoicingId: null,
    compareVoicingId: null,
    filters: { maxDifficulty: 5 },

    setRoot: (root) =>
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = state as any;
        s.root = normalizeNote(root);
        s.chord = buildChord(s.root, s.quality);
        s.selectedVoicingId = null;
        s.compareVoicingId = null;
      }),

    setQuality: (quality) =>
      set((state) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const s = state as any;
        s.quality = quality;
        s.chord = buildChord(s.root, quality);
        s.selectedVoicingId = null;
        s.compareVoicingId = null;
      }),

    setSelectedVoicing: (id) =>
      set((state) => {
        state.selectedVoicingId = id;
      }),

    setCompareVoicing: (id) =>
      set((state) => {
        state.compareVoicingId = id;
      }),

    setFilters: (filters) =>
      set((state) => {
        Object.assign(state.filters, filters);
      }),
  }))
);
