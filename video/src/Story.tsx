/**
 * One-minute vertical promo: a day of learning with the app, step by step, with real app
 * screens, a tapping finger, icons, kinetic titles, music and sound effects.
 */
import React from 'react';
import { AbsoluteFill, Audio, Easing, Img, Sequence, Series, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import {
  BookOpen,
  Scroll,
  BookMarked,
  Sun,
  Scale,
  Sunrise,
  Hand,
  TrendingUp,
  Heart,
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
} from 'lucide-react';
import STATES from './states.json';
import { assistant, frank } from './theme';

const FPS = 30;
const s = (sec: number) => Math.round(sec * FPS);
const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { ...clamp, easing: Easing.bezier(0.33, 1, 0.68, 1) });

const GOLD = '#fbbf24';
const AMBER = '#f59e0b';
const CREAM = '#fff7e6';
const MUTED = '#d6c3a5';
const GREEN = '#10b981';

type StateName = keyof typeof STATES;
const img = (n: StateName) => (STATES as any)[n].file as string;
const tap = (n: StateName, k: string) => (STATES as any)[n].taps[k] as { x: number; y: number };

// ---------------- Layout ----------------
const PHONE_W = 600;
const SCREEN_W = 560;
const K = SCREEN_W / 1080; // image px -> screen px
const SCREEN_H = Math.round(2340 * K);
const PHONE_X = (1080 - PHONE_W) / 2;
const PHONE_Y = 600;
const toScreen = (p: { x: number; y: number }) => ({ x: PHONE_X + 20 + p.x * K, y: PHONE_Y + 20 + p.y * K });

// ---------------- Building blocks ----------------

const Backdrop: React.FC<{ hue?: string }> = ({ hue = '#7c2d12' }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: 'radial-gradient(120% 80% at 50% 0%, #2b1708 0%, #140b05 55%, #0b0603 100%)', overflow: 'hidden' }}>
      {[
        { x: -200, y: 120, r: 760, c: hue, sp: 80 },
        { x: 520, y: 900, r: 820, c: '#b45309', sp: 95 },
        { x: 80, y: 1500, r: 700, c: '#92400e', sp: 70 },
      ].map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.x + Math.sin(f / b.sp + i * 2) * 120,
            top: b.y + Math.cos(f / (b.sp * 1.2) + i) * 140,
            width: b.r,
            height: b.r,
            borderRadius: '50%',
            background: b.c,
            filter: 'blur(140px)',
            opacity: 0.55,
          }}
        />
      ))}
      {/* fine golden dust */}
      {Array.from({ length: 26 }).map((_, i) => {
        const x = (i * 397) % 1080;
        const y = (((i * 631) % 1920) - f * (0.6 + (i % 5) * 0.25) + 1920 * 4) % 1920;
        return <div key={`d${i}`} style={{ position: 'absolute', left: x, top: y, width: 4, height: 4, borderRadius: 2, background: GOLD, opacity: 0.18 + (i % 4) * 0.08 }} />;
      })}
    </AbsoluteFill>
  );
};

const Pill: React.FC<{ icon?: React.ReactNode; children: React.ReactNode; color?: string; bg?: string; style?: React.CSSProperties }> = ({
  icon,
  children,
  color = CREAM,
  bg = 'rgba(255,255,255,0.08)',
  style,
}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 12,
      padding: '12px 24px',
      borderRadius: 999,
      background: bg,
      border: '1.5px solid rgba(251,191,36,0.25)',
      color,
      fontFamily: assistant,
      fontWeight: 700,
      fontSize: 32,
      direction: 'rtl',
      ...style,
    }}
  >
    {icon}
    <span>{children}</span>
  </div>
);

