import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";

interface Lesson {
  title: string;
  description: string;
  sections: { heading: string; body: string }[];
  relatedTools: { label: string; href: string }[];
  keyPoints: string[];
}

const LESSONS: Record<string, Lesson> = {
  "ii-v-i": {
    title: "The ii-V-I Progression",
    description: "The cornerstone of jazz harmony — understanding this progression unlocks the language of jazz.",
    keyPoints: [
      "ii-V-I uses three chords built on scale degrees 2, 5, and 1",
      "In C major: Dm7 → G7 → Cmaj7",
      "The V7 chord creates the strongest pull to I due to tritone resolution",
      "Guide tones (3rds and 7ths) voice lead smoothly: B→C (7th of G7 → 3rd of Cmaj7), F→E (3rd of G7 → 7th of Cmaj7)",
      "Minor ii-V-i uses m7b5 and 7b9: Dm7b5 → G7b9 → Cm(maj7)",
    ],
    sections: [
      {
        heading: "What is ii-V-I?",
        body: `The ii-V-I (two-five-one) is the most fundamental harmonic movement in jazz. It appears in countless standards and forms the backbone of bebop vocabulary. The three chords — built on scale degrees 2, 5, and 1 of a major key — create a strong sense of harmonic motion and resolution.

In the key of C major:
  • ii: Dm7 (D-F-A-C)
  • V7: G7 (G-B-D-F)
  • I: Cmaj7 (C-E-G-B)

The power of this progression comes from the tritone interval between the 3rd and 7th of the V7 chord (B and F in G7), which resolves by half-step into the I chord.`,
      },
      {
        heading: "Tritone Resolution",
        body: `The V7 chord contains a tritone — an unstable interval that wants to resolve. In G7:
  • The 3rd (B) resolves up by half step to C (the root of Cmaj7)
  • The 7th (F) resolves down by half step to E (the 3rd of Cmaj7)

This dual half-step resolution is what makes the V→I motion so compelling. It's the engine of tonal music.`,
      },
      {
        heading: "Guide Tone Voice Leading",
        body: `The 3rd and 7th of each chord (called "guide tones") move smoothly through the ii-V-I:

Dm7 → G7 → Cmaj7:
  • 3rd: F → B → E  (moves by tritone, then down a half step)
  • 7th: C → F → B  (moves by perfect 4th, then up a half step)

Notice how the 7th of each chord becomes the 3rd of the next. This is the voice leading machinery that makes jazz chord progressions sound inevitable.`,
      },
      {
        heading: "Minor ii-V-i",
        body: `In a minor key, the ii-V-I becomes:
  • ii: m7b5 (half-diminished) — e.g. Dm7b5 in C minor
  • V: 7b9 (dominant with flat 9) — G7b9
  • i: m(maj7) or m7 — Cm(maj7)

The m7b5 chord contains the same tritone as the dominant (F-B in Dm7b5), creating the same pull to resolution. The 7b9 adds tension with the half step between the root and b9.`,
      },
      {
        heading: "Common Practice Tips",
        body: `When playing over ii-V-I:
  • Target chord tones on strong beats (1 and 3)
  • Approach from a half step above or below
  • The altered scale works well over V7 (treat V7 as the Lydian dominant of bII)
  • Practice in all 12 keys — the cycle of 4ths is the most common key sequence
  • Learn to hear the "pull" of the dominant: can you resolve it in multiple ways?`,
      },
    ],
    relatedTools: [
      { label: "Build a ii-V-I in Progression Builder", href: "/progressions" },
      { label: "Explore G7 voicings", href: "/chords" },
      { label: "Reharmonize the V7", href: "/reharmonization" },
    ],
  },

  "drop2-voicings": {
    title: "Drop 2 Voicings",
    description: "The essential jazz chord technique — how to derive, play, and use drop 2 voicings across the neck.",
    keyPoints: [
      "Start with a close-position chord, then drop the 2nd-highest voice down an octave",
      "This spreads the chord across 4 adjacent strings — perfect for guitar",
      "The result is a more open, idiomatic jazz sound than close position",
      "All 4 inversions are available on each string set",
      "String sets: 6-3, 5-2, 4-1 are the most common for comping",
    ],
    sections: [
      {
        heading: "What Is Drop 2?",
        body: `A "drop 2" voicing is derived from a four-voice close-position chord (all voices within an octave) by taking the second-highest voice and dropping it down one octave. This spreads the chord across a wider range and makes it much more playable on guitar.

Close position Cmaj7: C4-E4-G4-B4
Drop the 2nd-highest voice (G4): C4-E4-B4-G3
Rearranged on guitar (low to high): G3-C4-E4-B4`,
      },
      {
        heading: "The Four Inversions",
        body: `Every four-note chord has four inversions (root position + 3 inversions). Each generates a different drop 2 voicing with a different bass note and top note:

For Cmaj7 on strings 6-3:
  • Root position: C is the bass note
  • 1st inversion: E is the bass note
  • 2nd inversion: G is the bass note
  • 3rd inversion: B is the bass note

Memorize all four inversions on each string set. This gives you 12 fingerings total across the 3 main string sets — enough to comp anywhere on the neck.`,
      },
      {
        heading: "String Sets",
        body: `The three primary string sets for drop 2 voicings:
  • Strings 6-3 (low): Deep, full sound — good for slow ballads
  • Strings 5-2 (middle): The most versatile — used constantly in jazz comping
  • Strings 4-1 (high): Bright, treble — good for chord melody and upper register

On guitar, the same interval relationships produce different fingerings on each string set due to the B string (strings 2-3 are a major 3rd apart instead of a 4th).`,
      },
      {
        heading: "Moving Through ii-V-I",
        body: `The real power of drop 2 voicings emerges when connecting chords via smooth voice leading. For Dm7 → G7 → Cmaj7:

Use 2nd inversion Dm7 → root position G7 → root position Cmaj7:
  • The top notes move: C → B → B (holds!)
  • The bass notes move: A → G → C

Or try: root position Dm7 → 3rd inversion G7 → 1st inversion Cmaj7 for a descending bass line.

The Chord Explorer shows voice leading between any two voicings automatically.`,
      },
    ],
    relatedTools: [
      { label: "Explore drop 2 voicings in Chord Explorer", href: "/chords" },
      { label: "See voice leading between chords", href: "/voice-leading" },
    ],
  },

  "tritone-substitution": {
    title: "Tritone Substitution",
    description: "Replace any dominant V7 chord with the dominant built a tritone away — a powerful jazz reharmonization technique.",
    keyPoints: [
      "The tritone sub replaces G7 with Db7 (6 semitones / tritone away)",
      "Both chords share the same tritone: B-F in G7 = Cb-F in Db7 (enharmonically)",
      "The sub creates chromatic bass movement: D → Db → C",
      "Works on V7 chords only (dominant quality required)",
      "The sub's altered extensions become natural tensions in the substitution",
    ],
    sections: [
      {
        heading: "The Logic of Tritone Subs",
        body: `A dominant 7th chord's character comes from its tritone — the dissonant interval between its 3rd and 7th. In G7, the tritone is between B (major 3rd) and F (minor 7th).

The key insight: only one other chord shares this exact tritone (with enharmonic respelling). Db7 has Cb (=B) and F. Same tritone, different bass note — a tritone away.

Since both chords have the same tritone and it resolves the same way, Db7 can substitute for G7 when resolving to C.`,
      },
      {
        heading: "Voice Leading Benefits",
        body: `Beyond the shared tritone, the tritone sub creates smoother chromatic bass movement:
  • Without sub: D (Dm7) → G (G7) → C (Cmaj7) — leap of a 5th
  • With sub: D (Dm7) → Db (Db7) → C (Cmaj7) — descending half steps

This chromatic bass line is one of the most ear-pleasing sounds in jazz, giving the progression a sense of inevitability.`,
      },
      {
        heading: "Altered Tensions",
        body: `When you play Db7 as a tritone sub for G7, the usual tensions become:
  • b9 of Db7 = natural 5th of G7 (D)
  • 9 of Db7 = b13 of G7 (Eb)
  • #11 of Db7 = major 7th of G (B)

In other words: the tritone sub's natural extensions are the altered extensions of the original dominant. This is why the altered scale (7th mode of melodic minor) works perfectly over both the V7 and its tritone sub.`,
      },
    ],
    relatedTools: [
      { label: "Find tritone subs in Reharmonization", href: "/reharmonization" },
      { label: "Explore Db7 voicings", href: "/chords" },
    ],
  },

  "guide-tones": {
    title: "Guide Tones",
    description: "The 3rd and 7th intervals define a chord's quality and voice lead smoothly through any progression.",
    keyPoints: [
      "The 3rd tells you major or minor quality; the 7th tells you major 7, dominant 7, or minor 7",
      "Guide tones move by half steps or common tones through ii-V-I",
      "A 2-note guide tone voicing (3rd + 7th) clearly outlines harmony with minimum notes",
      "The 7th of each chord often becomes the 3rd of the next",
      "Guide tone lines are the skeleton of jazz improvisation",
    ],
    sections: [
      {
        heading: "What Are Guide Tones?",
        body: `Guide tones are the 3rd and 7th of a chord. These two notes define the chord's quality more than any other tones:
  • 3rd: determines major vs minor quality
  • 7th: determines major 7 (Δ), dominant 7 (7), or minor 7 (m7)

Together they "guide" your ear through harmonic changes. A bassist, pianist, and guitarist can all hear the harmony clearly from just these two notes.`,
      },
      {
        heading: "Guide Tones Through ii-V-I",
        body: `In C major, trace the guide tones through Dm7 → G7 → Cmaj7:

Voice 1 (starts on 3rd of Dm7):
  F (3rd of Dm7) → F (7th of G7) → E (3rd of Cmaj7)
  Movement: hold → half step down

Voice 2 (starts on 7th of Dm7):
  C (7th of Dm7) → B (3rd of G7) → B (7th of Cmaj7)
  Movement: half step down → hold

Notice: the 7th of Dm7 becomes the 3rd of G7, and the 7th of G7 becomes the 7th of Cmaj7. The chords interlock like gears.`,
      },
      {
        heading: "Applying to Comping",
        body: `The simplest jazz comping approach: play only the guide tones (3rd and 7th) on strings 3-2 or 4-3. This leaves room for the bass player and horn player while clearly outlining the changes.

For rhythm section playing:
  • Add root (on string 5 or 6) to make a 3-note shell voicing
  • Add the 5th or a tension to make a full voicing
  • But always keep the guide tones — they're non-negotiable`,
      },
    ],
    relatedTools: [
      { label: "Filter guide tone voicings in Chord Explorer", href: "/chords" },
      { label: "See voice leading arrows", href: "/voice-leading" },
    ],
  },

  "chord-scales": {
    title: "Chord-Scale Theory",
    description: "Matching the right scale to each chord in a progression — the foundational framework for jazz improvisation.",
    keyPoints: [
      "Each chord quality corresponds to one or more compatible scales",
      "Dorian mode works over minor 7th chords (the 2nd mode of major)",
      "Mixolydian works over dominant 7th chords (the 5th mode of major)",
      "Lydian works over major 7th chords (the 4th mode of major)",
      "The altered scale (7th mode of melodic minor) is the go-to for altered dominants",
    ],
    sections: [
      {
        heading: "The Chord-Scale Relationship",
        body: `Every chord is a subset of a larger scale. Chord-scale theory matches each chord with the most harmonically consistent scale — one where every note of the chord appears in the scale, and the remaining scale tones add color without clashing.

The key chord-scale relationships for jazz:
  • Cmaj7: C Lydian (C-D-E-F#-G-A-B) — the #11 adds sparkle
  • Dm7: D Dorian (D-E-F-G-A-B-C) — the natural 6th is characteristic
  • G7: G Mixolydian (G-A-B-C-D-E-F) — plain dominant
  • G7alt: G Altered / Ab Melodic Minor — all tensions altered`,
      },
      {
        heading: "Modal Choices for Common Chord Types",
        body: `Dominant 7th chords have the most scale options because jazz dominants can carry many different tension profiles:
  • G7 (no tensions): G Mixolydian
  • G7#11: G Lydian Dominant (4th mode of D melodic minor)
  • G7b9, G7b13: G HW Diminished (alternating half-whole steps)
  • G7alt (b9, #9, b5, b13): G Altered = Ab Melodic Minor

The "available tensions" on a dominant chord depend on the harmonic context — whether it's resolving to a major or minor chord changes which alterations sound good.`,
      },
      {
        heading: "Parent Scales and Modes",
        body: `The 7 modes of the major scale each correspond to a chord type:
  1. Ionian (major): Maj7
  2. Dorian: m7
  3. Phrygian: m7 (darker)
  4. Lydian: Maj7#11
  5. Mixolydian: 7
  6. Aeolian (natural minor): m7
  7. Locrian: m7b5

Melodic minor (raised 7th of natural minor) generates another set of 7 modes, including Lydian Dominant (#4,b7) and the Altered scale.`,
      },
    ],
    relatedTools: [
      { label: "Visualize all scales in Scale Explorer", href: "/scales" },
      { label: "Hear chord scales over a progression", href: "/progressions" },
    ],
  },

  "voice-leading-principles": {
    title: "Voice Leading Principles",
    description: "The rules governing smooth movement between chords — minimal motion, contrary motion, and avoiding parallel fifths.",
    keyPoints: [
      "Move each voice the shortest distance possible (prefer half steps and whole steps)",
      "Common tones between chords should be held or repeated",
      "Contrary motion (voices moving in opposite directions) creates independence",
      "Avoid parallel 5ths and octaves — they collapse the voice texture",
      "The smoothness score = 100 × (1 - totalDistance / (voices × 12))",
    ],
    sections: [
      {
        heading: "The Principle of Minimal Motion",
        body: `The core rule: when moving from one chord to the next, each voice should move as little as possible. Half-step motion is ideal; whole-step is fine; anything larger draws attention.

This principle has two benefits:
  1. The individual voices sound like melodies, not random jumps
  2. The listener's ear can track each voice through the progression

When two adjacent chords share a common tone, the smoothest voice leading holds that tone in place.`,
      },
      {
        heading: "Parallel Fifths and Octaves",
        body: `Moving two voices in parallel motion by a perfect fifth or octave creates a "hollow" sound that collapses voice independence. Classical composers avoided this strictly; jazz allows more flexibility, but in 4-part voicing, parallel 5ths/8ths still sound thick and muddy.

Detection: Check if the interval between two voices is a P5 or P8, and the same interval holds after the chord change (with both voices moving in the same direction).

The Voice Leading tool flags these automatically.`,
      },
      {
        heading: "Contrary and Oblique Motion",
        body: `Two other motion types (beyond parallel motion):
  • Contrary motion: voices move in opposite directions — one up, one down. This is the most independent-sounding motion and is generally preferred.
  • Oblique motion: one voice holds while another moves. Common at held chord tones.

In jazz comping, you don't strictly follow classical voice leading rules — but understanding them helps you make intentional choices rather than accidental ones.`,
      },
    ],
    relatedTools: [
      { label: "Analyze voice leading between two chords", href: "/voice-leading" },
      { label: "Build progressions with auto voice leading", href: "/progressions" },
    ],
  },

  "modal-interchange": {
    title: "Modal Interchange",
    description: "Borrowing chords from parallel modes to add color and interest to your harmonic palette.",
    keyPoints: [
      "Modal interchange borrows chords from the parallel minor (or other parallel modes)",
      "Most common: IVm, bVII, bIII, bVI borrowed from the parallel Aeolian",
      "The iv minor chord (Fm in C major) has a characteristic \"dark\" resolution to I",
      "bVII (Bb in C major) is extremely common in pop and jazz",
      "These chords don't change the tonal center — they just add modal color",
    ],
    sections: [
      {
        heading: "What Is Modal Interchange?",
        body: `Modal interchange means temporarily borrowing chords from parallel modes — modes built on the same root but with different interval structures. The most common source is the parallel natural minor (Aeolian mode).

In C major, the parallel C Aeolian scale has: C-D-Eb-F-G-Ab-Bb-C
Chords built from this scale that aren't in C major:
  • IVm: Fm (F-Ab-C)
  • bVII: Bb major (Bb-D-F)
  • bIII: Eb major (Eb-G-Bb)
  • bVI: Ab major (Ab-C-Eb)`,
      },
      {
        heading: "The iv Minor Chord",
        body: `The borrowed iv minor chord (Fm in C major) is one of the most emotionally powerful sounds in tonal music. It appears in:
  • "Yesterday" (Beatles) — Fm over a C center
  • Countless jazz ballads and standards

The voice leading is compelling: the Ab in Fm resolves down to G in C major, while the C is a common tone. The movement creates a "sigh" effect.

In jazz, the iv minor often appears as part of the progression: I → IV → IVm → I (a common "clichéd" but effective harmonic move).`,
      },
      {
        heading: "The bVII Chord",
        body: `The subtonic major chord (bVII7, e.g., Bb7 in C) is borrowed from Mixolydian/Dorian and is ubiquitous in jazz, funk, and rock. It has a "modal" flavor — it doesn't create the same pull as a tritone-based V7.

Common uses:
  • As a replacement for V7 when you want less resolution tension
  • In "backdoor" ii-V: Fm7 → Bb7 → Cmaj7 (the ii and V of the bVII chord)
  • As a passing chord: I → bVII → bVI → V`,
      },
    ],
    relatedTools: [
      { label: "Find borrowed chords in Reharmonization", href: "/reharmonization" },
      { label: "Build a progression with modal interchange", href: "/progressions" },
    ],
  },

  "rhythm-changes": {
    title: "Rhythm Changes",
    description: "The harmonic form derived from 'I Got Rhythm' — a staple of bebop with endless substitution possibilities.",
    keyPoints: [
      "32-bar AABA form in Bb major",
      "A section: I → VI7 → ii → V → I (with many variations)",
      "B section (bridge): III7 → VI7 → II7 → V7 (dominant cycle in 4ths)",
      "The turnaround (I-VI7-ii-V7) is endlessly varied in bebop",
      "Key standards on rhythm changes: Anthropology, Oleo, Dexterity",
    ],
    sections: [
      {
        heading: "The Basic Form",
        body: `Rhythm changes is a 32-bar AABA form in Bb major. The A section (repeated 3 times) uses a I-VI-ii-V turnaround, and the B section (bridge) moves through a dominant cycle.

Basic A section in Bb:
  Bbmaj7 | G7 | Cm7 | F7 | Bbmaj7 | G7 | Cm7 F7 | Bb ||

Basic B section:
  D7 | D7 | G7 | G7 | C7 | C7 | F7 | F7 ||

The B section moves by dominant 7ths descending in 4ths: D7 → G7 → C7 → F7, all resolving back to Bb.`,
      },
      {
        heading: "Turnaround Variations",
        body: `The A section turnaround (I-VI-ii-V) is the most substituted chord sequence in jazz. Common variations:
  • Tritone subs: Bb → Db7 → Cm7 → Gb7
  • Chromatic approach: Bb → E7 → Eb7 → D7 → Db7 → C7 → B7 → Bb
  • Passing diminished: Bb → Bdim7 → Cm7 → F7
  • Back-cycling: Bb → Bb7 → Eb7 → A7 → Dm7 → G7 → Cm7 → F7

Each variation maintains the function but changes the color. Bebop players often improvise the turnaround chord substitutions spontaneously.`,
      },
    ],
    relatedTools: [
      { label: "Load Rhythm Changes in Progression Builder", href: "/progressions" },
      { label: "Reharmonize the turnaround", href: "/reharmonization" },
    ],
  },

  "blues-form": {
    title: "Jazz Blues",
    description: "The 12-bar blues adapted for jazz — chord substitutions, quick changes, and the bebop vocabulary.",
    keyPoints: [
      "Basic jazz blues in Bb: Bb7 | Eb7 | Bb7 | Bb7 | Eb7 | Edim7 | Bb7 | G7 | Cm7 | F7 | Bb7-G7 | Cm7-F7",
      "The 'quick change' goes to IV in bar 2 (instead of staying on I)",
      "Bar 6 often uses a passing diminished (Edim7) leading to Bb7",
      "Bars 9-10 use ii-V-I back to the top",
      "The last 2 bars (turnaround) connect back to bar 1",
    ],
    sections: [
      {
        heading: "Basic Jazz Blues Form",
        body: `The jazz blues evolved from the simple 3-chord country blues by adding ii-V substitutions and a more chromatic harmonic vocabulary.

Standard jazz blues in Bb (Charlie Parker style):
  Bar 1:  Bb7
  Bar 2:  Eb7  (quick change to IV)
  Bar 3:  Bb7
  Bar 4:  Bb7  (or Edim7 / F7 / Fm7-Bb7)
  Bar 5:  Eb7
  Bar 6:  Edim7  (passing diminished)
  Bar 7:  Bb7
  Bar 8:  G7   (V/ii, setting up the ii in bar 9)
  Bar 9:  Cm7
  Bar 10: F7
  Bar 11: Bb7-G7  (turnaround begins)
  Bar 12: Cm7-F7  (turnaround ends, back to bar 1)`,
      },
      {
        heading: "Bird Changes",
        body: `Charlie Parker's "Blues for Alice" introduced a heavily substituted blues form (now called "Bird Changes" or "Parker Changes"):

  | Fmaj7   | Em7b5-A7 | Dm7-G7 | Cm7-F7 |
  | Bb7     | Bbm7-Eb7 | Am7-D7 | Abm7-Db7 |
  | Gm7     | C7       | F-D7   | Gm7-C7 |

This is all ii-V chains leading back to F. The original 3-chord blues structure is barely visible — replaced by a web of ii-V relationships that move through multiple key centers chromatically.`,
      },
    ],
    relatedTools: [
      { label: "Build a jazz blues in Progression Builder", href: "/progressions" },
    ],
  },

  "caged-system": {
    title: "CAGED System",
    description: "Navigate the entire fretboard by connecting 5 chord shapes across all positions.",
    keyPoints: [
      "CAGED stands for the 5 open chord shapes: C, A, G, E, D",
      "Each shape can be moved up the neck (with barre or partial barre) to any key",
      "The 5 shapes connect: C-A-G-E-D-C... forming a complete neck map",
      "Every major scale position, arpeggio, and chord voicing maps to one of these 5 shapes",
      "The system works for all chord qualities — just alter the appropriate tones",
    ],
    sections: [
      {
        heading: "The Five Shapes",
        body: `Every chord on the guitar can be seen as one of five basic shapes, named after the open chord they resemble:
  • C shape: root on string 2 (or 5)
  • A shape: root on string 5
  • G shape: root on string 6 (or 1)
  • E shape: root on string 6
  • D shape: root on string 4 (or 1)

These 5 shapes, placed consecutively up the neck, cover all 12 frets. Each shape overlaps with the next at the root note.`,
      },
      {
        heading: "Extending to Scales",
        body: `Each CAGED shape defines a "box position" for the major scale. The 5 scale positions correspond to the 5 chord shapes — when you know where the chord tones are within each shape, the remaining scale notes are adjacent.

For the G major scale starting at the nut:
  • E shape (open position): frets 0-3
  • D shape: frets 2-5
  • C shape: frets 5-8
  • A shape: frets 7-10
  • G shape: frets 9-12

The Fretboard Explorer shows all 5 positions simultaneously for any scale.`,
      },
      {
        heading: "Practical Application",
        body: `The CAGED system is most useful when you:
  1. Know a chord's root position, then find adjacent shapes to comp in different registers
  2. Want to find the nearest chord voicing after a position shift
  3. Are mapping out arpeggios — the chord tones within each shape define the arpeggio
  4. Transitioning between scale positions — each shape overlaps at the root

The weakness of CAGED: it's position-based thinking. Advanced players often think in terms of chord tones and intervals rather than boxes, which allows free movement across positions.`,
      },
    ],
    relatedTools: [
      { label: "Visualize CAGED positions on Fretboard Explorer", href: "/fretboard" },
      { label: "See scale positions in Scale Explorer", href: "/scales" },
    ],
  },
};

