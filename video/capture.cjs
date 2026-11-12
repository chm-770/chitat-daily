/** Captures the app screens used by the promo video (run with the app served on :4200). */
const { chromium } = require('playwright');
const OUT = __dirname + '/public/shots';
const BASE = 'http://localhost:4200';
const settings = (extra = {}) => JSON.stringify({ fontSize: 'medium', fontFamily: 'serif', theme: 'parchment', showRashi: true, rashiFontScript: true, onboardingDone: true, inIsrael: true, rambamTrack: 'three_chapters', ...extra });

async function ctxWith(b, extra, init) {
  const ctx = await b.newContext({ viewport: { width: 360, height: 780 }, deviceScaleFactor: 3, locale: 'he-IL', timezoneId: 'Asia/Jerusalem', serviceWorkers: 'block' });
  await ctx.addInitScript(([s, init]) => {
    localStorage.setItem('chitas_settings', s);
    localStorage.setItem('chitas_dismiss_install_bottom_ts', String(Date.now()));
    localStorage.setItem('chitas_user_city', 'jerusalem');
    localStorage.setItem('chitas_dedications', JSON.stringify([{ id: 'd', type: 'refua', text: 'כל חולי ישראל', startDate: '2026-01-01', endDate: '2027-12-31' }]));
    if (init) eval(init);
  }, [settings(extra), init || '']);
  await ctx.route('**/documents:runQuery**', (r) => r.fallback());
  return ctx;
}
async function ready(p) {
  await p.waitForTimeout(2000);
  await p.waitForFunction(() => document.querySelectorAll('.animate-spin').length === 0, null, { timeout: 40000 }).catch(() => {});
  await p.waitForTimeout(1200);
}

(async () => {
  const b = await chromium.launch();
  let ctx = await ctxWith(b);
  const p = await ctx.newPage();
  for (const [name, q] of [['home', ''], ['chumash', '?section=chumash'], ['tehillim', '?section=tehillim'], ['rambam', '?section=rambam']]) {
    await p.goto(BASE + '/' + q); await ready(p);
    await p.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
    await p.screenshot({ path: `${OUT}/${name}.png` });
  }
  // header only (stays fixed while the page scrolls in the video)
  await p.goto(BASE + '/?section=chumash'); await ready(p);
  const hb = await p.locator('header').first().boundingBox();
  await p.screenshot({ path: `${OUT}/header.png`, clip: { x: 0, y: 0, width: 360, height: Math.ceil(hb.height) } });
  // one verse card (swipe animation)
  await p.locator('[data-swipe-verse]').nth(1).scrollIntoViewIfNeeded();
  await p.locator('[data-swipe-verse]').nth(1).screenshot({ path: `${OUT}/verse-card.png` });
  // zmanim
  await p.goto(BASE + '/'); await ready(p);
  await p.getByRole('button', { name: /זמני היום/ }).first().click(); await p.waitForTimeout(1500);
  await p.screenshot({ path: `${OUT}/zmanim.png` });
  // reminders
  await p.goto(BASE + '/'); await ready(p);
  await p.locator('button[title*="הגדרות"], button[aria-label*="הגדרות"]').first().click(); await p.waitForTimeout(600);
  await p.getByRole('button', { name: /תזכורות/ }).first().click(); await p.waitForTimeout(400);
  await p.getByRole('button', { name: 'הגדרת תזכורות' }).click();
  await p.waitForTimeout(400);
  const boxes = p.locator('input[type="checkbox"]');
  for (const i of [0, 2, 4, 5, 6]) await boxes.nth(i).check().catch(() => {});
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/reminders.png` });
  await ctx.close();

  // compass, facing Jerusalem from Paris
  ctx = await ctxWith(b, { inIsrael: false }, "localStorage.setItem('chitas_user_city','paris'); DeviceOrientationEvent.requestPermission = async () => 'granted';");
  const c = await ctx.newPage();
  await c.goto(BASE + '/'); await ready(c);
  await c.getByRole('button', { name: /מצפן/ }).click(); await c.waitForTimeout(800);
  await c.getByRole('button', { name: 'הפעלת המצפן' }).click().catch(() => {});
  await c.waitForTimeout(400);
  await c.evaluate(() => { const e = new Event('deviceorientationabsolute'); Object.assign(e, { absolute: true, alpha: 360 - 110 }); window.dispatchEvent(e); });
  await c.waitForTimeout(1200);
  await c.screenshot({ path: `${OUT}/compass.png` });
  await ctx.close();

  // other languages and dark theme
  for (const [name, extra] of [['home-en', { language: 'en' }], ['home-fr', { language: 'fr' }], ['home-dark', { theme: 'dark' }]]) {
    ctx = await ctxWith(b, extra);
    const q = await ctx.newPage();
    await q.goto(BASE + '/'); await ready(q);
    await q.screenshot({ path: `${OUT}/${name}.png` });
    await ctx.close();
  }
  await b.close();
})();