/** Step label, tag, two-line headline and a subtitle that can change during the scene. */
const Heading: React.FC<{
  step?: string;
  tag?: { icon: React.ReactNode; text: string };
  line1: string;
  line2?: string;
  subs?: { at: number; text: string }[];
}> = ({ step, tag, line1, line2, subs = [] }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const a = spring({ frame: f, fps, config: { damping: 18, stiffness: 160 } });
  const b = spring({ frame: f - 5, fps, config: { damping: 18, stiffness: 160 } });
  const current = [...subs].reverse().find((x) => f >= x.at);
  const subIn = current ? ease(f, current.at, current.at + 8) : 0;
  return (
    <div style={{ position: 'absolute', top: 110, left: 64, right: 64, direction: 'rtl' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: a }}>
        {step ? (
          <div style={{ fontFamily: assistant, fontWeight: 800, fontSize: 28, letterSpacing: 4, color: MUTED, padding: '8px 20px', borderRadius: 999, background: 'rgba(255,255,255,0.06)' }}>
            {step}
          </div>
        ) : (
          <div />
        )}
        {tag && <Pill icon={tag.icon}>{tag.text}</Pill>}
      </div>
      <div
        style={{
          fontFamily: assistant,
          fontWeight: 800,
          fontSize: 92,
          lineHeight: 1.05,
          color: '#fff',
          marginTop: 30,
          transform: `translateY(${(1 - a) * 40}px)`,
          opacity: a,
        }}
      >
        {line1}
      </div>
      {line2 && (
        <div style={{ fontFamily: assistant, fontWeight: 800, fontSize: 92, lineHeight: 1.05, color: GOLD, transform: `translateY(${(1 - b) * 40}px)`, opacity: b }}>
          {line2}
        </div>
      )}
      {current && (
        <div style={{ fontFamily: assistant, fontWeight: 600, fontSize: 40, color: MUTED, marginTop: 18, opacity: subIn, transform: `translateY(${(1 - subIn) * 14}px)` }}>
          {current.text}
        </div>
      )}
    </div>
  );
};

/** Phone frame showing a sequence of app states (cross-faded). */
const Phone: React.FC<{
  states: { at: number; name: StateName }[];
  enterDelay?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ states, enterDelay = 0, style, children }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = spring({ frame: f - enterDelay, fps, config: { damping: 17, stiffness: 120 } });
  return (
    <div
      style={{
        position: 'absolute',
        left: PHONE_X,
        top: PHONE_Y,
        width: PHONE_W,
        height: SCREEN_H + 40,
        borderRadius: 80,
        padding: 20,
        boxSizing: 'border-box',
        background: 'linear-gradient(145deg, #3f2a1d, #120a05)',
        boxShadow: '0 0 0 3px rgba(251,191,36,0.35), 0 60px 140px rgba(0,0,0,0.6), 0 0 120px rgba(245,158,11,0.18)',
        transform: `translateY(${(1 - enter) * 700}px)`,
        ...style,
      }}
    >
      <div style={{ position: 'relative', width: SCREEN_W, height: SCREEN_H, borderRadius: 62, overflow: 'hidden', background: '#fff' }}>
        {states.map((st, i) => {
          const op = i === 0 ? 1 : ease(f, st.at, st.at + 7);
          if (f < st.at && i > 0) return null;
          return <Img key={i} src={staticFile(img(st.name))} style={{ position: 'absolute', inset: 0, width: SCREEN_W, height: SCREEN_H, opacity: op }} />;
        })}
        {children}
      </div>
      <div style={{ position: 'absolute', top: 36, left: PHONE_W / 2 - 60, width: 120, height: 34, borderRadius: 17, background: '#0a0603' }} />
    </div>
  );
};

/** A finger that moves between taps (image coordinates) and presses. */
const Finger: React.FC<{ path: { at: number; p: { x: number; y: number }; press?: boolean }[]; show: [number, number] }> = ({ path, show }) => {
  const f = useCurrentFrame();
  if (f < show[0] - 8 || f > show[1] + 8) return null;
  let i = 0;
  while (i < path.length - 1 && f >= path[i + 1].at) i++;
  const a = path[i];
  const b = path[Math.min(i + 1, path.length - 1)];
  const t = b === a ? 0 : ease(f, b.at - 12, b.at);
  const pa = toScreen(a.p), pb = toScreen(b.p);
  const x = pa.x + (pb.x - pa.x) * t;
  const y = pa.y + (pb.y - pa.y) * t;
  const op = ease(f, show[0] - 8, show[0]) * (1 - ease(f, show[1], show[1] + 8));
  const presses = path.filter((q) => q.press);
  const last = [...presses].reverse().find((q) => f >= q.at);
  const since = last ? f - last.at : 99;
  const press = since < 6 ? 1 - since / 6 : 0;
  return (
    <>
      {last && since < 16 && (
        <div
          style={{
            position: 'absolute',
            left: toScreen(last.p).x - 60,
            top: toScreen(last.p).y - 60,
            width: 120,
            height: 120,
            borderRadius: 60,
            border: `5px solid ${GOLD}`,
            opacity: 1 - since / 16,
            transform: `scale(${0.4 + since / 10})`,
          }}
        />
      )}
      <div
        style={{
          position: 'absolute',
          left: x - 38,
          top: y - 38,
          width: 76,
          height: 76,
          borderRadius: 38,
          background: 'rgba(255,255,255,0.88)',
          border: '4px solid rgba(120,53,15,0.35)',
          boxShadow: '0 14px 30px rgba(0,0,0,0.45)',
          opacity: op,
          transform: `scale(${1 - press * 0.25})`,
        }}
      />
    </>
  );
};

