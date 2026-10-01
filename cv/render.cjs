// Prints cv/cv.html to assets/Myat-Thu-CV.pdf with Playwright's Chromium.
// Usage: node cv/render.cjs   (Playwright must be resolvable, e.g. NODE_PATH=$(npm root -g))
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  // file:// pages may not load sibling fonts without this flag.
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM, args: ["--allow-file-access-from-files"] });
  const page = await browser.newPage();
  await page.goto("file://" + path.join(__dirname, "cv.html"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({ path: path.join(__dirname, "..", "assets", "Myat-Thu-CV.pdf"), format: "A4", printBackground: true, preferCSSPageSize: true, tagged: true });
  await browser.close();
})();
