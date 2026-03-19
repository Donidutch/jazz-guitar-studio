"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { calculateAccuracy, calculateStreak } from "@/lib/ear-training/exercises";
import { playArpeggio } from "@/lib/audio/synth";
import { buildChord } from "@/lib/theory/chords";
import { generateVoicings } from "@/lib/theory/voicings";
import { STANDARD_TUNING } from "@/lib/theory/guitar";
import { useAudio } from "@/components/audio/AudioProvider";
import type { ChordQuality, ChordQualityExercise, ExerciseResult } from "@/types";

const QUALITY_GROUPS: { label: string; qualities: ChordQuality[] }[] = [
  { label: "Major", qualities: ["maj7", "maj9", "maj7#11", "maj13", "6", "6/9"] },
  { label: "Dominant", qualities: ["7", "9", "13", "7b9", "7#9", "7alt", "7#11", "7b13", "7sus4"] },
  { label: "Minor", qualities: ["m7", "m9", "m11", "m13", "m6", "m/maj7"] },
  { label: "Half-dim / Dim", qualities: ["m7b5", "dim7", "dim"] },
  { label: "Suspended / Aug", qualities: ["sus4", "sus2", "aug", "aug7"] },
];

const ALL_QUALITIES: ChordQuality[] = QUALITY_GROUPS.flatMap((g) => g.qualities);

type ExState = "idle" | "playing" | "awaiting-answer" | "correct" | "incorrect";

