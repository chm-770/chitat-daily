/**
 * Captures one continuous session of the app (same day) for the story video:
 * full pages for smooth scrolling, the fixed header of each section, tab positions,
 * the real verse swipe, personal Tehillim, home progress, calendar, zmanim, reminders,
 * compass, themes and languages. Run with the built app served on :4200.
 * Writes public/s3/*.png and src/s3.json (coordinates in image pixels, 1080 wide).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/public/s3';
const BASE = 'http://localhost:4200';
const S = 3;
const DATE = '2026-11-12T08:30:00+02:00';
fs.mkdirSync(OUT, { recursive: true });
const M = {};
const base = { fontSize: 'medium', fontFamily: 'serif', theme: 'parchment', showRashi: true, rashiFontScript: true, onboardingDone: true, inIsrael: true, rambamTrack: 'three_chapters' };
const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

async function open(b, { settings = {}, init = '' } = {}) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: S, locale: 'he-IL', timezoneId: 'Asia/Jerusalem', serviceWorkers: 'block' });
  const progress = {};
  const now = new Date(DATE);
  for (let i = 1; i <= 25; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    const all = i !== 5 && i !== 12;
    progress[dayKey(d)] = { date: dayKey(d), chumash: true, tehillim: true, tanya: all, hayomYom: true, rambam: all, readItemIds: {} };
  }
  await ctx.addInitScript(([s, progress, init]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('chitas_settings', s);
      localStorage.setItem('chitas_dismiss_install_bottom_ts', String(Date.now()));
      localStorage.setItem('chitas_user_city', 'jerusalem');
      for (const [k, v] of Object.entries(progress)) localStorage.setItem('chitas_progress_' + k, JSON.stringify(v));
      if (init) eval(init);
      sessionStorage.setItem('seeded', '1');
    }
  }, [JSON.stringify({ ...base, ...settings }), progress, init]);
  await ctx.route('**/documents:runQuery**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ document: { name: 'x/dedications/d', fields: { type: { stringValue: 'refua' }, text: { stringValue: 'כל חולי ישראל' }, startDate: { stringValue: '2026-01-01' }, endDate: { stringValue: '2027-12-31' } } } }]) })
  );
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date(DATE));
  return { ctx, p };
}
async function ready(p, extra = 1000) {
  await p.waitForTimeout(1500);
  await p.waitForFunction(() => document.querySelectorAll('.animate-spin').length === 0, null, { timeout: 40000 }).catch(() => {});
  await p.waitForTimeout(extra);
}
const px = (v) => Math.round(v * S);
async function boxOf(loc, scrollY = 0) {
  const b = await loc.boundingBox();
  return b ? { x: px(b.x), y: px(b.y + scrollY), w: px(b.width), h: px(b.height) } : null;
}
const mid = (b) => (b ? { x: Math.round(b.x + b.w / 2), y: Math.round(b.y + b.h / 2) } : null);
async function view(p, name, extra = {}) {
  await p.screenshot({ path: `${OUT}/${name}.png` });
  M[name] = { file: `s3/${name}.png`, ...extra };
  console.log('✓', name);
}
async function full(p, name, extra = {}) {
  await p.screenshot({ path: `${OUT}/${name}.png`, fullPage: true });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  M[name] = { file: `s3/${name}.png`, height: px(h), ...extra };
  console.log('✓', name, 'full', px(h));
}
async function header(p, name) {
  await p.evaluate(() => window.scrollTo(0, 0));
  await p.waitForTimeout(300);
  const hb = await p.locator('header').first().boundingBox();
  await p.screenshot({ path: `${OUT}/${name}.png`, clip: { x: 0, y: 0, width: 360, height: Math.ceil(hb.height) } });
  const tabs = {};
  for (const [k, label] of [['home', 'ראשי'], ['chumash', 'חומש היומי'], ['tehillim', 'תהילים היומי'], ['tanya', 'תניא היומי'], ['hayom', 'היום יום'], ['rambam', 'רמב״ם היומי']]) {
    const t = p.locator('header button:visible').filter({ hasText: label }).first();
    if (await t.count()) tabs[k] = mid(await boxOf(t));
  }
  M[name] = { file: `s3/${name}.png`, height: px(hb.height), tabs };
  console.log('✓', name, JSON.stringify(tabs));
}
const tabBtn = (p, label) => p.locator('header button:visible').filter({ hasText: label }).first();

