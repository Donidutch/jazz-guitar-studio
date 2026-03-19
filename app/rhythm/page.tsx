"use client";

import { useState, useCallback } from "react";
import { startMetronome, stopMetronome, isMetronomeRunning } from "@/lib/audio/metronome";
import { usePlaybackStore } from "@/store/playbackStore";
import { useAudio } from "@/components/audio/AudioProvider";
import { Button } from "@/components/ui/button";
import { Play, Square, Minus, Plus } from "lucide-react";

const SUBDIVISIONS = ["4n", "8n", "16n", "8t"] as const;
const SUBDIVISION_LABELS: Record<string, string> = {
  "4n": "Quarter notes",
  "8n": "Eighth notes",
  "16n": "Sixteenth notes",
  "8t": "Eighth triplets",
};

export default function RhythmPage() {
  const { initialize } = useAudio();
  const { bpm, setBpm, currentBeat, setCurrentBeat, metronomeActive, setMetronomeActive } = usePlaybackStore();
  const [subdivision, setSubdivision] = useState<typeof SUBDIVISIONS[number]>("4n");
  const [timeSignature, setTimeSignature] = useState(4);

  const handleToggle = useCallback(async () => {
    await initialize();
    if (metronomeActive) {
      stopMetronome();
      setMetronomeActive(false);
      setCurrentBeat(0);
    } else {
      await startMetronome(bpm, timeSignature, subdivision, (beat) => {
        setCurrentBeat(beat);
      });
      setMetronomeActive(true);
    }
  }, [metronomeActive, bpm, timeSignature, subdivision, initialize, setMetronomeActive, setCurrentBeat]);

  const handleTapTempo = useCallback(() => {
    // Simple tap tempo: track last 4 taps and average
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Rhythm & Metronome</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Practice with a precise metronome. Use subdivisions and drop-out mode.
        </p>
      </div>

      {/* BPM display + controls */}
      <div className="p-8 rounded-xl border border-border bg-card text-center space-y-4">
        <div className="text-7xl font-bold tabular-nums text-primary">{bpm}</div>
        <div className="text-muted-foreground text-sm">BPM</div>

        <div className="flex items-center justify-center gap-4">
          <Button variant="secondary" size="icon" onClick={() => setBpm(bpm - 10)}>
            <Minus className="w-4 h-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setBpm(bpm - 1)}>
            <Minus className="w-3 h-3" />
          </Button>
          <Button
            size="lg"
            className="w-24 h-24 rounded-full text-lg"
            onClick={handleToggle}
            variant={metronomeActive ? "destructive" : "default"}
          >
            {metronomeActive ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6" />}
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setBpm(bpm + 1)}>
            <Plus className="w-3 h-3" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setBpm(bpm + 10)}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Beat indicators */}
        {metronomeActive && (
          <div className="flex justify-center gap-3 pt-2">
            {Array.from({ length: timeSignature }, (_, i) => (
              <div
                key={i}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-75 ${
                  currentBeat === i
                    ? i === 0
                      ? "bg-primary border-primary scale-125"
                      : "bg-primary/60 border-primary/60 scale-110"
                    : "border-border"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Settings */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg border border-border bg-card space-y-2">
          <h3 className="text-sm font-medium">Time Signature</h3>
          <div className="flex gap-2">
            {[3, 4, 5, 6, 7].map((n) => (
              <button
                key={n}
                onClick={() => setTimeSignature(n)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  timeSignature === n ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                }`}
              >
                {n}/4
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg border border-border bg-card space-y-2">
          <h3 className="text-sm font-medium">Subdivision</h3>
          <div className="flex flex-wrap gap-2">
            {SUBDIVISIONS.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubdivision(sub)}
                className={`px-2 py-1.5 text-xs rounded border transition-colors ${
                  subdivision === sub ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                }`}
              >
                {SUBDIVISION_LABELS[sub]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Common tempos */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <h3 className="text-sm font-medium mb-2">Common Tempos</h3>
        <div className="flex flex-wrap gap-2">
          {[
            { name: "Very Slow", bpm: 60 },
            { name: "Slow", bpm: 80 },
            { name: "Medium", bpm: 100 },
            { name: "Medium Up", bpm: 140 },
            { name: "Up", bpm: 180 },
            { name: "Fast", bpm: 220 },
            { name: "Burning", bpm: 280 },
          ].map(({ name, bpm: b }) => (
            <button
              key={b}
              onClick={() => setBpm(b)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                bpm === b ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
              }`}
            >
              {name} ({b})
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
