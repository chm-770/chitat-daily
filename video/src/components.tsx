import React from 'react';
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig, Easing } from 'remotion';
import { C, assistant, frank } from './theme';

/** Warm parchment background with slowly moving golden light. */
export const Background: React.FC<{ dark?: boolean }> = ({ dark }) => {
  const f = useCurrentFrame();
  const blob = (x: number, y: number, r: number, color: string, speed: number, phase: number) => (
    <div
      style={{
        position: 'absolute',
        left: x + Math.sin(f / speed + phase) * 90,
        top: y + Math.cos(f / (speed * 1.3) + phase) * 110,
        width: r,
        height: r,
        borderRadius: '50%',
        background: color,
        filter: 'blur(90px)',
        opacity: 0.55,
      }}
    />
  );
  return (
    <AbsoluteFill
      style={{
        background: dark
          ? 'linear-gradient(160deg, #1c1917 0%, #292524 55%, #451a03 100%)'
          : `linear-gradient(160deg, ${C.cream} 0%, ${C.parchment} 50%, #f1dcb2 100%)`,
        overflow: 'hidden',
      }}
    >
      {blob(-150, 200, 700, dark ? '#78350f' : '#fcd34d', 70, 0)}
      {blob(600, 1100, 800, dark ? '#92400e' : '#fdba74', 85, 2)}
      {blob(200, 1600, 600, dark ? '#b45309' : '#fde68a', 60, 4)}
    </AbsoluteFill>
  );
};

/** Text that rises word by word (right to left). */
export const Caption: React.FC<{ text: string; sub?: string; delay?: number; y?: number; size?: number; color?: string }> = ({
  text,
  sub,
  delay = 0,
  y = 150,
  size = 92,
  color = C.ink,
}) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = text.split(' ');
  return (
    <div style={{ position: 'absolute', top: y, left: 60, right: 60, textAlign: 'center', direction: 'rtl' }}>
      <div style={{ fontFamily: frank, fontWeight: 900, fontSize: size, lineHeight: 1.12, color }}>
        {words.map((w, i) => {
          const s = spring({ frame: f - delay - i * 4, fps, config: { damping: 14, stiffness: 140 } });
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                margin: '0 12px',
                opacity: s,
                transform: `translateY(${(1 - s) * 60}px) scale(${0.8 + s * 0.2})`,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      {sub && (
        <div
          style={{
            fontFamily: assistant,
            fontWeight: 700,
            fontSize: 44,
            color: C.amber,
            marginTop: 22,
            opacity: interpolate(f - delay - words.length * 4 - 6, [0, 12], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            transform: `translateY(${interpolate(f - delay - words.length * 4 - 6, [0, 12], [20, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}px)`,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
};

export const PHONE_W = 640;
export const SCREEN_W = 600;
export const SCREEN_H = Math.round((SCREEN_W * 2340) / 1080);

/**
 * Phone with an app screen. `scroll` (0..1 of `scrollPx`) scrolls a tall screenshot under a fixed header.
 */
export const Phone: React.FC<{
  src: string;
  scrollSrc?: string;
  scrollPx?: number;
  scroll?: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}> = ({ src, scrollSrc, scrollPx = 0, scroll = 0, style, children }) => {
  const headerH = Math.round((SCREEN_W * 324) / 1080);
  return (
    <div
      style={{
        position: 'absolute',
        width: PHONE_W,
        height: SCREEN_H + 40,
        borderRadius: 78,
        background: '#1c1917',
        padding: 20,
        boxSizing: 'border-box',
        boxShadow: '0 50px 110px rgba(69, 26, 3, 0.45), inset 0 0 0 3px #44403c',
        ...style,
      }}
    >
      <div style={{ width: SCREEN_W, height: SCREEN_H, borderRadius: 60, overflow: 'hidden', position: 'relative', background: '#fff' }}>
        {scrollSrc ? (
          <>
            <Img src={staticFile(scrollSrc)} style={{ position: 'absolute', top: -scroll * scrollPx, left: 0, width: SCREEN_W }} />
            <Img src={staticFile('shots/header.png')} style={{ position: 'absolute', top: 0, left: 0, width: SCREEN_W, height: headerH }} />
          </>
        ) : (
          <Img src={staticFile(src)} style={{ width: SCREEN_W, height: SCREEN_H }} />
        )}
        {children}
      </div>
      {/* camera notch */}
      <div style={{ position: 'absolute', top: 34, left: PHONE_W / 2 - 14, width: 28, height: 28, borderRadius: 14, background: '#0c0a09' }} />
    </div>
  );
};

/** Enter animation: rise and fade in with a spring. */
export const useEnter = (delay = 0, damping = 16) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: f - delay, fps, config: { damping, stiffness: 110 } });
};

export const ease = (f: number, a: number, b: number, from = 0, to = 1) =>
  interpolate(f, [a, b], [from, to], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic) });

export const AppIcon: React.FC<{ size: number; style?: React.CSSProperties }> = ({ size, style }) => (
  <Img
    src={staticFile('icon.png')}
    style={{ width: size, height: size, borderRadius: size * 0.22, boxShadow: '0 24px 60px rgba(120, 53, 15, 0.35)', ...style }}
  />
);