const Sfx: React.FC<{ at: number; src: string; v?: number }> = ({ at, src, v = 0.6 }) => (
  <Sequence from={Math.max(0, at)} layout="none">
    <Audio src={staticFile(`audio/${src}`)} volume={v} />
  </Sequence>
);

const Toast: React.FC<{ at: number; icon: React.ReactNode; text: string; color?: string }> = ({ at, icon, text, color = GREEN }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const k = spring({ frame: f - at, fps, config: { damping: 11, stiffness: 170 } });
  if (f < at) return null;
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, top: 1630, display: 'flex', justifyContent: 'center', transform: `scale(${k})`, opacity: Math.min(1, k * 1.5) }}>
      <Pill icon={icon} bg={color} color="#fff" style={{ fontSize: 40, padding: '18px 36px', boxShadow: `0 20px 60px ${color}88`, border: 'none' }}>
        {text}
      </Pill>
    </div>
  );
};

const I = (C: React.FC<any>, size = 34, color = GOLD) => <C size={size} color={color} strokeWidth={2.4} />;

// ---------------- Scenes ----------------

const LESSONS = [
  { icon: BookOpen, text: 'חומש ורש״י', c: '#fde68a' },
  { icon: Scroll, text: 'תהילים', c: '#bfdbfe' },
  { icon: BookMarked, text: 'תניא', c: '#bbf7d0' },
  { icon: Sun, text: 'היום יום', c: '#fed7aa' },
  { icon: Scale, text: 'רמב״ם', c: '#e9d5ff' },
];

const Hook: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icon = spring({ frame: f - 2, fps, config: { damping: 9, stiffness: 110 } });
  const title = spring({ frame: f - 12, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: 'center', top: 300 }}>
        <div
          style={{
            position: 'absolute',
            top: -170,
            width: 900,
            height: 900,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, transparent, rgba(251,191,36,0.25), transparent 20%, rgba(251,191,36,0.25) 45%, transparent 60%, rgba(251,191,36,0.25) 80%, transparent)',
            transform: `rotate(${f * 1.2}deg) scale(${icon})`,
            filter: 'blur(6px)',
          }}
        />
        <Img src={staticFile('icon.png')} style={{ width: 260, height: 260, borderRadius: 60, transform: `scale(${icon}) rotate(${(1 - icon) * -30}deg)`, boxShadow: '0 30px 90px rgba(245,158,11,0.45)' }} />
        <div style={{ fontFamily: frank, fontWeight: 900, fontSize: 170, color: '#fff', marginTop: 60, direction: 'rtl', opacity: title, transform: `translateY(${(1 - title) * 70}px)`, textShadow: '0 10px 50px rgba(245,158,11,0.5)' }}>
          חִתַּ״ת יומי
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 18, width: 940, marginTop: 50, direction: 'rtl' }}>
          {LESSONS.map((l, i) => {
            const k = spring({ frame: f - 30 - i * 6, fps, config: { damping: 10, stiffness: 180 } });
            const Ic = l.icon;
            return (
              <div key={l.text} style={{ display: 'flex', alignItems: 'center', gap: 12, background: l.c, color: '#451a03', borderRadius: 999, padding: '16px 30px', fontFamily: assistant, fontWeight: 800, fontSize: 42, transform: `scale(${k}) translateY(${(1 - k) * 40}px)` }}>
                <Ic size={40} strokeWidth={2.5} />
                {l.text}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
      <Sfx at={1} src="rise.wav" v={0.7} />
      {LESSONS.map((_, i) => <Sfx key={i} at={30 + i * 6} src="pop.wav" v={0.45} />)}
    </AbsoluteFill>
  );
};

const Punch: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = [
    { t: '5 שיעורים.', c: '#fff' },
    { t: 'כל יום.', c: '#fff' },
    { t: 'במקום אחד.', c: GOLD },
  ];
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ justifyContent: 'center', alignItems: 'center', direction: 'rtl' }}>
        {lines.map((l, i) => {
          const k = spring({ frame: f - i * 12, fps, config: { damping: 12, stiffness: 200 } });
          return (
            <div key={i} style={{ fontFamily: assistant, fontWeight: 800, fontSize: 150, lineHeight: 1.15, color: l.c, opacity: k, transform: `scale(${0.6 + k * 0.4}) translateY(${(1 - k) * 60}px)` }}>
              {l.t}
            </div>
          );
        })}
      </AbsoluteFill>
      {lines.map((_, i) => <Sfx key={i} at={i * 12} src="tap.wav" v={0.6} />)}
    </AbsoluteFill>
  );
};

