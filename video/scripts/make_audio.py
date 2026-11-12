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
