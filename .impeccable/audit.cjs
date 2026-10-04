// Review audit for the sheet: screenshots at four widths, overflow, headings, dead targets,
// alt text, touch targets, contrast, dead CSS, unstyled classes, keyboard and focus rings,
// the accessibility tree, print, reduced motion, no JavaScript, a hidden tab and a late main.js.
// Usage: serve the repo at http://127.0.0.1:8777/ then
//   NODE_PATH=$(npm root -g) node .impeccable/audit.cjs   (Playwright must be resolvable)
// Captures and audit.json land in .impeccable/review/ (ignored by git).
const { chromium } = require('playwright');
const fs = require('fs');
const URL = 'http://127.0.0.1:8777/';
const OUT = 'D:/Projects/resume.io/.impeccable/review';
const REPO = 'D:/Projects/resume.io';
const report = {};

// ---- dead-CSS: parse selectors out of styles.css -------------------------
function cssSelectors(css) {
  css = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const out = []; let i = 0; let buf = '';
  while (i < css.length) {
    const ch = css[i];
    if (ch === '{') {
      const prelude = buf.trim(); buf = '';
      if (/^@(media|supports)/.test(prelude)) { i++; continue; }
      if (/^@/.test(prelude)) { let d = 1; i++; while (i < css.length && d) { if (css[i] === '{') d++; if (css[i] === '}') d--; i++; } continue; }
      prelude.split(',').map(s => s.trim()).filter(Boolean).forEach(s => out.push(s));
      let d = 1; i++; while (i < css.length && d) { if (css[i] === '{') d++; if (css[i] === '}') d--; i++; } continue;
    }
    if (ch === '}') { buf = ''; i++; continue; }
    buf += ch; i++;
  }
  return out;
}
const cleanSel = s => s
  .replace(/::?-webkit-[a-z-]+/g, '').replace(/::selection/g, '').replace(/::?(before|after)/g, '')
  .replace(/:not\(:focus-visible\)/g, '').replace(/:focus-visible/g, '').replace(/:hover/g, '').replace(/:focus/g, '').trim();