const Morning: React.FC = () => {
  const TAP = 50;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading step="שלב 1" tag={{ icon: I(Sunrise), text: 'בבוקר' }} line1="פותחים את היום" line2="עם חת״ת" subs={[{ at: 8, text: 'כל השיעורים של היום – במסך אחד' }, { at: TAP + 4, text: 'לחיצה אחת – ומתחילים' }]} />
      <Phone states={[{ at: 0, name: 'home0' }, { at: TAP + 4, name: 'chumash0' }]} />
      <Finger path={[{ at: 20, p: { x: 760, y: 2000 } }, { at: TAP, p: tap('home0', 'start'), press: true }]} show={[22, TAP + 10]} />
      <Sfx at={TAP} src="tap.wav" />
      <Sfx at={TAP + 3} src="whoosh.wav" v={0.35} />
    </AbsoluteFill>
  );
};

const Chumash: React.FC = () => {
  const f = useCurrentFrame();
  const card = (STATES as any).chumash0.taps.card as { x: number; y: number; w: number; h: number };
  const D0 = 40, D1 = 58; // drag window
  const dx = ease(f, D0, D1) * 700;
  const gone = f >= D1 + 2;
  const sc = toScreen({ x: card.x, y: card.y });
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading
        step="שלב 2"
        tag={{ icon: I(BookOpen), text: 'חומש עם רש״י' }}
        line1="מחליקים פסוק"
        line2="והוא מסומן ✓"
        subs={[{ at: 6, text: 'העלייה של היום, עם פירוש רש״י' }, { at: D1, text: 'וממשיכים בדיוק מאיפה שהפסקתם' }]}
      />
      <Phone states={[{ at: 0, name: 'chumash0' }, { at: D1 + 2, name: 'chumash1' }]}>
        {!gone && f >= D0 && (
          <>
            <div style={{ position: 'absolute', left: card.x * K, top: card.y * K, width: card.w * K, height: card.h * K, background: '#fdfdfd' }} />
            <div
              style={{
                position: 'absolute',
                left: card.x * K,
                top: card.y * K,
                width: card.w * K,
                height: card.h * K,
                backgroundImage: `url(${staticFile(img('chumash0'))})`,
                backgroundSize: `${SCREEN_W}px ${SCREEN_H}px`,
                backgroundPosition: `${-card.x * K}px ${-card.y * K}px`,
                transform: `translateX(${dx}px) rotate(${dx / 60}deg)`,
                boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
                borderRadius: 18,
              }}
            />
          </>
        )}
      </Phone>
      <Finger
        path={[
          { at: 20, p: { x: 300, y: 2100 } },
          { at: D0, p: { x: card.x + 200, y: card.y + card.h / 2 }, press: true },
          { at: D1, p: { x: card.x + 200 + 700 / K, y: card.y + card.h / 2 } },
        ]}
        show={[24, D1]}
      />
      {sc && null}
      <Toast at={D1 + 4} icon={<Check size={40} strokeWidth={3} />} text="נקרא" />
      <Sfx at={D0 + 4} src="swipe.wav" v={0.8} />
      <Sfx at={D1 + 4} src="ding.wav" v={0.6} />
    </AbsoluteFill>
  );
};

const Progress: React.FC = () => {
  const TAP = 34;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading step="שלב 3" tag={{ icon: I(TrendingUp), text: 'התקדמות' }} line1="סיימת שיעור?" line2="רואים את זה מיד" subs={[{ at: 6, text: 'וי ירוק וסרגל התקדמות לכל יום' }]} />
      <Phone states={[{ at: 0, name: 'home1' }, { at: TAP + 3, name: 'home2' }]} />
      <Finger path={[{ at: 10, p: { x: 500, y: 2150 } }, { at: TAP, p: tap('home1', 'done'), press: true }]} show={[12, TAP + 8]} />
      <Toast at={TAP + 6} icon={<BadgeCheck size={42} strokeWidth={2.6} />} text="1 מתוך 5 · 20%" />
      <Sfx at={TAP} src="tap.wav" />
      <Sfx at={TAP + 5} src="ding.wav" v={0.55} />
    </AbsoluteFill>
  );
};

