"use client";

import { useState, useCallback, useRef } from "react";
import { generateIntervalExercise, generateChordQualityExercise, calculateAccuracy, calculateStreak } from "@/lib/ear-training/exercises";
import { playNote, playChord, playArpeggio } from "@/lib/audio/synth";
import { noteToMidi } from "@/lib/theory/notes";
import { useAudio } from "@/components/audio/AudioProvider";
import type { Exercise, ExerciseResult, ExerciseState } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, RotateCcw, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

const INTERVAL_CHOICES = [
  "m2", "M2", "m3", "M3", "P4", "TT", "P5", "m6", "M6", "m7", "M7", "Oct"
];

const INTERVAL_NAMES: Record<string, string> = {
  "m2": "Minor 2nd", "M2": "Major 2nd", "m3": "Minor 3rd", "M3": "Major 3rd",
  "P4": "Perfect 4th", "TT": "Tritone", "P5": "Perfect 5th",
  "m6": "Minor 6th", "M6": "Major 6th", "m7": "Minor 7th", "M7": "Major 7th", "Oct": "Octave",
};

const QUALITY_CHOICES = ["maj7", "m7", "7", "m7b5", "dim7", "maj7#11", "7alt", "7b9", "m/maj7"];

type Mode = "interval" | "chordQuality";

