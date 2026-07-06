import { chromium } from "playwright";
const b = await chromium.launch();
for (const theme of ["light","dark"]) {
  const ctx = await b.newContext({ colorScheme: theme, viewport:{width:1280,height:900} });
  const p = await ctx.newPage();
  const msgs = [];
  p.on("console", m => { if(["error","warning"].includes(m.type())) msgs.push(`[${theme}:${m.type()}] ${m.text()}`); });
  p.on("pageerror", e => msgs.push(`[${theme}:pageerror] ${e.message}`));
  await p.goto("http://localhost:4123",{waitUntil:"networkidle"});
  await p.waitForTimeout(800);
  console.log(msgs.length ? msgs.join("\n") : `[${theme}] no console errors/warnings`);
  await ctx.close();
}
await b.close();
