"use client";

import React from "react";
import type { StringNumber, Voicing } from "@/types";
import Fretboard from "@/components/fretboard/Fretboard";
import { STANDARD_TUNING } from "@/lib/theory/guitar";
import { useGuitarSynth } from "@/components/audio/useGuitarSynth";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TYPE_LABELS: Record<string, string> = {
  "drop2": "Drop 2", "drop3": "Drop 3", "drop2-4": "Drop 2+4",
  "shell": "Shell", "guideTone": "Guide Tones", "quartal": "Quartal",
  "close": "Close", "open": "Open", "rootless": "Rootless",
};

const DIFFICULTY_STARS = (d: number) => "●".repeat(d) + "○".repeat(5 - d);

interface VoicingCardProps {
  readonly voicing: Voicing;
  readonly selected?: boolean;
  readonly comparing?: boolean;
  readonly onClick?: () => void;
  readonly onCompare?: () => void;
}

export default function VoicingCard({ voicing, selected, comparing, onClick, onCompare }: VoicingCardProps) {
  const { playVoicing } = useGuitarSynth();

  const startFret = voicing.lowestFret === 0
    ? 0
    : Math.max(0, voicing.lowestFret - 1);
  const endFret = Math.max(startFret + 4, voicing.highestFret + 1);

  const displayNotes = voicing.notes
    .filter((n) => !n.muted)
    .map((n) => ({
      string: n.string,
      fret: n.fret,
      label: n.intervalName,
    }));

  // Muted strings
  for (let s = 1; s <= 6; s++) {
    const hasNote = voicing.notes.some((n) => n.string === s && !n.muted);
    const stringInSet = voicing.stringSet.includes(s as StringNumber);
    if (!hasNote && stringInSet) {
      displayNotes.push({ string: s as StringNumber, fret: 0, label: "" });
    }
  }

  return (
    <div
      className={`rounded-lg border transition-all cursor-pointer group ${
        selected
          ? "border-primary bg-primary/10"
          : comparing
          ? "border-blue-500 bg-blue-500/10"
          : "border-border bg-card hover:border-primary/50"
      }`}
      onClick={onClick}
    >
      <div className="p-2">
        {/* Fretboard preview */}
        <div className="relative">
          <Fretboard
            tuning={STANDARD_TUNING}
            startFret={startFret}
            endFret={endFret}
            notes={displayNotes}
            showFretNumbers={true}
            showOpenStringLabels={false}
            showNut={startFret === 0}
            labelMode="intervalName"
          />

          {/* Play button overlay */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              playVoicing(voicing, "strum");
            }}
            className="absolute top-1 right-1 w-7 h-7 rounded-full bg-primary/20 hover:bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Play className="w-3 h-3 text-primary" />
          </button>
        </div>

        {/* Info row */}
        <div className="mt-1 flex items-center justify-between gap-1 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {TYPE_LABELS[voicing.type] ?? voicing.type}
          </Badge>
          <span className="text-xs text-muted-foreground font-mono">
            {DIFFICULTY_STARS(voicing.difficulty)}
          </span>
        </div>

        {/* Chord tones */}
        <div className="mt-1 text-xs text-muted-foreground">
          {voicing.notes.filter((n) => !n.muted).map((n) => n.note).join(" ")}
        </div>

        {/* Position */}
        <div className="text-xs text-muted-foreground/60">
          Pos {voicing.position} · {voicing.stringSet.length} strings
          {voicing.inversion > 0 ? ` · ${voicing.inversion === 1 ? "1st" : voicing.inversion === 2 ? "2nd" : "3rd"} inv.` : ""}
        </div>
      </div>
    </div>
  );
}
