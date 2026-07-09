import type { Metadata, Viewport } from "next";
import { Geist_Mono, IBM_Plex_Sans } from "next/font/google";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SITE_DESCRIPTION, SITE_KEYWORDS, SITE_NAME, SITE_OG_TITLE, SITE_URL } from "@/lib/site";
import "./globals.css";

const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: SITE_NAME,
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: "/",
  },
  keywords: SITE_KEYWORDS,
  authors: [{ name: "George Lydakis", url: "https://github.com/lydakis" }],
  creator: "George Lydakis",
  publisher: SITE_NAME,
  category: "technology",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: SITE_OG_TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_OG_TITLE,
    description: SITE_DESCRIPTION,
    creator: "@lydakis",
  },
};

const THEME_KEY = "sswe-theme";
const LIGHT_THEME_COLOR = "#eff1f2";
const DARK_THEME_COLOR = "#080d10";
const BASE_VIEWPORT = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
} satisfies Viewport;

type ThemeSetting = "system" | "light" | "dark";

function normalizeThemeSetting(value: string | undefined): ThemeSetting {
  return value === "light" || value === "dark" ? value : "system";
}

function viewportForTheme(setting: ThemeSetting): Viewport {
  if (setting === "light") {
    return {
      ...BASE_VIEWPORT,
      colorScheme: setting,
    };
  }

  if (setting === "dark") {
    return {
      ...BASE_VIEWPORT,
      colorScheme: setting,
      themeColor: DARK_THEME_COLOR,
    };
  }

  return {
    ...BASE_VIEWPORT,
    colorScheme: "light dark",
    themeColor: [
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
  const light = "${LIGHT_THEME_COLOR}";
  const dark = "${DARK_THEME_COLOR}";
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
    if (theme === "light") {
      metas.forEach((meta) => meta.remove());
      return;
    }
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