(async () => {
  const browser = await chromium.launch();
  const css = fs.readFileSync(REPO + '/styles.css', 'utf8');
  const selectors = [...new Set(cssSelectors(css).map(cleanSel).filter(Boolean))];

  for (const w of [390, 768, 1024, 1440]) {
    const h = w < 700 ? 844 : (w < 1000 ? 1024 : 900);
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    const cons = [], failed = [];
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') cons.push(m.type() + ': ' + m.text()); });
    page.on('pageerror', e => cons.push('pageerror: ' + e.message));
    page.on('requestfailed', r => failed.push(r.url() + ' ' + ((r.failure() || {}).errorText || '')));
    page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url()); });
    await page.goto(URL, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1500);
    // hero first: a full-page capture resizes the viewport, which restarts CSS animations in Chromium
    await page.screenshot({ path: `${OUT}/w${w}-hero.png` });
    // load every lazy image before the full-page capture, then return to the top
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 40)); } window.scrollTo(0, 0); });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${OUT}/w${w}-full.png`, fullPage: true });
    await page.waitForTimeout(1200);

    const audit = await page.evaluate((selectors) => {
      const vw = document.documentElement.clientWidth;
      const tag = el => `${el.tagName.toLowerCase()}${el.classList.length ? '.' + [...el.classList].join('.') : ''}`;
      const out = { vw, docScrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth };
      const inScroller = el => { for (let p = el.parentElement; p; p = p.parentElement) { const o = getComputedStyle(p).overflowX; if (o === 'auto' || o === 'scroll') return true; } return false; };
      out.overflow = [];
      for (const el of document.querySelectorAll('body *')) {
        const r = el.getBoundingClientRect(); if (!r.width && !r.height) continue;
        if ((r.right > vw + 1 || r.left < -1) && !inScroller(el)) out.overflow.push(`${tag(el)} L${Math.round(r.left)} R${Math.round(r.right)}`);
      }
      out.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(x => x.tagName + ' ' + x.textContent.trim().slice(0, 40));
      out.deadTargets = [];
      for (const a of document.querySelectorAll('a[href^="#"]')) if (!document.getElementById(a.getAttribute('href').slice(1))) out.deadTargets.push('href ' + a.getAttribute('href'));
      for (const el of document.querySelectorAll('[aria-labelledby],[aria-controls],[aria-describedby]')) for (const attr of ['aria-labelledby', 'aria-controls', 'aria-describedby']) { const v = el.getAttribute(attr); if (v) v.split(/\s+/).forEach(id => { if (!document.getElementById(id)) out.deadTargets.push(attr + ' ' + id); }); }
      for (const u of document.querySelectorAll('use')) { const hh = u.getAttribute('href') || u.getAttribute('xlink:href'); if (!hh || !document.querySelector(hh)) out.deadTargets.push('use ' + hh); }
      out.brokenImages = [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.getAttribute('src'));
      out.imgAlts = [...document.images].map(i => (i.getAttribute('src') || '').split('/').pop() + ' alt="' + (i.getAttribute('alt') ?? 'MISSING') + '"');
      out.smallTargets = []; out.under44 = [];
      for (const el of document.querySelectorAll('a,button,summary,[tabindex]')) { const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue; if (r.width < 24 || r.height < 24) out.smallTargets.push(`${tag(el)} ${Math.round(r.width)}x${Math.round(r.height)}`); else if (r.height < 44) out.under44.push(`${tag(el)} ${Math.round(r.width)}x${Math.round(r.height)} "${el.textContent.trim().slice(0, 14)}"`); }
      out.clipped = [];
      for (const el of document.querySelectorAll('body *')) { const cs = getComputedStyle(el); if (el.children.length === 0 && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1 && (cs.overflow !== 'visible' || cs.whiteSpace === 'nowrap')) out.clipped.push(`${tag(el)} sw${el.scrollWidth} cw${el.clientWidth}`); }
      const nav = document.querySelector('.index'); out.nav = { scrollWidth: nav.scrollWidth, clientWidth: nav.clientWidth, lastLinkRight: Math.round(nav.querySelector('li:last-child a').getBoundingClientRect().right) };
      const leaves = [...document.querySelectorAll('body *')].filter(el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) && getComputedStyle(el).visibility !== 'hidden').map(el => ({ el, r: el.getBoundingClientRect() })).filter(x => x.r.width > 0 && x.r.height > 0);
      out.overlaps = [];
      for (let a = 0; a < leaves.length; a++) for (let b = a + 1; b < leaves.length; b++) {
        const A = leaves[a], B = leaves[b]; if (A.el.contains(B.el) || B.el.contains(A.el)) continue;
        const ix = Math.min(A.r.right, B.r.right) - Math.max(A.r.left, B.r.left), iy = Math.min(A.r.bottom, B.r.bottom) - Math.max(A.r.top, B.r.top);
        if (ix > 2 && iy > 2) out.overlaps.push(`${tag(A.el)} x ${tag(B.el)} (${Math.round(ix)}x${Math.round(iy)})`);
      }
      const lum = (r, g, b) => { const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
      const parse = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[\s,\/]+/).map(Number); return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 }; };
      const bgOf = el => { for (let p = el; p; p = p.parentElement) { const cs = getComputedStyle(p); const c = parse(cs.backgroundColor); if (c && c.a > 0) return c; if (cs.backgroundImage !== 'none') return 'image'; } return { r: 255, g: 255, b: 255 }; };
      out.contrast = []; const seen = new Set();
      for (const el of document.querySelectorAll('body *')) {
        if (![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())) continue;
        const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const r = el.getBoundingClientRect(); if (!r.width || !r.height) continue;
        const fg = parse(cs.color); const bg = bgOf(el); if (!fg || bg === 'image') continue;
        const L1 = lum(fg.r, fg.g, fg.b), L2 = lum(bg.r, bg.g, bg.b); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight) >= 700; const large = size >= 24 || (size >= 18.66 && bold);
        const key = `${tag(el)}|${cs.color}|${cs.fontSize}|${bg.r}`; if (seen.has(key)) continue; seen.add(key);
        out.contrast.push({ sel: tag(el), fg: cs.color, bg: `rgb(${bg.r}, ${bg.g}, ${bg.b})`, size: cs.fontSize, ratio: +ratio.toFixed(2), pass: ratio >= (large ? 3 : 4.5) });
      }
      out.contrastFails = out.contrast.filter(c => !c.pass);
      out.fontSizes = [...new Set(out.contrast.map(c => c.size))].sort((a, b) => parseFloat(a) - parseFloat(b));
      document.querySelector('details').open = true; document.querySelector('.index a').setAttribute('aria-current', 'true');
      out.deadSelectors = []; for (const s of selectors) { try { if (!document.querySelector(s)) out.deadSelectors.push(s); } catch (e) { out.deadSelectors.push('INVALID ' + s); } }
      document.querySelector('details').open = false; document.querySelector('.index a').removeAttribute('aria-current');
      const classes = new Set(); document.querySelectorAll('[class]').forEach(el => el.classList.forEach(c => classes.add(c)));
      const joined = selectors.join('\n');
      out.unstyledClasses = [...classes].filter(c => !new RegExp('\\.' + c.replace(/-/g, '\\-') + '(?![\\w-])').test(joined));
      return out;
    }, selectors);

    const collisions = [];
    const stripBottom = await page.evaluate(() => document.querySelector('.strip').getBoundingClientRect().bottom);
    for (const id of ['sheet', 'elevation', 'details', 'schedule', 'project', 'notes', 'signoff']) {
      await page.evaluate(id => { document.documentElement.style.scrollBehavior = 'auto'; location.hash = ''; location.hash = '#' + id; }, id);
      await page.waitForTimeout(120);
      const t = await page.evaluate(id => document.getElementById(id).getBoundingClientRect().top, id);
      collisions.push(`#${id} top=${Math.round(t)}${t < stripBottom - 0.5 ? ' UNDER STRIP' : ''}`);
    }
    await page.evaluate(() => { location.hash = '#schedule'; });
    await page.waitForTimeout(500);
    const current = await page.evaluate(() => [...document.querySelectorAll('.index a[aria-current]')].map(a => a.textContent));
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = true));
    await page.waitForTimeout(200);
    await page.locator('#schedule').screenshot({ path: `${OUT}/w${w}-schedule-open.png` });
    await page.evaluate(() => document.querySelectorAll('details').forEach(d => d.open = false));
    report[`w${w}`] = { console: cons, failed, stripBottom, collisions, currentAfterSchedule: current, ...audit };
    await ctx.close();
  }

  // ---- keyboard, focus rings, a11y tree, print (1440) ----------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(URL); await page.evaluate(() => document.fonts.ready); await page.waitForTimeout(300);
    const kb = {};
    await page.keyboard.press('Tab');
    kb.first = await page.evaluate(() => document.activeElement.className + ' | ' + document.activeElement.textContent.trim() + ' | fv=' + document.activeElement.matches(':focus-visible'));
    await page.screenshot({ path: `${OUT}/focus-skip.png`, clip: { x: 0, y: 0, width: 700, height: 90 } });
    await page.keyboard.press('Tab');
    kb.second = await page.evaluate(() => {
      const a = document.activeElement, nav = a.closest('.index'); const r = a.getBoundingClientRect(), n = nav.getBoundingClientRect(); const cs = getComputedStyle(a);
      const off = parseFloat(cs.outlineOffset), wdt = parseFloat(cs.outlineWidth);
      return { el: a.className + ' ' + a.textContent.trim(), fv: a.matches(':focus-visible'), outline: cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor + ' offset ' + cs.outlineOffset, link: [r.left, r.top, r.right, r.bottom].map(Math.round), navClip: [n.left, n.top, n.right, n.bottom].map(Math.round), navOverflowY: getComputedStyle(nav).overflowY, ringTop: Math.round(r.top - off - wdt), ringBottom: Math.round(r.bottom + off + wdt), clippedTop: r.top - off - wdt < n.top, clippedBottom: r.bottom + off + wdt > n.bottom };
    });
    const navBox = await page.locator('.index a').first().boundingBox();
    await page.screenshot({ path: `${OUT}/focus-nav.png`, clip: { x: navBox.x - 30, y: 0, width: navBox.width + 60, height: 60 } });
    await page.focus('a.unit__mark[aria-label^="MYER"]');
    await page.keyboard.press('Tab');
    kb.summary = await page.evaluate(() => ({ el: document.activeElement.tagName + '.' + document.activeElement.className, fv: document.activeElement.matches(':focus-visible'), outline: getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineColor }));
    const sumBox = await page.locator('summary.cred__row').first().boundingBox();
    const sy = await page.evaluate(() => window.scrollY);
    await page.screenshot({ path: `${OUT}/focus-summary.png`, fullPage: true, clip: { x: Math.max(0, sumBox.x - 12), y: Math.max(0, sumBox.y + sy - 12), width: Math.min(1400, sumBox.width + 24), height: sumBox.height + 24 } });
    await page.keyboard.press('Enter'); await page.waitForTimeout(100);
    kb.enterOpens = await page.evaluate(() => document.querySelector('details').open);
    await page.keyboard.press('Space'); await page.waitForTimeout(100);
    kb.spaceCloses = await page.evaluate(() => !document.querySelector('details').open);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.focus('.skip'); await page.keyboard.press('Enter'); await page.waitForTimeout(300);
    kb.skipHash = await page.evaluate(() => location.hash);
    const client = await ctx.newCDPSession(page);
    await client.send('Accessibility.enable');
    const { nodes } = await client.send('Accessibility.getFullAXTree');
    const exposed = nodes.filter(n => !n.ignored);
    const roles = {}; exposed.forEach(n => { const r = n.role && n.role.value; roles[r] = (roles[r] || 0) + 1; });
    const svgish = exposed.filter(n => /svg|graphic|image|img/i.test((n.role && n.role.value) || '')).map(n => `${n.role.value}:"${(n.name && n.name.value) || ''}"`);
    const unnamedLinks = exposed.filter(n => n.role && n.role.value === 'link' && !(n.name && n.name.value)).length;
    kb.ax = { exposedCount: exposed.length, roles, svgish, unnamedLinks };
    kb.ariaActs = await page.locator('.block__acts').ariaSnapshot();
    kb.ariaCred = await page.locator('.cred').first().ariaSnapshot();
    kb.ariaHero = await page.locator('.hero__top').ariaSnapshot();
    // print path: the browser fires beforeprint, main.js opens the rows, afterprint restores them
    await page.evaluate(() => window.dispatchEvent(new Event('beforeprint')));
    await page.emulateMedia({ media: 'print' });
    kb.print = await page.evaluate(() => ({ openRows: [...document.querySelectorAll('details')].filter(d => d.open).length, strip: getComputedStyle(document.querySelector('.strip')).display, plus: getComputedStyle(document.querySelector('.cred__plus')).display }));
    const schedBox = await page.locator('#schedule').boundingBox();
    await page.screenshot({ path: `${OUT}/print-schedule.png`, fullPage: true, clip: schedBox });
    await page.emulateMedia({ media: 'screen' });
    await page.evaluate(() => window.dispatchEvent(new Event('afterprint')));
    kb.printRestored = await page.evaluate(() => [...document.querySelectorAll('details')].filter(d => d.open).length);
    // a real print run (PDF) fires the events natively
    await page.evaluate(() => document.querySelector('details').open = true); // one left open by the visitor must stay open
    await page.pdf({ path: `${OUT}/print-run.pdf`, format: 'A4', printBackground: true });
    kb.afterPdf = await page.evaluate(() => [...document.querySelectorAll('details')].map(d => d.open));
    kb.fontLoaded = await page.evaluate(() => document.fonts.check('600 16px Archivo'));
    report.keyboard = kb;
    await ctx.close();
  }

  // ---- reduced motion ------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage(); await page.goto(URL); await page.waitForTimeout(300);
    report.reducedMotion = await page.evaluate(() => ({ plotting: document.documentElement.classList.contains('is-plotting'), datum: getComputedStyle(document.querySelector('.datum')).transform, tickOpacity: [...new Set([...document.querySelectorAll('.tick')].map(t => getComputedStyle(t).opacity))], scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior }));
    await page.screenshot({ path: `${OUT}/reduced-motion-hero.png` });
    await ctx.close();
  }
  // ---- no JS ---------------------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const page = await ctx.newPage(); await page.goto(URL); await page.waitForTimeout(600);
    try { report.noJs = await page.evaluate(() => ({ plotting: document.documentElement.classList.contains('is-plotting'), datum: getComputedStyle(document.querySelector('.datum')).transform, tickOpacity: [...new Set([...document.querySelectorAll('.tick')].map(t => getComputedStyle(t).opacity))] })); } catch (e) { report.noJs = 'evaluate unavailable: ' + e.message; }
    await page.screenshot({ path: `${OUT}/nojs-hero.png` });
    await page.screenshot({ path: `${OUT}/nojs-full.png`, fullPage: true });
    await ctx.close();
  }
  // ---- hidden tab gate -----------------------------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.addInitScript(() => { Object.defineProperty(Document.prototype, 'hidden', { get: () => true, configurable: true }); });
    await page.goto(URL); await page.waitForTimeout(300);
    report.hiddenTab = await page.evaluate(() => ({ docHidden: document.hidden, plotting: document.documentElement.classList.contains('is-plotting'), datum: getComputedStyle(document.querySelector('.datum')).transform, tickOpacity: [...new Set([...document.querySelectorAll('.tick')].map(t => getComputedStyle(t).opacity))] }));
    await ctx.close();
  }
  // ---- delayed main.js: paint before the gate ------------------------------
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.route(/main\.js/, route => setTimeout(() => route.continue(), 2500));
    await page.goto(URL, { waitUntil: 'commit' });
    await page.waitForTimeout(1200);
    const snap = async () => page.evaluate(() => ({ t: Math.round(performance.now()), readyState: document.readyState, plotting: document.documentElement.classList.contains('is-plotting'), datum: getComputedStyle(document.querySelector('.datum')).transform, tick1: getComputedStyle(document.querySelector('.tick')).opacity, anims: document.querySelector('.datum').getAnimations().map(a => a.playState + '@' + Math.round(a.currentTime)) }));
    const before = await snap();
    await page.screenshot({ path: `${OUT}/flash-1-painted-before-js.png` });
    await page.waitForTimeout(1550);
    const during = await snap();
    await page.screenshot({ path: `${OUT}/flash-2-replotting-after-js.png` });
    await page.waitForTimeout(1200);
    const after = await snap();
    report.delayedJs = { before, during, after };
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(`${OUT}/audit.json`, JSON.stringify(report, null, 2));
  for (const w of [390, 768, 1024, 1440]) {
    const r = report[`w${w}`];
    console.log(`\n== ${w} == console:${r.console.length} failed:${r.failed.length} docSW:${r.docScrollWidth} bodySW:${r.bodyScrollWidth} vw:${r.vw}`);
    if (r.console.length) console.log('  console:', r.console);
    if (r.failed.length) console.log('  failed:', r.failed);
    console.log('  overflow:', r.overflow);
    console.log('  clipped:', r.clipped);
    console.log('  overlaps:', r.overlaps);
    console.log('  nav:', JSON.stringify(r.nav));
    console.log('  smallTargets:', r.smallTargets, ' under44:', r.under44);
    console.log('  contrastFails:', JSON.stringify(r.contrastFails));
    console.log('  collisions:', r.collisions.join(' | '));
    console.log('  current after #schedule:', r.currentAfterSchedule);
    if (w === 1440) {
      console.log('  headings:', r.headings);
      console.log('  deadTargets:', r.deadTargets, ' brokenImages:', r.brokenImages);
      console.log('  imgAlts:', r.imgAlts);
      console.log('  fontSizes:', r.fontSizes);
      console.log('  deadSelectors:', r.deadSelectors);
      console.log('  unstyledClasses:', r.unstyledClasses);
      console.log('  contrast table:'); r.contrast.forEach(c => console.log(`    ${c.pass ? 'ok ' : 'BAD'} ${c.ratio}  ${c.size.padEnd(7)} ${c.fg} on ${c.bg}  ${c.sel}`));
    }
  }
  console.log('\n== keyboard ==', JSON.stringify(report.keyboard, null, 1));
  console.log('\n== reducedMotion ==', JSON.stringify(report.reducedMotion));
  console.log('== noJs ==', JSON.stringify(report.noJs));
  console.log('== hiddenTab ==', JSON.stringify(report.hiddenTab));
  console.log('== delayedJs ==', JSON.stringify(report.delayedJs, null, 1));
})().catch(e => { console.error('AUDIT FAILED', e); process.exit(1); });
