"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Guitar, Music, BookOpen, Layers, Ear, Waves,
  Activity, SlidersHorizontal, LayoutGrid, Repeat,
  FileText, Dices
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", icon: LayoutGrid, label: "Dashboard" },
  { href: "/chords", icon: Music, label: "Chord Explorer" },
  { href: "/scales", icon: Guitar, label: "Scales & Modes" },
  { href: "/progressions", icon: Layers, label: "Progressions" },
  { href: "/ear-training", icon: Ear, label: "Ear Training" },
  { href: "/voice-leading", icon: Activity, label: "Voice Leading" },
  { href: "/reharmonization", icon: Repeat, label: "Reharmonization" },
  { href: "/fretboard", icon: SlidersHorizontal, label: "Fretboard Explorer" },
  { href: "/rhythm", icon: Waves, label: "Rhythm & Metronome" },
  { href: "/chord-melody", icon: Dices, label: "Chord Melody" },
  { href: "/theory", icon: BookOpen, label: "Theory Lessons" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-border bg-sidebar overflow-y-auto">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-border">
        <h1 className="text-lg font-bold text-primary tracking-tight">
          🎸 Jazz Studio
        </h1>
        <p className="text-xs text-muted-foreground mt-0.5">Guitar Learning System</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                active
                  ? "bg-sidebar-accent text-primary border-l-2 border-primary"
                  : "text-sidebar-foreground/70 border-l-2 border-transparent"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border">
        <p className="text-xs text-muted-foreground">Jazz Guitar Studio v1.0</p>
      </div>
    </aside>
  );
}