(async () => {
  const b = await chromium.launch();

  // ---------- One session: home → chumash → tehillim → tanya → hayom yom → rambam → home progress
  {
    const { ctx, p } = await open(b);
    await p.goto(BASE + '/'); await ready(p);
    await header(p, 'hdr_home');
    await view(p, 'home_top', { start: mid(await boxOf(p.getByRole('button', { name: /התחל לימוד חומש/ }))) });

    await p.getByRole('button', { name: /התחל לימוד חומש/ }).click();
    await ready(p, 800);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400);
    await header(p, 'hdr_chumash');
    const cards = p.locator('[data-swipe-verse]');
    const n = await cards.count();
    const boxes = [];
    for (let i = 0; i < Math.min(n, 8); i++) boxes.push(await boxOf(cards.nth(i), 0));
    await full(p, 'chumash_full', { cards: boxes });
    // swipe the 4th verse (the three above it are marked too)
    const K = 3;
    await cards.nth(K).scrollIntoViewIfNeeded();
    await p.evaluate(() => window.scrollBy(0, 120));
    await p.waitForTimeout(300);
    const bb = await cards.nth(K).boundingBox();
    const y = bb.y + Math.min(bb.height / 2, 120), x0 = bb.x + bb.width / 2;
    await p.mouse.move(x0, y); await p.mouse.down();
    for (let i = 1; i <= 12; i++) { await p.mouse.move(x0 + i * 15, y); await p.waitForTimeout(16); }
    await p.mouse.up();
    await p.waitForTimeout(1500);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(400);
    const cards2 = p.locator('[data-swipe-verse]');
    const after = [];
    for (let i = 0; i < Math.min(await cards2.count(), 6); i++) after.push(await boxOf(cards2.nth(i), 0));
    await full(p, 'chumash_after', { cards: after, swiped: K });

    // Tehillim (tab), personal psalms
    await tabBtn(p, 'תהילים היומי').click(); await ready(p, 800);
    await header(p, 'hdr_tehillim');
    const gear = p.locator('button:has(svg.lucide-settings2), button:has(svg.lucide-settings-2)').first();
    await view(p, 'teh0', { gear: mid(await boxOf(gear)) });
    await gear.click(); await p.waitForTimeout(700);
    const input = p.getByPlaceholder('למשל קכא');
    await input.scrollIntoViewIfNeeded();
    await view(p, 'teh1', { input: mid(await boxOf(input)) });
    await input.fill('קכא'); await p.waitForTimeout(300);
    const add = p.locator('form').filter({ has: input }).getByRole('button');
    await view(p, 'teh2', { add: mid(await boxOf(add)) });
    await add.click(); await p.waitForTimeout(600);
    await p.evaluate(() => { const el = document.querySelector('[class*="overflow-y-auto"]'); if (el) el.scrollTop = 0; });
    await p.waitForTimeout(300);
    const handles = p.locator('button[aria-label="גרירה לשינוי הסדר"]');
    const hn = await handles.count();
    const from = mid(await boxOf(handles.nth(hn - 1))), to = mid(await boxOf(handles.nth(0)));
    const save = p.getByRole('button', { name: /שמור פרקים/ });
    await view(p, 'teh3', { from, to });
    const hb = await handles.nth(hn - 1).boundingBox(), fb = await handles.nth(0).boundingBox();
    await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.mouse.down();
    for (let i = 1; i <= 15; i++) { await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2 + (fb.y - hb.y - 8) * i / 15); await p.waitForTimeout(25); }
    await p.mouse.up(); await p.waitForTimeout(700);
    await view(p, 'teh4', { save: mid(await boxOf(save)) });
    await save.click(); await p.waitForTimeout(800);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await view(p, 'teh5');

    // Tanya, Hayom Yom, Rambam (tabs), full pages for scrolling
    for (const [key, label] of [['tanya', 'תניא היומי'], ['hayom', 'היום יום'], ['rambam', 'רמב״ם היומי']]) {
      await tabBtn(p, label).click(); await ready(p, key === 'rambam' ? 2500 : 800);
      await header(p, `hdr_${key}`);
      await full(p, `${key}_full`);
    }

    // Back home: mark lessons done one after the other
    await tabBtn(p, 'ראשי').click(); await ready(p, 800);
    const circles = () => p.locator('button[title="סמן כהושלם"]');
    const lessonsY = await p.getByText('שיעורי היום', { exact: true }).boundingBox();
    const scrollTo = Math.max(0, Math.round(lessonsY.y - 60));
    const taps = [];
    for (let i = 0; i < 5; i++) {
      await p.evaluate((y) => window.scrollTo(0, y), scrollTo); await p.waitForTimeout(300);
      const sy = await p.evaluate(() => window.scrollY);
      const c = circles().first();
      taps.push(mid(await boxOf(c, sy)));
      await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
      await full(p, `home_p${i}`);
      await p.evaluate((y) => window.scrollTo(0, y), scrollTo); await p.waitForTimeout(300);
      await circles().first().click(); await p.waitForTimeout(700);
    }
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await full(p, 'home_p5');
    M.home_progress = { scroll: px(scrollTo), taps };
    await ctx.close();
  }

  // ---------- Calendar, zmanim, reminders (step by step)
  {
    const { ctx, p } = await open(b);
    await p.goto(BASE + '/'); await ready(p);
    const calBtn = p.locator('button:has(svg.lucide-calendar-days)').first();
    await view(p, 'cal0', { tap: mid(await boxOf(calBtn)) });
    await calBtn.click(); await p.waitForTimeout(900);
    await view(p, 'cal1');
    await p.goto(BASE + '/'); await ready(p);
    const zBtn = p.getByRole('button', { name: /זמני היום/ }).first();
    await view(p, 'z0', { tap: mid(await boxOf(zBtn)) });
    await zBtn.click(); await p.waitForTimeout(900);
    const next = p.locator('button[title="יום הבא"]').first();
    await view(p, 'z1', { tap: mid(await boxOf(next)) });
    await next.click(); await p.waitForTimeout(700);
    await view(p, 'z2');

    await p.goto(BASE + '/'); await ready(p);
    const gear = p.locator('button[title*="הגדרות"], button[aria-label*="הגדרות"]').first();
    await view(p, 'rem0', { tap: mid(await boxOf(gear)) });
    await gear.click(); await p.waitForTimeout(700);
    const topic = p.getByRole('button', { name: /תזכורות/ }).first();
    await view(p, 'rem1', { tap: mid(await boxOf(topic)) });
    await topic.click(); await p.waitForTimeout(500);
    const setup = p.getByRole('button', { name: 'הגדרת תזכורות' });
    await view(p, 'rem2', { tap: mid(await boxOf(setup)) });
    await setup.click(); await p.waitForTimeout(500);
    const boxes = p.locator('input[type="checkbox"]');
    let k = 3;
    for (const i of [0, 2, 5]) {
      await view(p, `rem${k}`, { tap: mid(await boxOf(boxes.nth(i))) });
      await boxes.nth(i).check().catch(() => {});
      await p.waitForTimeout(400);
      k++;
    }
    await view(p, `rem${k}`);
    await ctx.close();
  }

  // ---------- Compass from Paris
  {
    const { ctx, p } = await open(b, { settings: { inIsrael: false }, init: "localStorage.setItem('chitas_user_city','paris'); DeviceOrientationEvent.requestPermission = async () => 'granted';" });
    await p.goto(BASE + '/'); await ready(p);
    const btn = p.getByRole('button', { name: /מצפן/ });
    await view(p, 'comp0', { tap: mid(await boxOf(btn)) });
    await btn.click(); await p.waitForTimeout(700);
    await p.getByRole('button', { name: 'הפעלת המצפן' }).click().catch(() => {});
    for (const [i, h] of [10, 35, 60, 85, 100, 112].entries()) {
      await p.evaluate((h) => { const e = new Event('deviceorientationabsolute'); Object.assign(e, { absolute: true, alpha: (360 - h) % 360 }); window.dispatchEvent(e); }, h);
      await p.waitForTimeout(450);
      await view(p, `comp${i + 1}`);
    }
    await ctx.close();
  }

  // ---------- Themes and languages
  for (const [name, settings] of [['home_dark', { theme: 'dark' }], ['home_black', { theme: 'black' }], ['home_en', { language: 'en' }], ['home_fr', { language: 'fr' }]]) {
    const { ctx, p } = await open(b, { settings });
    await p.goto(BASE + '/'); await ready(p);
    await view(p, name);
    await ctx.close();
  }

  fs.writeFileSync(__dirname + '/src/s3.json', JSON.stringify(M, null, 1));
  await b.close();
})();
