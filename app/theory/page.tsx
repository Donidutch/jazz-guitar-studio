import Link from "next/link";
import { BookOpen } from "lucide-react";

const LESSONS = [
  { slug: "ii-v-i", title: "The ii-V-I Progression", description: "The cornerstone of jazz harmony. Learn how to play and improvise over the most common jazz progression." },
  { slug: "drop2-voicings", title: "Drop 2 Voicings", description: "How to derive and play drop 2 chord voicings on all string sets. The essential jazz chord technique." },
  { slug: "tritone-substitution", title: "Tritone Substitution", description: "Why bII7 replaces V7, common tones explained, and how to use tritone subs in your playing." },
  { slug: "guide-tones", title: "Guide Tones", description: "The 3rd and 7th of a chord define its quality. Learn to voice lead using guide tones alone." },
  { slug: "chord-scales", title: "Chord-Scale Theory", description: "How to choose the right scale for each chord in a progression. Dorian, Mixolydian, Altered, and more." },
  { slug: "voice-leading-principles", title: "Voice Leading Principles", description: "Smooth voice leading rules: minimal movement, contrary motion, and avoiding parallel fifths." },
  { slug: "modal-interchange", title: "Modal Interchange", description: "Borrowing chords from parallel modes — the IV minor, bVII, and other borrowed sounds in jazz." },
  { slug: "rhythm-changes", title: "Rhythm Changes", description: "The Gershwin-derived form used in hundreds of jazz standards. A, B sections and chord substitutions." },
  { slug: "blues-form", title: "Jazz Blues", description: "The 12-bar blues in jazz: chord substitutions, quick changes, and bebop-style chord progressions." },
  { slug: "caged-system", title: "CAGED System", description: "Navigate the fretboard using 5 chord shapes. How CAGED extends to scales and arpeggios." },
];

export default function TheoryPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Theory Lessons</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Interactive jazz guitar theory lessons with embedded tools.
        </p>
      </div>

      <div className="grid gap-3">
        {LESSONS.map(({ slug, title, description }) => (
          <Link key={slug} href={`/theory/${slug}`}>
            <div className="p-4 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-primary flex-shrink-0" />
                <h2 className="font-semibold group-hover:text-primary transition-colors">{title}</h2>
              </div>
              <p className="text-sm text-muted-foreground mt-1 ml-7">{description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
