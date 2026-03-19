import { useMemo } from "react";
import type { GuitarTuning } from "@/types";
import { FRET_INLAYS } from "@/lib/theory/guitar";
import type { FretboardLayout } from "./fretboard.types";

const SVG_WIDTH = 900;
const STRING_SPACING = 28;
const FRET_START_X = 48;  // left margin for string labels
const FRET_END_X = SVG_WIDTH - 20;
const NUT_X = FRET_START_X;
const TOP_MARGIN = 30;   // space for fret numbers
const BOTTOM_MARGIN = 20;

export function useFretboard(
  tuning: GuitarTuning,
  startFret: number,
  endFret: number
): FretboardLayout {
  return useMemo(() => {
    const numStrings = tuning.strings.length; // 6
    const numFrets = endFret - startFret;

    const svgHeight = TOP_MARGIN + (numStrings - 1) * STRING_SPACING + BOTTOM_MARGIN;
    const svgWidth = SVG_WIDTH;

    // Fret x positions — logarithmic spacing between startFret and endFret
    // Real scale: position of fret n from nut = scaleLength * (1 - 1/2^(n/12))
    // We compute relative positions within [startFret, endFret]
    const scaleLength = FRET_END_X - NUT_X;

    const fretXPositions: number[] = [];

    if (startFret === 0) {
      // Nut is at NUT_X; frets use logarithmic spacing from the nut
      for (let f = startFret; f <= endFret; f++) {
        const pos = scaleLength * (1 - 1 / Math.pow(2, f / 12));
        fretXPositions.push(NUT_X + pos);
      }
    } else {
      // Position view: linear spacing is fine for small fret windows
      const step = scaleLength / numFrets;
      for (let f = 0; f <= numFrets; f++) {
        fretXPositions.push(NUT_X + f * step);
      }
    }

    // String y positions — strings are ordered low (6) to high (1) top to bottom visually
    // String 6 = top of fretboard, string 1 = bottom (standard notation view)
    const stringYPositions: number[] = [];
    for (let s = 0; s < numStrings; s++) {
      stringYPositions.push(TOP_MARGIN + s * STRING_SPACING);
    }
    // Index 0 = string 6 (low E), index 5 = string 1 (high e)

    // Note position map: key = "string-fret" → {x, y}
    const notePositionMap = new Map<string, { x: number; y: number }>();
    for (let s = 1; s <= 6; s++) {
      const yIdx = 6 - s; // string 6 → yIdx 0, string 1 → yIdx 5
      const y = stringYPositions[yIdx];
      for (let f = startFret; f <= endFret; f++) {
        const fretIdx = f - startFret;
        const fretLeft = fretXPositions[fretIdx];
        const fretRight = fretXPositions[fretIdx + 1] ?? fretXPositions[fretIdx];
        const x = fretIdx === 0 && startFret === 0
          ? fretLeft + 14 // open string note, between nut and fret 1
          : (fretLeft + fretRight) / 2;
        notePositionMap.set(`${s}-${f}`, { x, y });
      }
    }

    // Inlay positions (dot markers)
    const inlayPositions: { x: number; y: number; double: boolean }[] = [];
    const midY = TOP_MARGIN + ((numStrings - 1) * STRING_SPACING) / 2;
    for (let f = startFret + 1; f <= endFret; f++) {
      const inlay = FRET_INLAYS[f];
      if (!inlay) continue;
      const fretIdx = f - startFret;
      if (fretIdx >= fretXPositions.length - 1) continue;
      const x = (fretXPositions[fretIdx - 1] + fretXPositions[fretIdx]) / 2;
      if (inlay === "single") {
        inlayPositions.push({ x, y: midY, double: false });
      } else {
        inlayPositions.push({ x, y: midY - STRING_SPACING * 0.8, double: true });
        inlayPositions.push({ x, y: midY + STRING_SPACING * 0.8, double: true });
      }
    }

    return {
      svgWidth,
      svgHeight,
      viewBox: `0 0 ${svgWidth} ${svgHeight}`,
      nutX: NUT_X,
      stringYPositions,
      fretXPositions,
      notePositionMap,
      inlayPositions,
    };
  }, [tuning, startFret, endFret]);
}
