import type { Metadata } from "next";
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
  title: "ShallowSWE — a cost benchmark for routine work",
  description:
    "The score isn't accuracy — it's cost. ShallowSWE measures cost per successful completion for routine software work.",
  metadataBase: new URL("https://shallowswe.com"),
  openGraph: {
    title: "ShallowSWE — a cost benchmark for routine work",
    description: "Cost per successful completion for routine software work.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

// Set the theme before paint to avoid a flash.
const themeScript = `(function(){try{var t=localStorage.getItem('sswe-theme');if(t==='light'||t==='dark'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

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
