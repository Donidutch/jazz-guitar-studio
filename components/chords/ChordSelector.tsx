"use client";

import { useChordStore } from "@/store/chordStore";
import { CHORD_QUALITY_GROUPS, CHORD_QUALITY_NAMES } from "@/lib/theory/chords";
import type { ChordQuality, NoteName } from "@/types";

const ALL_ROOTS: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export default function ChordSelector() {
  const { root, quality, setRoot, setQuality } = useChordStore();

  return (
    <div className="flex flex-wrap gap-4 items-center">
      {/* Root selector */}
      <div className="flex flex-col gap-1">
        <label className="text-xs text-muted-foreground uppercase tracking-widest">Root</label>
        <div className="flex flex-wrap gap-1">
          {ALL_ROOTS.map((r) => (
            <button
              key={r}
              onClick={() => setRoot(r)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors font-medium ${
                root === r
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary text-foreground border-border hover:border-primary/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Quality selector */}
      <div className="flex flex-col gap-1 flex-1">
        <label className="text-xs text-muted-foreground uppercase tracking-widest">Quality</label>
        <div className="flex flex-wrap gap-2">
          {CHORD_QUALITY_GROUPS.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">{group.label}</span>
              <div className="flex flex-wrap gap-1">
                {group.qualities.map((q) => (
                  <button
                    key={q}
                    onClick={() => setQuality(q as ChordQuality)}
                    className={`px-2 py-1 text-xs rounded border transition-colors ${
                      quality === q
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary text-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
