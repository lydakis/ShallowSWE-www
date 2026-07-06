import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Bricolage_Grotesque } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ShallowSWE",
  description:
    "The score isn't accuracy. It's cost. ShallowSWE measures cost per successful completion for routine software work.",
  metadataBase: new URL("https://shallowswe.com"),
  openGraph: {
    title: "ShallowSWE: a cost benchmark for routine work",
    description: "Cost per successful completion for routine software work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eff1f2" },
    { media: "(prefers-color-scheme: dark)", color: "#080d10" },
  ],
};

const themeScript = `(() => {
  const key = "sswe-theme";
  const light = "#eff1f2";
  const dark = "#080d10";
  const read = () => {
    try {
      const value = localStorage.getItem(key);
      return value === "light" || value === "dark" ? value : "system";
    } catch {
      return "system";
    }
  };
  const resolved = (setting) =>
    setting === "light" || setting === "dark"
      ? setting
      : window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
  const setThemeColor = (theme) => {
    const color = theme === "dark" ? dark : light;
    document.documentElement.style.backgroundColor = color;
    document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
      meta.setAttribute("content", color);
      meta.removeAttribute("media");
    });
    let meta = document.querySelector('meta[name="theme-color"][data-sswe-theme-color]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.setAttribute("data-sswe-theme-color", "");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", color);
  };
  const apply = (setting = read()) => {
    const root = document.documentElement;
    if (setting === "light" || setting === "dark") {
      root.setAttribute("data-theme", setting);
    } else {
      root.removeAttribute("data-theme");
    }
    root.setAttribute("data-theme-setting", setting);
    setThemeColor(resolved(setting));
  };
  apply();
  window.__ssweApplyTheme = apply;
})();`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