export default function ChordEarTrainingPage() {
  const { initialize } = useAudio();
  const [activeQualities, setActiveQualities] = useState<ChordQuality[]>(["maj7", "m7", "7", "m7b5", "dim7"]);
  const [exercise, setExercise] = useState<ChordQualityExercise | null>(null);
  const [state, setState] = useState<ExState>("idle");
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [lastAnswer, setLastAnswer] = useState<{ answer: string; correct: boolean } | null>(null);
  const startTime = useRef<number>(0);

  const streak = calculateStreak(results);
  const accuracy = calculateAccuracy(results);

  const toggleQuality = useCallback((q: ChordQuality) => {
    setActiveQualities((prev) =>
      prev.includes(q) ? (prev.length > 1 ? prev.filter((x) => x !== q) : prev) : [...prev, q]
    );
  }, []);

  const toggleGroup = useCallback((qualities: ChordQuality[]) => {
    setActiveQualities((prev) => {
      const allOn = qualities.every((q) => prev.includes(q));
      if (allOn) {
        const next = prev.filter((q) => !qualities.includes(q));
        return next.length > 0 ? next : prev;
      }
      const newSet = new Set([...prev, ...qualities]);
      return Array.from(newSet);
    });
  }, []);

  const playExercise = useCallback(async (ex: ChordQualityExercise) => {
    await initialize();
    const midis = ex.voicing.notes.filter((n) => !n.muted).map((n) => n.midi);
    await playArpeggio(midis, "8n", 0.08);
  }, [initialize]);

  const generateNext = useCallback((): ChordQualityExercise => {
    const q = activeQualities[Math.floor(Math.random() * activeQualities.length)];
    const roots = ["C", "D", "E", "F", "G", "A", "B", "Db", "Eb", "F#", "Ab", "Bb"];
    const root = roots[Math.floor(Math.random() * roots.length)];
    const chord = buildChord(root, q);
    const voicings = generateVoicings(chord, STANDARD_TUNING);
    const voicing = voicings.find((v) => v.type === "drop2" || v.type === "shell") ?? voicings[0];

    if (!voicing) {
      // Fallback: try another root
      const fallbackChord = buildChord("C", q);
      const fallbackVoicings = generateVoicings(fallbackChord, STANDARD_TUNING);
      const fallback = fallbackVoicings[0];
      if (!fallback) throw new Error(`No voicings for ${q}`);
      return { type: "chordQuality", voicing: fallback, correctQuality: q, rootHidden: false };
    }

    return { type: "chordQuality", voicing, correctQuality: q, rootHidden: Math.random() > 0.7 };
  }, [activeQualities]);

  const handleStart = useCallback(async () => {
    const ex = generateNext();
    setExercise(ex);
    setState("playing");
    setLastAnswer(null);
    startTime.current = Date.now();
    await playExercise(ex);
    setTimeout(() => setState("awaiting-answer"), 2000);
  }, [generateNext, playExercise]);

  const handleReplay = useCallback(async () => {
    if (!exercise) return;
    await playExercise(exercise);
  }, [exercise, playExercise]);

  const handleAnswer = useCallback((answer: string) => {
    if (!exercise || state !== "awaiting-answer") return;
    const timeMs = Date.now() - startTime.current;
    const correct = answer === exercise.correctQuality;
    const result: ExerciseResult = { exercise, answer, correct, timeMs };
    setResults((prev) => [...prev, result]);
    setLastAnswer({ answer, correct });
    setState(correct ? "correct" : "incorrect");

    setTimeout(() => {
      const next = generateNext();
      setExercise(next);
      setState("playing");
      setLastAnswer(null);
      startTime.current = Date.now();
      playExercise(next).then(() => setTimeout(() => setState("awaiting-answer"), 2000));
    }, correct ? 1000 : 2500);
  }, [exercise, state, generateNext, playExercise]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/ear-training" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Ear Training
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Chord Quality Training</h1>
        <p className="text-muted-foreground text-sm mt-1">Identify chord qualities by ear. Select which qualities to include.</p>
      </div>

      {/* Quality selection */}
      <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
        <div className="text-xs font-semibold text-muted-foreground">CHORD QUALITIES</div>
        {QUALITY_GROUPS.map((group) => (
          <div key={group.label}>
            <button
              onClick={() => toggleGroup(group.qualities)}
              className="text-xs font-medium text-muted-foreground hover:text-foreground mb-1.5 block"
            >
              {group.label} ({group.qualities.filter((q) => activeQualities.includes(q)).length}/{group.qualities.length} selected)
            </button>
            <div className="flex flex-wrap gap-1.5">
              {group.qualities.map((q) => (
                <button
                  key={q}
                  onClick={() => toggleQuality(q)}
                  className={`px-2.5 py-1 rounded text-sm font-medium border transition-colors ${
                    activeQualities.includes(q)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-secondary border-border text-muted-foreground"
                  }`}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Session stats */}
      {results.length > 0 && (
        <div className="flex gap-4 items-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{streak}</div>
            <div className="text-xs text-muted-foreground">Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{Math.round(accuracy * 100)}%</div>
            <div className="text-xs text-muted-foreground">Accuracy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{results.length}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
          <button onClick={() => { setResults([]); setState("idle"); setExercise(null); }}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exercise area */}
      <div className="p-8 rounded-xl border border-border bg-card text-center space-y-6 min-h-64 flex flex-col items-center justify-center">
        {state === "idle" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Listen to a chord and identify its quality. {activeQualities.length} qualities active.</p>
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="w-4 h-4" />
              Start
            </Button>
          </div>
        )}

        {state === "playing" && (
          <div className="space-y-2">
            <div className="text-muted-foreground animate-pulse">Playing chord...</div>
            <div className="w-8 h-8 rounded-full bg-primary/20 mx-auto animate-ping" />
            {exercise && !exercise.rootHidden && (
              <div className="text-sm text-muted-foreground mt-2">Root: <span className="text-foreground font-semibold">{exercise.voicing.chord.root}</span></div>
            )}
          </div>
        )}

        {state === "awaiting-answer" && exercise && (
          <div className="space-y-4 w-full">
            {!exercise.rootHidden && (
              <div className="text-sm text-muted-foreground">Root: <span className="text-foreground font-semibold">{exercise.voicing.chord.root}</span></div>
            )}
            <Button variant="secondary" size="sm" onClick={handleReplay} className="gap-2">
              <Play className="w-3 h-3" />
              Replay
            </Button>
            <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
              {activeQualities.map((q) => (
                <button key={q} onClick={() => handleAnswer(q)}
                  className="px-3 py-2 rounded border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-medium">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {(state === "correct" || state === "incorrect") && lastAnswer && exercise && (
          <div className="space-y-3">
            {state === "correct" ? (
              <div className="flex items-center gap-2 justify-center text-green-400">
                <CheckCircle className="w-6 h-6" />
                <span className="text-xl font-bold">Correct! {exercise.voicing.chord.root}{exercise.correctQuality}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center text-red-400">
                  <XCircle className="w-6 h-6" />
                  <span className="text-xl font-bold">Incorrect</span>
                </div>
                <p className="text-muted-foreground">
                  The chord was: <span className="text-foreground font-semibold">{exercise.voicing.chord.root}{exercise.correctQuality}</span>
                </p>
                <p className="text-sm text-muted-foreground">Notes: {exercise.voicing.chord.notes.join(" · ")}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Next exercise starting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
