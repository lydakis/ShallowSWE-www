import type { Metadata, Viewport } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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

const THEME_KEY = "sswe-theme";
const LIGHT_THEME_COLOR = "#eff1f2";
const DARK_THEME_COLOR = "#080d10";

type ThemeSetting = "system" | "light" | "dark";

function normalizeThemeSetting(value: string | undefined): ThemeSetting {
  return value === "light" || value === "dark" ? value : "system";
}

function viewportForTheme(setting: ThemeSetting): Viewport {
  if (setting === "light" || setting === "dark") {
    return {
      colorScheme: setting,
      themeColor: setting === "dark" ? DARK_THEME_COLOR : LIGHT_THEME_COLOR,
    };
  }

  return {
    colorScheme: "light dark",
    themeColor: [
      { media: "(prefers-color-scheme: light)", color: LIGHT_THEME_COLOR },
      { media: "(prefers-color-scheme: dark)", color: DARK_THEME_COLOR },
    ],
  };
}

export async function generateViewport(): Promise<Viewport> {
  const cookieStore = await cookies();
  return viewportForTheme(normalizeThemeSetting(cookieStore.get(THEME_KEY)?.value));
}

const themeScript = `(() => {
  const key = "sswe-theme";
  const light = "#eff1f2";
  const dark = "#080d10";
  const readCookie = () => {
    const match = document.cookie.match(/(?:^|; )sswe-theme=(light|dark)(?:;|$)/);
    return match ? match[1] : "system";
  };
  const writeCookie = (setting) => {
    if (setting === "light" || setting === "dark") {
      document.cookie = key + "=" + setting + "; Max-Age=31536000; Path=/; SameSite=Lax";
    } else {
      document.cookie = key + "=; Max-Age=0; Path=/; SameSite=Lax";
    }
  };
  const read = () => {
    try {
      const value = localStorage.getItem(key);
      return value === "light" || value === "dark" ? value : readCookie();
    } catch {
      return readCookie();
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
    if (document.body) document.body.style.backgroundColor = color;
    const metas = Array.from(document.querySelectorAll('meta[name="theme-color"]'));
    if (!metas.length) {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.setAttribute("data-sswe-theme-color", "");
      document.head.appendChild(meta);
      metas.push(meta);
    }
    metas.forEach((meta) => {
      meta.setAttribute("content", color);
      meta.removeAttribute("media");
    });
  };
  const apply = (setting = read()) => {
    const root = document.documentElement;
    if (setting === "light" || setting === "dark") {
      root.setAttribute("data-theme", setting);
    } else {
      root.removeAttribute("data-theme");
    }
    root.setAttribute("data-theme-setting", setting);
    writeCookie(setting);
    setThemeColor(resolved(setting));
  };
  apply();
  window.__ssweApplyTheme = apply;
})();`;

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const initialTheme = normalizeThemeSetting(cookieStore.get(THEME_KEY)?.value);
  const explicitTheme = initialTheme === "system" ? undefined : initialTheme;

  return (
    <Suspense>
      <html
        lang="en"
        data-theme={explicitTheme}
        data-theme-setting={initialTheme}
        suppressHydrationWarning
        className={`${plexSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <head>
          <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        </head>
        <body className="min-h-full flex flex-col">
          {children}
          <Analytics />
        </body>
      </html>
    </Suspense>
  );
}
