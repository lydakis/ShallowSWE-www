import { chromium } from "playwright";

const OUT = "/private/tmp/claude-501/-Users-lydakis-Developer-ShallowSWE-www/03dd6f44-a346-49c4-8c9a-e1a1d21c0bcd/scratchpad";
const URL = "http://localhost:4123";

const shots = [
  { name: "light-desktop", theme: "light", w: 1280, h: 900, full: true },
  { name: "dark-desktop", theme: "dark", w: 1280, h: 900, full: true },
  { name: "mobile", theme: "light", w: 390, h: 844, full: true },
];

const browser = await chromium.launch();
for (const s of shots) {
  const ctx = await browser.newContext({
    viewport: { width: s.w, height: s.h },
    deviceScaleFactor: 2,
    colorScheme: s.theme === "dark" ? "dark" : "light",
  });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200); // settle animations
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: s.full });
  console.log("shot", s.name);
  await ctx.close();
}
await browser.close();
console.log("done");