const Tehillim: React.FC = () => {
  const f = useCurrentFrame();
  const T0 = 28, T1 = 58, TYPE = 70, T2 = 100, DRAG0 = 130, DRAG1 = 158;
  const typed = 'קכא'.slice(0, Math.max(0, Math.min(3, Math.floor((f - TYPE) / 6) + 1)));
  const inp = tap('teh1', 'input');
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading
        step="שלב 4"
        tag={{ icon: I(Heart), text: 'תהילים אישיים' }}
        line1="תהילים"
        line2="גם הפרקים שלך"
        subs={[
          { at: 6, text: 'החלוקה לימי החודש, ועוד פרקים שבחרת' },
          { at: TYPE, text: 'כותבים ״קכא״ – והמזמור נוסף' },
          { at: DRAG0, text: 'גוררים כדי לשנות את הסדר' },
        ]}
      />
      <Phone
        states={[
          { at: 0, name: 'teh0' },
          { at: T0 + 3, name: 'teh1' },
          { at: T2 - 8, name: 'teh2' },
          { at: T2 + 4, name: 'teh3' },
          { at: DRAG1 + 2, name: 'teh4' },
        ]}
      >
        {f >= TYPE && f < T2 - 8 && (
          <div
            style={{
              position: 'absolute',
              left: inp.x * K - 150,
              top: inp.y * K - 22,
              width: 300,
              height: 44,
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              direction: 'rtl',
              fontFamily: frank,
              fontSize: 26,
              color: '#1c1917',
              paddingRight: 14,
            }}
          >
            {typed}
            <span style={{ width: 2, height: 28, background: '#1c1917', marginRight: 2, opacity: Math.floor(f / 8) % 2 }} />
          </div>
        )}
      </Phone>
      <Finger
        path={[
          { at: 12, p: { x: 600, y: 2100 } },
          { at: T0, p: tap('teh0', 'gear'), press: true },
          { at: T1, p: inp, press: true },
          { at: T2, p: tap('teh2', 'add'), press: true },
          { at: DRAG0, p: tap('teh3', 'from'), press: true },
          { at: DRAG1, p: tap('teh3', 'to') },
        ]}
        show={[14, DRAG1 + 4]}
      />
      <Toast at={T2 + 6} icon={<Sparkles size={40} strokeWidth={2.6} />} text="מזמור קכ״א נוסף" />
      <Sfx at={T0} src="tap.wav" />
      <Sfx at={T1} src="tap.wav" />
      {[0, 1, 2].map((i) => <Sfx key={i} at={TYPE + i * 6} src="type.wav" v={0.8} />)}
      <Sfx at={T2} src="tap.wav" />
      <Sfx at={T2 + 6} src="pop.wav" v={0.5} />
      <Sfx at={DRAG0} src="tap.wav" />
      <Sfx at={DRAG1} src="swipe.wav" v={0.5} />
    </AbsoluteFill>
  );
};

const TanyaHayom: React.FC = () => {
  const SW = 55;
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading
        step="שלב 5"
        tag={{ icon: I(f < SW ? BookMarked : Sun), text: f < SW ? 'תניא' : 'היום יום' }}
        line1={f < SW ? 'תניא יומי' : 'היום יום'}
        line2={f < SW ? 'השיעור של היום' : 'הפתגם של היום'}
        subs={[{ at: 6, text: 'הטקסט המלא, בגופן נוח לקריאה' }]}
      />
      <Phone states={[{ at: 0, name: 'tanya' }, { at: SW, name: 'hayomyom' }]} />
      <Sfx at={SW - 2} src="whoosh.wav" v={0.4} />
    </AbsoluteFill>
  );
};

const Rambam: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading step="שלב 6" tag={{ icon: I(Scale), text: 'רמב״ם' }} line1="רמב״ם יומי" line2="במסלול שבחרת" subs={[{ at: 6, text: 'ג׳ פרקים · פרק אחד · ספר המצוות' }]} />
      <Phone states={[{ at: 0, name: 'rambam' }]} style={{ transform: `scale(${1 + ease(f, 10, 90) * 0.05})` }} />
    </AbsoluteFill>
  );
};

