export default function ChordMelodyPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Chord Melody</h1>
      <p className="text-muted-foreground">
        Arrange melody notes over chord voicings. This workspace is coming in Phase 4.
      </p>
      <div className="p-8 rounded-xl border border-dashed border-border text-center text-muted-foreground">
        <p className="text-lg">Chord Melody Workshop</p>
        <p className="text-sm mt-2">
          Will include: fretboard + notation side-by-side, melody note placement,
          duration assignment, tab/notation export.
        </p>
      </div>
    </div>
  );
}
