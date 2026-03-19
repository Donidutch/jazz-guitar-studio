"use client";

import { useState, useMemo } from "react";
import { buildChord, CHORD_QUALITY_GROUPS } from "@/lib/theory/chords";
import { allSubstitutions } from "@/lib/theory/reharmonization";
import { useProgressionStore } from "@/store/progressionStore";
import type { ChordQuality, NoteName } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useGuitarSynth } from "@/components/audio/useGuitarSynth";
import { generateVoicings } from "@/lib/theory/voicings";
import { STANDARD_TUNING } from "@/lib/theory/guitar";
import { Play } from "lucide-react";

const ALL_ROOTS: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const SUB_TYPE_LABELS: Record<string, string> = {
  "tritone-sub": "Tritone Sub",
  "secondary-dominant": "Secondary Dominant",
  "back-cycle": "Back Cycle",
  "modal-interchange": "Modal Interchange",
  "chromatic-mediant": "Chromatic Mediant",
  "passing-diminished": "Passing Diminished",
  "deceptive-resolution": "Deceptive Resolution",
};

const SUB_TYPE_COLORS: Record<string, string> = {
  "tritone-sub": "text-red-400",
  "secondary-dominant": "text-orange-400",
  "back-cycle": "text-yellow-400",
  "modal-interchange": "text-purple-400",
  "chromatic-mediant": "text-blue-400",
  "passing-diminished": "text-gray-400",
  "deceptive-resolution": "text-pink-400",
};

export default function ReharmonizationPage() {
  const { activeKey } = useProgressionStore();
  const [root, setRoot] = useState<NoteName>("G");
  const [quality, setQuality] = useState<ChordQuality>("7");
  const { playMidiChord } = useGuitarSynth();

  const chord = useMemo(() => buildChord(root, quality), [root, quality]);
  const substitutions = useMemo(() => allSubstitutions(chord, activeKey), [chord, activeKey]);

  const handlePlaySub = (subChordSymbol: string) => {
    const match = subChordSymbol.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return;
    const subRoot = match[1] as NoteName;
    const subQuality = match[2] as ChordQuality;
    try {
      const subChord = buildChord(subRoot, subQuality || "maj7");
      const voicings = generateVoicings(subChord, STANDARD_TUNING);
      const v = voicings[0];
      if (v) playMidiChord(v.notes.map((n) => n.midi));
    } catch {}
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reharmonization</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Explore all substitution options for any chord in the current key ({activeKey}).
        </p>
      </div>

      {/* Chord input */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-3">
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Root</label>
          <div className="flex flex-wrap gap-1">
            {ALL_ROOTS.map((r) => (
              <button key={r} onClick={() => setRoot(r)}
                className={`px-2 py-1 text-sm rounded border transition-colors ${root === r ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Quality</label>
          <div className="flex flex-wrap gap-1">
            {CHORD_QUALITY_GROUPS.flatMap((g) => g.qualities.map((q) => (
              <button key={q} onClick={() => setQuality(q as ChordQuality)}
                className={`px-2 py-1 text-xs rounded border transition-colors ${quality === q ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>
                {q}
              </button>
            )))}
          </div>
        </div>
        <div className="text-xl font-bold text-primary">{chord.symbol}</div>
      </div>

      {/* Substitutions */}
      <div className="space-y-3">
        <h2 className="font-semibold">{substitutions.length} Substitutions Found</h2>
        {substitutions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No common substitutions found for this chord in {activeKey}.</p>
        ) : (
          substitutions.map((sub, i) => (
            <div key={i} className="p-4 rounded-lg border border-border bg-card space-y-2">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-lg font-bold">{sub.substitutionChord.symbol}</span>
                <Badge variant="secondary" className={SUB_TYPE_COLORS[sub.type] ?? ""}>
                  {SUB_TYPE_LABELS[sub.type] ?? sub.type}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Voice leading: {sub.voiceLeadingScore}/100
                </span>
                <button
                  onClick={() => handlePlaySub(sub.substitutionChord.symbol)}
                  className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  <Play className="w-3 h-3" /> Play
                </button>
              </div>
              <p className="text-sm text-muted-foreground">{sub.explanation}</p>
              {sub.commonTones.length > 0 && (
                <div className="flex gap-2 items-center">
                  <span className="text-xs text-muted-foreground">Common tones:</span>
                  <div className="flex gap-1">
                    {sub.commonTones.map((t) => (
                      <Badge key={t} variant="outline" className="text-xs">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