const Calendar: React.FC = () => {
  const TAP = 26;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading step="שלב 7" tag={{ icon: I(CalendarDays), text: 'לוח שנה' }} line1="כל יום שלמדת" line2="מסומן בלוח" subs={[{ at: 6, text: 'לוח עברי עם ההתקדמות של כל יום' }]} />
      <Phone states={[{ at: 0, name: 'cal0' }, { at: TAP + 3, name: 'cal1' }]} />
      <Finger path={[{ at: 8, p: { x: 500, y: 700 } }, { at: TAP, p: tap('cal0', 'cal'), press: true }]} show={[10, TAP + 8]} />
      <Sfx at={TAP} src="tap.wav" />
    </AbsoluteFill>
  );
};

const Zmanim: React.FC = () => {
  const T0 = 24, T1 = 62;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading
        step="שלב 8"
        tag={{ icon: I(Clock), text: 'זמני היום' }}
        line1="זמני היום"
        line2="לפי אדמו״ר הזקן"
        subs={[{ at: 6, text: 'לכל עיר בעולם' }, { at: T1, text: 'ובערב שבת – גם הדלקת נרות' }]}
      />
      <Phone states={[{ at: 0, name: 'z0' }, { at: T0 + 3, name: 'z1' }, { at: T1 + 3, name: 'z2' }]} />
      <Finger path={[{ at: 8, p: { x: 700, y: 700 } }, { at: T0, p: tap('z0', 'open'), press: true }, { at: T1, p: tap('z1', 'next'), press: true }]} show={[10, T1 + 8]} />
      <Toast at={T1 + 8} icon={<Flame size={40} strokeWidth={2.6} />} text="הדלקת נרות 16:00" color="#d97706" />
      <Sfx at={T0} src="tap.wav" />
      <Sfx at={T1} src="tap.wav" />
    </AbsoluteFill>
  );
};

const Reminders: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const G = 18, TP = 40, SU = 60, C1 = 82, C2 = 96, C3 = 110, N = 140;
  const n = spring({ frame: f - N, fps, config: { damping: 13, stiffness: 140 } });
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading
        step="שלב 9"
        tag={{ icon: I(Bell), text: 'תזכורות' }}
        line1="תזכורת"
        line2="בדיוק בזמן"
        subs={[{ at: 6, text: 'בוחרים שעה לכל שיעור' }, { at: C3, text: 'וגם סוף זמן קריאת שמע' }, { at: N, text: 'ובשבת וחג – אין התראות' }]}
      />
      <Phone
        states={[
          { at: 0, name: 'rem0' },
          { at: G + 3, name: 'rem1' },
          { at: TP + 3, name: 'rem2' },
          { at: SU + 3, name: 'rem3' },
          { at: C3 + 3, name: 'rem4' },
        ]}
      />
      <Finger
        path={[
          { at: 4, p: { x: 300, y: 600 } },
          { at: G, p: tap('rem0', 'gear'), press: true },
          { at: TP, p: tap('rem1', 'topic'), press: true },
          { at: SU, p: tap('rem2', 'setup'), press: true },
          { at: C1, p: tap('rem3', 't1'), press: true },
          { at: C2, p: tap('rem3', 't2'), press: true },
          { at: C3, p: tap('rem3', 't3'), press: true },
        ]}
        show={[6, C3 + 8]}
      />
      {f >= N && (
        <div
          style={{
            position: 'absolute',
            left: 70,
            right: 70,
            top: 640 + (n - 1) * 500,
            opacity: n,
            background: 'rgba(255,255,255,0.97)',
            borderRadius: 40,
            padding: '28px 34px',
            display: 'flex',
            gap: 24,
            alignItems: 'center',
            direction: 'rtl',
            boxShadow: '0 30px 90px rgba(0,0,0,0.5)',
          }}
        >
          <Img src={staticFile('icon.png')} style={{ width: 104, height: 104, borderRadius: 24 }} />
          <div style={{ fontFamily: assistant }}>
            <div style={{ fontWeight: 800, fontSize: 38, color: '#1c1917' }}>חת״ת יומי · 08:00</div>
            <div style={{ fontWeight: 600, fontSize: 36, color: '#57534e', marginTop: 4 }}>הגיע הזמן ללמוד חומש עם רש״י ותניא של היום</div>
          </div>
        </div>
      )}
      {[G, TP, SU, C1, C2, C3].map((a, i) => <Sfx key={i} at={a} src="tap.wav" v={0.5} />)}
      <Sfx at={N} src="notify.wav" v={0.8} />
    </AbsoluteFill>
  );
};

