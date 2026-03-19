"use client";

import type { VoiceLeadingResult } from "@/types";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, ArrowUp, ArrowDown, Minus } from "lucide-react";

interface VoiceLeadingViewProps {
  readonly result: VoiceLeadingResult;
}

export default function VoiceLeadingView({ result }: VoiceLeadingViewProps) {
  const { movements, totalDistance, smoothnessScore, hasParallelFifths, hasParallelOctaves } = result;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <h3 className="font-semibold">Voice Leading Analysis</h3>
        <Badge variant={smoothnessScore >= 70 ? "default" : smoothnessScore >= 40 ? "secondary" : "destructive"}>
          Smoothness: {smoothnessScore}/100
        </Badge>
        <span className="text-sm text-muted-foreground">
          Total movement: {totalDistance} semitones
        </span>
        {hasParallelFifths && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Parallel 5ths
          </Badge>
        )}
        {hasParallelOctaves && (
          <Badge variant="destructive" className="flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            Parallel 8ths
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {movements.map((m, i) => (
          <div
            key={i}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-secondary text-sm"
          >
            <span className="text-muted-foreground font-mono">{m.fromNote.note}</span>
            <span className="text-muted-foreground">({m.fromNote.intervalName})</span>
            <span className="mx-1">
              {m.direction === "up" ? (
                <ArrowUp className="w-3 h-3 text-green-400" />
              ) : m.direction === "down" ? (
                <ArrowDown className="w-3 h-3 text-red-400" />
              ) : (
                <Minus className="w-3 h-3 text-muted-foreground" />
              )}
            </span>
            <span className="font-medium">{m.toNote.note}</span>
            <span className="text-muted-foreground">({m.toNote.intervalName})</span>
            {m.direction !== "static" && (
              <span className="text-xs text-muted-foreground ml-1">
                {Math.abs(m.semitoneDistance)}st
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
