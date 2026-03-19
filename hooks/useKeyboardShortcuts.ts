"use client";

import { useEffect, useCallback } from "react";
import { usePlaybackStore } from "@/store/playbackStore";
import { useProgressionStore } from "@/store/progressionStore";
import { playProgression, stopProgression } from "@/lib/audio/scheduler";
import { initAudio } from "@/lib/audio/synth";

/**
 * Global keyboard shortcuts:
 *  Space         – play / stop the active progression (when not typing in an input)
 *  ArrowUp       – BPM + 5
 *  ArrowDown     – BPM - 5
 *  Shift+ArrowUp – BPM + 1
 *  Shift+ArrowDown – BPM - 1
 */
export function useKeyboardShortcuts() {
  const { bpm, isPlaying, loop, setBpm, setPlaying, setCurrentChord } = usePlaybackStore();
  const { activeProgression } = useProgressionStore();

  const handleKeyDown = useCallback(
    async (e: KeyboardEvent) => {
      // Don't hijack shortcuts when user is typing in an input/textarea/select
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        const prog = activeProgression();
        if (!prog) return;

        if (isPlaying) {
          stopProgression();
          setPlaying(false);
        } else {
          await initAudio();
          setPlaying(true);
          await playProgression(
            { ...prog, bpm },
            (idx) => setCurrentChord(idx),
            loop
          );
          setPlaying(false);
        }
        return;
      }

      if (e.code === "ArrowUp") {
        e.preventDefault();
        setBpm(bpm + (e.shiftKey ? 1 : 5));
        return;
      }

      if (e.code === "ArrowDown") {
        e.preventDefault();
        setBpm(bpm - (e.shiftKey ? 1 : 5));
        return;
      }
    },
    [bpm, isPlaying, loop, activeProgression, setBpm, setPlaying, setCurrentChord]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}
