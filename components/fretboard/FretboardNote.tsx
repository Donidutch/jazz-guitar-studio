"use client";

import React from "react";
import type { FretboardDisplayNote } from "@/types";

// Interval color tokens
const INTERVAL_COLORS: Record<string, string> = {
  "R":    "#F59E0B", // amber (root)
  "3":    "#22C55E", // green (major 3rd)
  "b3":   "#3B82F6", // blue (minor 3rd)
  "5":    "#A855F7", // purple (5th)
  "b5":   "#EC4899", // pink (flat 5)
  "#5":   "#F97316", // orange (sharp 5)
  "b7":   "#EC4899", // pink (dominant 7th)
  "7":    "#F97316", // orange (major 7th)
  "2":    "#64748B", // slate (tensions)
  "4":    "#64748B",
  "#4":   "#64748B",
  "#11":  "#64748B",
  "6":    "#64748B",
  "b9":   "#94A3B8",
  "9":    "#94A3B8",
  "#9":   "#94A3B8",
  "11":   "#94A3B8",
  "b13":  "#94A3B8",
  "13":   "#94A3B8",
};

function getColor(displayNote: FretboardDisplayNote): string {
  if (displayNote.color) return displayNote.color;
  if (displayNote.label) return INTERVAL_COLORS[displayNote.label] ?? "#6B7280";
  return "#6B7280"; // default gray
}

interface FretboardNoteProps {
  readonly x: number;
  readonly y: number;
  readonly displayNote: FretboardDisplayNote;
  readonly radius: number;
  readonly onClick?: () => void;
  readonly onMouseEnter?: () => void;
  readonly onMouseLeave?: () => void;
}

const FretboardNote = React.memo(function FretboardNote({
  x,
  y,
  displayNote,
  radius,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: FretboardNoteProps) {
  const color = getColor(displayNote);
  const r = displayNote.size === "sm" ? radius * 0.75
           : displayNote.size === "lg" ? radius * 1.2
           : radius;

  const fontSize = r * 0.85;

  if (displayNote.muted) {
    return (
      <g
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
      >
        <text
          x={x}
          y={y + fontSize * 0.35}
          textAnchor="middle"
          fontSize={r * 1.4}
          fill="#6B7280"
          fontFamily="sans-serif"
          fontWeight="bold"
        >
          ×
        </text>
      </g>
    );
  }

  return (
    <g
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ cursor: onClick ? "pointer" : "default" }}
    >
      {displayNote.pulsing && (
        <circle
          cx={x}
          cy={y}
          r={r + 4}
          fill={color}
          opacity={0.3}
          className="animate-ping"
        />
      )}
      {displayNote.shape === "square" ? (
        <rect
          x={x - r}
          y={y - r}
          width={r * 2}
          height={r * 2}
          rx={3}
          fill={color}
          stroke={color === "#F59E0B" ? "#fff" : "transparent"}
          strokeWidth={1}
        />
      ) : displayNote.shape === "diamond" ? (
        <polygon
          points={`${x},${y - r} ${x + r},${y} ${x},${y + r} ${x - r},${y}`}
          fill={color}
        />
      ) : (
        <circle cx={x} cy={y} r={r} fill={color} />
      )}
      {displayNote.label && (
        <text
          x={x}
          y={y + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fill={color === "#F59E0B" || color === "#22C55E" ? "#0F172A" : "#FFFFFF"}
          fontFamily="sans-serif"
          fontWeight="600"
          pointerEvents="none"
        >
          {displayNote.label}
        </text>
      )}
    </g>
  );
});

export default FretboardNote;
