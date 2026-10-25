---
project: jazz-guitar-studio
state: active
next:
  - Fix the 8 lint errors, then add lint to CI
  - Remove unused dependencies, move shadcn to devDependencies, patch next
  - Deploy a live demo on Vercel and link it from the README
---

# Status

Revived on 2026-10-25 from the March 2026 prototype `guitarapp` (archive
drive, 4 commits). The original GitHub repository no longer exists.

**Works:** `npm run build` succeeds on Next.js 16.2 with 0 TypeScript errors
and 16 routes, 15 of them prerendered static pages. Every internal link
resolves (14 checked against a production build). The theory engine has 109
Vitest tests (92% of lines in `lib/theory` and `lib/ear-training`), run in CI.
Notes are spelled by letter for each chord and scale (Cm7 is C Eb G Bb, the
tritone sub of G7 is Db7, Gb major has Cb), including double sharps and flats;
fretboard and voicing labels use that spelling, so the Scales page now marks
the root in flat keys.

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
