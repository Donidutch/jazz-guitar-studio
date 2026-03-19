"use client";

import { useCallback } from "react";
import { useAudio } from "./AudioProvider";
import { playNote, playChord, playArpeggio, stopAll } from "@/lib/audio/synth";
import type { MidiNote, Voicing } from "@/types";

export function useGuitarSynth() {
  const { ready, initialize } = useAudio();

  const ensureReady = useCallback(async () => {
    if (!ready) await initialize();
  }, [ready, initialize]);

  const playVoicing = useCallback(async (voicing: Voicing, style: "strum" | "arpeggio" = "strum") => {
    await ensureReady();
    const mids = voicing.notes.filter((n) => !n.muted).map((n) => n.midi);
    if (style === "arpeggio") {
      await playArpeggio(mids);
    } else {
      // Strum: low to high with slight delay
      await playArpeggio(mids, "4n", 0.04);
    }
  }, [ensureReady]);

  const playSingleNote = useCallback(async (midi: MidiNote, duration = "4n") => {
    await ensureReady();
    await playNote(midi, duration);
  }, [ensureReady]);

  const playMidiChord = useCallback(async (mids: MidiNote[], duration = "2n") => {
    await ensureReady();
    await playChord(mids, duration);
  }, [ensureReady]);

  const stop = useCallback(() => {
    stopAll();
  }, []);

  return { playVoicing, playSingleNote, playMidiChord, stop, ready };
}
