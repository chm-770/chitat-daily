import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from 'remotion';
import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { slide } from '@remotion/transitions/slide';
import { wipe } from '@remotion/transitions/wipe';
import { AppIcon, Background, Caption, Phone, PHONE_W, SCREEN_H, SCREEN_W, ease, useEnter } from './components';
import { C, assistant, frank } from './theme';

const T = 15; // transition length (frames)
const PHONE_LEFT = (1080 - PHONE_W) / 2;
const PHONE_TOP = 500;

// ---------------- Scenes ----------------

const Intro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icon = spring({ frame: f - 4, fps, config: { damping: 10, stiffness: 90 } });
  const title = spring({ frame: f - 16, fps, config: { damping: 14 } });
  const sub = ease(f, 30, 45);
  return (
    <AbsoluteFill>
      <Background />
      {/* golden rays */}
      <AbsoluteFill style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div
          style={{
            width: 1500,
            height: 1500,
            borderRadius: '50%',
            background: 'conic-gradient(from 0deg, rgba(251,191,36,0.0), rgba(251,191,36,0.22), rgba(251,191,36,0.0) 25%, rgba(251,191,36,0.22) 50%, rgba(251,191,36,0) 75%, rgba(251,191,36,0.22))',
            transform: `rotate(${f * 0.6}deg) scale(${0.6 + icon * 0.4})`,
            opacity: icon * 0.9,
            position: 'absolute',
            top: 160,
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill style={{ alignItems: 'center', top: 470 }}>
        <AppIcon size={300} style={{ transform: `scale(${icon}) rotate(${(1 - icon) * -25}deg)` }} />
        <div
          style={{
            fontFamily: frank,
            fontWeight: 900,
            fontSize: 190,
            color: C.brown,
            marginTop: 70,
            direction: 'rtl',
            opacity: title,
            transform: `translateY(${(1 - title) * 80}px)`,
            textShadow: '0 8px 30px rgba(120,53,15,0.25)',
          }}
        >
          חִתַּ״ת יומי
        </div>
        <div style={{ fontFamily: assistant, fontWeight: 700, fontSize: 52, color: C.amber, marginTop: 24, opacity: sub, direction: 'rtl' }}>
          הלימוד היומי · במקום אחד
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const LESSONS = ['חומש ורש״י', 'תהילים', 'תניא', 'היום יום', 'רמב״ם'];
const COLORS = ['#fde68a', '#bfdbfe', '#bbf7d0', '#fed7aa', '#e9d5ff'];
export const WORDS_STEP = 11;

const Words: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Background />
      <Caption text="חמשת השיעורים של היום" y={190} size={88} />
      <AbsoluteFill style={{ top: 520, alignItems: 'center', gap: 34, direction: 'rtl' }}>
        {LESSONS.map((w, i) => {
          const s = spring({ frame: f - 14 - i * WORDS_STEP, fps, config: { damping: 11, stiffness: 150 } });
          return (
            <div
              key={w}
              style={{
                fontFamily: frank,
                fontWeight: 900,
                fontSize: 104,
                color: C.brownDark,
                background: COLORS[i],
                padding: '18px 70px',
                borderRadius: 40,
                boxShadow: '0 16px 40px rgba(120,53,15,0.18)',
                opacity: Math.min(1, s * 1.4),
                transform: `translateX(${(1 - s) * (i % 2 ? -500 : 500)}px) rotate(${(1 - s) * (i % 2 ? -10 : 10)}deg) scale(${0.7 + s * 0.3})`,
              }}
            >
              {w}
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

const Home: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useEnter(0, 15);
  return (
    <AbsoluteFill>
      <Background />
      <Caption text="הכול במסך אחד" sub="מתחילים מהשיעור הראשון וממשיכים הלאה" y={130} />
      <Phone
        src="shots/home.png"
        scrollSrc="shots/home-scroll.png"
        scrollPx={1500}
        scroll={ease(f, 30, 110)}
        style={{ left: PHONE_LEFT, top: PHONE_TOP + (1 - enter) * 900, transform: `rotate(${(1 - enter) * 8}deg)` }}
      />
    </AbsoluteFill>
  );
};

export const SWIPE_AT = 70; // frame (inside the Chumash scene) when the finger swipes
const Chumash: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useEnter(0, 15);
  const zoom = ease(f, 40, 58); // the verse card comes forward
  const fingerX = interpolate(f, [SWIPE_AT - 12, SWIPE_AT + 10], [330, 900], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const fingerIn = ease(f, SWIPE_AT - 20, SWIPE_AT - 12) * (1 - ease(f, SWIPE_AT + 12, SWIPE_AT + 18));
  const cardOut = interpolate(f, [SWIPE_AT - 2, SWIPE_AT + 14], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const check = spring({ frame: f - SWIPE_AT - 10, fps, config: { damping: 9, stiffness: 160 } });
  const cardW = 920;
  const cardH = Math.round((cardW * 420) / 858);
  return (
    <AbsoluteFill>
      <Background />
      <Caption
        text={f < SWIPE_AT - 6 ? 'חומש עם רש״י' : 'מחליקים – ומסמנים'}
        sub={f < SWIPE_AT - 6 ? 'העלייה של היום בפרשת השבוע' : 'וממשיכים בדיוק מאיפה שהפסקתם'}
        delay={f < SWIPE_AT - 6 ? 0 : SWIPE_AT - 6}
        y={130}
      />
      <Phone
        src="shots/chumash.png"
        scrollSrc="shots/chumash-scroll.png"
        scrollPx={900}
        scroll={ease(f, 10, 45) * 0.55}
        style={{
          left: PHONE_LEFT,
          top: PHONE_TOP + (1 - enter) * 900,
          filter: `blur(${zoom * 6}px) brightness(${1 - zoom * 0.25})`,
        }}
      />
      {/* the verse card, large */}
      {zoom > 0 && (
        <div
          style={{
            position: 'absolute',
            left: (1080 - cardW) / 2,
            top: 980,
            width: cardW,
            height: cardH,
            opacity: zoom * (1 - cardOut),
            transform: `translateX(${cardOut * 1150}px) rotate(${cardOut * 10}deg) scale(${0.7 + zoom * 0.3})`,
            boxShadow: '0 40px 90px rgba(69,26,3,0.35)',
            borderRadius: 34,
            overflow: 'hidden',
          }}
        >
          <Img src={staticFile('shots/verse-card.png')} style={{ width: cardW, height: cardH }} />
        </div>
      )}
      {/* finger */}
      {fingerIn > 0 && (
        <div
          style={{
            position: 'absolute',
            left: fingerX,
            top: 1180,
            width: 110,
            height: 110,
            borderRadius: 55,
            background: 'rgba(255,255,255,0.85)',
            border: '5px solid rgba(120,53,15,0.35)',
            boxShadow: '0 12px 30px rgba(0,0,0,0.25)',
            opacity: fingerIn,
          }}
        />
      )}
      {/* check */}
      {check > 0.01 && (
        <AbsoluteFill style={{ alignItems: 'center', top: 1010 }}>
          <div
            style={{
              width: 300,
              height: 300,
              borderRadius: 150,
              background: C.green,
              color: '#fff',
              fontSize: 190,
              fontWeight: 900,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${check})`,
              boxShadow: '0 30px 70px rgba(5,150,105,0.45)',
              fontFamily: assistant,
            }}
          >
            ✓
          </div>
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};

const TehillimRambam: React.FC = () => {
  const f = useCurrentFrame();
  const a = useEnter(0, 14);
  const b = useEnter(8, 14);
  const small = 0.74;
  return (
    <AbsoluteFill>
      <Background />
      <Caption text="תהילים ורמב״ם יומי" sub="ג׳ פרקים · פרק אחד · ספר המצוות" y={130} />
      <Phone
        src="shots/tehillim.png"
        scrollSrc="shots/tehillim-scroll.png"
        scrollPx={1200}
        scroll={ease(f, 15, 110)}
        style={{
          left: 560,
          top: 560,
          transform: `scale(${small}) rotate(${6 + (1 - a) * 20}deg) translateX(${(1 - a) * 900}px)`,
          transformOrigin: 'top left',
        }}
      />
      <Phone
        src="shots/rambam.png"
        scrollSrc="shots/rambam-scroll.png"
        scrollPx={1200}
        scroll={ease(f, 20, 115)}
        style={{
          left: 40,
          top: 640,
          transform: `scale(${small}) rotate(${-6 - (1 - b) * 20}deg) translateX(${-(1 - b) * 900}px)`,
          transformOrigin: 'top left',
        }}
      />
    </AbsoluteFill>
  );
};

const Zmanim: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useEnter(0, 15);
  // highlight sliding over the times (sof zman kriat shema row)
  const hl = ease(f, 30, 45);
  return (
    <AbsoluteFill>
      <Background />
      <Caption text="זמני היום" sub="לפי שיטת אדמו״ר הזקן · לכל עיר בעולם" y={130} />
      <Phone src="shots/zmanim.png" style={{ left: PHONE_LEFT, top: PHONE_TOP + (1 - enter) * 900, transform: `scale(${1 + ease(f, 30, 90) * 0.04})` }}>
        <div
          style={{
            position: 'absolute',
            left: 22,
            right: 22,
            top: 530,
            height: 58,
            borderRadius: 14,
            border: `4px solid ${C.amber}`,
            background: 'rgba(251,191,36,0.18)',
            opacity: hl,
            transform: `scaleX(${0.6 + hl * 0.4})`,
          }}
        />
      </Phone>
    </AbsoluteFill>
  );
};

export const NOTIFY_AT = 40;
const Reminders: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const enter = useEnter(0, 15);
  const n = spring({ frame: f - NOTIFY_AT, fps, config: { damping: 12, stiffness: 120 } });
  return (
    <AbsoluteFill>
      <Background />
      <Caption text="תזכורת בזמן שלך" sub="שיעורים · קריאת שמע · ערב שבת וחג" y={130} />
      <Phone src="shots/reminders.png" style={{ left: PHONE_LEFT, top: PHONE_TOP + (1 - enter) * 900 }} />
      {/* notification */}
      <div
        style={{
          position: 'absolute',
          left: 90,
          right: 90,
          top: 560 + (n - 1) * 400,
          opacity: n,
          background: 'rgba(255,255,255,0.97)',
          borderRadius: 40,
          padding: '30px 36px',
          display: 'flex',
          gap: 26,
          alignItems: 'center',
          direction: 'rtl',
          boxShadow: '0 30px 80px rgba(0,0,0,0.25)',
        }}
      >
        <AppIcon size={110} style={{ boxShadow: 'none', borderRadius: 26 }} />
        <div style={{ fontFamily: assistant }}>
          <div style={{ fontWeight: 800, fontSize: 40, color: C.ink }}>חת״ת יומי · עכשיו</div>
          <div style={{ fontWeight: 600, fontSize: 38, color: '#57534e', marginTop: 6 }}>הגיע הזמן ללמוד חומש עם רש״י של היום</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Compass: React.FC = () => {
  const f = useCurrentFrame();
  const enter = useEnter(0, 15);
  const pulse = (f % 30) / 30;
  return (
    <AbsoluteFill>
      <Background />
      <Caption text="מצפן לתפילה" sub="הכיוון המדויק לירושלים" y={130} />
      <Phone src="shots/compass.png" style={{ left: PHONE_LEFT, top: PHONE_TOP + (1 - enter) * 900, transform: `rotate(${Math.sin(f / 12) * 3 * (1 - ease(f, 20, 60))}deg)` }}>
        <div
          style={{
            position: 'absolute',
            left: SCREEN_W / 2 - 160,
            top: 330,
            width: 320,
            height: 320,
            borderRadius: '50%',
            border: `6px solid ${C.green}`,
            opacity: (1 - pulse) * ease(f, 15, 25),
            transform: `scale(${0.6 + pulse * 0.8})`,
          }}
        />
      </Phone>
    </AbsoluteFill>
  );
};

const Languages: React.FC = () => {
  const f = useCurrentFrame();
  const items = [
    { src: 'shots/home-en.png', r: -12, x: -260 },
    { src: 'shots/home-dark.png', r: 0, x: 0 },
    { src: 'shots/home-fr.png', r: 12, x: 260 },
  ];
  const fan = ease(f, 8, 34);
  return (
    <AbsoluteFill>
      <Background />
      <Caption text="עברית · English · Français" sub="ומצב כהה ללימוד בלילה" y={130} size={80} />
      {items.map((it, i) => (
        <Phone
          key={i}
          src={it.src}
          style={{
            left: PHONE_LEFT,
            top: 640,
            transform: `translateX(${it.x * fan}px) rotate(${it.r * fan}deg) scale(0.72)`,
            transformOrigin: '50% 100%',
            zIndex: i === 1 ? 2 : 1,
            opacity: ease(f, 0, 10),
          }}
        />
      ))}
    </AbsoluteFill>
  );
};

const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const icon = spring({ frame: f - 2, fps, config: { damping: 10 } });
  const t = spring({ frame: f - 12, fps, config: { damping: 14 } });
  const pills = ['חינם', 'בלי פרסומות', 'עובד גם בלי אינטרנט'];
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill style={{ alignItems: 'center', top: 380, direction: 'rtl' }}>
        <AppIcon size={260} style={{ transform: `scale(${icon})` }} />
        <div style={{ fontFamily: frank, fontWeight: 900, fontSize: 170, color: C.brown, marginTop: 60, opacity: t, transform: `translateY(${(1 - t) * 60}px)` }}>
          חִתַּ״ת יומי
        </div>
        <div style={{ display: 'flex', gap: 22, marginTop: 50 }}>
          {pills.map((p, i) => {
            const s = spring({ frame: f - 26 - i * 6, fps, config: { damping: 12 } });
            return (
              <div
                key={p}
                style={{
                  fontFamily: assistant,
                  fontWeight: 800,
                  fontSize: 40,
                  color: C.brownDark,
                  background: '#fde68a',
                  padding: '14px 30px',
                  borderRadius: 999,
                  transform: `scale(${s})`,
                }}
              >
                {p}
              </div>
            );
          })}
        </div>
        <div
          style={{
            marginTop: 90,
            fontFamily: assistant,
            fontWeight: 800,
            fontSize: 54,
            color: '#fff',
            background: C.brownDark,
            padding: '26px 60px',
            borderRadius: 999,
            boxShadow: '0 20px 50px rgba(69,26,3,0.4)',
            opacity: ease(f, 45, 58),
            transform: `translateY(${(1 - ease(f, 45, 58)) * 40}px)`,
          }}
        >
          זמין עכשיו ב־{'⁦'}Google Play{'⁩'}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------- Timeline ----------------

const SCENES: { C: React.FC; d: number }[] = [
  { C: Intro, d: 80 },
  { C: Words, d: 100 },
  { C: Home, d: 120 },
  { C: Chumash, d: 150 },
  { C: TehillimRambam, d: 120 },
  { C: Zmanim, d: 100 },
  { C: Reminders, d: 110 },
  { C: Compass, d: 90 },
  { C: Languages, d: 100 },
  { C: Outro, d: 110 },
];
const TRANSITIONS = [fade(), slide({ direction: 'from-left' }), slide({ direction: 'from-left' }), wipe({ direction: 'from-left' }), slide({ direction: 'from-left' }), slide({ direction: 'from-left' }), slide({ direction: 'from-left' }), wipe({ direction: 'from-left' }), fade()];

export const STARTS = SCENES.reduce<number[]>((acc, s, i) => [...acc, i === 0 ? 0 : acc[i - 1] + SCENES[i - 1].d - T], []);
export const TOTAL_FRAMES = STARTS[STARTS.length - 1] + SCENES[SCENES.length - 1].d;

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 1 }) => (
  <Sequence from={Math.max(0, Math.round(at))} layout="none">
    <Audio src={staticFile(`audio/${src}`)} volume={volume} />
  </Sequence>
);

export const Promo: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: C.cream }}>
      <TransitionSeries>
        {SCENES.map((s, i) => (
          <React.Fragment key={i}>
            <TransitionSeries.Sequence durationInFrames={s.d}>
              <s.C />
            </TransitionSeries.Sequence>
            {i < SCENES.length - 1 && <TransitionSeries.Transition presentation={TRANSITIONS[i] as any} timing={linearTiming({ durationInFrames: T })} />}
          </React.Fragment>
        ))}
      </TransitionSeries>

      {/* Music */}
      <Audio
        src={staticFile('audio/music.wav')}
        volume={(f) => interpolate(f, [0, 20, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 0.55, 0.55, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
      {/* Sound effects */}
      <Sfx at={2} src="rise.wav" volume={0.8} />
      {STARTS.slice(1).map((s, i) => (
        <Sfx key={i} at={s - 4} src="whoosh.wav" volume={0.45} />
      ))}
      {LESSONS.map((_, i) => (
        <Sfx key={`p${i}`} at={STARTS[1] + 14 + i * WORDS_STEP} src="pop.wav" volume={0.5} />
      ))}
      <Sfx at={STARTS[3] + SWIPE_AT - 4} src="swipe.wav" volume={0.7} />
      <Sfx at={STARTS[3] + SWIPE_AT + 10} src="ding.wav" volume={0.7} />
      <Sfx at={STARTS[6] + NOTIFY_AT} src="notify.wav" volume={0.7} />
      <Sfx at={STARTS[9] + 2} src="rise.wav" volume={0.8} />
      <Sfx at={STARTS[9] + 46} src="ding.wav" volume={0.5} />
    </AbsoluteFill>
  );
};
