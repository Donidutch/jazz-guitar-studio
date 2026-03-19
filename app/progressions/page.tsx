"use client";

import { useState, useCallback } from "react";
import { useProgressionStore } from "@/store/progressionStore";
import { usePlaybackStore } from "@/store/playbackStore";
import { buildChord, CHORD_QUALITY_GROUPS } from "@/lib/theory/chords";
import { playProgression, stopProgression } from "@/lib/audio/scheduler";
import { autoVoiceProgression } from "@/lib/theory/voiceLeading";
import { commonProgression, COMMON_PROGRESSION_NAMES } from "@/lib/theory/progressions";
import { useFretboardStore } from "@/store/fretboardStore";
import type { ChordDefinition, ChordQuality, NoteName } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Square, Plus, Trash2, RotateCcw, Wand2, Repeat } from "lucide-react";
import { useAudio } from "@/components/audio/AudioProvider";

const ALL_ROOTS: NoteName[] = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

const FUNCTION_COLORS: Record<string, string> = {
  "tonic": "text-green-400",
  "subdominant": "text-blue-400",
  "dominant": "text-red-400",
  "secondary-dominant": "text-orange-400",
  "modal-interchange": "text-purple-400",
  "chromatic": "text-gray-400",
};

const DURATION_OPTIONS = [1, 2, 4, 8];