const Shabbat: React.FC = () => (
  <AbsoluteFill>
    <Backdrop hue="#9a3412" />
    <Heading step="שלב 10" tag={{ icon: I(Flame), text: 'ערב שבת' }} line1="שניים מקרא" line2="ואחד תרגום" subs={[{ at: 6, text: 'כל הפרשה ביום שישי · מקרא פעמיים ואונקלוס' }]} />
    <Phone states={[{ at: 0, name: 'shnayim' }]} />
  </AbsoluteFill>
);

const Compass: React.FC = () => {
  const f = useCurrentFrame();
  const TAP = 22;
  const steps = [TAP + 4, 48, 60, 72, 84];
  const done = 84;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading
        step="שלב 11"
        tag={{ icon: I(CompassIcon), text: 'מצפן' }}
        line1="מתפללים"
        line2="לכיוון ירושלים"
        subs={[{ at: 6, text: 'מצפן לכיוון הר הבית, מכל מקום' }, { at: done, text: 'אתה פונה לכיוון ירושלים ✓' }]}
      />
      <Phone
        states={[{ at: 0, name: 'comp0' }, ...steps.map((a, i) => ({ at: a, name: `comp${i + 1}` as StateName }))]}
        style={{ transform: `rotate(${f > TAP && f < done ? Math.sin(f / 5) * 2.5 : 0}deg)` }}
      />
      <Finger path={[{ at: 6, p: { x: 300, y: 600 } }, { at: TAP, p: tap('comp0', 'open'), press: true }]} show={[8, TAP + 8]} />
      <Toast at={done + 4} icon={<CompassIcon size={40} strokeWidth={2.6} />} text="ירושלים · 112°" />
      <Sfx at={TAP} src="tap.wav" />
      <Sfx at={done + 4} src="ding.wav" v={0.6} />
    </AbsoluteFill>
  );
};

