"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { calculateAccuracy, calculateStreak, weightedRandomInterval } from "@/lib/ear-training/exercises";
import { playNote, playChord } from "@/lib/audio/synth";
import { noteToMidi, midiToNote } from "@/lib/theory/notes";
import { useAudio } from "@/components/audio/AudioProvider";
import type { IntervalExercise, ExerciseResult } from "@/types";

const ALL_INTERVALS = ["m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7", "Oct"];

const INTERVAL_NAMES: Record<string, string> = {
  "m2": "Minor 2nd", "M2": "Major 2nd", "m3": "Minor 3rd", "M3": "Major 3rd",
  "P4": "Perfect 4th", "TT": "Tritone", "P5": "Perfect 5th",
  "m6": "Minor 6th", "M6": "Major 6th", "m7": "Minor 7th", "M7": "Major 7th", "Oct": "Octave",
};

type Direction = "ascending" | "descending" | "harmonic" | "random";
type ExState = "idle" | "playing" | "awaiting-answer" | "correct" | "incorrect";

export default function IntervalTrainingPage() {
  const { initialize } = useAudio();
  const [activeIntervals, setActiveIntervals] = useState<string[]>(ALL_INTERVALS);
  const [direction, setDirection] = useState<Direction>("random");
  const [exercise, setExercise] = useState<IntervalExercise | null>(null);
  const [state, setState] = useState<ExState>("idle");
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [lastAnswer, setLastAnswer] = useState<{ answer: string; correct: boolean } | null>(null);
  const startTime = useRef<number>(0);

  // Per-interval miss rate for adaptive weighting
  const missRates = useRef<Record<string, number>>({});

  const streak = calculateStreak(results);
  const accuracy = calculateAccuracy(results);

  // Per-interval accuracy breakdown
  const intervalStats = ALL_INTERVALS.map((iv) => {
    const relevant = results.filter((r) => r.exercise.type === "interval" && r.exercise.correctInterval === iv);
    const correct = relevant.filter((r) => r.correct).length;
    return { iv, total: relevant.length, correct };
  });

  const toggleInterval = useCallback((iv: string) => {
    setActiveIntervals((prev) =>
      prev.includes(iv) ? (prev.length > 1 ? prev.filter((i) => i !== iv) : prev) : [...prev, iv]
    );
  }, []);

  const playIntervalAudio = useCallback(async (ex: IntervalExercise) => {
    await initialize();
    const midi1 = noteToMidi(ex.note1);
    const midi2 = noteToMidi(ex.note2);
    if (ex.direction === "harmonic") {
      await playChord([midi1, midi2], "2n");
    } else if (ex.direction === "ascending") {
      await playNote(midi1, "4n");
      setTimeout(async () => { await playNote(midi2, "4n"); }, 600);
    } else {
      await playNote(midi2, "4n");
      setTimeout(async () => { await playNote(midi1, "4n"); }, 600);
    }
  }, [initialize]);

  const generateNext = useCallback((): IntervalExercise => {
    const chosen = weightedRandomInterval(missRates.current, activeIntervals);
    const semitoneMap: Record<string, number> = {
      "m2": 1, "M2": 2, "m3": 3, "M3": 4, "P4": 5, "TT": 6,
      "P5": 7, "m6": 8, "M6": 9, "m7": 10, "M7": 11, "Oct": 12,
    };
    const rootMidi = 48 + Math.floor(Math.random() * 12);
    const semitones = semitoneMap[chosen] ?? 5;
    const dirs: Array<"ascending" | "descending" | "harmonic"> = ["ascending", "descending", "harmonic"];
    const dir2 = direction === "random"
      ? dirs[Math.floor(Math.random() * dirs.length)]
      : direction as "ascending" | "descending" | "harmonic";

    return {
      type: "interval",
      note1: midiToNote(rootMidi),
      note2: midiToNote(rootMidi + semitones),
      direction: dir2,
      correctInterval: chosen,
    };
  }, [activeIntervals, direction]);

  const handleStart = useCallback(async () => {
    const ex = generateNext();
    setExercise(ex);
    setState("playing");
    setLastAnswer(null);
    startTime.current = Date.now();
    await playIntervalAudio(ex);
    setTimeout(() => setState("awaiting-answer"), 1500);
  }, [generateNext, playIntervalAudio]);

  const handleReplay = useCallback(async () => {
    if (!exercise) return;
    await playIntervalAudio(exercise);
  }, [exercise, playIntervalAudio]);

  const handleAnswer = useCallback((answer: string) => {
    if (!exercise || state !== "awaiting-answer") return;
    const timeMs = Date.now() - startTime.current;
    const correct = answer === exercise.correctInterval;

    // Update adaptive weights
    const iv = exercise.correctInterval;
    const oldRate = missRates.current[iv] ?? 0.5;
    missRates.current[iv] = oldRate * 0.8 + (correct ? 0 : 1) * 0.2;

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
      playIntervalAudio(next).then(() => setTimeout(() => setState("awaiting-answer"), 1500));
    }, correct ? 1000 : 2000);
  }, [exercise, state, generateNext, playIntervalAudio]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/ear-training" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Ear Training
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Interval Training</h1>
        <p className="text-muted-foreground text-sm mt-1">Configure which intervals to practice and the playback direction.</p>
      </div>

      {/* Settings */}
      <div className="space-y-4 p-4 rounded-lg border border-border bg-card">
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">INTERVALS TO PRACTICE</div>
          <div className="flex flex-wrap gap-2">
            {ALL_INTERVALS.map((iv) => (
              <button
                key={iv}
                onClick={() => toggleInterval(iv)}
                className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                  activeIntervals.includes(iv)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary border-border text-muted-foreground"
                }`}
              >
                <div>{iv}</div>
                <div className="text-xs opacity-70">{INTERVAL_NAMES[iv]}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">DIRECTION</div>
          <div className="flex gap-2">
            {(["ascending", "descending", "harmonic", "random"] as Direction[]).map((d) => (
              <button
                key={d}
                onClick={() => setDirection(d)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors capitalize ${
                  direction === d ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
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
          <button onClick={() => { setResults([]); setState("idle"); setExercise(null); missRates.current = {}; }}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exercise area */}
      <div className="p-8 rounded-xl border border-border bg-card text-center space-y-6 min-h-64 flex flex-col items-center justify-center">
        {state === "idle" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">Listen and identify the interval. Using {activeIntervals.length} interval{activeIntervals.length !== 1 ? "s" : ""}.</p>
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="w-4 h-4" />
              Start
            </Button>
          </div>
        )}

        {state === "playing" && (
          <div className="space-y-2">
            <div className="text-muted-foreground animate-pulse">Playing...</div>
            <div className="w-8 h-8 rounded-full bg-primary/20 mx-auto animate-ping" />
          </div>
        )}

        {state === "awaiting-answer" && (
          <div className="space-y-4 w-full">
            <Button variant="secondary" size="sm" onClick={handleReplay} className="gap-2">
              <Play className="w-3 h-3" />
              Replay
            </Button>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
              {activeIntervals.map((iv) => (
                <button key={iv} onClick={() => handleAnswer(iv)}
                  className="px-3 py-2 rounded border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-medium">
                  <div>{iv}</div>
                  <div className="text-xs text-muted-foreground">{INTERVAL_NAMES[iv]}</div>
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
                <span className="text-xl font-bold">Correct! {exercise.correctInterval} — {INTERVAL_NAMES[exercise.correctInterval]}</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center text-red-400">
                  <XCircle className="w-6 h-6" />
                  <span className="text-xl font-bold">Incorrect</span>
                </div>
                <p className="text-muted-foreground">
                  The correct answer was: <span className="text-foreground font-semibold">{exercise.correctInterval} — {INTERVAL_NAMES[exercise.correctInterval]}</span>
                </p>
                <p className="text-sm text-muted-foreground">You answered: {lastAnswer.answer}</p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Next exercise starting...</p>
          </div>
        )}
      </div>

      {/* Per-interval breakdown */}
      {results.length >= 5 && (
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">PERFORMANCE BY INTERVAL</div>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {intervalStats.filter((s) => s.total > 0).map(({ iv, total, correct }) => (
              <div key={iv} className={`p-2 rounded border text-center text-xs ${
                correct / total >= 0.8 ? "border-green-800 bg-green-950/30" :
                correct / total >= 0.5 ? "border-yellow-800 bg-yellow-950/30" :
                "border-red-800 bg-red-950/30"
              }`}>
                <div className="font-semibold">{iv}</div>
                <div className="text-muted-foreground">{correct}/{total}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
