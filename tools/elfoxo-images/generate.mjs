// Генерирует демонстрационные иллюстрации для сайта elfoxo/ (WebP, два размера).
// Запуск из корня репозитория:  node tools/elfoxo-images/generate.mjs [--only=<имя>]
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import * as A from "./art.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const here = path.dirname(fileURLToPath(import.meta.url));
const site = path.resolve(here, "../../elfoxo");
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(site, "js/catalog.js"), "utf8"), ctx);
const cat = ctx.window.ELFOXO_CATALOG;
const hex = (k) => cat.colors[k].hex;
const only = (process.argv.find((a) => a.startsWith("--only=")) || "").slice(7);

const ART = { fox: A.foxBeanie, pompom: A.pompomHat, rib: A.ribBeanie, helmet: A.helmet, panama: A.panama, panama2: A.panama2,
  cap: A.cap, cap2: A.cap2, setSnood: A.setSnood, setMitt: A.setMitt, snood: A.snood, mittens: A.mittens };
const jobs = [];
const add = (name, w, h, svg, sizes) => jobs.push({ name, w, h, svg, sizes });

/* ---- товары: 800×1000, файлы 960 и 480 ---- */
for (const p of cat.products) {
  for (const k of p.colors) {
    const c = hex(k);
    const light = parseInt(c.slice(1, 3), 16) > 215;
    const back = light ? A.bg(800, 1000, "#ECE5DA", "#DED3C3") : A.bg(800, 1000, "#F4EFE8", "#E8E0D4");
    add(`products/${p.id}-${k}`, 800, 1000, A.doc(800, 1000, back, A.group(ART[p.art](c), 400, 512, 1.1)), [960, 480]);
  }
}

/* ---- категории ---- */
const catArt = {
  "cat-shapki": [A.group(A.pompomHat("#C46F3E", "#EEE5D6"), 400, 520, 1.02), "#EFE3D6", "#E2D2C0"],
  "cat-panamy": [A.group(A.panama("#D1B48D"), 400, 520, 1.05), "#E6E9DF", "#D5DACB"],
  "cat-kepki": [A.group(A.cap2("#36445B"), 410, 520, 1.02), "#E7EAEE", "#D6DCE3"],
  "cat-komplekty": [A.setSnood("#C89A3C"), "#F1E9DD", "#E5D8C5"],
  "cat-aksessuary": [A.join([A.group(A.snood("#9AA88F"), 420, 400, 0.72, -8), A.group(A.mittens("#EEE5D6"), 400, 720, 0.62, 4)]), "#EFE7E3", "#E1D4CE"]
};
for (const [n, [item, c1, c2]] of Object.entries(catArt)) add(`scenes/${n}`, 800, 1000, A.doc(800, 1000, A.bg(800, 1000, c1, c2), item), [960, 480]);

/* ---- главный экран 1600×1200 ---- */
const heroItem = () => A.join([
  A.leaf("#C89A3C", 170, 190, 1.1, -35), A.leaf("#C46F3E", 1440, 1040, 1.2, 140), A.leaf("#B5804A", 1490, 170, 0.9, 60),
  A.yarn("#EEE5D6", 330, 900, 1.05),
  A.group(A.snood("#EEE5D6"), 1110, 470, 0.9, 12),
  A.group(A.mittens("#C46F3E"), 1180, 900, 0.58, -14),
  A.group(A.foxBeanie("#C46F3E"), 690, 560, 0.95, -8),
  A.leaf("#9AA88F", 420, 330, 0.75, 20)
]);
add("scenes/hero", 1600, 1200, A.doc(1600, 1200, A.bg(1600, 1200, "#F1EBE2", "#E3D8C8", true), heroItem()), [1600, 960]);
add("scenes/og", 1200, 630, A.doc(1200, 630, A.bg(1600, 1200, "#F1EBE2", "#E3D8C8", true), heroItem(), "200 140 1240 651"), [1200]);

/* ---- новая коллекция 1200×1500 ---- */
add("scenes/collection", 1200, 1500, A.doc(1200, 1500, A.bg(1200, 1500, "#EFE4D6", "#DCC8B1", true), A.join([
  A.leaf("#C46F3E", 160, 180, 1.2, -20), A.leaf("#C89A3C", 1040, 160, 1, 50), A.leaf("#6E4C3B", 1080, 1360, 1.1, 160), A.leaf("#B5804A", 140, 1340, 0.9, 210),
  A.group(A.snood("#C89A3C"), 640, 1020, 0.95, -8),
  A.group(A.mittens("#6E4C3B"), 330, 1130, 0.5, 18),
  A.group(A.foxBeanie("#C46F3E"), 600, 540, 1.0, 6)
])), [1200, 600]);

/* ---- о бренде 1200×1500 ---- */
add("scenes/about", 1200, 1500, A.doc(1200, 1500, A.bg(1200, 1500, "#F2ECE3", "#E2D7C7", true), A.join([
  A.swatch("#9AA88F", 640, 980, 1.4, -6),
  A.needles(760, 760, 28),
  A.yarn("#C46F3E", 360, 470, 1.25), A.yarn("#EEE5D6", 760, 360, 1.05), A.yarn("#C89A3C", 300, 1180, 0.95),
  A.leaf("#C89A3C", 1020, 1300, 0.9, 120)
])), [1200, 600]);

/* ---- рендер ---- */
const browser = await chromium.launch();
const tmp = path.join(here, ".tmp");
fs.mkdirSync(tmp, { recursive: true });
let n = 0;
for (const j of jobs) {
  if (only && !j.name.includes(only)) continue;
  const context = await browser.newContext({ viewport: { width: j.w, height: j.h }, deviceScaleFactor: Math.max(1, j.sizes[0] / j.w) });
  const page = await context.newPage();
  await page.setContent(`<html><body style="margin:0;background:#fff">${j.svg}</body></html>`);
  const png = path.join(tmp, "x.png");
  await page.screenshot({ path: png, clip: { x: 0, y: 0, width: j.w, height: j.h }, scale: "device" });
  for (const s of j.sizes) {
    const out = path.join(site, "images", `${j.name}-${s}.webp`);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    execFileSync("convert", [png, "-resize", `${s}x`, "-quality", s > 900 ? "74" : "78", "-define", "webp:method=6", out]);
  }
  await context.close();
  n++;
}
await browser.close();
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Готово: ${n} изображений`);
