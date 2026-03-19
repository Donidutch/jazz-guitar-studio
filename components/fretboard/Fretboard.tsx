"use client";

import React, { useCallback } from "react";
import type { FretboardDisplayNote, StringNumber } from "@/types";
import type { FretboardProps } from "./fretboard.types";
import { useFretboard } from "./useFretboard";
import FretboardNote from "./FretboardNote";
import { notesOnString } from "@/lib/theory/guitar";
import { midiToNoteName } from "@/lib/theory/notes";

const NOTE_RADIUS = 10;

export default function Fretboard({
  tuning,
  startFret,
  endFret,
  showFretNumbers = true,
  showOpenStringLabels = true,
  showNut = true,
  showInlays = true,
  notes,
  interactive = false,
  onNoteClick,
  onNoteHover,
  labelMode = "intervalName",
  highlightStrings,
  className = "",
}: FretboardProps) {
  const layout = useFretboard(tuning, startFret, endFret);

  // Build a map for quick lookup of display notes
  const noteMap = new Map<string, FretboardDisplayNote>();
  for (const n of notes) {
    noteMap.set(`${n.string}-${n.fret}`, n);
  }

  const handleNoteClick = useCallback(
    (s: StringNumber, f: number) => {
      if (onNoteClick) onNoteClick(s, f);
    },
    [onNoteClick]
  );

  const handleNoteHover = useCallback(
    (s: StringNumber | null, f: number | null) => {
      if (onNoteHover) onNoteHover(s, f);
    },
    [onNoteHover]
  );

  const isHighlighted = (s: StringNumber) =>
    !highlightStrings || highlightStrings.includes(s);

  const stringLabels = tuning.strings.map((n) => {
    const match = n.match(/^([A-G][#b]?)/);
    return match ? match[1] : n;
  });
  // Index 0 = string 6 (low E) → display at top
  // Index 5 = string 1 (high e) → display at bottom

  return (
    <svg
      viewBox={layout.viewBox}
      className={`w-full select-none ${className}`}
      aria-label="Guitar fretboard"
      role="img"
    >
      {/* Inlay dots */}
      {showInlays &&
        layout.inlayPositions.map((inlay, i) => (
          <circle
            key={`inlay-${i}`}
            cx={inlay.x}
            cy={inlay.y}
            r={5}
            fill="#374151"
          />
        ))}

      {/* Fret wires */}
      {layout.fretXPositions.map((x, i) => {
        const isNut = startFret === 0 && i === 0;
        return (
          <line
            key={`fret-${i}`}
            x1={x}
            y1={layout.stringYPositions[0]}
            x2={x}
            y2={layout.stringYPositions[layout.stringYPositions.length - 1]}
            stroke={isNut && showNut ? "#D1D5DB" : "#4B5563"}
            strokeWidth={isNut && showNut ? 4 : 1.5}
          />
        );
      })}

      {/* Strings */}
      {layout.stringYPositions.map((y, idx) => {
        const stringNum = (6 - idx) as StringNumber;
        const dimmed = !isHighlighted(stringNum);
        // String thickness varies: string 6 thicker, string 1 thinner
        const thickness = 0.8 + idx * 0.25; // idx 0 = string 6 (thickest)
        return (
          <line
            key={`string-${idx}`}
            x1={layout.fretXPositions[0]}
            y1={y}
            x2={layout.fretXPositions[layout.fretXPositions.length - 1]}
            y2={y}
            stroke={dimmed ? "#374151" : "#9CA3AF"}
            strokeWidth={thickness}
          />
        );
      })}

      {/* Fret numbers */}
      {showFretNumbers &&
        layout.fretXPositions.slice(0, -1).map((x, i) => {
          const fretNum = startFret + i + 1;
          if (fretNum > endFret) return null;
          const nextX = layout.fretXPositions[i + 1] ?? x + 40;
          const midX = (x + nextX) / 2;
          return (
            <text
              key={`fretnum-${i}`}
              x={midX}
              y={12}
              textAnchor="middle"
              fontSize={10}
              fill="#6B7280"
              fontFamily="sans-serif"
            >
              {fretNum}
            </text>
          );
        })}

      {/* Open string labels */}
      {showOpenStringLabels && startFret === 0 &&
        layout.stringYPositions.map((y, idx) => {
          const stringNum = (6 - idx) as StringNumber;
          const label = stringLabels[idx];
          return (
            <text
              key={`strlabel-${idx}`}
              x={layout.nutX - 8}
              y={y + 4}
              textAnchor="end"
              fontSize={10}
              fill="#6B7280"
              fontFamily="sans-serif"
            >
              {label}
            </text>
          );
        })}

      {/* Interactive background click zones */}
      {interactive &&
        Array.from({ length: 6 }, (_, sIdx) => {
          const stringNum = (6 - sIdx) as StringNumber;
          const y = layout.stringYPositions[sIdx];
          return Array.from({ length: endFret - startFret }, (_, fretIdx) => {
            const fretNum = startFret + fretIdx;
            const x1 = layout.fretXPositions[fretIdx];
            const x2 = layout.fretXPositions[fretIdx + 1] ?? x1 + 40;
            return (
              <rect
                key={`zone-${sIdx}-${fretIdx}`}
                x={x1}
                y={y - NOTE_RADIUS}
                width={x2 - x1}
                height={NOTE_RADIUS * 2}
                fill="transparent"
                style={{ cursor: "pointer" }}
                onClick={() => handleNoteClick(stringNum, fretNum + (startFret === 0 ? 1 : 0))}
                onMouseEnter={() => handleNoteHover(stringNum, fretNum)}
                onMouseLeave={() => handleNoteHover(null, null)}
              />
            );
          });
        })}

      {/* Note dots */}
      {(() => {
        const rendered: React.ReactNode[] = [];
        for (const displayNote of notes) {
          const key = `${displayNote.string}-${displayNote.fret}`;
          const pos = layout.notePositionMap.get(key);
          if (!pos) continue;
          rendered.push(
            <FretboardNote
              key={key}
              x={pos.x}
              y={pos.y}
              displayNote={displayNote}
              radius={NOTE_RADIUS}
              onClick={onNoteClick ? () => handleNoteClick(displayNote.string, displayNote.fret) : undefined}
              onMouseEnter={onNoteHover ? () => handleNoteHover(displayNote.string, displayNote.fret) : undefined}
              onMouseLeave={onNoteHover ? () => handleNoteHover(null, null) : undefined}
            />
          );
        }
        return rendered;
      })()}
    </svg>
  );
}
