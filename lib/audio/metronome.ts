"use client";

import { initAudio, getTone } from "./synth";

type TickCallback = (beat: number, totalBeats: number) => void;

let sequence: import("tone").Sequence | null = null;
let beatCount = 0;
let totalBeats = 4;
let tickCallback: TickCallback | null = null;

export async function startMetronome(
  bpm: number,
  timeSignatureNumerator = 4,
  subdivision: "4n" | "8n" | "16n" | "8t" = "4n",
  onTick?: TickCallback
): Promise<void> {
  await initAudio();
  const Tone = getTone();
  if (!Tone) return;

  stopMetronome();

  totalBeats = timeSignatureNumerator;
  beatCount = 0;
  tickCallback = onTick ?? null;

  Tone.getTransport().bpm.value = bpm;

  // Create a simple click synth for metronome
  const clickSynth = new Tone.Synth({
    oscillator: { type: "triangle" },
    envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
  });
  clickSynth.toDestination();

  const beats = Array.from({ length: totalBeats }, (_, i) => i);

  sequence = new Tone.Sequence(
    (time, beat) => {
      const isAccent = beat === 0;
      clickSynth.triggerAttackRelease(
        isAccent ? "A5" : "E5",
        "32n",
        time,
        isAccent ? 0.9 : 0.5
      );
      beatCount = beat as number;
      if (tickCallback) {
        // Schedule UI update after the audio event
        Tone.getDraw().schedule(() => {
          tickCallback!(beat as number, totalBeats);
        }, time);
      }
    },
    beats,
    subdivision
  );

  sequence.start(0);
  Tone.getTransport().start();
}

export function stopMetronome(): void {
  const Tone = getTone();
  if (!Tone) return;
  if (sequence) {
    sequence.stop();
    sequence.dispose();
    sequence = null;
  }
  Tone.getTransport().stop();
  beatCount = 0;
}

export function setMetronomeBpm(bpm: number): void {
  const Tone = getTone();
  if (Tone) {
    Tone.getTransport().bpm.value = bpm;
  }
}

export function isMetronomeRunning(): boolean {
  const Tone = getTone();
  if (!Tone) return false;
  return Tone.getTransport().state === "started";
}
