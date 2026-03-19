"use client";

import { useState, useMemo } from "react";
import { buildScale, scaleNeckPositions, SCALE_GROUPS, SCALE_NAMES, SCALE_DESCRIPTIONS } from "@/lib/theory/scales";
import { noteSetPositionsOnNeck } from "@/lib/theory/guitar";
import { useFretboardStore } from "@/store/fretboardStore";
import type { NoteName, ScaleType } from "@/types";
import Fretboard from "@/components/fretboard/Fretboard";
import { playArpeggio } from "@/lib/audio/synth";
import { useAudio } from "@/components/audio/AudioProvider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, Square } from "lucide-react";

const ALL_ROOTS: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

// Interval color map for scale degrees
const DEGREE_COLORS: Record<string, string> = {
  "1P": "#F59E0B", "R": "#F59E0B",
  "2M": "#94A3B8", "9": "#94A3B8",
  "b2": "#94A3B8",
  "b3": "#3B82F6", "m3": "#3B82F6",
  "3M": "#22C55E",
  "4P": "#94A3B8", "4": "#94A3B8",
  "#4": "#64748B", "#11": "#64748B",
  "5P": "#A855F7",
  "#5": "#F97316", "b6": "#F97316",
  "6M": "#94A3B8",
  "b7": "#EC4899",
  "7M": "#F97316",
};

export default function ScalesPage() {
  const { tuning } = useFretboardStore();
  const { initialize } = useAudio();
  const [root, setRoot] = useState<NoteName>("C");
  const [scaleType, setScaleType] = useState<ScaleType>("dorian");
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [mode, setMode] = useState<"full" | "positions">("full");

  const scale = useMemo(() => buildScale(root, scaleType), [root, scaleType]);
  const positions = useMemo(() => scaleNeckPositions(scale, tuning, 17), [scale, tuning]);

  const allNeckPositions = useMemo(
    () => noteSetPositionsOnNeck(scale.notes, tuning, 17),
    [scale, tuning]
  );

  const displayNotes = useMemo(() => {
    if (mode === "positions" && selectedPosition !== null) {
      const pos = positions[selectedPosition];
      if (!pos) return [];
      return pos.notes.map((n) => ({
        string: n.string,
        fret: n.fret,
        label: scale.intervals[scale.notes.indexOf(n.note)] ? "●" : "●",
        color: pos.rootPositions.some((r) => r.string === n.string && r.fret === n.fret)
          ? "#F59E0B"
          : "#6B7280",
      }));
    }
    return allNeckPositions.map((n) => ({
      string: n.string,
      fret: n.fret,
      label: n.note === root ? "R" : n.note,
      color: n.note === root ? "#F59E0B" : "#6B7280",
    }));
  }, [mode, selectedPosition, positions, allNeckPositions, root, scale]);

  const handlePlayScale = async () => {
    await initialize();
    const { noteToMidi } = await import("@/lib/theory/notes");
    // Play scale ascending from octave 4
    const midis = scale.notes.map((n) => {
      try { return noteToMidi(`${n}4`); } catch { return 60; }
    });
    await playArpeggio(midis, "8n", 0.3);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Scales & Modes</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Visualize any jazz scale, mode, or arpeggio across the entire neck.
        </p>
      </div>

      {/* Selectors */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-4">
        <div className="flex flex-wrap gap-4">
          {/* Root */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-widest block mb-1">Root</label>
            <div className="flex flex-wrap gap-1">
              {ALL_ROOTS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRoot(r)}
                  className={`px-3 py-1 text-sm rounded border transition-colors ${
                    root === r ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border hover:border-primary/50"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Scale groups */}
        <div className="space-y-2">
          {SCALE_GROUPS.map((group) => (
            <div key={group.label}>
              <label className="text-xs text-muted-foreground block mb-1">{group.label}</label>
              <div className="flex flex-wrap gap-1">
                {group.scales.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setScaleType(s); setSelectedPosition(null); }}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      scaleType === s ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border hover:border-primary/50"
                    }`}
                  >
                    {SCALE_NAMES[s]}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scale info */}
      <div className="flex items-start gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-xl font-bold text-primary">{root} {SCALE_NAMES[scaleType]}</h2>
            <Button size="sm" variant="secondary" onClick={handlePlayScale}>
              <Play className="w-3 h-3 mr-1" />
              Play
            </Button>
          </div>
          <p className="text-sm text-muted-foreground max-w-xl">{SCALE_DESCRIPTIONS[scaleType]}</p>
        </div>
        <div className="ml-auto">
          <div className="flex flex-wrap gap-1">
            {scale.notes.map((n, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-gray-900"
                  style={{ backgroundColor: i === 0 ? "#F59E0B" : "#374151" }}
                >
                  {n}
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">
                  {scale.intervals[i]}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => { setMode("full"); setSelectedPosition(null); }}
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            mode === "full" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
          }`}
        >
          Full Neck
        </button>
        <button
          onClick={() => setMode("positions")}
          className={`px-3 py-1.5 text-sm rounded border transition-colors ${
            mode === "positions" ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
          }`}
        >
          Positions ({positions.length})
        </button>
      </div>

      {/* Full neck view */}
      {mode === "full" && (
        <div className="p-4 rounded-lg border border-border bg-card">
          <Fretboard
            tuning={tuning}
            startFret={0}
            endFret={15}
            notes={displayNotes}
            showFretNumbers={true}
            showNut={true}
            labelMode="noteName"
          />
        </div>
      )}

      {/* Position views */}
      {mode === "positions" && (
        <div className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {positions.map((pos, i) => (
              <button
                key={i}
                onClick={() => setSelectedPosition(i)}
                className={`px-3 py-1.5 text-sm rounded border transition-colors ${
                  selectedPosition === i ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border hover:border-primary/50"
                }`}
              >
                {pos.label}
              </button>
            ))}
          </div>

          {selectedPosition !== null && positions[selectedPosition] && (
            <div className="p-4 rounded-lg border border-border bg-card">
              <h3 className="text-sm font-medium mb-2 text-muted-foreground">
                {positions[selectedPosition].label} — frets {positions[selectedPosition].lowestFret}–{positions[selectedPosition].highestFret}
              </h3>
              <Fretboard
                tuning={tuning}
                startFret={positions[selectedPosition].lowestFret}
                endFret={positions[selectedPosition].highestFret + 1}
                notes={displayNotes}
                showFretNumbers={true}
                showNut={positions[selectedPosition].lowestFret === 0}
                labelMode="noteName"
              />
            </div>
          )}

          {/* All positions grid */}
          {selectedPosition === null && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {positions.map((pos, i) => {
                const posNotes = pos.notes.map((n) => ({
                  string: n.string,
                  fret: n.fret,
                  label: pos.rootPositions.some((r) => r.string === n.string && r.fret === n.fret) ? "R" : "●",
                  color: pos.rootPositions.some((r) => r.string === n.string && r.fret === n.fret) ? "#F59E0B" : "#6B7280",
                }));
                return (
                  <div
                    key={i}
                    className="p-3 rounded-lg border border-border bg-card cursor-pointer hover:border-primary/50"
                    onClick={() => setSelectedPosition(i)}
                  >
                    <h4 className="text-sm font-medium mb-2">{pos.label}</h4>
                    <Fretboard
                      tuning={tuning}
                      startFret={pos.lowestFret}
                      endFret={pos.highestFret + 1}
                      notes={posNotes}
                      showFretNumbers={true}
                      showNut={pos.lowestFret === 0}
                      labelMode="intervalName"
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
