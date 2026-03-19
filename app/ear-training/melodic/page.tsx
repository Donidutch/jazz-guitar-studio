"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import { ArrowLeft, Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateMelodicDictationExercise, calculateAccuracy, calculateStreak } from "@/lib/ear-training/exercises";
import { playNote } from "@/lib/audio/synth";
import { noteToMidi } from "@/lib/theory/notes";
import { useAudio } from "@/components/audio/AudioProvider";
import type { MelodicDictationExercise, ExerciseResult, NoteName } from "@/types";

const ALL_KEYS: NoteName[] = ["C", "F", "Bb", "Eb", "Ab", "Db", "G", "D", "A", "E", "B", "F#"];
const SCALE_DEGREES = ["1", "2", "3", "4", "5", "6", "7"];
const DEGREE_NAMES: Record<string, string> = {
  "1": "Root", "2": "2nd", "3": "3rd", "4": "4th", "5": "5th", "6": "6th", "7": "7th",
};

type ExState = "idle" | "playing" | "awaiting-answer" | "correct" | "incorrect";

export default function MelodicDictationPage() {
  const { initialize } = useAudio();
  const [key, setKey] = useState<NoteName>("C");
  const [length, setLength] = useState<2 | 3 | 4 | 6 | 8>(4);
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [exercise, setExercise] = useState<MelodicDictationExercise | null>(null);
  const [state, setState] = useState<ExState>("idle");
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [guessedDegrees, setGuessedDegrees] = useState<string[]>([]);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const startTime = useRef<number>(0);

  const streak = calculateStreak(results);
  const accuracy = calculateAccuracy(results);

  const playMelody = useCallback(async (ex: MelodicDictationExercise, bpm = 120) => {
    await initialize();
    const msPerBeat = 60000 / bpm;
    for (let i = 0; i < ex.notes.length; i++) {
      const midi = noteToMidi(ex.notes[i]);
      setTimeout(async () => { await playNote(midi, "4n"); }, i * msPerBeat);
    }
  }, [initialize]);

  const handleStart = useCallback(async () => {
    const ex = generateMelodicDictationExercise(key, length, difficulty);
    setExercise(ex);
    setGuessedDegrees([]);
    setState("playing");
    setLastCorrect(null);
    startTime.current = Date.now();
    await playMelody(ex);
    setTimeout(() => setState("awaiting-answer"), ex.notes.length * 600 + 500);
  }, [key, length, difficulty, playMelody]);

  const handleReplay = useCallback(async () => {
    if (!exercise) return;
    await playMelody(exercise);
  }, [exercise, playMelody]);

  const handleDegreeInput = useCallback((degree: string) => {
    if (!exercise || state !== "awaiting-answer") return;
    const next = [...guessedDegrees, degree];
    setGuessedDegrees(next);

    if (next.length === exercise.correctDegrees.length) {
      const timeMs = Date.now() - startTime.current;
      // Check against the correct degrees (simplified: compare degree numbers)
      const correct = exercise.correctDegrees.every((d, i) => {
        const dNum = d.replace(/[^0-9]/g, "");
        return dNum === next[i];
      });
      setLastCorrect(correct);
      const result: ExerciseResult = { exercise, answer: next.join("-"), correct, timeMs };
      setResults((prev) => [...prev, result]);
      setState(correct ? "correct" : "incorrect");

      setTimeout(() => {
        const ex = generateMelodicDictationExercise(key, length, difficulty);
        setExercise(ex);
        setGuessedDegrees([]);
        setState("playing");
        setLastCorrect(null);
        startTime.current = Date.now();
        playMelody(ex).then(() => setTimeout(() => setState("awaiting-answer"), ex.notes.length * 600 + 500));
      }, 2500);
    }
  }, [exercise, state, guessedDegrees, key, length, difficulty, playMelody]);

  const handleUndo = useCallback(() => {
    setGuessedDegrees((prev) => prev.slice(0, -1));
  }, []);

  // Map interval names to scale degrees for display
  const correctDegreeNums = exercise?.correctDegrees.map((d) => d.replace(/[^0-9]/g, "")) ?? [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link href="/ear-training" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" />
        Back to Ear Training
      </Link>

      <div>
        <h1 className="text-2xl font-bold">Melodic Dictation</h1>
        <p className="text-muted-foreground text-sm mt-1">Listen to a melody and identify each scale degree in order.</p>
      </div>

      {/* Settings */}
      <div className="grid grid-cols-3 gap-4 p-4 rounded-lg border border-border bg-card">
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">KEY</div>
          <div className="flex flex-wrap gap-1">
            {ALL_KEYS.map((k) => (
              <button key={k} onClick={() => setKey(k)}
                className={`px-2 py-1 rounded text-sm font-medium border transition-colors ${
                  key === k ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                }`}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">LENGTH</div>
          <div className="flex flex-wrap gap-1">
            {([2, 3, 4, 6, 8] as const).map((l) => (
              <button key={l} onClick={() => setLength(l)}
                className={`px-2 py-1 rounded text-sm font-medium border transition-colors ${
                  length === l ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                }`}>
                {l} notes
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold text-muted-foreground mb-2">DIFFICULTY</div>
          <div className="flex flex-col gap-1">
            {(["beginner", "intermediate", "advanced"] as const).map((d) => (
              <button key={d} onClick={() => setDifficulty(d)}
                className={`px-2 py-1 rounded text-sm font-medium border transition-colors capitalize ${
                  difficulty === d ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                }`}>
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
          <button onClick={() => { setResults([]); setState("idle"); setExercise(null); setGuessedDegrees([]); }}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exercise area */}
      <div className="p-8 rounded-xl border border-border bg-card space-y-6 min-h-64 flex flex-col items-center justify-center">
        {state === "idle" && (
          <div className="space-y-4 text-center">
            <p className="text-muted-foreground">Listen to a {length}-note melody in {key} major and enter each scale degree.</p>
            <Button onClick={handleStart} size="lg" className="gap-2">
              <Play className="w-4 h-4" />
              Start
            </Button>
          </div>
        )}

        {state === "playing" && (
          <div className="space-y-2 text-center">
            <div className="text-muted-foreground animate-pulse">Playing melody in {key} major...</div>
            <div className="flex gap-1 justify-center">
              {Array.from({ length }).map((_, i) => (
                <div key={i} className="w-8 h-8 rounded border border-border bg-secondary animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}

        {state === "awaiting-answer" && exercise && (
          <div className="space-y-4 w-full">
            <div className="flex gap-2 justify-center mb-2">
              <Button variant="secondary" size="sm" onClick={handleReplay} className="gap-2">
                <Play className="w-3 h-3" />
                Replay
              </Button>
              {guessedDegrees.length > 0 && (
                <Button variant="secondary" size="sm" onClick={handleUndo}>Undo</Button>
              )}
            </div>

            {/* Answer slots */}
            <div className="flex gap-2 justify-center">
              {Array.from({ length: exercise.notes.length }).map((_, i) => (
                <div key={i} className={`w-12 h-12 rounded-lg border-2 flex items-center justify-center text-lg font-bold transition-colors ${
                  i < guessedDegrees.length
                    ? "border-primary bg-primary/20 text-foreground"
                    : i === guessedDegrees.length
                    ? "border-primary/50 bg-primary/5 animate-pulse"
                    : "border-border bg-secondary"
                }`}>
                  {guessedDegrees[i] ?? (i === guessedDegrees.length ? "?" : "")}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground text-center">
              Note {guessedDegrees.length + 1} of {exercise.notes.length} — enter the scale degree
            </p>

            {/* Degree buttons */}
            <div className="grid grid-cols-7 gap-2 max-w-sm mx-auto">
              {SCALE_DEGREES.map((d) => (
                <button key={d} onClick={() => handleDegreeInput(d)}
                  className="py-3 rounded border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-bold">
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {(state === "correct" || state === "incorrect") && exercise && (
          <div className="space-y-4 w-full text-center">
            {lastCorrect ? (
              <div className="flex items-center gap-2 justify-center text-green-400">
                <CheckCircle className="w-6 h-6" />
                <span className="text-xl font-bold">Correct!</span>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center text-red-400">
                  <XCircle className="w-6 h-6" />
                  <span className="text-xl font-bold">Incorrect</span>
                </div>
                <div className="flex gap-2 justify-center">
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Your answer</div>
                    <div className="flex gap-1">
                      {guessedDegrees.map((d, i) => (
                        <div key={i} className={`w-10 h-10 rounded border-2 flex items-center justify-center font-bold text-sm ${
                          d === correctDegreeNums[i] ? "border-green-600 bg-green-950/30 text-green-400" : "border-red-600 bg-red-950/30 text-red-400"
                        }`}>{d}</div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground mb-1">Correct answer</div>
                    <div className="flex gap-1">
                      {correctDegreeNums.map((d, i) => (
                        <div key={i} className="w-10 h-10 rounded border-2 border-green-600 bg-green-950/30 flex items-center justify-center font-bold text-sm text-green-400">{d}</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Next exercise starting...</p>
          </div>
        )}
      </div>
    </div>
  );
}
