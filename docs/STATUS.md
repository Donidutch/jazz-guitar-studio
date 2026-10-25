---
project: jazz-guitar-studio
state: active
next:
  - Deploy a live demo on Vercel and link it from the README
  - Rewrite CLAUDE.md to match the code
  - Clear the 50 lint warnings, mostly unused variables
---

# Status

Revived on 2026-10-25 from the March 2026 prototype `guitarapp` (archive
drive, 4 commits). The original GitHub repository no longer exists.

**Works:** `npm run build` succeeds on Next.js 16.4.3 with 0 TypeScript errors
and 16 routes, 15 of them prerendered static pages. Every internal link
resolves (14 checked against a production build). The theory engine has 109
Vitest tests (92% of lines in `lib/theory` and `lib/ear-training`), run in CI.
Notes are spelled by letter for each chord and scale (Cm7 is C Eb G Bb, the
tritone sub of G7 is Db7, Gb major has Cb), including double sharps and flats;
fretboard and voicing labels use that spelling, so the Scales page now marks
the root in flat keys. `npm audit` reports 0 vulnerabilities (27 at revival):
Next.js moved from 16.2.0 to 16.4.3, the first release past its critical
remote-code-execution advisories, and unused packages were removed. CI runs
lint (0 errors), type check, tests and build.

Fixed on 2026-10-25, each shown by a test that failed first: unknown note
names silently became B; `isChordTone` missed enharmonic spellings; the major
bebop scale added b7 instead of #5; real drop-2 voicings were labelled
"open"; reharmonisation voice-leading scores were 0 for most pairs;
descending interval exercises played one note twice; adaptive interval
practice favoured the intervals you get right; IVmaj7 was labelled modal
interchange; the rhythm-changes bridge used VII7 instead of VI7; the 12-bar
blues was 10 bars.

**In progress:** nothing.

**Broken / open:**

- Voicings are only generated on adjacent strings with none muted, so
  string-skipping shapes such as drop 3 never appear.
- Lint: 50 warnings, mostly unused variables and imports.
- The Progressions page's tempo field sets the global playback tempo; each
  progression's own `bpm` and `swing` are stored but nothing in the UI sets
  them.
- `CLAUDE.md` still names libraries the code does not use (Tonal, VexFlow,
  jsPDF, MIDI Writer) and component folders that do not exist; it needs
  rewriting to match the code.
- No live demo.
