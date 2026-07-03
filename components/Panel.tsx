import { Section, SectionHeader } from "./Section";
import ModelDot from "./ModelDot";
import { PANEL_SIZE, models, prices, PRICE_SHEET_DATE, PRICE_GATEWAY } from "@/app/data/model";

const sizeLabel: Record<string, string> = { small: "Small", mid: "Mid", large: "Large" };

export default function Panel() {
  const rows = [...models].sort((a, b) => prices[a.priceKey].outputPer1M - prices[b.priceKey].outputPer1M);

  return (
    <Section id="panel" className="border-t border-line">
      <SectionHeader eyebrow="Model panel" title={`${PANEL_SIZE} measured model-effort rows`}>
        <p>
          The expanded publish pilot includes Fable at low effort plus low and medium rows for GPT-5.5, Claude Opus
          4.8, and Claude Sonnet 5. Gemini remains medium and Kimi remains default because those are the rows DeepSWE
          publishes.
        </p>
      </SectionHeader>

      <div className="scroll-x mt-8 rounded-xl border border-line">
        <table className="w-full border-collapse text-sm">
          <caption className="sr-only">Model panel and price sheet</caption>
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-3 py-2.5 font-medium text-ink-2">Model</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">Vendor</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">Class</th>
              <th className="px-3 py-2.5 font-medium text-ink-2">Effort</th>
              <th className="px-3 py-2.5 text-right font-medium text-ink-2">$/1M in</th>
              <th className="px-3 py-2.5 text-right font-medium text-ink-2">$/1M cached</th>
              <th className="px-3 py-2.5 text-right font-medium text-ink-2">$/1M out</th>
              <th className="px-3 py-2.5 text-right font-medium text-ink-2">On chart</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((m) => {
              const p = prices[m.priceKey];
              return (
                <tr key={m.id} className="border-b border-line last:border-0">
                  <th scope="row" className="px-3 py-2.5 text-left font-normal">
                    <ModelDot id={m.id} />
                    <span className="text-ink">{m.label}</span>
                    <span className="ml-2 font-mono text-[0.68rem] text-muted">{m.priceKey}</span>
                  </th>
                  <td className="px-3 py-2.5 text-ink-2">{m.vendor}</td>
                  <td className="px-3 py-2.5">
                    <span className="rounded border border-line px-1.5 py-0.5 font-mono text-[0.68rem] text-muted">
                      {sizeLabel[m.size]}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-mono text-[0.72rem] text-muted">{m.effort ?? "default"}</td>
                  <td className="px-3 py-2.5 text-right font-mono tnum text-ink-2">${p.inputPer1M.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tnum text-muted">${p.cachedInputPer1M.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right font-mono tnum text-ink">${p.outputPer1M.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right">
                    <span className="font-mono text-[0.7rem] text-ink-2">measured</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 font-mono text-[0.7rem] text-muted">
        price sheet · {PRICE_GATEWAY} · effective {PRICE_SHEET_DATE} · {Object.keys(prices).length} models priced ·
        effort levels become separate rows at snapshot
      </p>
    </Section>
  );
}
