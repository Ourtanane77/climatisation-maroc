import { chromium } from "@playwright/test";
import pairs from "./phase-6.mjs";
const b = await chromium.launch();
for (const w of [1440, 390]) {
  const c = await b.newContext({ viewport: { width: w, height: 900 } });
  for (const [name, d] of pairs) {
    const p = await c.newPage();
    await p.goto(`http://localhost:5500/${encodeURI(d)}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `test-results/visual/phase-6/${name}-${w}-design.png`, fullPage: true });
    await p.close();
  }
  await c.close();
}
await b.close();
