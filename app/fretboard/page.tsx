"use client";

import { useState, useMemo } from "react";
import { notePositionsOnNeck, fretToNote } from "@/lib/theory/guitar";
import { useFretboardStore } from "@/store/fretboardStore";
import { useGuitarSynth } from "@/components/audio/useGuitarSynth";
import type { FretboardDisplayNote, NoteName, StringNumber } from "@/types";
import Fretboard from "@/components/fretboard/Fretboard";

const ALL_NOTES = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"];

export default function FretboardExplorerPage() {
  const { tuning } = useFretboardStore();
  const { playSingleNote } = useGuitarSynth();
  const [highlightNote, setHighlightNote] = useState<NoteName | null>(null);
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  const highlightedPositions = useMemo(() => {
    if (!highlightNote) return [];
    return notePositionsOnNeck(highlightNote, tuning, 15);
  }, [highlightNote, tuning]);

  const displayNotes: FretboardDisplayNote[] = useMemo(() => {
    return highlightedPositions.map((p) => ({
      string: p.string,
      fret: p.fret,
      label: p.note,
      color: "#F59E0B",
    }));
  }, [highlightedPositions]);

  const handleNoteClick = async (string: StringNumber, fret: number) => {
    const pos = fretToNote(tuning, string, fret);
    const { noteToMidi } = await import("@/lib/theory/notes");
    await playSingleNote(noteToMidi(`${pos.note}${pos.octave}`));
    setHoveredNote(`${pos.note}${pos.octave} (string ${string}, fret ${fret})`);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fretboard Explorer</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Click any fret to hear the note. Highlight all occurrences of a note across the neck.
        </p>
      </div>

      {/* Note highlight */}
      <div className="p-4 rounded-lg border border-border bg-card space-y-2">
        <label className="text-xs text-muted-foreground uppercase tracking-widest">Highlight note:</label>
        <div className="flex flex-wrap gap-1">
          <button
            onClick={() => setHighlightNote(null)}
            className={`px-3 py-1.5 text-sm rounded border transition-colors ${!highlightNote ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}
          >
            None
          </button>
          {ALL_NOTES.map((n) => (
            <button
              key={n}
              onClick={() => setHighlightNote(n === highlightNote ? null : n)}
              className={`px-3 py-1.5 text-sm rounded border transition-colors ${highlightNote === n ? "bg-primary text-primary-foreground border-primary" : "bg-secondary border-border"}`}
            >
              {n}
            </button>
          ))}
        </div>
        {hoveredNote && (
          <p className="text-sm text-primary font-mono">{hoveredNote}</p>
        )}
      </div>

      {/* Fretboard */}
      <div className="p-4 rounded-lg border border-border bg-card">
        <Fretboard
          tuning={tuning}
          startFret={0}
          endFret={15}
          notes={displayNotes}
          interactive={true}
          showFretNumbers={true}
          showNut={true}
          showInlays={true}
          onNoteClick={handleNoteClick}
          onNoteHover={() => {}}
          labelMode="noteName"
        />
      </div>

      <div className="text-sm text-muted-foreground">
        {highlightNote
          ? `${highlightNote} appears on ${highlightedPositions.length} positions across the neck.`
          : "Click any position on the fretboard to hear the note."}
      </div>
    </div>
  );
}
