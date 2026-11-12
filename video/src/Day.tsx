/**
 * "A day with Chitas" – one continuous shot of the app (same day), light and soft colors,
 * a transparent tapping finger, smooth scrolling, sections switched from the app's tabs.
 */
import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  BookOpen,
  Scroll,
  BookMarked,
  Sun,
  Scale,
  Sunrise,
  Heart,
  TrendingUp,
  CalendarDays,
  Clock,
  Bell,
  Flame,
  Compass as CompassIcon,
  Palette,
  Languages,
  Download,
  Check,
  Sparkles,
  WifiOff,
  BadgeCheck,
  Hand,
  PartyPopper,
} from 'lucide-react';
import S3 from './s3.json';
import { assistant, frank } from './theme';

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });

const INK = '#292524';
const BROWN = '#78350f';
const AMBER = '#b45309';
const SOFT = '#57534e';
const GREEN = '#059669';

const D = S3 as any;
const file = (n: string) => staticFile(D[n].file);

// ---------- Phone geometry ----------
const SCREEN_W = 560;
const K = SCREEN_W / 1080;
const SCREEN_H = Math.round(2340 * K);
const BEZEL = 12;
const PHONE_W = SCREEN_W + BEZEL * 2;
const PHONE_X = (1080 - PHONE_W) / 2;
const PHONE_Y = 470;
const screenPt = (p: { x: number; y: number }) => ({ x: PHONE_X + BEZEL + p.x * K, y: PHONE_Y + BEZEL + p.y * K });

// ---------- Timeline (frames, 30 fps) ----------
const T = {
  phoneIn: 150,
  start: 200,
  chumash: 204,
  scrollA: 222,
  scrollB: 268,
  press: 284,
  release: 300,
  above: 298,
  after: 307,
  settle: 330,
  tabTeh: 356,
  gear: 386,
  input: 410,
  type: 418,
  add: 452,
  drag0: 482,
  drag1: 504,
  save: 524,
  tabTanya: 552,
  tabHayom: 640,
  tabRambam: 722,
  logo: 812,
  done: [866, 886, 906, 926, 946],
  backTop: 958,
  hundred: 990,
  cal: 1018,
  zman: 1074,
  next: 1112,
  gearR: 1160,
  topic: 1180,
  setup: 1200,
  checks: [1222, 1240, 1258],
  notify: 1284,
  compassIn: 1338,
  compassTap: 1358,
  personal: 1448,
  outro: 1560,
  end: 1740,
};
export const DAY_FRAMES = T.end;

// Chumash swipe geometry (image px)
const CH = D.chumash_full;
const CA = D.chumash_after;
const SWIPED = CA.swiped as number; // index of the swiped verse
const SCROLL_B = CH.cards[SWIPED].y - 700; // swiped verse ~700px from the top
const NEXT_BEFORE = CH.cards[SWIPED + 1].y - SCROLL_B; // next verse position on screen (before)
const SCROLL_A0 = CA.cards[0].y - NEXT_BEFORE; // after-page aligned on that verse
const SCROLL_A1 = CA.cards[0].y - 760; // where it settles

const HOME_SCROLL = D.home_progress.scroll as number;
// scroll for each lesson tap on the home page, so that its circle is in view
const HS: number[] = D.home_progress.taps.map((t: any) => Math.max(HOME_SCROLL, t.y - 1500));
const LOGO = { x: 995, y: 96 };

type Seg = { at: number; src: string; header?: string; scroll?: [number, number][]; children?: (f: number) => React.ReactNode };

const scrollAt = (f: number, keys?: [number, number][]) => {
  if (!keys || keys.length === 0) return 0;
  if (keys.length === 1) return keys[0][1];
  return interpolate(f, keys.map((k) => k[0]), keys.map((k) => k[1]), { ...clamp, easing: Easing.bezier(0.45, 0, 0.2, 1) });
};

const homeP = (i: number, at: number, scroll: [number, number][]): Seg => ({ at, src: `home_p${i}`, header: 'hdr_home', scroll });

