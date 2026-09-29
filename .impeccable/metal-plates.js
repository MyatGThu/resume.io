const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
// Procedural bronze: a height field lit per pixel. No image model involved.
const RENDER = (kind, S) => {
  let seed = kind === 'shield' ? 7 : 19;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const H = new Float32Array(S * S), C = S / 2, R = S / 2 - 2;
  // value noise for patina and grain
  const G = 64, grid = Array.from({ length: G * G }, rnd);
  const vn = (x, y) => { const xi = Math.floor(x) & (G - 1), yi = Math.floor(y) & (G - 1), xf = x - Math.floor(x), yf = y - Math.floor(y);
    const s = t => t * t * (3 - 2 * t), a = grid[yi * G + xi], b = grid[yi * G + ((xi + 1) & (G - 1))], c = grid[((yi + 1) & (G - 1)) * G + xi], d = grid[((yi + 1) & (G - 1)) * G + ((xi + 1) & (G - 1))];
    return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf); };
  const fbm = (x, y) => { let v = 0, a = 0.5; for (let i = 0; i < 5; i++) { v += a * vn(x, y); x *= 2.03; y *= 2.03; a *= 0.5; } return v; };
  const dents = [];
  if (kind === 'shield') for (let i = 0; i < 1500; i++) { const r = Math.sqrt(rnd()) * 0.83 * R, t = rnd() * 6.2832; dents.push([C + r * Math.cos(t), C + r * Math.sin(t), (0.012 + rnd() * 0.02) * S, 0.5 + rnd() * 0.5]); }
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const dx = x - C, dy = y - C, r = Math.hypot(dx, dy) / R;
    let h = 0;
    if (kind === 'shield') {
      h = r < 0.86 ? Math.sqrt(Math.max(0, 1 - (r / 0.95) ** 2)) * 0.55 : 0.2;                 // domed bowl
      h += Math.exp(-(((r - 0.885) / 0.018) ** 2)) * 0.09;                                       // raised ridge
      h += r > 0.925 ? Math.sqrt(Math.max(0, 1 - ((r - 0.965) / 0.04) ** 2)) * 0.16 : 0;        // rolled rim
    } else {
      const rim = r > 0.9 ? Math.sqrt(Math.max(0, 1 - ((r - 0.95) / 0.052) ** 2)) * 0.16 : 0;   // struck rim
      const band = r > 0.62 && r <= 0.9 ? 0.06 : 0;                 // turned lettering band
      const field = r <= 0.62 ? 0.1 + Math.sqrt(Math.max(0, 1 - (r / 0.9) ** 2)) * 0.05 : 0;    // raised field
      const step = Math.exp(-(((r - 0.62) / 0.012) ** 2)) * 0.05 + Math.exp(-(((r - 0.9) / 0.012) ** 2)) * 0.035;
      h = rim + band + field + step;
    }
    h += (fbm(x / S * 18, y / S * 18) - 0.5) * (kind === 'shield' ? 0.008 : 0.0028);            // grain
    H[y * S + x] = h;
  }
  if (kind === 'shield') for (const [cx, cy, rr, dd] of dents) {                               // hammer marks
    const x0 = Math.max(0, cx - rr | 0), x1 = Math.min(S - 1, cx + rr | 0), y0 = Math.max(0, cy - rr | 0), y1 = Math.min(S - 1, cy + rr | 0);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const q = Math.hypot(x - cx, y - cy) / rr; if (q < 1) H[y * S + x] -= (1 - q * q) * 0.0045 * dd; }
  }
  const cv = document.createElement('canvas'); cv.width = cv.height = S; const ctx = cv.getContext('2d'), img = ctx.createImageData(S, S), D = img.data;
  const L = [-0.45, -0.62, 0.64], Ln = Math.hypot(...L), Lk = L.map(v => v / Ln);            // gold key from top left
  const F = [0.55, 0.6, 0.58], Fn = Math.hypot(...F), Fk = F.map(v => v / Fn);                // ember fill from below right
  const k = S * 0.9;
  for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
    const i = y * S + x, r = Math.hypot(x - C, y - C) / R; if (r > 1) continue;
    const nx = -(H[i + 1] - H[i - 1]) * k, ny = -(H[i + S] - H[i - S]) * k, nz = 1, nl = Math.hypot(nx, ny, nz);
    const N = [nx / nl, ny / nl, nz / nl];
    const dk = Math.max(0, N[0] * Lk[0] + N[1] * Lk[1] + N[2] * Lk[2]), df = Math.max(0, N[0] * Fk[0] + N[1] * Fk[1] + N[2] * Fk[2]);
    const Hh = [Lk[0], Lk[1], Lk[2] + 1], hn = Math.hypot(...Hh), sp = Math.pow(Math.max(0, (N[0] * Hh[0] + N[1] * Hh[1] + N[2] * Hh[2]) / hn), kind === 'shield' ? 34 : 60);
    const pat = fbm(x / S * 7 + 3, y / S * 7), cav = Math.max(0, -(H[i + 1] + H[i - 1] + H[i + S] + H[i - S] - 4 * H[i]) * 90);
    let br = [176, 122, 60].map((c, j) => c * (0.78 + 0.35 * pat) - cav * [40, 34, 24][j]);  // bronze albedo, dark in hollows
    let col = br.map((c, j) => c * (0.3 + 0.85 * dk) + [255, 138, 61][j] * 0.12 * df + [255, 224, 170][j] * sp * (kind === 'shield' ? 0.85 : 1.0));
    const edge = Math.min(1, (1 - r) * S * 0.5);                                               // anti-aliased disc edge
    D[i * 4] = Math.min(255, col[0]); D[i * 4 + 1] = Math.min(255, col[1]); D[i * 4 + 2] = Math.min(255, col[2]); D[i * 4 + 3] = 255 * Math.max(0, edge);
  }
  ctx.putImageData(img, 0, 0);
  return cv.toDataURL('image/webp', 0.86);
};
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage();
  for (const [kind, S] of [['shield', 480], ['coin', 480]]) {
    const url = await p.evaluate(`(${RENDER.toString()})(${JSON.stringify(kind)}, ${S})`);
    fs.writeFileSync(`/home/user/hello-world.io/assets/material/${kind}.webp`, Buffer.from(url.split(',')[1], 'base64'));
    console.log(kind, fs.statSync(`/home/user/hello-world.io/assets/material/${kind}.webp`).size, 'bytes');
  }
  // proof sheet on the page ground
  await p.setViewportSize({ width: 900, height: 460 });
  await p.setContent(`<body style="margin:0;background:#0b0906;display:flex;gap:40px;align-items:center;justify-content:center;height:460px">
    <img src="data:image/webp;base64,${fs.readFileSync('/home/user/hello-world.io/assets/material/shield.webp').toString('base64')}" width="400">
    <img src="data:image/webp;base64,${fs.readFileSync('/home/user/hello-world.io/assets/material/coin.webp').toString('base64')}" width="380"></body>`);
  await p.screenshot({ path: '/tmp/claude-0/-home-user-hello-world-io/f90a7a26-1cb5-5e60-bc58-95e5559b79c2/scratchpad/metal-proof.png' });
  await b.close();
})();
