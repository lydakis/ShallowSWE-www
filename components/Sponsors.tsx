import { SITE_SPONSORS } from "@/lib/site";

/* Until a sponsor's official mark arrives, its name is set in the site's own
   display face — never a recreated logo. */
export default function Sponsors() {
  if (SITE_SPONSORS.length === 0) return null;

  return (
    <section id="sponsors" aria-label="Sponsors" className="border-b border-line bg-plane-2">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[1fr_21rem] lg:gap-12">
        <div>
          <div className="mb-5 flex items-center gap-2.5">
            <span className="h-px w-6 bg-waterline" />
            <span className="eyebrow">Supported by</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-10 gap-y-6">
            {SITE_SPONSORS.map((sponsor) => (
              <a key={sponsor.name} href={sponsor.href} className="group flex items-baseline gap-3">
                {sponsor.logoSrc ? (
                  // eslint-disable-next-line @next/next/no-img-element -- static export, plain asset
                  <img src={sponsor.logoSrc} alt={sponsor.logoAlt ?? sponsor.name} className="h-8 w-auto" />
                ) : (
                  <>
                    <span className="font-display text-[1.6rem] leading-none text-ink">{sponsor.name}</span>
                    <span className="font-mono text-[0.62rem] uppercase text-muted">official mark pending</span>
                  </>
                )}
              </a>
            ))}
          </div>
        </div>
        <p className="text-xs leading-relaxed text-muted">
          Sponsorship funds compute for evaluation runs. Sponsors have no role in task selection, scoring, or rankings —
          every displayed number traces to the public data manifest.
        </p>
      </div>
    </section>
  );
}
