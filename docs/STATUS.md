---
project: jazz-guitar-studio
state: active
next:
  - Spell notes correctly per chord and key (Cm7 as C Eb G Bb, not C D# G A#)
  - Fix the 8 lint errors, then add lint to CI
  - Deploy a live demo on Vercel and link it from the README
---

# Status

Revived on 2026-10-25 from the March 2026 prototype `guitarapp` (archive
drive, 4 commits). The original GitHub repository no longer exists.

**Works:** `npm run build` succeeds on Next.js 16.2 with 0 TypeScript errors
and 16 routes, 15 of them prerendered static pages. Every internal link
resolves (14 checked against a production build). The theory engine has 90
Vitest tests (91% of lines in `lib/theory` and `lib/ear-training`), run in CI.

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

- Note spelling follows the key's sharp/flat preference, not the chord, so
  Cm7 shows as C D# G A# and the tritone sub of G7 as C#7 (a `todo` test).
- Voicings are only generated on adjacent strings with none muted, so
  string-skipping shapes such as drop 3 never appear.
- Lint: 8 errors (3 `no-explicit-any` in `store/progressionStore.ts`, others)
  and 50 warnings, mostly unused variables. CI runs type check, tests and
  build, and adds lint once these are fixed.
- `npm audit --omit=dev`: 26 findings (2 critical, 17 high). Most come from
  `next` (needs a patch upgrade) and from the `shadcn` CLI being a runtime
  dependency instead of a dev dependency.
- Unused dependencies: `tonal`, `tone`, `vexflow`, `jspdf`, `midi-writer-js`,
  `immer` and `next-themes` are never imported. Audio uses the Web Audio API
  directly and the stores use plain Zustand.
- `CLAUDE.md` lists component folders and libraries the code does not have;
  it needs rewriting to match the code.
- No live demo.
