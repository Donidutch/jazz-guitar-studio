// ─── Primitives ──────────────────────────────────────────────────────────────

export type NoteName = string; // "C", "Bb", "F#"
export type NoteWithOctave = string; // "C4", "Bb3"
export type MidiNote = number; // 0-127
export type Semitones = number;
export type FretNumber = number; // 0 = open string
export type StringNumber = number; // 1 = high e, 6 = low E (standard)

// ─── Chord ───────────────────────────────────────────────────────────────────

export type ChordQuality =
  | "maj7" | "maj9" | "maj7#11" | "maj13" | "maj7#5"
  | "7" | "9" | "11" | "13" | "7b9" | "7#9" | "7b9#9" | "7alt" | "7#11"
  | "7b13" | "7#11b13" | "9#11" | "13b9" | "13#11"
  | "m7" | "m9" | "m11" | "m13" | "m7b5" | "m/maj7" | "m6"
  | "dim7" | "dim"
  | "6" | "6/9"
  | "sus4" | "sus2" | "7sus4" | "9sus4"
  | "aug" | "aug7";

export interface ChordDefinition {
  readonly symbol: string; // "Cmaj7", "G7b9"
  readonly root: NoteName;
  readonly quality: ChordQuality;
  readonly intervals: ReadonlyArray<string>; // ["1P", "3M", "5P", "7M"]
  readonly notes: ReadonlyArray<NoteName>;
  readonly bassNote?: NoteName; // for slash chords
}

// ─── Voicing ─────────────────────────────────────────────────────────────────

export type VoicingType =
  | "drop2" | "drop3" | "drop2-4"
  | "shell" // root, 3rd, 7th only
  | "guideTone" // 3rd and 7th only (rootless)
  | "quartal"
  | "close"
  | "open"
  | "rootless";

export interface VoicingNote {
  readonly string: StringNumber;
  readonly fret: FretNumber;
  readonly note: NoteName;
  readonly octave: number;
  readonly midi: MidiNote;
  readonly intervalName: string; // "R", "3", "b7", "#11"
  readonly muted: boolean;
}

export interface Voicing {
  readonly id: string; // deterministic hash
  readonly chord: ChordDefinition;
  readonly notes: ReadonlyArray<VoicingNote>; // sorted low to high string
  readonly type: VoicingType;
  readonly lowestFret: FretNumber;
  readonly highestFret: FretNumber;
  readonly span: number; // highestFret - lowestFret
  readonly stringSet: ReadonlyArray<StringNumber>;
  readonly position: number; // approx. neck position 1-12
  readonly bassNote: NoteName;
  readonly topNote: NoteName;
  readonly inversion: 0 | 1 | 2 | 3;
  readonly difficulty: 1 | 2 | 3 | 4 | 5;
}

// ─── Voice Leading ────────────────────────────────────────────────────────────

export interface VoiceMovement {
  readonly fromNote: VoicingNote;
  readonly toNote: VoicingNote;
  readonly semitoneDistance: Semitones;
  readonly direction: "up" | "down" | "static";
  readonly intervalName: string;
}

export interface VoiceLeadingResult {
  readonly fromVoicing: Voicing;
  readonly toVoicing: Voicing;
  readonly movements: ReadonlyArray<VoiceMovement>;
  readonly totalDistance: Semitones;
  readonly hasParallelFifths: boolean;
  readonly hasParallelOctaves: boolean;
  readonly smoothnessScore: number; // 0-100
}

// ─── Scale ───────────────────────────────────────────────────────────────────

export type ScaleType =
  | "major" | "natural-minor" | "harmonic-minor" | "melodic-minor"
  | "dorian" | "phrygian" | "lydian" | "mixolydian" | "aeolian" | "locrian"
  | "lydian-dominant" | "altered" | "half-diminished" | "phrygian-dominant"
  | "whole-tone" | "half-whole-dim" | "whole-half-dim"
  | "major-pentatonic" | "minor-pentatonic"
  | "major-bebop" | "dominant-bebop" | "minor-bebop"
  | "blues";

export interface ScaleDefinition {
  readonly name: string;
  readonly root: NoteName;
  readonly type: ScaleType;
  readonly intervals: ReadonlyArray<string>;
  readonly notes: ReadonlyArray<NoteName>;
  readonly chordScaleContext: ReadonlyArray<ChordQuality>;
  readonly description: string;
}

// ─── Fretboard ───────────────────────────────────────────────────────────────