const SEGMENTS: Seg[] = [
  { at: 0, src: 'home_top' },
  {
    at: T.chumash,
    src: 'chumash_full',
    header: 'hdr_chumash',
    scroll: [[T.scrollA, 0], [T.scrollB, SCROLL_B]],
    children: (f) => <ChumashSwipe f={f} />,
  },
  { at: T.after, src: 'chumash_after', header: 'hdr_chumash', scroll: [[T.after, SCROLL_A0], [T.settle, SCROLL_A1]] },
  { at: T.tabTeh + 4, src: 'teh0' },
  { at: T.gear + 4, src: 'teh1' },
  { at: T.add - 6, src: 'teh2' },
  { at: T.add + 4, src: 'teh3' },
  { at: T.drag1 + 2, src: 'teh4' },
  { at: T.save + 4, src: 'teh5' },
  { at: T.tabTanya + 4, src: 'tanya_full', header: 'hdr_tanya', scroll: [[T.tabTanya + 16, 0], [T.tabHayom - 10, 1500]] },
  { at: T.tabHayom + 4, src: 'hayom_full', header: 'hdr_hayom', scroll: [[T.tabHayom + 16, 0], [T.tabRambam - 10, 1100]] },
  { at: T.tabRambam + 4, src: 'rambam_full', header: 'hdr_rambam', scroll: [[T.tabRambam + 16, 0], [T.logo - 10, 1700]] },
  homeP(0, T.logo + 4, [[T.logo + 18, 0], [T.done[0] - 14, HS[0]]]),
  ...[1, 2, 3, 4].map((i) => homeP(i, T.done[i - 1] + 3, [[T.done[i] - 15, HS[i - 1]], [T.done[i] - 4, HS[i]]])),
  homeP(5, T.done[4] + 3, [[T.backTop, HS[4]], [T.hundred - 4, 0]]),
  { at: T.cal + 4, src: 'cal1' },
  { at: T.cal + 40, src: 'z0' },
  { at: T.zman + 4, src: 'z1' },
  { at: T.next + 4, src: 'z2' },
  { at: T.next + 40, src: 'rem0' },
  { at: T.gearR + 4, src: 'rem1' },
  { at: T.topic + 4, src: 'rem2' },
  { at: T.setup + 4, src: 'rem3' },
  { at: T.checks[0] + 2, src: 'rem4' },
  { at: T.checks[1] + 2, src: 'rem5' },
  { at: T.checks[2] + 2, src: 'rem6' },
  { at: T.compassIn, src: 'comp0' },
  ...[1, 2, 3, 4, 5, 6].map((i) => ({ at: T.compassTap + 4 + (i - 1) * 9, src: `comp${i}` })),
  { at: T.personal, src: 'home_top' },
  { at: T.personal + 22, src: 'home_dark' },
  { at: T.personal + 44, src: 'home_black' },
  { at: T.personal + 66, src: 'home_en' },
  { at: T.personal + 88, src: 'home_fr' },
];

// ---------- Taps ----------
type TapEv = { at: number; p: { x: number; y: number }; to?: { x: number; y: number }; toAt?: number };
const tab = (hdr: string, k: string) => D[hdr].tabs[k];
const card = CH.cards[SWIPED];
const TAPS: TapEv[] = [
  { at: T.start, p: D.home_top.start },
  { at: T.press, p: { x: card.x + 180, y: card.y - SCROLL_B + 160 }, to: { x: card.x + 180 + 620, y: card.y - SCROLL_B + 160 }, toAt: T.release },
  { at: T.tabTeh, p: tab('hdr_chumash', 'tehillim') },
  { at: T.gear, p: D.teh0.gear },
  { at: T.input, p: D.teh1.input },
  { at: T.add, p: D.teh2.add },
  { at: T.drag0, p: D.teh3.from, to: D.teh3.to, toAt: T.drag1 },
  { at: T.save, p: D.teh4.save },
  { at: T.tabTanya, p: tab('hdr_tehillim', 'tanya') },
  { at: T.tabHayom, p: tab('hdr_tanya', 'hayom') },
  { at: T.tabRambam, p: tab('hdr_hayom', 'rambam') },
  { at: T.logo, p: LOGO },
  ...T.done.map((at, i) => ({ at, p: { x: D.home_progress.taps[i].x, y: D.home_progress.taps[i].y - HS[i] } })),
  { at: T.cal, p: D.cal0.tap },
  { at: T.zman, p: D.z0.tap },
  { at: T.next, p: D.z1.tap },
  { at: T.gearR, p: D.rem0.tap },
  { at: T.topic, p: D.rem1.tap },
  { at: T.setup, p: D.rem2.tap },
  { at: T.checks[0], p: D.rem3.tap },
  { at: T.checks[1], p: D.rem4.tap },
  { at: T.checks[2], p: D.rem5.tap },
  { at: T.compassTap, p: D.comp0.tap },
];

