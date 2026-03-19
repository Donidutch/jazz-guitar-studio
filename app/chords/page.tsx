"use client";

import { useMemo } from "react";
import { useChordStore } from "@/store/chordStore";
import { useFretboardStore } from "@/store/fretboardStore";
import { generateVoicings, filterVoicings } from "@/lib/theory/voicings";
import { computeVoiceLeading } from "@/lib/theory/voiceLeading";
import { CHORD_QUALITY_NAMES } from "@/lib/theory/chords";
import type { VoicingType } from "@/types";
import ChordSelector from "@/components/chords/ChordSelector";
import VoicingFilters from "@/components/chords/VoicingFilters";
import VoicingCard from "@/components/chords/VoicingCard";
import VoiceLeadingView from "@/components/chords/VoiceLeadingView";
import { Badge } from "@/components/ui/badge";

const VOICING_TYPE_ORDER: VoicingType[] = ["shell", "guideTone", "drop2", "drop3", "drop2-4", "close", "rootless", "quartal", "open"];
const VOICING_TYPE_LABELS: Record<VoicingType, string> = {
  shell: "Shell Voicings", guideTone: "Guide Tones", drop2: "Drop 2",
  drop3: "Drop 3", "drop2-4": "Drop 2-4", close: "Close Position", rootless: "Rootless",
  quartal: "Quartal", open: "Open",
};

export default function ChordExplorerPage() {
  const { chord, filters, selectedVoicingId, compareVoicingId, setSelectedVoicing, setCompareVoicing } = useChordStore();
  const { tuning } = useFretboardStore();

  const allVoicings = useMemo(() => generateVoicings(chord, tuning), [chord, tuning]);

  const voicings = useMemo(
    () => filterVoicings(allVoicings, filters),
    [allVoicings, filters]
  );

  // Group by voicing type, preserving sort order within each group
  const groupedVoicings = useMemo(() => {
    if (filters.type) return null; // don't group when a single type is filtered
    const groups = new Map<VoicingType, typeof voicings>();
    for (const type of VOICING_TYPE_ORDER) {
      const group = voicings.filter((v) => v.type === type);
      if (group.length > 0) groups.set(type, group);
    }
    return groups;
  }, [voicings, filters.type]);

  // Type distribution counts for the info bar
  const typeCounts = useMemo(() => {
    const counts: Partial<Record<VoicingType, number>> = {};
    for (const v of allVoicings) {
      counts[v.type] = (counts[v.type] ?? 0) + 1;
    }
    return counts;
  }, [allVoicings]);

  const selectedVoicing = useMemo(
    () => voicings.find((v) => v.id === selectedVoicingId) ?? null,
    [voicings, selectedVoicingId]
  );

  const compareVoicing = useMemo(
    () => voicings.find((v) => v.id === compareVoicingId) ?? null,
    [voicings, compareVoicingId]
  );

  const voiceLeadingResult = useMemo(() => {
    if (!selectedVoicing || !compareVoicing) return null;
    return computeVoiceLeading(selectedVoicing, compareVoicing);
  }, [selectedVoicing, compareVoicing]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Chord Explorer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Generate all playable voicings for any jazz chord. Click to hear, select two to see voice leading.
        </p>
      </div>

      {/* Chord selector */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-4">
        <ChordSelector />
      </div>

      {/* Chord info */}
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xl font-bold text-primary">
          {chord.symbol}
        </h2>
        <Badge variant="secondary">{CHORD_QUALITY_NAMES[chord.quality]}</Badge>
        <span className="text-muted-foreground text-sm">
          {chord.notes.join(" · ")}
        </span>
        <span className="text-muted-foreground text-sm ml-auto">
          {voicings.length} voicings
        </span>
      </div>

      {/* Filters */}
      <div className="p-3 rounded-lg border border-border bg-card/50">
        <VoicingFilters />
      </div>

      {/* Voice leading panel (when 2 voicings selected) */}
      {voiceLeadingResult && selectedVoicing && compareVoicing && (
        <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/5">
          <VoiceLeadingView result={voiceLeadingResult} />
        </div>
      )}

      {/* Instructions when nothing selected */}
      {!selectedVoicingId && voicings.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Click a voicing to select it. Shift-click a second voicing to compare voice leading.
        </p>
      )}

      {/* Type distribution badges */}
      <div className="flex flex-wrap gap-1.5">
        {VOICING_TYPE_ORDER.filter((t) => typeCounts[t]).map((t) => (
          <button
            key={t}
            onClick={() => {
              const { setFilters, filters: f } = useChordStore.getState();
              setFilters({ type: f.type === t ? undefined : t });
            }}
            className={`px-2 py-0.5 rounded text-xs border transition-colors ${
              filters.type === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-secondary border-border text-muted-foreground hover:border-primary/50"
            }`}
          >
            {VOICING_TYPE_LABELS[t]} <span className="opacity-60">{typeCounts[t]}</span>
          </button>
        ))}
      </div>

      {/* Voicing grid — grouped by type or flat */}
      {voicings.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          No voicings match the current filters.
        </div>
      ) : groupedVoicings ? (
        <div className="space-y-6">
          {Array.from(groupedVoicings.entries()).map(([type, group]) => (
            <div key={type}>
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                  {VOICING_TYPE_LABELS[type]}
                </h3>
                <span className="text-xs text-muted-foreground/60">{group.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                {group.map((voicing) => (
                  <VoicingCard
                    key={voicing.id}
                    voicing={voicing}
                    selected={selectedVoicingId === voicing.id}
                    comparing={compareVoicingId === voicing.id}
                    onClick={() => {
                      if (selectedVoicingId === voicing.id) {
                        setSelectedVoicing(null);
                      } else if (!selectedVoicingId) {
                        setSelectedVoicing(voicing.id);
                      } else {
                        setCompareVoicing(voicing.id);
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {voicings.map((voicing) => (
            <VoicingCard
              key={voicing.id}
              voicing={voicing}
              selected={selectedVoicingId === voicing.id}
              comparing={compareVoicingId === voicing.id}
              onClick={() => {
                if (selectedVoicingId === voicing.id) {
                  setSelectedVoicing(null);
                } else if (!selectedVoicingId) {
                  setSelectedVoicing(voicing.id);
                } else {
                  setCompareVoicing(voicing.id);
                }
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
