# Jazz Guitar Studio

A browser app for learning jazz guitar: chord voicings, scales and modes on
the fretboard, progressions, voice leading, reharmonisation, ear training and
a metronome. Everything runs in the browser; there is no backend.

**Status:** prototype being finished. See [docs/STATUS.md](docs/STATUS.md).

## Features

| Page | What it does |
| --- | --- |
| Chord Explorer (`/chords`) | Voicings for jazz chord types, including drop 2, drop 3 and shell voicings |
| Scales & Modes (`/scales`) | Modes, bebop, pentatonic, altered and diminished scales across the neck |
| Progression Builder (`/progressions`) | Builds progressions with Roman numeral analysis; saved in the browser |
| Voice Leading (`/voice-leading`) | Compares two voicings and flags parallel fifths and octaves |
| Reharmonisation (`/reharmonization`) | Tritone substitutes, secondary dominants, modal interchange, passing diminished, back-cycling |
| Ear Training (`/ear-training`) | Interval, chord-quality and melodic exercises |
| Fretboard (`/fretboard`) | Interactive fretboard explorer |
| Rhythm (`/rhythm`) | Metronome with subdivisions and polyrhythms |
| Chord Melody (`/chord-melody`) | Chord-melody arranging |
| Theory (`/theory`) | Ten lessons, from the ii–V–I and drop 2 voicings to the CAGED system |

The music theory engine lives in `lib/theory/` as plain TypeScript: notes,
intervals, chords, scales, guitar fretboard maths, voicings, voice leading,
progressions and reharmonisation.

## Stack

Next.js 16 (App Router), React 19, TypeScript in strict mode, Tailwind CSS 4,
shadcn/ui components on Base UI, Zustand (with Immer) for state, and Tone.js
for sound, loaded on first use.

## Run it

Requires Node.js 22 or newer.

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>. Sound starts after your first click, as
browsers require.

```bash
npm test              # theory engine tests (Vitest)
npm run test:coverage # with a coverage report
npm run build         # production build
npm run lint          # ESLint
```

## License

[MIT](LICENSE)