// ---------- Headings ----------
type Head = { at: number; step: string; icon: React.FC<any>; tag: string; l1: string; l2: string; subs: { at: number; t: string }[] };
const HEADS: Head[] = [
  { at: T.phoneIn, step: 'בבוקר', icon: Sunrise, tag: 'מתחילים', l1: 'פותחים את היום', l2: 'עם חת״ת', subs: [{ at: T.phoneIn + 8, t: 'כל השיעורים של היום – במסך אחד' }] },
  { at: T.chumash, step: 'שיעור 1', icon: BookOpen, tag: 'חומש', l1: 'חומש עם רש״י', l2: 'העלייה של היום', subs: [{ at: T.chumash + 8, t: 'גוללים וקוראים פסוק אחרי פסוק' }, { at: T.press, t: 'מחליקים פסוק – וכל מה שלפניו מסומן' }] },
  { at: T.tabTeh + 4, step: 'שיעור 2', icon: Scroll, tag: 'תהילים', l1: 'תהילים', l2: 'וגם הפרקים שלך', subs: [{ at: T.tabTeh + 12, t: 'החלוקה לימי החודש' }, { at: T.type, t: 'כותבים ״קכא״ – והמזמור נוסף' }, { at: T.drag0, t: 'גוררים כדי לסדר' }] },
  { at: T.tabTanya + 4, step: 'שיעור 3', icon: BookMarked, tag: 'תניא', l1: 'תניא', l2: 'השיעור היומי', subs: [{ at: T.tabTanya + 12, t: 'מעבר בין השיעורים בלחיצה אחת' }] },
  { at: T.tabHayom + 4, step: 'שיעור 4', icon: Sun, tag: 'היום יום', l1: 'היום יום', l2: 'הפתגם של היום', subs: [{ at: T.tabHayom + 12, t: 'עם המקור מחב״דפדיה' }] },
  { at: T.tabRambam + 4, step: 'שיעור 5', icon: Scale, tag: 'רמב״ם', l1: 'רמב״ם יומי', l2: 'במסלול שבחרת', subs: [{ at: T.tabRambam + 12, t: 'ג׳ פרקים · פרק אחד · ספר המצוות' }] },
  { at: T.logo + 4, step: 'סיכום', icon: TrendingUp, tag: 'התקדמות', l1: 'סיימת שיעור?', l2: 'מסמנים ✓', subs: [{ at: T.logo + 12, t: 'וסרגל ההתקדמות מתמלא' }] },
  { at: T.cal - 6, step: 'לוח שנה', icon: CalendarDays, tag: 'מעקב', l1: 'כל יום שלמדת', l2: 'מסומן בלוח', subs: [{ at: T.cal + 2, t: 'לוח עברי עם ההתקדמות' }] },
  { at: T.cal + 40, step: 'זמנים', icon: Clock, tag: 'זמני היום', l1: 'זמני היום', l2: 'לפי אדמו״ר הזקן', subs: [{ at: T.cal + 48, t: 'לכל עיר בעולם' }, { at: T.next, t: 'ובערב שבת – הדלקת נרות' }] },
  { at: T.next + 40, step: 'תזכורות', icon: Bell, tag: 'התראות', l1: 'תזכורת', l2: 'בדיוק בזמן', subs: [{ at: T.next + 48, t: 'בוחרים שעה לכל שיעור' }, { at: T.checks[2], t: 'וגם לפני סוף זמן קריאת שמע' }, { at: T.notify + 6, t: 'בשבת ובחג – אין התראות' }] },
  { at: T.compassIn, step: 'תפילה', icon: CompassIcon, tag: 'מצפן', l1: 'מתפללים', l2: 'לכיוון ירושלים', subs: [{ at: T.compassIn + 8, t: 'מצפן לכיוון הר הבית, מכל מקום' }] },
  { at: T.personal, step: 'בשבילך', icon: Palette, tag: 'התאמה אישית', l1: 'בדיוק כמו', l2: 'שנוח לך', subs: [{ at: T.personal + 8, t: 'מצב כהה · עברית · English · Français' }] },
];

