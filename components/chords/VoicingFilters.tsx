"use client";

import { useChordStore } from "@/store/chordStore";
import type { VoicingType } from "@/types";

const TYPE_OPTIONS: { value: VoicingType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "drop2", label: "Drop 2" },
  { value: "drop3", label: "Drop 3" },
  { value: "shell", label: "Shell" },
  { value: "guideTone", label: "Guide Tones" },
  { value: "quartal", label: "Quartal" },
  { value: "close", label: "Close" },
  { value: "open", label: "Open" },
  { value: "rootless", label: "Rootless" },
];

const STRING_SET_OPTIONS = [
  { value: 0, label: "All" },
  { value: 3, label: "3-string" },
  { value: 4, label: "4-string" },
  { value: 5, label: "5-string" },
  { value: 6, label: "6-string" },
];

export default function VoicingFilters() {
  const { filters, setFilters } = useChordStore();

  return (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Type:</label>
        <select
          value={filters.type ?? "all"}
          onChange={(e) => {
            const v = e.target.value;
            setFilters({ type: v === "all" ? undefined : v as VoicingType });
          }}
          className="bg-secondary text-sm rounded px-2 py-1 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Strings:</label>
        <select
          value={filters.stringSet ?? 0}
          onChange={(e) => {
            const v = parseInt(e.target.value);
            setFilters({ stringSet: v === 0 ? undefined : v });
          }}
          className="bg-secondary text-sm rounded px-2 py-1 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {STRING_SET_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Max difficulty:</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((d) => (
            <button
              key={d}
              onClick={() => setFilters({ maxDifficulty: d })}
              className={`w-7 h-7 rounded text-xs border transition-colors ${
                filters.maxDifficulty >= d
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-secondary border-border text-muted-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-muted-foreground">Inversion:</label>
        <select
          value={filters.inversion ?? "all"}
          onChange={(e) => {
            const v = e.target.value;
            setFilters({ inversion: v === "all" ? undefined : parseInt(v) as 0 | 1 | 2 | 3 });
          }}
          className="bg-secondary text-sm rounded px-2 py-1 border border-border focus:outline-none focus:ring-1 focus:ring-ring"
        >
          <option value="all">All inversions</option>
          <option value="0">Root position</option>
          <option value="1">1st inversion</option>
          <option value="2">2nd inversion</option>
          <option value="3">3rd inversion</option>
        </select>
      </div>
    </div>
  );
}