export default function EarTrainingPage() {
  const { initialize } = useAudio();
  const [mode, setMode] = useState<Mode>("interval");
  const [difficulty, setDifficulty] = useState<"beginner" | "intermediate" | "advanced">("beginner");
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [state, setState] = useState<ExerciseState>("idle");
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [lastAnswer, setLastAnswer] = useState<{ answer: string; correct: boolean } | null>(null);
  const startTime = useRef<number>(0);

  const streak = calculateStreak(results);
  const accuracy = calculateAccuracy(results);

  const generateExercise = useCallback(() => {
    if (mode === "interval") return generateIntervalExercise(difficulty);
    return generateChordQualityExercise(difficulty);
  }, [mode, difficulty]);

  const playExercise = useCallback(async (ex: Exercise) => {
    await initialize();
    if (ex.type === "interval") {
      const midi1 = noteToMidi(ex.note1);
      const midi2 = noteToMidi(ex.note2);
      if (ex.direction === "harmonic") {
        await playChord([midi1, midi2], "2n");
      } else {
        await playNote(midi1, "4n");
        setTimeout(async () => {
          await playNote(midi2, "4n");
        }, 600);
      }
    } else if (ex.type === "chordQuality") {
      const midis = ex.voicing.notes.filter((n) => !n.muted).map((n) => n.midi);
      await playArpeggio(midis, "8n", 0.08);
    }
  }, [initialize]);

  const handleStart = useCallback(async () => {
    const ex = generateExercise();
    setExercise(ex);
    setState("playing");
    setLastAnswer(null);
    startTime.current = Date.now();
    await playExercise(ex);
    setTimeout(() => setState("awaiting-answer"), 1500);
  }, [generateExercise, playExercise]);

  const handleReplay = useCallback(async () => {
    if (!exercise) return;
    await playExercise(exercise);
  }, [exercise, playExercise]);

  const handleAnswer = useCallback((answer: string) => {
    if (!exercise || state !== "awaiting-answer") return;
    const timeMs = Date.now() - startTime.current;
    let correct = false;

    if (exercise.type === "interval") {
      correct = answer === exercise.correctInterval;
    } else if (exercise.type === "chordQuality") {
      correct = answer === exercise.correctQuality;
    }

    const result: ExerciseResult = { exercise, answer, correct, timeMs };
    setResults((prev) => [...prev, result]);
    setLastAnswer({ answer, correct });
    setState(correct ? "correct" : "incorrect");

    // Auto-advance after delay
    setTimeout(() => {
      const nextEx = generateExercise();
      setExercise(nextEx);
      setState("playing");
      setLastAnswer(null);
      startTime.current = Date.now();
      playExercise(nextEx).then(() => {
        setTimeout(() => setState("awaiting-answer"), 1500);
      });
    }, correct ? 1200 : 2000);
  }, [exercise, state, generateExercise, playExercise]);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Ear Training</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Train your ear to recognize intervals, chord qualities, and melodic patterns.
        </p>
      </div>

      {/* Mode and difficulty */}
      <div className="flex flex-wrap gap-4">
        <div className="flex gap-2">
          {(["interval", "chordQuality"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setState("idle"); setExercise(null); }}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                mode === m ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              }`}
            >
              {m === "interval" ? "Intervals" : "Chord Quality"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(["beginner", "intermediate", "advanced"] as const).map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setState("idle"); setExercise(null); }}
              className={`px-3 py-1.5 text-sm rounded border transition-colors capitalize ${
                difficulty === d ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              }`}
            >
              {d}
            </button>
          ))}
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
          <button
            onClick={() => { setResults([]); setState("idle"); setExercise(null); }}
            className="ml-auto text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Exercise area */}
      <div className="p-8 rounded-xl border border-border bg-card text-center space-y-6 min-h-64 flex flex-col items-center justify-center">
        {state === "idle" && (
          <div className="space-y-4">
            <p className="text-muted-foreground">
              {mode === "interval" ? "Listen to two notes and identify the interval." : "Listen to a chord and identify its quality."}
            </p>
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
            <div className="flex justify-center gap-2">
              <Button variant="secondary" size="sm" onClick={handleReplay} className="gap-2">
                <Play className="w-3 h-3" />
                Replay
              </Button>
            </div>

            {mode === "interval" && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-w-lg mx-auto">
                {INTERVAL_CHOICES.map((iv) => (
                  <button
                    key={iv}
                    onClick={() => handleAnswer(iv)}
                    className="px-3 py-2 rounded border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-medium"
                  >
                    <div>{iv}</div>
                    <div className="text-xs text-muted-foreground">{INTERVAL_NAMES[iv]}</div>
                  </button>
                ))}
              </div>
            )}

            {mode === "chordQuality" && (
              <div className="grid grid-cols-3 gap-2 max-w-md mx-auto">
                {QUALITY_CHOICES.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleAnswer(q)}
                    className="px-3 py-2 rounded border border-border bg-secondary hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors text-sm font-medium"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {(state === "correct" || state === "incorrect") && lastAnswer && exercise && (
          <div className="space-y-3">
            {state === "correct" ? (
              <div className="flex items-center gap-2 justify-center text-green-400">
                <CheckCircle className="w-6 h-6" />
                <span className="text-xl font-bold">Correct!</span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 justify-center text-red-400">
                  <XCircle className="w-6 h-6" />
                  <span className="text-xl font-bold">Incorrect</span>
                </div>
                <p className="text-muted-foreground">
                  The correct answer was:{" "}
                  <span className="text-foreground font-semibold">
                    {exercise.type === "interval" ? exercise.correctInterval
                      : exercise.type === "chordQuality" ? exercise.correctQuality
                      : exercise.correctDegrees.join(" ")}
                  </span>
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground">Next exercise starting...</p>
          </div>
        )}
      </div>

      {/* Links to sub-modes */}
      <div className="grid grid-cols-3 gap-3">
        <Link href="/ear-training/intervals">
          <div className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center">
            <div className="font-medium text-sm">Interval Training</div>
            <div className="text-xs text-muted-foreground mt-1">All intervals with settings</div>
          </div>
        </Link>
        <Link href="/ear-training/chords">
          <div className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center">
            <div className="font-medium text-sm">Chord Quality</div>
            <div className="text-xs text-muted-foreground mt-1">All jazz chord types</div>
          </div>
        </Link>
        <Link href="/ear-training/melodic">
          <div className="p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer text-center">
            <div className="font-medium text-sm">Melodic Dictation</div>
            <div className="text-xs text-muted-foreground mt-1">Transcribe melodies</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