const TOASTS: { at: number; icon: React.FC<any>; t: string; color?: string }[] = [
  { at: T.release + 4, icon: Check, t: 'נקרא ✓' },
  { at: T.add + 6, icon: Sparkles, t: 'מזמור קכ״א נוסף' },
  { at: T.hundred, icon: PartyPopper, t: '5 מתוך 5 · כל הכבוד!' },
  { at: T.next + 8, icon: Flame, t: 'הדלקת נרות 16:00', color: '#d97706' },
  { at: T.compassTap + 60, icon: CompassIcon, t: 'ירושלים · 112°' },
];

const SFX: { at: number; src: string; v?: number }[] = [
  { at: 2, src: 'rise.wav', v: 0.6 },
  ...[0, 1, 2, 3, 4].map((i) => ({ at: 70 + i * 9, src: 'pop.wav', v: 0.45 })),
  { at: T.phoneIn - 2, src: 'whoosh.wav', v: 0.4 },
  ...TAPS.map((t) => ({ at: t.at, src: 'tap.wav', v: 0.55 })),
  { at: T.press + 2, src: 'swipe.wav', v: 0.8 },
  { at: T.above, src: 'swipe.wav', v: 0.5 },
  { at: T.release + 4, src: 'ding.wav', v: 0.5 },
  ...[0, 1, 2].map((i) => ({ at: T.type + i * 7, src: 'type.wav', v: 0.8 })),
  { at: T.add + 6, src: 'pop.wav', v: 0.5 },
  { at: T.hundred, src: 'ding.wav', v: 0.6 },
  { at: T.notify, src: 'notify.wav', v: 0.8 },
  { at: T.compassTap + 60, src: 'ding.wav', v: 0.5 },
  ...[22, 44, 66, 88].map((d) => ({ at: T.personal + d - 2, src: 'whoosh.wav', v: 0.25 })),
  { at: T.outro, src: 'rise.wav', v: 0.6 },
  { at: T.outro + 60, src: 'ding.wav', v: 0.5 },
];

// ---------- Components ----------

/** Same look as the store graphic: soft cream gradient with a thin golden frame. */
const FeatureBg: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(135deg, #fffbeb 0%, #fbf3e1 55%, #f3e2bf 100%)', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          left: -300 + Math.sin(f / 90) * 80,
          top: 200 + Math.cos(f / 110) * 90,
          width: 900,
          height: 900,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.75), rgba(255,255,255,0))',
        }}
      />
      <div style={{ position: 'absolute', inset: 28, border: '2px solid #d6a76a', borderRadius: 48 }} />
    </AbsoluteFill>
  );
};

const Screen: React.FC<{ seg: Seg; f: number }> = ({ seg, f }) => {
  const sc = scrollAt(f, seg.scroll);
  const isFull = !!seg.header;
  return (
    <AbsoluteFill>
      <Img src={file(seg.src)} style={{ position: 'absolute', left: 0, top: -sc * K, width: SCREEN_W, height: isFull ? (D[seg.src].height as number) * K : SCREEN_H }} />
      {seg.children?.(f)}
      {seg.header && <Img src={file(seg.header)} style={{ position: 'absolute', left: 0, top: 0, width: SCREEN_W, height: (D[seg.header].height as number) * K }} />}
    </AbsoluteFill>
  );
};

