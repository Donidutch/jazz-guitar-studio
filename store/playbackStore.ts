import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface PlaybackState {
  readonly isPlaying: boolean;
  readonly currentChordIndex: number;
  readonly loop: boolean;
  readonly bpm: number;
  readonly swing: number; // 0-1
  readonly metronomeActive: boolean;
  readonly currentBeat: number; // 0-based beat within bar

  setPlaying: (playing: boolean) => void;
  setCurrentChord: (index: number) => void;
  setLoop: (loop: boolean) => void;
  setBpm: (bpm: number) => void;
  setSwing: (swing: number) => void;
  setMetronomeActive: (active: boolean) => void;
  setCurrentBeat: (beat: number) => void;
}

export const usePlaybackStore = create<PlaybackState>()(
  immer((set) => ({
    isPlaying: false,
    currentChordIndex: 0,
    loop: true,
    bpm: 120,
    swing: 0,
    metronomeActive: false,
    currentBeat: 0,

    setPlaying: (playing) =>
      set((state) => {
        state.isPlaying = playing;
        if (!playing) {
          state.currentChordIndex = 0;
          state.currentBeat = 0;
        }
      }),

    setCurrentChord: (index) =>
      set((state) => { state.currentChordIndex = index; }),

    setLoop: (loop) =>
      set((state) => { state.loop = loop; }),

    setBpm: (bpm) =>
      set((state) => { state.bpm = Math.max(40, Math.min(300, bpm)); }),

    setSwing: (swing) =>
      set((state) => { state.swing = Math.max(0, Math.min(1, swing)); }),

    setMetronomeActive: (active) =>
      set((state) => { state.metronomeActive = active; }),

    setCurrentBeat: (beat) =>
      set((state) => { state.currentBeat = beat; }),
  }))
);
