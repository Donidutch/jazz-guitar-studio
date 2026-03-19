import type { FretboardDisplayNote, GuitarTuning, LabelMode, StringNumber } from "@/types";

export interface FretboardLayout {
  readonly svgWidth: number;
  readonly svgHeight: number;
  readonly viewBox: string;
  readonly nutX: number;
  readonly stringYPositions: number[];
  readonly fretXPositions: number[];
  readonly notePositionMap: Map<string, { x: number; y: number }>;
  readonly inlayPositions: { x: number; y: number; double: boolean }[];
}

export interface FretboardProps {
  // Layout
  readonly tuning: GuitarTuning;
  readonly startFret: number;
  readonly endFret: number;
  readonly orientation?: "horizontal" | "vertical";
  readonly showFretNumbers?: boolean;
  readonly showOpenStringLabels?: boolean;
  readonly showNut?: boolean;
  readonly showInlays?: boolean;

  // Notes to display
  readonly notes: ReadonlyArray<FretboardDisplayNote>;

  // Interactivity
  readonly interactive?: boolean;
  readonly onNoteClick?: (string: StringNumber, fret: number) => void;
  readonly onNoteHover?: (string: StringNumber | null, fret: number | null) => void;

  // Display
  readonly labelMode?: LabelMode;
  readonly highlightStrings?: ReadonlyArray<StringNumber>;

  // Dimensions (optional; defaults to responsive 100% width)
  readonly width?: number;
  readonly height?: number;
  readonly className?: string;
}

export interface FretboardNoteProps {
  readonly x: number;
  readonly y: number;
  readonly displayNote: FretboardDisplayNote;
  readonly radius: number;
}