/** The swiped verse flies out with the finger; the verses above it follow. */
const ChumashSwipe: React.FC<{ f: number }> = ({ f }) => {
  if (f < T.press) return null;
  const sc = scrollAt(f, [[T.scrollA, 0], [T.scrollB, SCROLL_B]]);
  return (
    <>
      {CH.cards.slice(0, SWIPED + 1).map((c: any, i: number) => {
        const start = i === SWIPED ? T.press : T.above + (SWIPED - 1 - i) * 3;
        const end = i === SWIPED ? T.release : start + 13;
        const dx = i === SWIPED ? interpolate(f, [T.press, T.release], [0, 640], { ...clamp, easing: Easing.in(Easing.quad) }) : ease(f, start, end, 0, 640);
        const op = 1 - ease(f, end - 4, end);
        const top = (c.y - sc) * K;
        return (
          <React.Fragment key={i}>
            <div style={{ position: 'absolute', left: c.x * K - 2, top: top - 2, width: c.w * K + 4, height: c.h * K + 4, background: '#fdfdfd', opacity: f >= start ? 1 : 0 }} />
            {f >= start && op > 0 && (
              <div
                style={{
                  position: 'absolute',
                  left: c.x * K,
                  top,
                  width: c.w * K,
                  height: c.h * K,
                  backgroundImage: `url(${file('chumash_full')})`,
                  backgroundSize: `${SCREEN_W}px ${CH.height * K}px`,
                  backgroundPosition: `${-c.x * K}px ${-c.y * K}px`,
                  transform: `translateX(${dx}px) rotate(${dx / 70}deg)`,
                  opacity: op,
                  borderRadius: 16,
                  boxShadow: '0 16px 36px rgba(0,0,0,0.18)',
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};

const Phone: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f - T.phoneIn, fps, config: { damping: 18, stiffness: 110 } });
  const leave = ease(f, T.outro - 4, T.outro + 14);
  let idx = 0;
  while (idx < SEGMENTS.length - 1 && f >= SEGMENTS[idx + 1].at) idx++;
  const cur = SEGMENTS[idx];
  const prev = idx > 0 ? SEGMENTS[idx - 1] : null;
  const fadeIn = idx > 0 ? ease(f, cur.at, cur.at + 6) : 1;
  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE_X,
        top: PHONE_Y,
        width: PHONE_W,
        height: SCREEN_H + BEZEL * 2,
        borderRadius: 64,
        padding: BEZEL,
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, #fafaf9, #d6d3d1)',
        boxShadow: '0 40px 90px rgba(120, 53, 15, 0.22), 0 0 0 1px rgba(0,0,0,0.06)',
        transform: `translateY(${(1 - enter) * 1600 + leave * 1700}px)`,
        opacity: f < T.phoneIn - 2 || f > T.outro + 20 ? 0 : 1,
      }}
    >
      <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 52, overflow: 'hidden', background: '#fff' }}>
        {prev && fadeIn < 1 && <Screen seg={prev} f={f} />}
        <AbsoluteFill style={{ opacity: fadeIn }}>
          <Screen seg={cur} f={f} />
          {f >= T.type && f < T.add - 6 && <Typing f={f} />}
        </AbsoluteFill>
      </div>
    </div>
  );
};

const Typing: React.FC<{ f: number }> = ({ f }) => {
  const p = D.teh1.input;
  const n = Math.max(0, Math.min(3, Math.floor((f - T.type) / 7) + 1));
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x * K - 150,
        top: p.y * K - 20,
        width: 290,
        height: 40,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        direction: 'rtl',
        fontFamily: frank,
        fontSize: 24,
        color: INK,
        paddingRight: 12,
      }}
    >
      {'קכא'.slice(0, n)}
      <span style={{ width: 2, height: 24, background: INK, marginRight: 2, opacity: Math.floor(f / 8) % 2 }} />
    </div>
  );
};

