# ShallowSWE — site

Results site for [ShallowSWE](../ShallowSWE), a benchmark for the easy parts of software work.
The score is **cost per successful completion (CPSC)**, not accuracy.

Next.js App Router · React 19 · Tailwind v4 · hand-built SVG charts. Fully static.

## Develop

```sh
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Data

All displayed ShallowSWE numbers come from the measured pilot artifacts in `public/data/`:

- `rollouts.json`
- `aggregate-by-model.json`
- `aggregate-by-task-model.json`
- `workload-index.json`
- `deepswe-comparison.json`
- `run-manifest.json`
- `prices-openrouter-2026-07-03.json`

`app/data/model.ts` imports those JSON files and derives the leaderboard, task chart, and DeepSWE comparison from them. Do not add hand-entered benchmark numbers to components.

To refresh the site, regenerate the artifacts in `../ShallowSWE/results/<snapshot>/`, copy them into `public/data/`, then run `npm run build`.

## Charts

- `components/HeroDepth.tsx` — equal-category pilot CPSC depth gauge.
- `components/crossover/*` — measured task map with cost/tokens toggle.
- `components/CostQuadrantChart.tsx` — DeepSWE hard-work CPSC vs measured ShallowSWE pilot CPSC.
- `components/RankTranslation.tsx` — DeepSWE dollar rank to ShallowSWE dollar rank.
- `components/EffortCurveChart.tsx` — DeepSWE effort curves with measured ShallowSWE efforts ringed.

## Not affiliated

ShallowSWE is independent and not affiliated with DeepSWE, Datacurve, Harbor, or Pier.
