# ShallowSWE — site

Results site for [ShallowSWE](../ShallowSWE), a cost benchmark for routine software work.
The score is **cost per successful completion (CPSC)** from bounded repair loops.

Next.js App Router · React 19 · Tailwind v4 · hand-built SVG charts. Fully static.

## Develop

```sh
npm install
npm run dev      # http://localhost:3000
npm run build
```

## Data

All displayed ShallowSWE numbers come from the bounded repair-loop artifacts in `public/data/`:

- `rollouts.json` (raw repair-loop rows)
- `aggregate-by-model.json`
- `aggregate-by-task-model.json`
- `run-manifest.json`
- `prices-openrouter-2026-07-09.json`

`app/data/model.ts` imports those JSON files and derives the leaderboard and task diagnostics from them. Do not add hand-entered benchmark numbers to components.

To refresh the site, regenerate the artifacts in `../ShallowSWE/results/<snapshot>/`, copy them into `public/data/`, then run `npm run build`.

## Charts

- `components/HeroDepth.tsx` — basket-weighted repair-loop CPSC depth gauge.
- `components/Leaderboard.tsx` — category and size workload mixer plus result table.
- `components/crossover/*` — repair-loop task diagnostics with cost/tokens toggle.
- `components/CostQuadrantChart.tsx` — DeepSWE pass@1 vs measured ShallowSWE repair-loop CPSC.
- `components/RankTranslation.tsx` — DeepSWE pass@1 rank to ShallowSWE CPSC rank.
- `components/EffortCurveChart.tsx` — repair-loop cost against agent steps.

## Not affiliated

ShallowSWE is independent and not affiliated with DeepSWE, Datacurve, Harbor, or Pier.