/** Transparent ring with a white outline; glides between taps and presses. */
const Finger: React.FC = () => {
  const f = useCurrentFrame();
  let i = TAPS.findIndex((t) => f >= t.at - 16 && f <= (t.toAt ?? t.at) + 10);
  if (i < 0) return null;
  const t = TAPS[i];
  const prev = i > 0 ? TAPS[i - 1] : null;
  const prevEnd = prev ? (prev.toAt ?? prev.at) : -999;
  const from = prev && t.at - prevEnd < 40 ? prev.to ?? prev.p : { x: t.p.x + 140, y: t.p.y + 220 };
  let pos = t.p;
  if (f < t.at) {
    const k = ease(f, Math.max(prevEnd + 2, t.at - 16), t.at - 2);
    pos = { x: from.x + (t.p.x - from.x) * k, y: from.y + (t.p.y - from.y) * k };
  } else if (t.to && t.toAt) {
    const k = ease(f, t.at + 2, t.toAt);
    pos = { x: t.p.x + (t.to.x - t.p.x) * k, y: t.p.y + (t.to.y - t.p.y) * k };
  }
  const appear = prev && t.at - prevEnd < 40 ? 1 : ease(f, t.at - 16, t.at - 8);
  const nextT = TAPS[i + 1];
  const stays = nextT && nextT.at - (t.toAt ?? t.at) < 40;
  const vanish = stays ? 0 : ease(f, (t.toAt ?? t.at) + 4, (t.toAt ?? t.at) + 10);
  const since = f - t.at;
  const press = since >= 0 && since < 8 ? Math.sin((since / 8) * Math.PI) : 0;
  const holding = t.toAt && f >= t.at && f <= t.toAt;
  const sp = screenPt(pos);
  const ring = screenPt(t.p);
  return (
    <>
      {since >= 0 && since < 14 && !t.to && (
        <div
          style={{
            position: 'absolute',
            left: ring.x - 50,
            top: ring.y - 50,
            width: 100,
            height: 100,
            borderRadius: 50,
            border: '4px solid rgba(255,255,255,0.95)',
            boxShadow: '0 0 0 2px rgba(0,0,0,0.12)',
            opacity: 1 - since / 14,
            transform: `scale(${0.5 + since / 12})`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: sp.x - 34,
          top: sp.y - 34,
          width: 68,
          height: 68,
          borderRadius: 34,
          background: holding ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)',
          border: '5px solid #fff',
          boxShadow: '0 0 0 2px rgba(0,0,0,0.18), 0 6px 18px rgba(0,0,0,0.25), inset 0 0 0 2px rgba(0,0,0,0.08)',
          opacity: appear * (1 - vanish),
          transform: `scale(${1 - press * 0.22 - (holding ? 0.1 : 0)})`,
        }}
      />
    </>
  );
};

const Heading: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.phoneIn - 4 || f >= T.outro) return null;
  let i = 0;
  while (i < HEADS.length - 1 && f >= HEADS[i + 1].at) i++;
  const h = HEADS[i];
  const a = spring({ frame: f - h.at, fps, config: { damping: 18, stiffness: 170 } });
  const b = spring({ frame: f - h.at - 4, fps, config: { damping: 18, stiffness: 170 } });
  const sub = [...h.subs].reverse().find((s) => f >= s.at);
  const subIn = sub ? ease(f, sub.at, sub.at + 8) : 0;
  const Ic = h.icon;
  return (
    <div style={{ position: 'absolute', top: 90, left: 70, right: 70, direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: a }}>
        <div style={{ fontFamily: assistant, fontWeight: 800, fontSize: 28, letterSpacing: 3, color: SOFT, padding: '8px 22px', borderRadius: 999, background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(180,83,9,0.15)' }}>
          {h.step}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 22px', borderRadius: 999, background: '#fff', boxShadow: '0 6px 18px rgba(120,53,15,0.12)', fontFamily: assistant, fontWeight: 700, fontSize: 30, color: INK }}>
          <Ic size={32} color={AMBER} strokeWidth={2.4} />
          {h.tag}
        </div>
      </div>
      <div style={{ fontFamily: frank, fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: BROWN, marginTop: 22, opacity: a, transform: `translateY(${(1 - a) * 30}px)` }}>{h.l1}</div>
      <div style={{ fontFamily: frank, fontWeight: 900, fontSize: 92, lineHeight: 1.0, color: AMBER, opacity: b, transform: `translateY(${(1 - b) * 30}px)` }}>{h.l2}</div>
      {sub && (
        <div style={{ fontFamily: assistant, fontWeight: 600, fontSize: 38, color: SOFT, marginTop: 14, opacity: subIn, transform: `translateY(${(1 - subIn) * 12}px)` }}>{sub.t}</div>
      )}
    </div>
  );
};

const Toasts: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <>
      {TOASTS.map((t, i) => {
        if (f < t.at || f > t.at + 40) return null;
        const k = spring({ frame: f - t.at, fps, config: { damping: 12, stiffness: 180 } });
        const out = ease(f, t.at + 32, t.at + 40);
        const Ic = t.icon;
        return (
          <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: 1745, display: 'flex', justifyContent: 'center', transform: `scale(${k * (1 - out * 0.2)})`, opacity: Math.min(1, k * 1.5) * (1 - out) }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: t.color ?? GREEN, color: '#fff', borderRadius: 999, padding: '18px 36px', fontFamily: assistant, fontWeight: 800, fontSize: 40, direction: 'rtl', boxShadow: `0 16px 40px ${(t.color ?? GREEN)}66` }}>
              <Ic size={40} strokeWidth={2.6} />
              {t.t}
            </div>
          </div>
        );
      })}
    </>
  );
};

