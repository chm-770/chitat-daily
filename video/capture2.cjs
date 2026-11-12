/**
 * Captures the app states for the one-minute promo video, with the tap positions
 * (image pixels, 1080 wide). Run with the built app served on :4200:
 *   node capture2.cjs
 * Writes public/states/*.png and src/states.json.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = __dirname + '/public/states';
const BASE = 'http://localhost:4200';
const S = 3; // device scale factor
fs.mkdirSync(OUT, { recursive: true });
const manifest = {};

const base = { fontSize: 'medium', fontFamily: 'serif', theme: 'parchment', showRashi: true, rashiFontScript: true, onboardingDone: true, inIsrael: true, rambamTrack: 'three_chapters' };

function dayKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function open(b, { settings = {}, date = '2026-11-12T08:30:00+02:00', init = '' } = {}) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: S, locale: 'he-IL', timezoneId: 'Asia/Jerusalem', serviceWorkers: 'block' });
  // a month of progress for the calendar
  const progress = {};
  const now = new Date(date);
  for (let i = 1; i <= 20; i++) {
    const d = new Date(now.getTime() - i * 86400000);
    const all = i !== 6 && i !== 13;
    progress[dayKey(d)] = { date: dayKey(d), chumash: true, tehillim: true, tanya: all, hayomYom: true, rambam: all, readItemIds: {} };
  }
  await ctx.addInitScript(([s, progress, init]) => {
    if (!sessionStorage.getItem('seeded')) {
      localStorage.clear();
      localStorage.setItem('chitas_settings', s);
      localStorage.setItem('chitas_dismiss_install_bottom_ts', String(Date.now()));
      localStorage.setItem('chitas_user_city', 'jerusalem');
      localStorage.setItem('chitas_dedications', JSON.stringify([{ id: 'd', type: 'refua', text: 'כל חולי ישראל', startDate: '2026-01-01', endDate: '2027-12-31' }]));
      for (const [k, v] of Object.entries(progress)) localStorage.setItem('chitas_progress_' + k, JSON.stringify(v));
      if (init) eval(init);
      sessionStorage.setItem('seeded', '1');
    }
  }, [JSON.stringify({ ...base, ...settings }), progress, init]);
  await ctx.route('**/documents:runQuery**', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ document: { name: 'x/dedications/d', fields: { type: { stringValue: 'refua' }, text: { stringValue: 'כל חולי ישראל' }, startDate: { stringValue: '2026-01-01' }, endDate: { stringValue: '2027-12-31' } } } }]) })
  );
  const p = await ctx.newPage();
  await p.clock.setFixedTime(new Date(date));
  return { ctx, p };
}

async function ready(p, extra = 1000) {
  await p.waitForTimeout(1500);
  await p.waitForFunction(() => document.querySelectorAll('.animate-spin').length === 0, null, { timeout: 40000 }).catch(() => {});
  await p.waitForTimeout(extra);
}

async function center(loc) {
  const b = await loc.boundingBox();
  return b ? { x: Math.round((b.x + b.width / 2) * S), y: Math.round((b.y + b.height / 2) * S) } : null;
}

async function shot(p, name, taps = {}) {
  await p.screenshot({ path: `${OUT}/${name}.png` });
  manifest[name] = { file: `states/${name}.png`, taps };
  console.log('✓', name, JSON.stringify(taps));
}

