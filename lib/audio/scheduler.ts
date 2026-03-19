"use client";

import type { Progression } from "@/types";
import { initAudio, getTone, playChord, stopAll } from "./synth";

let part: import("tone").Part | null = null;
let isPlaying = false;

type BeatCallback = (chordIndex: number) => void;

export async function playProgression(
  progression: Progression,
  onBeat?: BeatCallback,
  loop = true
): Promise<void> {
  await initAudio();
  const Tone = getTone();
  if (!Tone) return;

  stopProgression();

  Tone.getTransport().bpm.value = progression.bpm;
  const secondsPerBeat = 60 / progression.bpm;

  // Build events array: [{time, chordIndex}]
  const events: { time: number; chordIndex: number; mids: number[] }[] = [];
  let currentTime = 0;

  for (let i = 0; i < progression.chords.length; i++) {
    const pc = progression.chords[i];
    const mids = pc.voicing?.notes.map((n) => n.midi) ?? pc.chord.notes.map(() => 60); // fallback
    events.push({ time: currentTime, chordIndex: i, mids });
    currentTime += pc.durationBeats * secondsPerBeat;
  }

  const totalDuration = currentTime;

  type PartEvent = { chordIndex: number; mids: number[] };

  part = new Tone.Part<PartEvent>(
    (time: number, event: PartEvent) => {
      if (event.mids.length > 0) {
        const Tone = getTone();
        if (!Tone) return;
        // Arpeggiate slightly for a guitar feel
        const durationBeats = progression.chords[event.chordIndex]?.durationBeats ?? 4;
        const noteDur = `${durationBeats * 2}n`;
        playChord(event.mids, noteDur, 0);
      }
      if (onBeat) {
        const T = getTone();
        if (T) {
          T.getDraw().schedule(() => {
            onBeat(event.chordIndex);
          }, time);
        }
      }
    },
    events.map((e) => ({ time: e.time, ...{ chordIndex: e.chordIndex, mids: e.mids } } as unknown as PartEvent)) as unknown as PartEvent[]
  );

  part.loop = loop;
  part.loopEnd = totalDuration;
  part.start(0);

  Tone.getTransport().start();
  isPlaying = true;
}

export function stopProgression(): void {
  const Tone = getTone();
  if (!Tone) return;
  if (part) {
    part.stop();
    part.dispose();
    part = null;
  }
  Tone.getTransport().stop();
  Tone.getTransport().cancel();
  stopAll();
  isPlaying = false;
}

export function isProgressionPlaying(): boolean {
  return isPlaying;
}

export function setProgressionBpm(bpm: number): void {
  const Tone = getTone();
  if (Tone) Tone.getTransport().bpm.value = bpm;
}
