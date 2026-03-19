import { create } from "zustand";
import { persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { GuitarTuning, LabelMode } from "@/types";
import { STANDARD_TUNING } from "@/lib/theory/guitar";

interface FretboardState {
  readonly tuning: GuitarTuning;
  readonly capo: number;
  readonly startFret: number;
  readonly endFret: number;
  readonly labelMode: LabelMode;
  readonly showInlays: boolean;
  readonly showFretNumbers: boolean;

  setTuning: (tuning: GuitarTuning) => void;
  setCapo: (capo: number) => void;
  setFretRange: (start: number, end: number) => void;
  setLabelMode: (mode: LabelMode) => void;
  toggleInlays: () => void;
}

export const useFretboardStore = create<FretboardState>()(
  persist(
    immer((set) => ({
      tuning: STANDARD_TUNING,
      capo: 0,
      startFret: 0,
      endFret: 12,
      labelMode: "intervalName",
      showInlays: true,
      showFretNumbers: true,

      setTuning: (tuning) =>
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        set((state) => { (state as any).tuning = tuning; }),

      setCapo: (capo) =>
        set((state) => { state.capo = Math.max(0, Math.min(12, capo)); }),

      setFretRange: (start, end) =>
        set((state) => {
          state.startFret = start;
          state.endFret = end;
        }),

      setLabelMode: (mode) =>
        set((state) => { state.labelMode = mode; }),

      toggleInlays: () =>
        set((state) => { state.showInlays = !state.showInlays; }),
    })),
    {
      name: "jazz-guitar-fretboard",
      partialize: (s) => ({ tuning: s.tuning, capo: s.capo, labelMode: s.labelMode }),
    }
  )
);
