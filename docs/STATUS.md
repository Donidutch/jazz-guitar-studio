---
project: jazz-guitar-studio
state: active
next:
  - Add Vitest and unit tests for the theory engine in lib/theory/
  - Fix the 8 lint errors, then add lint to CI
  - Deploy a live demo on Vercel and link it from the README
---

# Status

Revived on 2026-10-25 from the March 2026 prototype `guitarapp` (archive
drive, 4 commits). The original GitHub repository no longer exists.

**Works:** `npm run build` succeeds on Next.js 16.2 with 0 TypeScript errors
and 16 routes, 15 of them prerendered static pages. Every internal link
resolves (14 checked against a production build).

**In progress:** nothing yet.

**Broken / open:**

- No tests.
- Lint: 8 errors (3 `no-explicit-any` in `store/progressionStore.ts`, others)
  and 50 warnings, mostly unused variables. CI runs type check and build only
  until these are fixed.
- `npm audit --omit=dev`: 26 findings (2 critical, 17 high). Most come from
  `next` (needs a patch upgrade) and from the `shadcn` CLI being a runtime
  dependency instead of a dev dependency.
- Unused dependencies: `tonal`, `tone`, `vexflow`, `jspdf`, `midi-writer-js`,
  `immer` and `next-themes` are never imported. Audio uses the Web Audio API
  directly and the stores use plain Zustand.
- `CLAUDE.md` lists component folders and libraries the code does not have;
  it needs rewriting to match the code.
- No live demo.
