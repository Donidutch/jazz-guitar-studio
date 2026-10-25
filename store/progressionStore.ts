import { castDraft } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { ChordDefinition, NoteName, Progression, ProgressionChord, Voicing } from "@/types";
import { createProgression, analyzeChordInKey } from "@/lib/theory/progressions";
import { buildChord } from "@/lib/theory/chords";
import { normalizeNote } from "@/lib/theory/notes";

interface ProgressionState {
  readonly progressions: Progression[];
  readonly activeProgressionId: string | null;
  readonly activeKey: NoteName;

  activeProgression: () => Progression | null;
  createNew: (name?: string) => void;
  addChord: (progressionId: string, chord: ChordDefinition, durationBeats?: number) => void;
  removeChord: (progressionId: string, chordId: string) => void;
  updateChordVoicing: (progressionId: string, chordId: string, voicing: Voicing) => void;
  updateChordDuration: (progressionId: string, chordId: string, beats: number) => void;
  moveChord: (progressionId: string, fromIdx: number, toIdx: number) => void;
  setActiveProgression: (id: string | null) => void;
  setKey: (key: NoteName) => void;
  setBpm: (progressionId: string, bpm: number) => void;
  setSwing: (progressionId: string, swing: number) => void;
  deleteProgression: (id: string) => void;
}

const DEFAULT_PROGRESSION = createProgression("My Progression", "C", [
  { chord: buildChord("D", "m7"), durationBeats: 2 },
  { chord: buildChord("G", "7"), durationBeats: 2 },
  { chord: buildChord("C", "maj7"), durationBeats: 4 },
]);

export const useProgressionStore = create<ProgressionState>()(
  persist(
    immer((set, get) => ({
      progressions: [DEFAULT_PROGRESSION],
      activeProgressionId: DEFAULT_PROGRESSION.id,
      activeKey: "C",

      activeProgression: () => {
        const { progressions, activeProgressionId } = get();
        return progressions.find((p) => p.id === activeProgressionId) ?? null;
      },

      createNew: (name = "New Progression") =>
        set((state) => {
          const p = createProgression(name, state.activeKey, []);
          // Progression is readonly by design; inside an Immer draft it may be added.
          state.progressions.push(castDraft(p));
          state.activeProgressionId = p.id;
        }),

      addChord: (progressionId, chord, durationBeats = 4) =>
        set((state) => {
          const prog = state.progressions.find((p) => p.id === progressionId);
          if (!prog) return;
          const analysis = analyzeChordInKey(chord, prog.key);
          const newChord: ProgressionChord = {
            id: `chord-${Date.now()}-${Math.random().toString(36).slice(2)}`,
            chord,
            durationBeats,
            romanNumeral: analysis.romanNumeral,
            harmonicFunction: analysis.harmonicFunction,
            secondaryFunction: analysis.secondaryFunction,
          };
          (prog.chords as ProgressionChord[]).push(newChord);
          prog.updatedAt = Date.now();
        }),

      removeChord: (progressionId, chordId) =>
        set((state) => {
          const prog = state.progressions.find((p) => p.id === progressionId);
          if (!prog) return;
          const idx = prog.chords.findIndex((c) => c.id === chordId);
          if (idx !== -1) (prog.chords as ProgressionChord[]).splice(idx, 1);
          prog.updatedAt = Date.now();
        }),

      updateChordVoicing: (progressionId, chordId, voicing) =>
        set((state) => {
          const prog = state.progressions.find((p) => p.id === progressionId);
          if (!prog) return;
          const chord = prog.chords.find((c) => c.id === chordId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (chord) (chord as any).voicing = voicing;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (prog as any).updatedAt = Date.now();
        }),

      updateChordDuration: (progressionId, chordId, beats) =>
        set((state) => {
          const prog = state.progressions.find((p) => p.id === progressionId);
          if (!prog) return;
          const chord = prog.chords.find((c) => c.id === chordId);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (chord) (chord as any).durationBeats = beats;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (prog as any).updatedAt = Date.now();
        }),

      moveChord: (progressionId, fromIdx, toIdx) =>
        set((state) => {
          const prog = state.progressions.find((p) => p.id === progressionId);
          if (!prog) return;
          const chords = prog.chords as ProgressionChord[];
          const [removed] = chords.splice(fromIdx, 1);
          chords.splice(toIdx, 0, removed);
          prog.updatedAt = Date.now();
        }),

      setActiveProgression: (id) =>
        set((state) => {
          state.activeProgressionId = id;
        }),

      setKey: (key) =>
        set((state) => {
          state.activeKey = normalizeNote(key);
          // Re-analyze chords in all progressions that use this key
          for (const prog of state.progressions) {
            if (prog.id === state.activeProgressionId) {
              prog.key = state.activeKey;
              for (const chord of prog.chords) {
                const analysis = analyzeChordInKey(chord.chord, state.activeKey);
                chord.romanNumeral = analysis.romanNumeral;
                chord.harmonicFunction = analysis.harmonicFunction;
                chord.secondaryFunction = analysis.secondaryFunction;
              }
            }
          }
        }),

      setBpm: (progressionId, bpm) =>
        set((state) => {
          const prog = state.progressions.find((p) => p.id === progressionId);
          if (prog) prog.bpm = bpm;
        }),

      setSwing: (progressionId, swing) =>
        set((state) => {
          const prog = state.progressions.find((p) => p.id === progressionId);
          if (prog) prog.swing = swing;
        }),

      deleteProgression: (id) =>
        set((state) => {
          const idx = state.progressions.findIndex((p) => p.id === id);
          if (idx !== -1) state.progressions.splice(idx, 1);
          if (state.activeProgressionId === id) {
            state.activeProgressionId = state.progressions[0]?.id ?? null;
          }
        }),
    })),
    {
      name: "jazz-guitar-progressions",
      partialize: (state) => ({
        progressions: state.progressions,
        activeProgressionId: state.activeProgressionId,
        activeKey: state.activeKey,
      }),
    }
  )
);