(async () => {
  const b = await chromium.launch();

  // ---- Home and Chumash
  {
    const { ctx, p } = await open(b);
    await p.goto(BASE + '/');
    await ready(p);
    await shot(p, 'home0', { start: await center(p.getByRole('button', { name: /התחל לימוד חומש/ })) });
    await p.getByRole('button', { name: /התחל לימוד חומש/ }).click();
    await ready(p, 800);
    // scroll so that the verses are visible
    await p.evaluate(() => window.scrollTo(0, 0));
    const card = p.locator('[data-swipe-verse]').first();
    await card.scrollIntoViewIfNeeded();
    await p.evaluate(() => window.scrollBy(0, -170));
    await p.waitForTimeout(500);
    const bb = await card.boundingBox();
    await shot(p, 'chumash0', { card: { x: Math.round(bb.x * S), y: Math.round(bb.y * S), w: Math.round(bb.width * S), h: Math.round(bb.height * S) } });
    // real swipe
    const y = bb.y + Math.min(bb.height / 2, 120), x0 = bb.x + bb.width / 2;
    await p.mouse.move(x0, y); await p.mouse.down();
    for (let i = 1; i <= 12; i++) { await p.mouse.move(x0 + i * 15, y); await p.waitForTimeout(16); }
    await p.mouse.up();
    await p.waitForTimeout(1200);
    await shot(p, 'chumash1');
    // mark the lesson done from the home page
    await p.goto(BASE + '/'); await ready(p);
    const circle = p.locator('button[title*="סמן"], button[title*="הושלם"]').first();
    const c = await center(circle);
    await shot(p, 'home1', { done: c });
    await circle.click(); await p.waitForTimeout(800);
    await p.evaluate(() => window.scrollTo(0, 0)); await p.waitForTimeout(300);
    await shot(p, 'home2');
    await ctx.close();
  }

  // ---- Personal Tehillim
  {
    const { ctx, p } = await open(b);
    await p.goto(BASE + '/?section=tehillim'); await ready(p);
    const gear = p.locator('button:has(svg.lucide-settings2), button:has(svg.lucide-settings-2)').first();
    await shot(p, 'teh0', { gear: await center(gear) });
    await gear.click(); await p.waitForTimeout(700);
    const input = p.getByPlaceholder('למשל קכא');
    await input.scrollIntoViewIfNeeded();
    await shot(p, 'teh1', { input: await center(input) });
    await input.fill('קכא'); await p.waitForTimeout(300);
    const add = p.locator('form').filter({ has: input }).getByRole('button');
    await shot(p, 'teh2', { add: await center(add) });
    await add.click(); await p.waitForTimeout(600);
    await p.locator('button[aria-label="גרירה לשינוי הסדר"]').first().scrollIntoViewIfNeeded();
    await p.evaluate(() => { const el = document.querySelector('[class*="overflow-y-auto"]'); if (el) el.scrollTop = 0; });
    await p.waitForTimeout(300);
    const handles = p.locator('button[aria-label="גרירה לשינוי הסדר"]');
    const n = await handles.count();
    const from = await center(handles.nth(n - 1)), to = await center(handles.nth(0));
    await shot(p, 'teh3', { from, to });
    const hb = await handles.nth(n - 1).boundingBox(), fb = await handles.nth(0).boundingBox();
    await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2); await p.mouse.down();
    for (let i = 1; i <= 15; i++) { await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2 + (fb.y - hb.y - 8) * i / 15); await p.waitForTimeout(25); }
    await p.mouse.up(); await p.waitForTimeout(700);
    await shot(p, 'teh4');
    await ctx.close();
  }

  // ---- Tanya, Hayom Yom, Rambam (with the opening of Hilchot Shluchin)
  {
    const { ctx, p } = await open(b, { date: '2026-11-10T08:30:00+02:00' });
    await p.goto(BASE + '/?section=tanya'); await ready(p);
    await p.evaluate(() => window.scrollBy(0, 330)); await p.waitForTimeout(400);
    await shot(p, 'tanya');
    await p.goto(BASE + '/?section=hayom_yom'); await ready(p);
    await p.evaluate(() => window.scrollBy(0, 300)); await p.waitForTimeout(400);
    await shot(p, 'hayomyom');
    await p.goto(BASE + '/?section=rambam'); await ready(p, 2500);
    await p.getByText('פתיחה · הלכות שלוחין ושותפין').scrollIntoViewIfNeeded();
    await p.evaluate(() => window.scrollBy(0, -260)); await p.waitForTimeout(400);
    await shot(p, 'rambam');
    await ctx.close();
  }

  // ---- Calendar, Zmanim, Reminders
  {
    const { ctx, p } = await open(b);
    await p.goto(BASE + '/'); await ready(p);
    const calBtn = p.locator('button:has(svg.lucide-calendar-days)').first();
    await shot(p, 'cal0', { cal: await center(calBtn) });
    await calBtn.click(); await p.waitForTimeout(900);
    await shot(p, 'cal1');
    await p.keyboard.press('Escape');
    await p.goto(BASE + '/'); await ready(p);
    const zBtn = p.getByRole('button', { name: /זמני היום/ }).first();
    await shot(p, 'z0', { open: await center(zBtn) });
    await zBtn.click(); await p.waitForTimeout(900);
    const next = p.locator('button[title="יום הבא"]').first();
    await shot(p, 'z1', { next: await center(next) });
    await next.click(); await p.waitForTimeout(700);
    await shot(p, 'z2');
    await p.goto(BASE + '/'); await ready(p);
    const gear = p.locator('button[title*="הגדרות"], button[aria-label*="הגדרות"]').first();
    await shot(p, 'rem0', { gear: await center(gear) });
    await gear.click(); await p.waitForTimeout(700);
    const topic = p.getByRole('button', { name: /תזכורות/ }).first();
    await shot(p, 'rem1', { topic: await center(topic) });
    await topic.click(); await p.waitForTimeout(500);
    const setup = p.getByRole('button', { name: 'הגדרת תזכורות' });
    await shot(p, 'rem2', { setup: await center(setup) });
    await setup.click(); await p.waitForTimeout(500);
    const boxes = p.locator('input[type="checkbox"]');
    const t1 = await center(boxes.nth(0)), t2 = await center(boxes.nth(2)), t3 = await center(boxes.nth(5));
    await shot(p, 'rem3', { t1, t2, t3 });
    for (const i of [0, 2, 5]) await boxes.nth(i).check().catch(() => {});
    await p.waitForTimeout(500);
    await shot(p, 'rem4');
    await ctx.close();
  }

  // ---- Friday: Shnayim Mikra
  {
    const { ctx, p } = await open(b, { settings: { shnayimMikra: true }, date: '2026-11-13T09:00:00+02:00' });
    await p.goto(BASE + '/?section=shnayim_mikra'); await ready(p, 1500);
    await p.evaluate(() => window.scrollBy(0, 250)); await p.waitForTimeout(400);
    await shot(p, 'shnayim');
    await ctx.close();
  }

  // ---- Compass from Paris, turning towards Jerusalem
  {
    const { ctx, p } = await open(b, { settings: { inIsrael: false }, init: "localStorage.setItem('chitas_user_city','paris'); DeviceOrientationEvent.requestPermission = async () => 'granted';" });
    await p.goto(BASE + '/'); await ready(p);
    const btn = p.getByRole('button', { name: /מצפן/ });
    await shot(p, 'comp0', { open: await center(btn) });
    await btn.click(); await p.waitForTimeout(700);
    await p.getByRole('button', { name: 'הפעלת המצפן' }).click().catch(() => {});
    for (const [i, h] of [20, 50, 80, 100, 112].entries()) {
      await p.evaluate((h) => { const e = new Event('deviceorientationabsolute'); Object.assign(e, { absolute: true, alpha: (360 - h) % 360 }); window.dispatchEvent(e); }, h);
      await p.waitForTimeout(500);
      await shot(p, `comp${i + 1}`);
    }
    await ctx.close();
  }

  // ---- Themes and languages
  for (const [name, settings] of [['dark', { theme: 'dark' }], ['black', { theme: 'black' }], ['en', { language: 'en' }], ['fr', { language: 'fr' }]]) {
    const { ctx, p } = await open(b, { settings });
    await p.goto(BASE + '/'); await ready(p);
    await shot(p, `home-${name}`);
    await ctx.close();
  }

  fs.writeFileSync(__dirname + '/src/states.json', JSON.stringify(manifest, null, 1));
  await b.close();
})();