export interface FretPosition {
  readonly string: StringNumber;
  readonly fret: FretNumber;
  readonly note: NoteName;
  readonly octave: number;
  readonly midi: MidiNote;
}

export interface GuitarTuning {
  readonly name: string;
  readonly strings: ReadonlyArray<NoteWithOctave>; // low to high: ["E2","A2","D3","G3","B3","E4"]
}

export interface ScaleNeckPosition {
  readonly positionIndex: number;
  readonly label: string; // "Position I", "Position IV"
  readonly lowestFret: FretNumber;
  readonly highestFret: FretNumber;
  readonly notes: ReadonlyArray<FretPosition>;
  readonly rootPositions: ReadonlyArray<FretPosition>;
}

// ─── Progression ─────────────────────────────────────────────────────────────

export type RomanNumeral = "I" | "II" | "bII" | "III" | "bIII" | "IV" | "#IV" | "V" | "bVI" | "VI" | "bVII" | "VII";
export type HarmonicFunction = "tonic" | "subdominant" | "dominant" | "secondary-dominant" | "modal-interchange" | "chromatic";

export interface ProgressionChord {
  readonly id: string;
  readonly chord: ChordDefinition;
  readonly voicing?: Voicing;
  readonly durationBeats: number; // 1, 2, 4
  readonly romanNumeral?: string;
  readonly harmonicFunction?: HarmonicFunction;
  readonly secondaryFunction?: string; // "V/ii"
  readonly modalInterchange?: string;
}

export interface Progression {
  readonly id: string;
  readonly name: string;
  readonly key: NoteName;
  readonly mode: string;
  readonly timeSignature: [number, number];
  readonly bpm: number;
  readonly swing: number; // 0 = straight, 1 = full swing
  readonly chords: ReadonlyArray<ProgressionChord>;
  readonly form?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

// ─── Ear Training ─────────────────────────────────────────────────────────────

export type EarTrainingMode = "interval" | "chordQuality" | "melodicDictation";
export type ExerciseState = "idle" | "playing" | "awaiting-answer" | "correct" | "incorrect";

export interface IntervalExercise {
  readonly type: "interval";
  readonly note1: NoteWithOctave;
  readonly note2: NoteWithOctave;
  readonly direction: "ascending" | "descending" | "harmonic";
  readonly correctInterval: string; // "M3", "b7"
}

export interface ChordQualityExercise {
  readonly type: "chordQuality";
  readonly voicing: Voicing;
  readonly correctQuality: ChordQuality;
  readonly rootHidden: boolean;
}

export interface MelodicDictationExercise {
  readonly type: "melodicDictation";
  readonly notes: ReadonlyArray<NoteWithOctave>;
  readonly key: NoteName;
  readonly correctDegrees: ReadonlyArray<string>;
}

export type Exercise = IntervalExercise | ChordQualityExercise | MelodicDictationExercise;

export interface ExerciseResult {
  readonly exercise: Exercise;
  readonly answer: string | ReadonlyArray<string>;
  readonly correct: boolean;
  readonly timeMs: number;
}

export interface EarTrainingSession {
  readonly id: string;
  readonly mode: EarTrainingMode;
  readonly startedAt: number;
  readonly results: ReadonlyArray<ExerciseResult>;
  readonly streak: number;
  readonly accuracy: number;
}

// ─── Reharmonization ─────────────────────────────────────────────────────────

export type SubstitutionType =
  | "tritone-sub"
  | "secondary-dominant"
  | "back-cycle"
  | "modal-interchange"
  | "chromatic-mediant"
  | "passing-diminished"
  | "deceptive-resolution";

export interface Substitution {
  readonly type: SubstitutionType;
  readonly originalChord: ChordDefinition;
  readonly substitutionChord: ChordDefinition;
  readonly explanation: string;
  readonly commonTones: ReadonlyArray<NoteName>;
  readonly voiceLeadingScore: number; // 0-100
}

// ─── Fretboard Component Props ────────────────────────────────────────────────

export interface FretboardDisplayNote {
  readonly string: StringNumber;
  readonly fret: FretNumber;
  readonly label?: string; // "R", "b7", "C", "3"
  readonly color?: string; // CSS color
  readonly shape?: "circle" | "square" | "diamond";
  readonly size?: "sm" | "md" | "lg";
  readonly pulsing?: boolean;
  readonly muted?: boolean;
  readonly open?: boolean;
}

export type LabelMode = "none" | "noteName" | "intervalName" | "scaleDegree";
