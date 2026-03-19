"use client";

import type { MidiNote } from "@/types";
import { midiToNote } from "@/lib/theory/notes";

// Tone.js is loaded dynamically to avoid SSR issues
let Tone: typeof import("tone") | null = null;
let chordSynth: import("tone").PolySynth | null = null;
let pluckSynth: import("tone").PluckSynth | null = null;
let reverb: import("tone").Reverb | null = null;
let eq: import("tone").EQ3 | null = null;
let initialized = false;

export async function initAudio(): Promise<void> {
  if (initialized) return;
  Tone = await import("tone");
  await Tone.start();

  // Reverb for room sound
  reverb = new Tone.Reverb({ decay: 1.8, wet: 0.25 });
  await reverb.ready;

  // EQ — slight mid boost for guitar body
  eq = new Tone.EQ3({ low: -2, mid: 3, high: 1 });

  // PluckSynth (Karplus-Strong) for single notes and arpeggios
  pluckSynth = new Tone.PluckSynth({
    attackNoise: 1,
    dampening: 4000,
    resonance: 0.97,
  });
  pluckSynth.connect(reverb);
  reverb.connect(eq);
  eq.toDestination();

  // PolySynth for chord playback — FM synth with guitar-like envelope
  chordSynth = new Tone.PolySynth(Tone.FMSynth, {
    oscillator: { type: "triangle" },
    envelope: { attack: 0.01, decay: 0.3, sustain: 0.4, release: 1.2 },
    modulation: { type: "square" },
    modulationEnvelope: { attack: 0.1, decay: 0.2, sustain: 0.3, release: 0.5 },
  });
  chordSynth.connect(reverb);

  initialized = true;
}

export function isAudioReady(): boolean {
  return initialized;
}

export async function playNote(midi: MidiNote, duration = "4n", time?: number): Promise<void> {
  if (!initialized) await initAudio();
  if (!pluckSynth || !Tone) return;
  const note = midiToNote(midi);
  if (time !== undefined) {
    pluckSynth.triggerAttackRelease(note, duration, time);
  } else {
    pluckSynth.triggerAttackRelease(note, duration);
  }
}

export async function playChord(midis: MidiNote[], duration = "2n", delay = 0): Promise<void> {
  if (!initialized) await initAudio();
  if (!chordSynth || !Tone) return;
  const notes = midis.map((m) => midiToNote(m));
  const now = Tone.now() + delay;
  chordSynth.triggerAttackRelease(notes, duration, now);
}

export async function playArpeggio(
  midis: MidiNote[],
  noteDuration = "8n",
  intervalSeconds = 0.12
): Promise<void> {
  if (!initialized) await initAudio();
  if (!pluckSynth || !Tone) return;
  const now = Tone.now();
  midis.forEach((midi, i) => {
    const note = midiToNote(midi);
    pluckSynth!.triggerAttackRelease(note, noteDuration, now + i * intervalSeconds);
  });
}

export async function stopAll(): Promise<void> {
  if (!chordSynth || !pluckSynth) return;
  chordSynth.releaseAll();
}

export function getTone(): typeof import("tone") | null {
  return Tone;
}