export default function ProgressionsPage() {
  const { initialize } = useAudio();
  const { tuning } = useFretboardStore();
  const {
    progressions, activeProgressionId, activeKey,
    activeProgression, createNew, addChord, removeChord, setKey, setBpm,
    updateChordVoicing, updateChordDuration
  } = useProgressionStore();
  const { isPlaying, loop, bpm, setPlaying, setLoop, setBpm: setPlaybackBpm, setCurrentChord } = usePlaybackStore();

  const prog = activeProgression();

  // Chord picker state
  const [pickerRoot, setPickerRoot] = useState<NoteName>("C");
  const [pickerQuality, setPickerQuality] = useState<ChordQuality>("m7");
  const [showPicker, setShowPicker] = useState(false);

  const handlePlay = useCallback(async () => {
    if (!prog) return;
    await initialize();
    if (isPlaying) {
      stopProgression();
      setPlaying(false);
      return;
    }
    setPlaying(true);
    await playProgression(
      { ...prog, bpm },
      (idx) => setCurrentChord(idx),
      loop
    );
    setPlaying(false);
  }, [prog, isPlaying, bpm, loop, initialize, setPlaying, setCurrentChord]);

  const handleAutoVoice = useCallback(() => {
    if (!prog || !activeProgressionId) return;
    const chords = prog.chords.map((c) => c.chord);
    const voicings = autoVoiceProgression(chords, tuning);
    voicings.forEach((v, i) => {
      const chord = prog.chords[i];
      if (chord && v) {
        updateChordVoicing(activeProgressionId, chord.id, v);
      }
    });
  }, [prog, activeProgressionId, tuning, updateChordVoicing]);

  const handleLoadTemplate = (type: keyof typeof COMMON_PROGRESSION_NAMES) => {
    if (!activeProgressionId) return;
    const chords = commonProgression(type, activeKey);
    createNew(COMMON_PROGRESSION_NAMES[type]);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progression Builder</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Build jazz progressions, analyze harmony, and play with auto voice leading.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button
          onClick={handlePlay}
          variant={isPlaying ? "destructive" : "default"}
          className="gap-2"
        >
          {isPlaying ? <><Square className="w-4 h-4" /> Stop</> : <><Play className="w-4 h-4" /> Play</>}
        </Button>

        <Button variant="secondary" onClick={handleAutoVoice} className="gap-2">
          <Wand2 className="w-4 h-4" />
          Auto Voice Lead
        </Button>

        <Button
          variant="secondary"
          onClick={() => setLoop(!loop)}
          className={`gap-2 ${loop ? "text-primary border-primary" : ""}`}
        >
          <Repeat className="w-4 h-4" />
          Loop {loop ? "On" : "Off"}
        </Button>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">BPM:</span>
          <input
            type="number"
            value={bpm}
            min={40}
            max={300}
            onChange={(e) => {
              const v = parseInt(e.target.value);
              if (!isNaN(v)) setPlaybackBpm(v);
            }}
            className="w-16 bg-secondary text-sm rounded px-2 py-1 border border-border text-center"
          />
        </div>

        <Button
          variant="secondary"
          onClick={() => { createNew(); }}
          className="gap-2 ml-auto"
        >
          <Plus className="w-4 h-4" />
          New
        </Button>
      </div>

      {/* Common progressions */}
      <div className="p-3 rounded-lg border border-border bg-card/50">
        <p className="text-xs text-muted-foreground mb-2 uppercase tracking-widest">Load Template</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(COMMON_PROGRESSION_NAMES) as (keyof typeof COMMON_PROGRESSION_NAMES)[]).map((type) => (
            <button
              key={type}
              onClick={() => {
                const chords = commonProgression(type, activeKey);
                const progId = activeProgressionId;
                if (!progId) return;
                // Clear current chords and add template chords
                chords.forEach((c) => addChord(progId, c.chord, c.durationBeats));
              }}
              className="px-3 py-1 text-sm rounded border border-border bg-secondary hover:border-primary/50 transition-colors"
            >
              {COMMON_PROGRESSION_NAMES[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Progression view */}
      {prog ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-semibold">{prog.name}</h2>
            <span className="text-muted-foreground text-sm">Key of {prog.key}</span>
          </div>

          {/* Chord slots */}
          <div className="flex flex-wrap gap-3">
            {prog.chords.map((pc, idx) => (
              <div
                key={pc.id}
                className={`p-3 rounded-lg border bg-card min-w-24 relative transition-colors ${
                  isPlaying && usePlaybackStore.getState().currentChordIndex === idx
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                <div className="text-lg font-bold">{pc.chord.symbol}</div>
                {pc.romanNumeral && (
                  <div className={`text-xs font-medium ${FUNCTION_COLORS[pc.harmonicFunction ?? "chromatic"]}`}>
                    {pc.romanNumeral}
                    {pc.secondaryFunction && ` (${pc.secondaryFunction})`}
                  </div>
                )}
                <div className="text-xs text-muted-foreground mt-1">
                  {pc.durationBeats} beat{pc.durationBeats !== 1 ? "s" : ""}
                </div>
                {pc.voicing && (
                  <div className="text-xs text-primary/70 mt-0.5">
                    {pc.voicing.type} pos.{pc.voicing.position}
                  </div>
                )}
                <button
                  onClick={() => activeProgressionId && removeChord(activeProgressionId, pc.id)}
                  className="absolute top-1 right-1 opacity-0 hover:opacity-100 transition-opacity text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}

            {/* Add chord button */}
            <button
              onClick={() => setShowPicker(!showPicker)}
              className="p-3 rounded-lg border border-dashed border-border hover:border-primary/50 min-w-24 flex items-center justify-center transition-colors"
            >
              <Plus className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Chord picker */}
          {showPicker && (
            <div className="p-4 rounded-lg border border-primary/30 bg-card space-y-3">
              <h3 className="text-sm font-medium">Add Chord</h3>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Root</label>
                <div className="flex flex-wrap gap-1">
                  {ALL_ROOTS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setPickerRoot(r)}
                      className={`px-2 py-1 text-sm rounded border transition-colors ${
                        pickerRoot === r ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Quality</label>
                <div className="flex flex-wrap gap-1">
                  {CHORD_QUALITY_GROUPS.flatMap((g) =>
                    g.qualities.map((q) => (
                      <button
                        key={q}
                        onClick={() => setPickerQuality(q as ChordQuality)}
                        className={`px-2 py-1 text-xs rounded border transition-colors ${
                          pickerQuality === q ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"
                        }`}
                      >
                        {q}
                      </button>
                    ))
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    if (activeProgressionId) {
                      addChord(activeProgressionId, buildChord(pickerRoot, pickerQuality), 4);
                      setShowPicker(false);
                    }
                  }}
                >
                  Add {pickerRoot}{pickerQuality}
                </Button>
                <Button variant="secondary" onClick={() => setShowPicker(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p>No progression loaded.</p>
          <Button className="mt-4" onClick={() => createNew()}>Create New Progression</Button>
        </div>
      )}
    </div>
  );
}
