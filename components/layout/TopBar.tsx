"use client";

import { usePlaybackStore } from "@/store/playbackStore";
import { useProgressionStore } from "@/store/progressionStore";
import { CHROMATIC_NOTES_SHARPS, CHROMATIC_NOTES_FLATS } from "@/lib/theory/notes";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const ALL_ROOTS = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export default function TopBar() {
  const { bpm, setBpm } = usePlaybackStore();
  const { activeKey, setKey } = useProgressionStore();

  return (
    <header className="h-12 flex items-center gap-6 px-6 border-b border-border bg-card/50 flex-shrink-0">
      {/* Key selector */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">Key</span>
        <select
          value={activeKey}
          onChange={(e) => setKey(e.target.value)}
          className="bg-secondary text-foreground text-sm rounded px-2 py-1 border border-border focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer"
        >
          {ALL_ROOTS.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>

      <div className="w-px h-6 bg-border" />

      {/* BPM control */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground uppercase tracking-widest">BPM</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setBpm(bpm - 5)}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="text-sm font-mono font-semibold w-10 text-center tabular-nums">
          {bpm}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setBpm(bpm + 5)}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground/60">
          <kbd className="px-1 rounded bg-secondary border border-border font-mono text-[10px]">Space</kbd>
          <span>play/stop</span>
          <span className="mx-1">·</span>
          <kbd className="px-1 rounded bg-secondary border border-border font-mono text-[10px]">↑↓</kbd>
          <span>BPM</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary/60 animate-pulse" />
          <span className="text-xs text-muted-foreground">Click to activate audio</span>
        </div>
      </div>
    </header>
  );
}
