import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import ChartSection from "@/components/ChartSection";
import FoilSection from "@/components/FoilSection";
import Suite from "@/components/Suite";
import Method from "@/components/Method";
import ResearchBand from "@/components/ResearchBand";
import Footer from "@/components/Footer";
import StickyMixer from "@/components/StickyMixer";
import { WeightsProvider } from "@/lib/weights";
import { ModelSelectionProvider } from "@/lib/model-selection";
import {
  absoluteUrl,
  SITE_BENCHMARKED_MODEL_CONFIGS,
  SITE_BENCHMARKED_MODELS,
  SITE_DATA_LICENSE_URL,
  SITE_DATA_DOWNLOADS,
  SITE_DESCRIPTION,
  SITE_KEYWORDS,
  SITE_LAST_MODIFIED,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      publisher: { "@id": `${SITE_URL}/#organization` },
      about: { "@id": `${SITE_URL}/#dataset` },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      sameAs: ["https://github.com/lydakis/ShallowSWE", "https://github.com/lydakis/ShallowSWE-www"],
    },
    {
      "@type": "Dataset",
      "@id": `${SITE_URL}/#dataset`,
      name: "ShallowSWE bounded repair-loop preview",
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
      creator: {
        "@type": "Person",
        name: "George Lydakis",
        url: "https://github.com/lydakis",
      },
      license: {
        "@type": "CreativeWork",
        name: "ShallowSWE data license (CC BY 4.0)",
        url: SITE_DATA_LICENSE_URL,
      },
      isBasedOn: "https://github.com/lydakis/ShallowSWE",
      dateModified: SITE_LAST_MODIFIED,
      keywords: SITE_KEYWORDS,
      measurementTechnique: "Bounded repair-loop runs with hidden programmatic tests",
      about: [
        { "@type": "Thing", name: "AI coding benchmark" },
        { "@type": "Thing", name: "software engineering benchmark" },
        { "@type": "Thing", name: "cost per verified success" },
        ...SITE_BENCHMARKED_MODELS.map((model) => ({
          "@type": "Thing",
          name: model,
        })),
      ],
      mentions: SITE_BENCHMARKED_MODEL_CONFIGS.map((modelConfig) => ({
        "@type": "Thing",
        name: modelConfig,
      })),
      variableMeasured: [
        "Cost per successful completion",
        "Cost per verified success",
        "Solve rate",
        "Tokens per success",
        "Verifier submissions",
      ],
      distribution: SITE_DATA_DOWNLOADS.map((download) => ({
        "@type": "DataDownload",
        name: download.name,
        description: download.description,
        encodingFormat: "application/json",
        contentUrl: absoluteUrl(download.path),
      })),
    },
  ],
};

function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(jsonLd),
        }}
      />
      <WeightsProvider>
        <ModelSelectionProvider>
          <Nav />
          <StickyMixer />
          <main>
            <Hero />
            <ChartSection />
            <FoilSection />
            <Suite />
            <Method />
            <ResearchBand />
          </main>
          <Footer />
        </ModelSelectionProvider>
      </WeightsProvider>
    </>
  );
}