const Notification: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < T.notify || f > T.compassIn) return null;
  const n = spring({ frame: f - T.notify, fps, config: { damping: 13, stiffness: 140 } });
  const out = ease(f, T.compassIn - 10, T.compassIn);
  return (
    <div
      style={{
        position: 'absolute',
        left: 80,
        right: 80,
        top: PHONE_Y + 40 + (n - 1) * 420,
        opacity: n * (1 - out),
        background: 'rgba(255,255,255,0.98)',
        borderRadius: 36,
        padding: '26px 30px',
        display: 'flex',
        gap: 22,
        alignItems: 'center',
        direction: 'rtl',
        boxShadow: '0 26px 70px rgba(0,0,0,0.25)',
      }}
    >
      <Img src={staticFile('icon.png')} style={{ width: 96, height: 96, borderRadius: 22 }} />
      <div style={{ fontFamily: assistant }}>
        <div style={{ fontWeight: 800, fontSize: 36, color: INK }}>חת״ת יומי · 08:00</div>
        <div style={{ fontWeight: 600, fontSize: 34, color: '#57534e', marginTop: 4 }}>הגיע הזמן ללמוד חומש עם רש״י ותניא של היום</div>
      </div>
    </div>
  );
};

const LESSONS = [
  { icon: BookOpen, t: 'חומש ורש״י', c: '#fde68a' },
  { icon: Scroll, t: 'תהילים', c: '#bfdbfe' },
  { icon: BookMarked, t: 'תניא', c: '#bbf7d0' },
  { icon: Sun, t: 'היום יום', c: '#fed7aa' },
  { icon: Scale, t: 'רמב״ם', c: '#e9d5ff' },
];

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f > T.phoneIn + 10) return null;
  const icon = spring({ frame: f - 2, fps, config: { damping: 10, stiffness: 100 } });
  const title = spring({ frame: f - 12, fps, config: { damping: 14 } });
  const part2 = ease(f, 56, 66);
  const out = ease(f, T.phoneIn - 12, T.phoneIn + 4);
  return (
    <AbsoluteFill style={{ opacity: 1 - out }}>
      {/* logo and name */}
      <AbsoluteFill style={{ alignItems: 'center', top: 560, opacity: 1 - part2, transform: `translateY(${-part2 * 120}px)` }}>
        <Img src={staticFile('icon.png')} style={{ width: 280, height: 280, borderRadius: 64, transform: `scale(${icon}) rotate(${(1 - icon) * -20}deg)`, boxShadow: '0 30px 80px rgba(120,53,15,0.3)' }} />
        <div style={{ fontFamily: frank, fontWeight: 900, fontSize: 180, color: '#78350f', marginTop: 60, direction: 'rtl', opacity: title, transform: `translateY(${(1 - title) * 70}px)` }}>חִתַּ״ת יומי</div>
        <div style={{ fontFamily: assistant, fontWeight: 700, fontSize: 50, color: AMBER, marginTop: 20, opacity: ease(f, 26, 40), direction: 'rtl' }}>הלימוד היומי · במקום אחד</div>
      </AbsoluteFill>
      {/* the five lessons */}
      {part2 > 0 && (
        <AbsoluteFill style={{ opacity: part2 }}>
          <div style={{ position: 'absolute', top: 230, left: 0, right: 0, textAlign: 'center', fontFamily: frank, fontWeight: 900, fontSize: 92, color: BROWN, direction: 'rtl' }}>
            חמשת השיעורים של היום
          </div>
          <AbsoluteFill style={{ top: 520, alignItems: 'center', gap: 34, direction: 'rtl' }}>
            {LESSONS.map((l, i) => {
              const k = spring({ frame: f - 70 - i * 9, fps, config: { damping: 11, stiffness: 150 } });
              const Ic = l.icon;
              return (
                <div
                  key={l.t}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 22,
                    fontFamily: frank,
                    fontWeight: 900,
                    fontSize: 100,
                    color: '#451a03',
                    background: l.c,
                    padding: '16px 60px',
                    borderRadius: 40,
                    boxShadow: '0 16px 40px rgba(120,53,15,0.16)',
                    opacity: Math.min(1, k * 1.4),
                    transform: `translateX(${(1 - k) * (i % 2 ? -500 : 500)}px) rotate(${(1 - k) * (i % 2 ? -10 : 10)}deg) scale(${0.7 + k * 0.3})`,
                  }}
                >
                  <Ic size={78} strokeWidth={2.2} />
                  {l.t}
                </div>
              );
            })}
          </AbsoluteFill>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame() - T.outro;
  const { fps } = useVideoConfig();
  if (f < 0) return null;
  const icon = spring({ frame: f - 6, fps, config: { damping: 10 } });
  const t = spring({ frame: f - 14, fps, config: { damping: 14 } });
  const feats = [
    { icon: BadgeCheck, t: 'חינם לגמרי' },
    { icon: Sparkles, t: 'בלי פרסומות' },
    { icon: WifiOff, t: 'עובד גם בלי אינטרנט' },
    { icon: Hand, t: 'בלי הרשמה' },
  ];
  const cta = spring({ frame: f - 56, fps, config: { damping: 10, stiffness: 140 } });
  const pulse = 1 + Math.sin(f / 6) * 0.03 * ease(f, 66, 76);
  return (
    <AbsoluteFill style={{ alignItems: 'center', top: 250, direction: 'rtl' }}>
      <Img src={staticFile('icon.png')} style={{ width: 240, height: 240, borderRadius: 56, transform: `scale(${icon})`, boxShadow: '0 30px 80px rgba(120,53,15,0.3)' }} />
      <div style={{ fontFamily: frank, fontWeight: 900, fontSize: 160, color: '#78350f', marginTop: 40, opacity: t, transform: `translateY(${(1 - t) * 50}px)` }}>חִתַּ״ת יומי</div>
      <div style={{ fontFamily: assistant, fontWeight: 700, fontSize: 46, color: AMBER, opacity: t }}>הלימוד היומי שלך, בכיס</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 64 }}>
        {feats.map((x, i) => {
          const k = spring({ frame: f - 26 - i * 5, fps, config: { damping: 12, stiffness: 170 } });
          const Ic = x.icon;
          return (
            <div key={x.t} style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#fff', borderRadius: 26, padding: '22px 28px', color: INK, fontFamily: assistant, fontWeight: 700, fontSize: 38, boxShadow: '0 10px 30px rgba(120,53,15,0.12)', transform: `scale(${k})` }}>
              <Ic size={40} color={AMBER} strokeWidth={2.4} />
              {x.t}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 90,
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          fontFamily: assistant,
          fontWeight: 800,
          fontSize: 54,
          color: '#fff',
          background: 'linear-gradient(135deg, #b45309, #92400e)',
          padding: '30px 64px',
          borderRadius: 999,
          boxShadow: '0 24px 60px rgba(146,64,14,0.4)',
          transform: `scale(${cta * pulse})`,
        }}
      >
        <Download size={54} strokeWidth={2.8} />
        הורידו עכשיו ב־{'⁦'}Google Play{'⁩'}
      </div>
    </AbsoluteFill>
  );
};

export const Day: React.FC = () => (
  <AbsoluteFill>
    <FeatureBg />
    <Intro />
    <Heading />
    <Phone />
    <Finger />
    <Notification />
    <Toasts />
    <Outro />
    <Audio src={staticFile('audio/music2.wav')} volume={(fr) => interpolate(fr, [0, 15, DAY_FRAMES - 50, DAY_FRAMES], [0, 1, 1, 0], clamp)} />
    {SFX.map((s, i) => (
      <Sequence key={i} from={Math.max(0, s.at)} layout="none">
        <Audio src={staticFile(`audio/${s.src}`)} volume={s.v ?? 0.5} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