const Personal: React.FC = () => {
  const f = useCurrentFrame();
  const order: { at: number; name: StateName; label: string; icon: any }[] = [
    { at: 0, name: 'home0', label: 'קלף', icon: Palette },
    { at: 24, name: 'home-dark', label: 'מצב כהה', icon: Palette },
    { at: 46, name: 'home-black', label: 'שחור ללילה', icon: Palette },
    { at: 68, name: 'home-en', label: 'English', icon: Languages },
    { at: 90, name: 'home-fr', label: 'Français', icon: Languages },
  ];
  const cur = [...order].reverse().find((o) => f >= o.at)!;
  const Ic = cur.icon;
  return (
    <AbsoluteFill>
      <Backdrop />
      <Heading step="שלב 12" tag={{ icon: <Ic size={34} color={GOLD} strokeWidth={2.4} />, text: cur.label }} line1="בדיוק כמו" line2="שנוח לך" subs={[{ at: 6, text: 'צבעים, גופנים ושפה: עברית · English · Français' }]} />
      <Phone states={order.map((o) => ({ at: o.at, name: o.name }))} />
      {order.slice(1).map((o, i) => <Sfx key={i} at={o.at - 2} src="whoosh.wav" v={0.3} />)}
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icon = spring({ frame: f - 2, fps, config: { damping: 9 } });
  const t = spring({ frame: f - 10, fps, config: { damping: 14 } });
  const feats = [
    { icon: BadgeCheck, text: 'חינם לגמרי' },
    { icon: Sparkles, text: 'בלי פרסומות' },
    { icon: WifiOff, text: 'עובד גם בלי אינטרנט' },
    { icon: Hand, text: 'בלי הרשמה' },
  ];
  const cta = spring({ frame: f - 50, fps, config: { damping: 10, stiffness: 140 } });
  const pulse = 1 + Math.sin(f / 6) * 0.03 * ease(f, 60, 70);
  return (
    <AbsoluteFill>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: 'center', top: 230, direction: 'rtl' }}>
        <Img src={staticFile('icon.png')} style={{ width: 230, height: 230, borderRadius: 52, transform: `scale(${icon})`, boxShadow: '0 30px 90px rgba(245,158,11,0.5)' }} />
        <div style={{ fontFamily: frank, fontWeight: 900, fontSize: 160, color: '#fff', marginTop: 40, opacity: t, transform: `translateY(${(1 - t) * 50}px)` }}>חִתַּ״ת יומי</div>
        <div style={{ fontFamily: assistant, fontWeight: 700, fontSize: 46, color: GOLD, marginTop: 6, opacity: t }}>הלימוד היומי שלך, בכיס</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 64 }}>
          {feats.map((x, i) => {
            const k = spring({ frame: f - 22 - i * 5, fps, config: { damping: 12, stiffness: 170 } });
            const Ic = x.icon;
            return (
              <div key={x.text} style={{ display: 'flex', alignItems: 'center', gap: 14, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(251,191,36,0.3)', borderRadius: 26, padding: '22px 28px', color: CREAM, fontFamily: assistant, fontWeight: 700, fontSize: 38, transform: `scale(${k})` }}>
                <Ic size={40} color={GOLD} strokeWidth={2.4} />
                {x.text}
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
            fontSize: 56,
            color: '#451a03',
            background: `linear-gradient(135deg, ${GOLD}, ${AMBER})`,
            padding: '30px 64px',
            borderRadius: 999,
            boxShadow: '0 24px 70px rgba(245,158,11,0.55)',
            transform: `scale(${cta * pulse})`,
          }}
        >
          <Download size={56} strokeWidth={2.8} />
          הורידו עכשיו ב־{'⁦'}Google Play{'⁩'}
        </div>
      </AbsoluteFill>
      <Sfx at={2} src="rise.wav" v={0.7} />
      {feats.map((_, i) => <Sfx key={i} at={22 + i * 5} src="pop.wav" v={0.4} />)}
      <Sfx at={50} src="ding.wav" v={0.5} />
    </AbsoluteFill>
  );
};

// ---------------- Timeline ----------------

const SCENES: { C: React.FC; d: number }[] = [
  { C: Hook, d: s(3.4) },
  { C: Punch, d: s(2.3) },
  { C: Morning, d: s(3.3) },
  { C: Chumash, d: s(3.6) },
  { C: Progress, d: s(3.0) },
  { C: Tehillim, d: s(6.4) },
  { C: TanyaHayom, d: s(3.8) },
  { C: Rambam, d: s(3.0) },
  { C: Calendar, d: s(3.2) },
  { C: Zmanim, d: s(3.8) },
  { C: Reminders, d: s(6.6) },
  { C: Shabbat, d: s(3.0) },
  { C: Compass, d: s(4.0) },
  { C: Personal, d: s(4.0) },
  { C: Outro, d: s(5.6) },
];

export const STORY_FRAMES = SCENES.reduce((a, x) => a + x.d, 0);

/** Short flash between scenes. */
const Cut: React.FC<{ d: number }> = ({ d }) => {
  const f = useCurrentFrame();
  const inn = ease(f, 0, 6);
  const out = 1 - ease(f, d - 5, d);
  return <AbsoluteFill style={{ opacity: Math.min(inn, out), transform: `scale(${1.04 - inn * 0.04})` }} />;
};

export const Story: React.FC = () => {
  let at = 0;
  return (
    <AbsoluteFill style={{ background: '#0b0603' }}>
      <Series>
        {SCENES.map((sc, i) => (
          <Series.Sequence key={i} durationInFrames={sc.d}>
            <SceneWrap d={sc.d}>
              <sc.C />
            </SceneWrap>
          </Series.Sequence>
        ))}
      </Series>
      <Audio
        src={staticFile('audio/music2.wav')}
        volume={(fr) => interpolate(fr, [0, 15, STORY_FRAMES - 50, STORY_FRAMES], [0, 0.5, 0.5, 0], clamp)}
      />
      {SCENES.slice(1).map((sc, i) => {
        at += SCENES[i].d;
        return <Sfx key={i} at={at - 3} src="whoosh.wav" v={0.25} />;
      })}
    </AbsoluteFill>
  );
};

/** Each scene zooms in slightly and fades at its edges for a lively cut. */
const SceneWrap: React.FC<{ d: number; children: React.ReactNode }> = ({ d, children }) => {
  const f = useCurrentFrame();
  const inn = ease(f, 0, 7);
  const out = 1 - ease(f, d - 6, d);
  return (
    <AbsoluteFill style={{ opacity: Math.min(inn, out), transform: `scale(${1.03 - inn * 0.03 + (1 - out) * 0.03})` }}>
      {children}
    </AbsoluteFill>
  );
};

export { Cut };
