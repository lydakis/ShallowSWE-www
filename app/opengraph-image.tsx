import { ImageResponse } from "next/og";

export const alt = "ShallowSWE - the score isn't accuracy. The score is cost.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const ink = "#ecf2f5";
const muted = "#8fa3ad";
const cyan = "#2cc0ec";
const bg = "#0b1216";
const line = "#1d2b33";

// Depth-gauge motif: measured CPSC, cheap floats / costly sinks.
const gauge = [
  { label: "GLM 5.2 high", v: "$0.025", y: 145 },
  { label: "Sonnet 5 low", v: "$0.031", y: 210 },
  { label: "Sonnet 5 med", v: "$0.040", y: 275 },
  { label: "Kimi default", v: "$0.050", y: 340 },
  { label: "Opus 4.8 low", v: "$0.081", y: 405 },
];

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: bg,
          color: ink,
          fontFamily: "sans-serif",
        }}
      >
        {/* left: thesis */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 0 0 80px",
            width: 660,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 34 }}>
            <svg width="40" height="40" viewBox="0 0 32 32">
              <rect width="32" height="32" rx="8" fill="#0f171c" stroke={line} strokeWidth="1" />
              <circle cx="16" cy="16.4" r="4.5" fill={ink} />
              <path
                d="M3.5 19.9c3.125 0 3.125 2.2 6.25 2.2s3.125-2.2 6.25-2.2 3.125 2.2 6.25 2.2 3.125-2.2 6.25-2.2"
                stroke={cyan}
                strokeWidth="2.4"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div style={{ fontSize: 30, fontWeight: 700 }}>ShallowSWE</div>
          </div>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.04, letterSpacing: -1.5 }}>
            The score isn&rsquo;t accuracy.
          </div>
          <div style={{ display: "flex", flexDirection: "column", marginTop: 6 }}>
            <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.04, letterSpacing: -1.5 }}>
              The score is cost.
            </div>
            <div style={{ display: "flex", width: 430, height: 3, background: cyan, marginTop: 10, borderRadius: 2 }} />
          </div>
          <div style={{ fontSize: 24, color: muted, marginTop: 30, lineHeight: 1.45 }}>
            Cost per successful completion for routine software work.
          </div>
        </div>

        {/* right: depth gauge */}
        <div style={{ display: "flex", flexDirection: "column", position: "relative", width: 460, padding: "70px 60px" }}>
          <div style={{ display: "flex", width: 340, height: 3, background: cyan, borderRadius: 2 }} />
          <div style={{ display: "flex", fontSize: 15, color: cyan, marginTop: 8, letterSpacing: 3 }}>
            SURFACE · CHEAPEST
          </div>
          <div
            style={{
              display: "flex",
              position: "absolute",
              left: 66,
              top: 110,
              width: 2,
              height: 400,
              background: line,
            }}
          />
          {gauge.map((g) => (
            <div
              key={g.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                position: "absolute",
                top: g.y,
                left: 60,
              }}
            >
              <div style={{ display: "flex", width: 16, height: 16, borderRadius: 999, background: cyan, opacity: 0.9 }} />
              <div style={{ display: "flex", fontSize: 23, fontWeight: 700 }}>{g.label}</div>
              <div style={{ display: "flex", fontSize: 20, color: muted }}>{g.v}</div>
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
