"""Generates the original music and sound effects of the promo video (no outside material)."""
import numpy as np, wave, os
SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'audio')

def save(name, x):
    x = np.clip(x, -1, 1)
    if x.ndim == 1: x = np.stack([x, x], 1)
    with wave.open(os.path.join(OUT, name), 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())

def t(d): return np.arange(int(SR * d)) / SR
def env(n, a=0.01, r=0.3):
    e = np.ones(n); ai = min(int(SR * a), n // 2); ri = min(int(SR * r), n - ai)
    e[:ai] = np.linspace(0, 1, ai) if ai else 1
    if ri: e[-ri:] *= np.linspace(1, 0, ri)
    return e
def note(f, d, amp=0.2, decay=3.0, harm=(1, .5, .25)):
    tt = t(d); s = sum(h * np.sin(2*np.pi*f*(k+1)*tt) for k, h in enumerate(harm))
    return amp * s * np.exp(-decay*tt) * env(len(tt), 0.005, 0.05)
def pad(freqs, d, amp=0.06):
    tt = t(d); s = np.zeros_like(tt)
    for f in freqs:
        for det in (-0.6, 0.6):
            s += np.sin(2*np.pi*(f+det)*tt) + 0.3*np.sin(2*np.pi*2*(f+det)*tt)
    return amp * s / len(freqs) * env(len(tt), 0.8, 1.2)
def lowpass(x, k=8):
    return np.convolve(x, np.ones(k)/k, mode='same')
def reverb(x, delays=(0.07, 0.13, 0.21, 0.31), g=0.35):
    y = x.copy()
    for i, dl in enumerate(delays):
        n = int(SR*dl); y[n:] += x[:-n] * g * (0.75**i)
    return y

hz = lambda m: 440 * 2 ** ((m - 69) / 12)
# --- Music: 36 s, warm and hopeful, 96 bpm (D major: D – Bm – G – A)
BPM = 96; beat = 60 / BPM; L = 36.0
music = np.zeros(int(SR * L))
chords = [[62, 66, 69], [59, 62, 66], [55, 59, 62], [57, 61, 64]]  # D, Bm, G, A
bar = beat * 4
pos = 0.0; i = 0
while pos < L - 0.1:
    ch = chords[i % 4]
    seg = pad([hz(m) for m in ch] + [hz(ch[0]-12)], min(bar*1.05, L-pos), 0.07)
    s = int(pos*SR); music[s:s+len(seg)] += seg[:len(music)-s]
    # arpeggio (eighth notes) from 4 s
    if pos >= 3.5:
        arp = [ch[0]+12, ch[1]+12, ch[2]+12, ch[1]+12, ch[0]+24, ch[2]+12, ch[1]+12, ch[2]+12]
        for k, m in enumerate(arp):
            st = pos + k*beat/2
            if st >= L: break
            n = note(hz(m), 0.6, 0.075, 5.0)
            a = int(st*SR); music[a:a+len(n)] += n[:len(music)-a]
    # soft bass + kick from 6 s
    if pos >= 6:
        for k in range(4):
            st = pos + k*beat
            if st >= L: break
            b = note(hz(ch[0]-24), beat*0.9, 0.16, 2.5, (1, .2)); a = int(st*SR); music[a:a+len(b)] += b[:len(music)-a]
            kt = t(0.18); kick = 0.35*np.sin(2*np.pi*(50+80*np.exp(-30*kt))*kt)*np.exp(-18*kt)
            music[a:a+len(kick)] += kick[:len(music)-a]
    pos += bar; i += 1
music = reverb(music)
music *= env(len(music), 1.5, 3.0)
music /= np.max(np.abs(music)) / 0.6
save('music.wav', music)

# --- Effects
rng = np.random.default_rng(7)
d = 0.55; tt = t(d); noise = rng.standard_normal(len(tt))
sweep = np.sin(np.pi*tt/d) ** 2
whoosh = lowpass(noise, 6) * sweep * 0.35
save('whoosh.wav', reverb(whoosh, (0.05, 0.09), 0.25))

pop = note(hz(81), 0.18, 0.5, 25, (1, .3)) + note(hz(88), 0.18, 0.2, 30, (1,))
save('pop.wav', pop)

ding = np.zeros(int(SR*1.2))
for k, m in enumerate([79, 86]):
    n = note(hz(m), 1.0, 0.35, 4.0, (1, .4, .15)); a = int(k*0.09*SR); ding[a:a+len(n)] += n
save('ding.wav', reverb(ding))

d = 0.35; tt = t(d); sw = lowpass(rng.standard_normal(len(tt)), 3) * np.exp(-8*tt) * np.sin(np.pi*tt/d) * 0.4
save('swipe.wav', sw)

notif = np.zeros(int(SR*1.0))
for k, m in enumerate([76, 81, 85]):
    n = note(hz(m), 0.6, 0.3, 6.0, (1, .3)); a = int(k*0.08*SR); notif[a:a+len(n)] += n
save('notify.wav', reverb(notif))

rise = t(1.2); shimmer = sum(np.sin(2*np.pi*hz(74+s)*rise) for s in (0, 7, 12, 19)) * 0.06 * (rise/1.2)**2
save('rise.wav', reverb(shimmer))
print('ok')

# ================= Upbeat track for the one-minute video =================
BPM2 = 116; b2 = 60 / BPM2; L2 = 64.0
m2 = np.zeros(int(SR * L2))
def add(x, at):
    a = int(at * SR)
    if a >= len(m2): return
    m2[a:a+len(x)] += x[:len(m2)-a]
prog = [[62, 66, 69, 73], [59, 62, 66, 69], [55, 59, 62, 66], [57, 61, 64, 67]]  # Dmaj7 Bm7 Gmaj7 A7
bar2 = b2 * 4
k = 0; pos = 0.0
hat_t = t(0.05)
while pos < L2:
    ch = prog[k % 4]
    add(pad([hz(m) for m in ch[:3]], bar2 * 1.02, 0.05), pos)
    intro = pos < bar2 * 2          # first two bars: pads + plucks only
    for s in range(8):              # eighth-note plucks
        st = pos + s * b2 / 2
        m = [ch[0]+12, ch[2]+12, ch[1]+12, ch[3]+12, ch[0]+24, ch[3]+12, ch[2]+12, ch[1]+12][s]
        add(note(hz(m), 0.35, 0.06, 9.0), st)
    if not intro:
        for s in range(4):
            st = pos + s * b2
            kt = t(0.22); add(0.5*np.sin(2*np.pi*(45+90*np.exp(-28*kt))*kt)*np.exp(-14*kt), st)       # kick
            add(note(hz(ch[0]-24), b2*0.45, 0.17, 4.0, (1, .35)), st)                               # bass
            add(note(hz(ch[0]-24), b2*0.4, 0.12, 5.0, (1, .35)), st + b2/2)
            if s in (1, 3):                                                                       # clap
                ct = t(0.18); add(lowpass(rng.standard_normal(len(ct)), 2) * np.exp(-20*ct) * 0.22, st)
            for h in (0, 0.5):                                                                    # hats
                add(np.diff(np.concatenate([[0], rng.standard_normal(len(hat_t))])) * np.exp(-60*hat_t) * 0.05, st + h*b2)
    pos += bar2; k += 1
m2 = reverb(m2, (0.05, 0.11, 0.17), 0.25)
m2 *= env(len(m2), 0.6, 2.5)
m2 /= np.max(np.abs(m2)) / 0.9
save('music2.wav', m2)

tap = note(hz(96), 0.08, 0.45, 60, (1, .2))
clk = lowpass(rng.standard_normal(int(SR*0.012)), 2) * 0.3
tap[:len(clk)] += clk
save('tap.wav', tap)
ty = np.zeros(int(SR*0.06)); ty[:int(SR*0.01)] = rng.standard_normal(int(SR*0.01)) * 0.25
save('type.wav', lowpass(ty, 3))
print('ok2')
