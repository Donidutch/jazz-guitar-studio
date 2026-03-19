"use client";

import { useState, useMemo } from "react";
import { buildChord, CHORD_QUALITY_GROUPS } from "@/lib/theory/chords";
import { generateVoicings } from "@/lib/theory/voicings";
import { computeVoiceLeading } from "@/lib/theory/voiceLeading";
import { useFretboardStore } from "@/store/fretboardStore";
import type { ChordQuality, NoteName, Voicing } from "@/types";
import Fretboard from "@/components/fretboard/Fretboard";
import VoiceLeadingView from "@/components/chords/VoiceLeadingView";
import { Button } from "@/components/ui/button";
import { useGuitarSynth } from "@/components/audio/useGuitarSynth";
import { Play } from "lucide-react";

const ALL_ROOTS: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

function ChordPicker({
  label, root, quality, voicing,
  onRootChange, onQualityChange, onVoicingChange,
}: {
  label: string;
  root: NoteName;
  quality: ChordQuality;
  voicing: Voicing | null;
  onRootChange: (r: NoteName) => void;
  onQualityChange: (q: ChordQuality) => void;
  onVoicingChange: (v: Voicing) => void;
}) {
  const { tuning } = useFretboardStore();
  const chord = useMemo(() => buildChord(root, quality), [root, quality]);
  const voicings = useMemo(() => generateVoicings(chord, tuning).slice(0, 8), [chord, tuning]);
  const { playVoicing } = useGuitarSynth();

  return (
    <div className="space-y-3 p-4 rounded-lg border border-border bg-card">
      <h3 className="font-semibold text-sm text-muted-foreground">{label}</h3>
      <div className="flex flex-wrap gap-1">
        {ALL_ROOTS.map((r) => (
          <button key={r} onClick={() => onRootChange(r)}
            className={`px-2 py-1 text-xs rounded border transition-colors ${root === r ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}>
            {r}
          </button>
        ))}
      </div>
      <select value={quality} onChange={(e) => onQualityChange(e.target.value as ChordQuality)}
        className="bg-secondary text-sm rounded px-2 py-1 border border-border w-full">
        {CHORD_QUALITY_GROUPS.flatMap((g) => g.qualities.map((q) => (
          <option key={q} value={q}>{q}</option>
        )))}
      </select>
      <div className="text-lg font-bold text-primary">{chord.symbol}</div>
      <div className="grid grid-cols-4 gap-1">
        {voicings.map((v) => (
          <button key={v.id} onClick={() => { onVoicingChange(v); playVoicing(v); }}
            className={`p-1 text-xs rounded border transition-colors ${voicing?.id === v.id ? "border-primary bg-primary/10" : "border-border bg-secondary"}`}>
            {v.type.slice(0, 4)} p{v.position}
          </button>
        ))}
      </div>
      {voicing && (
        <div className="mt-2">
          <Fretboard
            tuning={tuning}
            startFret={Math.max(0, voicing.lowestFret - 1)}
            endFret={voicing.highestFret + 2}
            notes={voicing.notes.filter((n) => !n.muted).map((n) => ({ string: n.string, fret: n.fret, label: n.intervalName }))}
            showFretNumbers={true}
            showNut={voicing.lowestFret <= 1}
          />
        </div>
      )}
    </div>
  );
}

export default function VoiceLeadingPage() {
  const [rootA, setRootA] = useState<NoteName>("D");
  const [qualityA, setQualityA] = useState<ChordQuality>("m7");
  const [voicingA, setVoicingA] = useState<Voicing | null>(null);

  const [rootB, setRootB] = useState<NoteName>("G");
  const [qualityB, setQualityB] = useState<ChordQuality>("7");
  const [voicingB, setVoicingB] = useState<Voicing | null>(null);

  const result = useMemo(() => {
    if (!voicingA || !voicingB) return null;
    return computeVoiceLeading(voicingA, voicingB);
  }, [voicingA, voicingB]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Voice Leading</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Select two chord voicings and analyze the voice movement between them.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <ChordPicker label="From Chord" root={rootA} quality={qualityA} voicing={voicingA}
          onRootChange={setRootA} onQualityChange={setQualityA} onVoicingChange={setVoicingA} />
        <ChordPicker label="To Chord" root={rootB} quality={qualityB} voicing={voicingB}
          onRootChange={setRootB} onQualityChange={setQualityB} onVoicingChange={setVoicingB} />
      </div>

      {result ? (
        <div className="p-4 rounded-lg border border-border bg-card">
          <VoiceLeadingView result={result} />
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          Select a voicing for both chords to see voice leading analysis.
        </div>
      )}
    </div>
  );
}
