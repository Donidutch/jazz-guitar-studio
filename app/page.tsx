import Link from "next/link";
import { Music, Guitar, Layers, Ear, Activity, Repeat, Waves, BookOpen, SlidersHorizontal, Dices } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const FEATURES = [
  {
    href: "/chords",
    icon: Music,
    title: "Chord Explorer",
    description: "All voicings & inversions for every jazz chord type. Drop 2, drop 3, shell voicings, guide tones.",
    color: "text-amber-400",
  },
  {
    href: "/scales",
    icon: Guitar,
    title: "Scales & Modes",
    description: "Every jazz mode, bebop scale, pentatonic, altered, diminished — all neck positions visualized.",
    color: "text-green-400",
  },
  {
    href: "/progressions",
    icon: Layers,
    title: "Progression Builder",
    description: "Build and play jazz progressions with auto voice leading, Roman numeral analysis, and loop playback.",
    color: "text-blue-400",
  },
  {
    href: "/ear-training",
    icon: Ear,
    title: "Ear Training",
    description: "Interval recognition, chord quality ID, melodic dictation. Adaptive difficulty with session stats.",
    color: "text-purple-400",
  },
  {
    href: "/voice-leading",
    icon: Activity,
    title: "Voice Leading",
    description: "Visualize smooth voice movement between chords. Detect parallel fifths and octaves.",
    color: "text-pink-400",
  },
  {
    href: "/reharmonization",
    icon: Repeat,
    title: "Reharmonization",
    description: "Tritone subs, secondary dominants, modal interchange, back-cycling — instant substitution suggestions.",
    color: "text-orange-400",
  },
  {
    href: "/fretboard",
    icon: SlidersHorizontal,
    title: "Fretboard Explorer",
    description: "Click any note to hear it. Find all occurrences of any note, scale degree, or chord tone.",
    color: "text-cyan-400",
  },
  {
    href: "/rhythm",
    icon: Waves,
    title: "Rhythm & Metronome",
    description: "Metronome with subdivisions, polyrhythm, and drop-out mode for internalization practice.",
    color: "text-yellow-400",
  },
  {
    href: "/chord-melody",
    icon: Dices,
    title: "Chord Melody",
    description: "Arrange melody over chord shapes. See notation and tabs side by side.",
    color: "text-red-400",
  },
  {
    href: "/theory",
    icon: BookOpen,
    title: "Theory Lessons",
    description: "Interactive lessons on ii-V-I, drop 2 voicings, tritone subs, chord scales, and more.",
    color: "text-indigo-400",
  },
];

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Jazz Guitar Studio</h1>
        <p className="text-muted-foreground mt-2">
          A complete system for jazz guitar theory, voicings, ear training, and practice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(({ href, icon: Icon, title, description, color }) => (
          <Link key={href} href={href}>
            <Card className="h-full hover:bg-secondary/50 transition-colors cursor-pointer group border-border">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${color}`} />
                  <CardTitle className="text-base group-hover:text-primary transition-colors">
                    {title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">
                  {description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-lg border border-primary/20 bg-primary/5">
        <p className="text-sm text-muted-foreground">
          <span className="text-primary font-medium">Tip:</span> Click anywhere to activate audio.
          Use the key selector and BPM control in the top bar to set global context for all tools.
        </p>
      </div>
    </div>
  );
}
