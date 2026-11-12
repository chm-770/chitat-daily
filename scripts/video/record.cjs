/**
 * Records the promo video of the app for the Google Play store page.
 * Usage: npm run build && cp scripts/video/stage.html dist/ && npx vite preview --port 4199
 *        node scripts/video/record.cjs <output dir>
 * Then convert the .webm to .mp4 with ffmpeg (see README in this folder).
 */
const { chromium } = require('playwright');
const OUT = process.argv[2] || '.';
const BASE = 'http://localhost:4199';
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({
    viewport: { width: 1920, height: 1080 },
    recordVideo: { dir: OUT, size: { width: 1920, height: 1080 } },
    locale: 'he-IL',
    timezoneId: 'Asia/Jerusalem',
    serviceWorkers: 'block',
  });
  await ctx.addInitScript(() => {
    localStorage.setItem('chitas_settings', JSON.stringify({ fontSize: 'medium', fontFamily: 'serif', theme: 'parchment', showRashi: true, rashiFontScript: true, onboardingDone: true, inIsrael: true, rambamTrack: 'three_chapters' }));
    localStorage.setItem('chitas_dismiss_install_bottom_ts', String(Date.now()));
    localStorage.setItem('chitas_user_city', 'jerusalem');
    localStorage.setItem('chitas_dedications', JSON.stringify([]));
  });
  await ctx.route('**/documents:runQuery**', (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '[]' }));
  const t0 = Date.now();
  const p = await ctx.newPage();
  await p.goto(BASE + '/stage.html');
  const app = () => p.frame({ url: (u) => !u.pathname.endsWith('stage.html') });
  // Switch section inside the app (tabs in the header), no page reload
  const TAB = { '': 'ראשי', chumash: 'חומש היומי', tehillim: 'תהילים היומי', rambam: 'רמב״ם היומי' };
  const nav = async (section) => {
    await app().locator('header button:visible').filter({ hasText: TAB[section] }).first().click();
    await app().evaluate(() => window.scrollTo(0, 0));
    await wait(250);
    await app().waitForFunction(() => document.querySelectorAll('.animate-spin').length === 0, null, { timeout: 40000 }).catch(() => {});
    if (section === 'rambam') await app().waitForFunction(() => document.body.innerText.includes('הלכה א'), null, { timeout: 40000 }).catch(() => {});
    await wait(400);
  };
  const scroll = async (dy, steps = 30, ms = 1500) => {
    for (let i = 0; i < steps; i++) { await app().evaluate((d) => window.scrollBy(0, d), dy / steps); await wait(ms / steps); }
  };
  const caption = (a, s) => p.evaluate(([a, s]) => window.setCaption(a, s), [a, s || '']);

  // Preload lessons (texts come from the network) while the title card is shown
  await p.waitForFunction(() => { const f = document.getElementById('app'); return f && f.contentDocument && f.contentDocument.body.innerText.length > 200; }, null, { timeout: 40000 });
  await wait(1500);
  for (const s of ['chumash', 'tehillim', 'rambam', '']) { await nav(s); await wait(1500); }
  const startAt = (Date.now() - t0) / 1000;
  await wait(3500);

  // 1. Home
  await caption('כל שיעורי היום במקום אחד', 'חומש · תהילים · תניא · היום יום · רמב״ם');
  await p.evaluate(() => window.hideCard());
  await wait(1500);
  await scroll(520, 40, 2600);
  await wait(800);

  // 2. Chumash + swipe
  await caption('חומש עם רש״י', 'העלייה של היום בפרשת השבוע');
  await nav('chumash');
  await scroll(430, 30, 1800);
  await wait(1200);
  await caption('מחליקים כדי לסמן שנקראו', 'וממשיכים בדיוק מאיפה שהפסקתם');
  await wait(1200);
  const card = app().locator('[data-swipe-verse]').first();
  const box = await card.boundingBox();
  if (box) {
    const y = box.y + Math.min(box.height / 2, 160), x0 = box.x + box.width * 0.35;
    await p.mouse.move(x0, y); await p.mouse.down();
    for (let i = 1; i <= 25; i++) { await p.mouse.move(x0 + i * 9, y); await wait(22); }
    await p.mouse.up();
  }
  await wait(2200);

  // 3. Tehillim
  await caption('תהילים לפי ימי החודש', 'ואפשר להוסיף פרקים אישיים');
  await nav('tehillim');
  await scroll(380, 30, 2000);
  await wait(1500);

  // 4. Rambam
  await nav('rambam');
  await caption('רמב״ם היומי', 'ג׳ פרקים, פרק אחד או ספר המצוות');
  await wait(600);
  await scroll(450, 30, 2000);
  await wait(1500);

  // 5. Zmanim
  await caption('זמני היום', 'לפי שיטת אדמו״ר הזקן, לפי העיר שלכם');
  await nav('');
  await app().getByRole('button', { name: /זמני היום/ }).first().click();
  await wait(3800);
  await app().getByRole('button', { name: /סגור|סגירה|Close/ }).last().click().catch(() => {});
  await wait(400);

  // 6. Reminders
  await caption('תזכורות', 'לשיעורים, לקריאת שמע ולערב שבת וחג');

  await app().locator('button[title*="הגדרות"], button[aria-label*="הגדרות"]').first().click();
  await wait(600);
  await app().getByRole('button', { name: /תזכורות/ }).first().click();
  await wait(500);
  await app().getByRole('button', { name: 'הגדרת תזכורות' }).click().catch(() => {});
  await wait(1200);
  for (const label of ['חומש עם רש״י', 'תניא']) await app().getByText(label, { exact: true }).last().click().catch(() => {});
  await app().getByText('סוף זמן קריאת שמע').last().click().catch(() => {});
  await wait(2600);

  // 7. Compass
  await caption('מצפן לתפילה', 'הכיוון לירושלים, להר הבית');
  await app().getByRole('button', { name: /סגור הגדרות|סגירה/ }).first().click().catch(() => {});
  await wait(300);
  await app().getByRole('button', { name: /מצפן/ }).click();
  await wait(3800);

  // 8. Closing card
  await p.evaluate(() => window.showCard('חינם · בלי פרסומות · בעברית, באנגלית ובצרפתית', 'זמין ב־\u2066Google Play\u2069'));
  await wait(4200);
  const endAt = (Date.now() - t0) / 1000;

  await ctx.close();
  await b.close();
  console.log(JSON.stringify({ startAt, endAt }));
})();