export default async function TheoryLessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = LESSONS[slug];
  if (!lesson) notFound();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <Link href="/theory" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm mb-4">
          <span>← Theory Lessons</span>
        </Link>
        <h1 className="text-3xl font-bold">{lesson.title}</h1>
        <p className="text-muted-foreground mt-2">{lesson.description}</p>
      </div>

      {/* Key Points */}
      <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
        <div className="text-xs font-semibold text-primary mb-3">KEY POINTS</div>
        <ul className="space-y-1.5">
          {lesson.keyPoints.map((point, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Lesson Sections */}
      {lesson.sections.map((section, i) => (
        <div key={i} className="space-y-3">
          <h2 className="text-xl font-semibold border-b border-border pb-2">{section.heading}</h2>
          <div className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">
            {section.body}
          </div>
        </div>
      ))}

      {/* Related Tools */}
      {lesson.relatedTools.length > 0 && (
        <div className="p-4 rounded-lg border border-border bg-card">
          <div className="text-xs font-semibold text-muted-foreground mb-3">PRACTICE WITH THESE TOOLS</div>
          <div className="flex flex-wrap gap-2">
            {lesson.relatedTools.map((tool) => (
              <Link key={tool.href} href={tool.href}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded border border-border bg-secondary hover:border-primary/50 hover:bg-primary/10 transition-colors text-sm">
                <ExternalLink className="w-3 h-3" />
                {tool.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
