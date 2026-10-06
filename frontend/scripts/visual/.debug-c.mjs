import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage();
p.on("console", (m) => m.type() === "error" && console.log("console:", m.text().slice(0, 300)));
p.on("pageerror", (e) => console.log("pageerror:", e.message.slice(0, 300)));
await p.goto("http://localhost:8080" + (process.argv[2] ?? "/demander-un-devis"), { waitUntil: "networkidle" });
await p.waitForTimeout(2000);
console.log("hydrated?", await p.evaluate(() => !!document.querySelector("form") && Object.keys(document.querySelector("form")).some((k) => k.startsWith("__react"))));
await b.close();
