#!/usr/bin/env python3
# make_audio.py: builds the AIMA video's soundtrack (assets/audio/aima_soundtrack.m4a) from scratch, in sync with
# src/scenes/aima_creator.js: synthesized music on the video's beat (120 bpm, beat 1 at 0 s), synthesized sound
# effects on the on-screen events, and the Vietnamese voice-over clips in assets/audio/vo/ (see make_vo.sh).
# Needs numpy and ffmpeg. Run from the repo root:  python3 tools/make_audio.py
#
# Every time below is VIDEO time in seconds. The story's room clock starts PRE = 2 s in (S(rt) converts), the morning
# with AIMA starts at V_AIMA (A(a) converts). Change a time in the scene, change it here too.
import os, subprocess, wave
import numpy as np

SR, DUR = 48000, 55.0
N = int(SR * DUR)
PRE, V_PITCH, V_AIMA, V_END = 2.0, 26.3, 31.3, 49.9
S = lambda rt: rt + PRE                 # story time → video time
A = lambda a: a + V_AIMA                # time in the morning-with-AIMA shot → video time
BEAT, BAR = .5, 2.0
rng = np.random.default_rng(7)
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
VO_DIR = os.path.join(ROOT, 'assets/audio/vo')
OUT = os.path.join(ROOT, 'assets/audio/aima_soundtrack.m4a')

music, sfx, vo = np.zeros((N, 2)), np.zeros((N, 2)), np.zeros(N)
TAU = 2 * np.pi


def add(buf, t, sig, gain=1., pan=0.):
    i = int(round(t * SR))
    if i >= len(buf) or i + len(sig) <= 0: return
    if i < 0: sig, i = sig[-i:], 0
    n = min(len(sig), len(buf) - i)
    if buf.ndim == 1: buf[i:i + n] += sig[:n] * gain; return
    l, r = np.cos((pan + 1) * np.pi / 4) * np.sqrt(2), np.sin((pan + 1) * np.pi / 4) * np.sqrt(2)
    buf[i:i + n, 0] += sig[:n] * gain * l
    buf[i:i + n, 1] += sig[:n] * gain * r


def tt(d): return np.arange(int(d * SR)) / SR
def noise(d): return rng.uniform(-1, 1, int(d * SR))
def hz(note):                                   # 'A4' → 440
    names = {'C': -9, 'D': -7, 'E': -5, 'F': -4, 'G': -2, 'A': 0, 'B': 2}
    n = names[note[0]] + (1 if '#' in note else -1 if note[1] == 'b' else 0)
    return 440 * 2 ** ((n + 12 * (int(note[-1]) - 4)) / 12)


def lowpass(x, fc, taps=129):                   # windowed-sinc FIR
    k = np.arange(taps) - (taps - 1) / 2
    h = np.sinc(2 * fc / SR * k) * np.hamming(taps); h /= h.sum()
    return np.convolve(x, h, mode='same')
def highpass(x, fc, taps=129): return x - lowpass(x, fc, taps)
def band(x, lo, hi, taps=129): return lowpass(x, hi, taps) - lowpass(x, lo, taps)
def fade(sig, a=.004, r=.02):
    n, na, nr = len(sig), max(1, int(a * SR)), max(1, int(r * SR))
    e = np.ones(n); e[:na] = np.linspace(0, 1, min(na, n))[:n] if na <= n else 1; e[-nr:] *= np.linspace(1, 0, min(nr, n))
    return sig * e


# ---------- instruments ----------
def ep(f, d, vel=1.):                           # electric-piano-ish: a few decaying partials, a touch of tremolo
    t = tt(d)
    s = sum(a * np.sin(TAU * f * h * t) * np.exp(-t * dk) for h, a, dk in [(1, 1, 2.2), (2, .35, 4), (3, .12, 7), (4, .05, 10)])
    return fade(s * (1 + .08 * np.sin(TAU * 4.5 * t)) * vel * .3, .006, .08)
def pad(fs, d, cut=1400, vel=1.):               # detuned saws, filtered, slow attack and release
    t = tt(d); s = np.zeros(len(t))
    for f in fs:
        for dt in (-.006, 0, .007): s += 2 * ((t * f * (1 + dt)) % 1) - 1
    s = lowpass(s / (3 * len(fs)), cut)
    e = np.minimum(1, t / .35) * np.minimum(1, (d - t) / .5)
    return s * e * vel * .5
def bass(f, d, vel=1.):
    t = tt(d)
    s = np.sin(TAU * f * t) + .25 * np.sin(TAU * 2 * f * t) + .08 * np.sin(TAU * 3 * f * t)
    return fade(s * np.exp(-t * 2.5) * vel * .55, .005, .06)
def pluck(f, d=.45, vel=1.):
    t = tt(d)
    s = np.sin(TAU * f * t) * np.exp(-t * 7) + .4 * np.sin(TAU * 2 * f * t) * np.exp(-t * 11) + .15 * np.sin(TAU * 3 * f * t) * np.exp(-t * 16)
    return fade(s * vel * .28, .002, .05)
def kick(vel=1.):
    t = tt(.4); f = 48 + 110 * np.exp(-t * 28)
    return np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t * 8) * vel * .9
def snare(vel=1.):
    t = tt(.25)
    return (band(noise(.25), 1200, 6000) * np.exp(-t * 20) * .7 + np.sin(TAU * 190 * t) * np.exp(-t * 25) * .4) * vel * .55
def clap(vel=1.):
    t = tt(.3); e = np.zeros(len(t))
    for o in (0, .011, .022): e += (t >= o) * np.exp(-np.maximum(0, t - o) * 90)
    e += (t >= .03) * np.exp(-np.maximum(0, t - .03) * 14) * .5
    return band(noise(.3), 900, 3500) * e * vel * .5
def hat(vel=1., d=.06):
    t = tt(d)
    return highpass(noise(d), 7000, 63) * np.exp(-t * 70) * vel * .35


# ---------- sound effects ----------
def pop(f=600, vel=1.):
    t = tt(.09); fr = f * (.6 + .9 * np.minimum(1, t / .05))
    return fade(np.sin(TAU * np.cumsum(fr) / SR) * np.exp(-t * 38) * vel * .5, .001, .02)
def click(vel=1.):
    t = tt(.012)
    return highpass(noise(.012), 2500, 31) * np.exp(-t * 400) * vel * .6
def whoosh(d=.5, vel=1., rise=True):
    t = tt(d); x = t / d; n = noise(d)
    lo, hi = lowpass(n, 700), band(n, 900, 5000)
    m = x if rise else 1 - x
    return (lo * (1 - m) + hi * m) * np.sin(np.pi * x) ** 1.5 * vel * .9
def tick(vel=1., f=2600):
    t = tt(.03)
    return fade((np.sin(TAU * f * t) * .6 + highpass(noise(.03), 3000, 31) * .5) * np.exp(-t * 160) * vel * .6, .0005, .005)
def bell(f, d=1.2, vel=1., dec=3.):
    t = tt(d)
    s = sum(a * np.sin(TAU * f * h * t) * np.exp(-t * dec * (1 + h * .4)) for h, a in [(1, 1), (2.0, .45), (2.76, .35), (5.4, .2), (8.9, .08)])
    return fade(s * vel * .3, .001, .05)
def boing(f0=260, d=.55, vel=1.):
    t = tt(d); f = f0 * (1 + .45 * np.sin(TAU * 13 * t) * np.exp(-t * 4)) * (1 - .25 * t / d)
    return fade(np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t * 3.5) * vel * .45, .003, .05)
def slide(f0=1400, f1=280, d=.45, vel=1.):
    t = tt(d); f = f0 * (f1 / f0) ** (t / d) * (1 + .015 * np.sin(TAU * 7 * t))
    return fade(np.sin(TAU * np.cumsum(f) / SR) * vel * .3, .01, .06)
def scratch(vel=1.):
    t = tt(.4); f = 900 * np.exp(-t * 6) + 150
    s = band(noise(.4), 400, 3000) * np.abs(np.sin(TAU * 7 * t)) + .5 * np.sin(TAU * np.cumsum(f) / SR) * np.exp(-t * 4)
    return fade(s * vel * .5, .002, .05)
def thunk(vel=1.):
    t = tt(.25)
    return (np.sin(TAU * 85 * t) * np.exp(-t * 22) + lowpass(noise(.25), 500) * np.exp(-t * 30) * .8) * vel * .7
def clang(vel=1.): return bell(780, .5, vel * .8, dec=9)
def thud(vel=1.):
    t = tt(.15)
    return np.sin(TAU * 120 * t) * np.exp(-t * 35) * vel * .6
def hiss(d=.6, vel=1.):
    t = tt(d)
    return highpass(noise(d), 3500, 63) * np.sin(np.pi * t / d) * vel * .35
def sparkle(vel=1., n=6):
    out = np.zeros(int(.9 * SR))
    for i in range(n):
        b = bell(rng.uniform(2200, 4800), .5, .5, dec=10); o = int(i * .05 * SR); out[o:o + len(b)] += b[:len(out) - o]
    return out * vel
def riser(d=1.4, vel=1.):
    t = tt(d); x = t / d; n = noise(d)
    s = (lowpass(n, 600) * (1 - x) + band(n, 1500, 7000) * x) * x ** 2 * .7
    s += np.sin(TAU * np.cumsum(150 * 8 ** x) / SR) * x ** 2 * .25
    return fade(s * vel, .05, .01)
def impact(vel=1.):
    t = tt(1.2)
    s = np.sin(TAU * np.cumsum(40 + 60 * np.exp(-t * 15)) / SR) * np.exp(-t * 3) * .9 + lowpass(noise(1.2), 3000) * np.exp(-t * 6) * .4
    return s * vel
def rustle(vel=1.):
    out = np.zeros(int(.3 * SR))
    for i in range(7):
        d = rng.uniform(.02, .05); b = band(noise(d), 1800, 6500, 63) * np.hanning(int(d * SR)); o = int(rng.uniform(0, .24) * SR); out[o:o + len(b)] += b[:len(out) - o]
    return out * vel * .5
def blip(vel=1.):
    a, b = bell(880, .25, .6, 12), bell(1320, .35, .6, 10)
    out = np.zeros(len(a) + int(.07 * SR)); out[:len(a)] += a; out[int(.07 * SR):int(.07 * SR) + len(b)] += b[:len(out) - int(.07 * SR)]
    return out * vel
def chime(vel=1.):                              # success: two notes up
    out = np.zeros(int(1.4 * SR)); a, b = bell(hz('E6'), 1, .7), bell(hz('B6'), 1.2, .7)
    out[:len(a)] += a; o = int(.09 * SR); out[o:o + len(b)] += b[:len(out) - o]
    return out * vel
def typing(t0, t1, rate=14, vel=.5):
    t = t0
    while t < t1:
        add(sfx, t, click(vel * rng.uniform(.6, 1.1)), pan=.25 + rng.uniform(-.1, .1)); t += rng.uniform(.6, 1.4) / rate


# ---------- music ----------
LOFI = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']]
LOFI_B = ['F2', 'E2', 'D2', 'C2']
BRIGHT = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']]
BRIGHT_B = ['C2', 'G2', 'A2', 'F2']

def bars(t0, t1):
    b = int(np.ceil(t0 / BAR - 1e-6))
    while b * BAR < t1 - 1e-6: yield b, b * BAR; b += 1

def lofi_section(t0, t1, drums=True, vel=1.):
    for b, tb in bars(t0, t1):
        ch, rt = LOFI[b % 4], LOFI_B[b % 4]
        for k, n in enumerate(ch): add(music, tb + k * .012, ep(hz(n), 1.9, .8 * vel), pan=-.3 + k * .2)
        add(music, tb, bass(hz(rt), .9, vel)); add(music, tb + 1.25, bass(hz(rt), .7, .7 * vel))
        if drums:
            for e in range(8):
                te = tb + e * .25
                if e in (0, 3, 4): add(music, te, kick(.85 * vel))
                if e in (2, 6): add(music, te, snare(.7 * vel))
                add(music, te + (.02 if e % 2 else 0), hat((.5 if e % 2 else .8) * vel), pan=.3)

def night_section(t0, t1):
    for b, tb in bars(t0, t1):
        ch = LOFI[b % 4]
        add(music, tb, pad([hz(n) for n in ch], 2.1, cut=900, vel=.9))
        add(music, tb, bass(hz(LOFI_B[b % 4]), 1.6, .6))

def bright_section(t0, t1, full=True):
    for b, tb in bars(t0, t1):
        ch, rt = BRIGHT[b % 4], BRIGHT_B[b % 4]
        add(music, tb, pad([hz(n) for n in ch], 2.1, cut=1800, vel=.7))
        for k, n in enumerate(ch): add(music, tb + k * .01, ep(hz(n), 1.9, .55), pan=-.2 + k * .2)
        add(music, tb, bass(hz(rt), .45)); add(music, tb + .75, bass(hz(rt), .3, .7)); add(music, tb + 1.0, bass(hz(rt), .45, .9)); add(music, tb + 1.5, bass(hz(rt) * 1.5, .4, .7))
        arp = [ch[0], ch[1], ch[2], ch[1], ch[2], ch[0], ch[1], ch[2]]
        for e in range(8):
            te = tb + e * .25
            if full or e % 2 == 0: add(music, te, pluck(hz(arp[e][:-1] + str(int(arp[e][-1]) + 1)), .4, .9 if e % 2 == 0 else .6), pan=.35 * (1 if e % 2 else -1))
            if full:
                if e in (0, 4): add(music, te, kick(.9))
                if e == 7: add(music, te, kick(.5))
                if e in (2, 6): add(music, te, clap(.8))
                for h in (0, .125): add(music, te + h, hat(.45 if h else .7), pan=.3)
            elif e == 0: add(music, te, kick(.6))


lofi_section(0, 2, drums=False, vel=.7)
lofi_section(2, S(15.45))              # the day, up to the second push-in on the clock
night_section(S(15.45), S(19.9))       # night: no drums, sleepy
add(music, S(19.9), pad([hz('F3'), hz('A3'), hz('C4')], .55, 900, .7))
bright_section(V_PITCH, V_AIMA, full=False)
bright_section(V_AIMA, V_END)
add(music, V_END, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4', 'D5']], 5.1, 2200, 1.0))       # the last chord rings out
for k, n in enumerate(['C4', 'E4', 'G4', 'D5']): add(music, V_END + k * .06, ep(hz(n), 4.5, .8), pan=-.3 + k * .2)
add(music, V_END, bass(hz('C2'), 2.5))
# the record stops on the crash zoom: cut the music from there to the AIMA riser
i0, i1 = int(S(20.45) * SR), int((V_PITCH - 1.4) * SR)
music[i0:i0 + 2400] *= np.linspace(1, 0, 2400)[:, None]; music[i0 + 2400:i1] = 0

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                       # iris opens
add(sfx, .75, pop(700, .6))                                         # the hook caption
add(sfx, S(1.88), click(.9), pan=.3); add(sfx, S(1.95), blip(.7), pan=.4)            # key, screen on
for i, ti in enumerate([3.5, 3.8, 4.05, 4.27, 4.46, 4.61, 4.72, 4.81, 4.88, 4.94]):   # tabs popping, faster and higher
    add(sfx, S(ti), pop(500 + i * 70, .8), pan=.4 + .05 * np.sin(i))
add(sfx, S(4.8), boing(240, .7, .9))                                # dizzy
for t0 in (5.4, 15.0):                                              # the two push-ins on the clock: in, ticking flies, out
    add(sfx, S(t0), whoosh(.45, .8))
    for k in range(18): add(sfx, S(t0 + .45 + k * .025), tick(.55, 2400 + 300 * (k % 2)))
    add(sfx, S(t0 + .9), whoosh(.45, .7, rise=False))
for ts in (6.7, 7.0, 7.3): add(sfx, S(ts), whoosh(.18, .35), pan=.4)                  # scrolling
add(sfx, S(7.6), sparkle(.8), pan=.4)                                                 # a hot trend
for i in range(6): add(sfx, S(7.65 + i * .12), pop(900 + i * 60, .35), pan=.4)        # hearts
add(sfx, S(8.42), slide(1300, 260, .45, .9), pan=.4)                                  # ...and it crashes
add(sfx, S(9.4), whoosh(.5, .5, rise=False))                                          # pan to the bin
for i, ti in enumerate([10.4, 10.9, 11.4]):                                           # crumple, throw, land
    add(sfx, S(ti - .4), rustle(.8), pan=-.3)
    add(sfx, S(ti), whoosh(.3, .45), pan=-.5)
    if i == 1: add(sfx, S(ti + .48), clang(.8), pan=-.7); add(sfx, S(ti + .88), thud(.8), pan=-.6)
    else: add(sfx, S(ti + .48), thunk(.8), pan=-.7)
add(sfx, S(11.6), bell(hz('G6'), 1.2, .9))                                            # idea!
add(sfx, S(12.3), whoosh(.3, .7))                                                     # whip back to the desk
add(sfx, S(12.42), pop(650, .5), pan=.4)                                              # the doc opens
typing(S(12.7), S(13.62)); typing(S(13.7), S(14.0), 26, .6); typing(S(14.4), S(15.05), 20)
add(sfx, S(13.8), hiss(.7, .7))                                                       # steaming mad
for i, ti in enumerate([16.5, 16.75, 17.0, 17.25, 17.35]): add(sfx, S(ti), pop(420 + 40 * i, .45), pan=.4)   # clips
add(sfx, S(17.45), riser(.85, .15), pan=.4)                                           # render
add(sfx, S(18.32), chime(.8), pan=.3)                                                 # done ✓
add(sfx, S(19.9), tick(1.2, 2000)); add(sfx, S(19.95), bell(hz('G3'), 3.5, 1.1, dec=.9))   # midnight
add(sfx, S(20.42), whoosh(.18, .9)); add(sfx, S(20.5), scratch(1.0)); add(sfx, S(20.5), boing(330, .5, .6))   # crash zoom, the record stops
add(sfx, S(21.2), pop(520, .7)); add(sfx, S(21.75), pop(640, .6))                     # "Ủa?" "Hết ngày rồi?"
add(sfx, V_PITCH - 1.4, riser(1.4, .8))                                               # into AIMA
add(sfx, V_PITCH - .3, whoosh(.6, .8))                                                # brush wipe
add(sfx, V_PITCH, impact(.6))
add(sfx, V_PITCH + .3, sparkle(.9)); add(sfx, V_PITCH + 2.15, pop(600, .5)); add(sfx, V_PITCH + 2.6, pop(760, .4))
add(sfx, V_AIMA - .5, whoosh(.5, .7))                                                 # the logo swells into the screen
add(sfx, A(1.0), blip(.6), pan=.4)                                                    # the app opens
for b in (1.0, 3.3, 7.2, 10.9): add(sfx, A(b - .1), click(.8), pan=.3)               # a click per tool
for b in (1.0, 3.3, 7.2, 10.9, 13.5): add(sfx, A(b + .1), pop(560, .5))              # the captions
for j in range(4): add(sfx, A(1.0 + .12 + j * .1), pop(700 + j * 80, .35), pan=.45)
add(sfx, A(2.45), bell(hz('E6'), .8, .6), pan=.45)
for j in range(3): add(sfx, A(3.3 + .15 + j * .3), pop(600 + j * 90, .45), pan=.45)
add(sfx, A(3.3 + 2.5), pop(820, .5), pan=.45)
add(sfx, A(7.2 + .7), whoosh(.5, .5), pan=.45)
for i in range(4): add(sfx, A(7.2 + 1.6 + i * .15), bell(hz(['C6', 'E6', 'G6', 'C7'][i]), .6, .45), pan=.45)
for i in range(9): add(sfx, A(10.9 + .2 + i * .09), tick(.35, 1800 + 120 * i), pan=.45)
add(sfx, A(10.9 + 2.1), chime(.6), pan=.45)
add(sfx, A(14.4 - .9), whoosh(.6, .35, rise=False))                                  # pull out
add(sfx, A(15.72), whoosh(.15, .7)); add(sfx, A(15.75), boing(300, .5, .7))          # 9 a.m.?!
add(sfx, A(16.05), pop(520, .7)); add(sfx, A(16.6), pop(640, .6))
add(sfx, V_END - .3, whoosh(.6, .8))
add(sfx, V_END + .3, sparkle(1.0)); add(sfx, V_END + 1.5, pop(600, .5)); add(sfx, V_END + 2.2, pop(760, .4))

# ---------- voice-over ----------
def load_vo(name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(VO_DIR, name + '.wav'), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768
VO = [('c_hook', .45), ('c_research', S(3.35)), ('c_trend', S(7.7)), ('c_trend2', S(9.1)), ('c_idea', S(9.95)), ('c_idea2', S(11.65)),
      ('c_caption', S(13.75)), ('c_edit', S(16.25)), ('c_done', S(18.55)), ('c_punch', S(21.2)),
      ('n_1', 25.25), ('n_2', 28.05), ('n_3', A(1.1)), ('n_4', A(3.4)), ('n_5', A(7.3)), ('n_6', A(11.0)), ('n_7', A(13.65)),
      ('c_morning', A(16.0)), ('n_8', V_END + .55)]
for name, t in VO: add(vo, t, load_vo(name), .95)

# ---------- mix ----------
def reverb(x, wet=.18, length=1.3, damp=4000):
    t = tt(length); ir = lowpass(rng.uniform(-1, 1, len(t)), damp) * np.exp(-t / .3); ir /= np.sqrt((ir ** 2).sum())
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    out = np.stack([np.fft.irfft(np.fft.rfft(x[:, c], n) * np.fft.rfft(ir, n), n)[:len(x)] for c in range(2)], 1)
    return x + wet * out
music, sfx = reverb(music, .22), reverb(sfx, .12)
# duck the music under the voice
act = np.convolve((np.abs(vo) > .02).astype(float), np.ones(int(.05 * SR)), 'same') > 0
duck = 1 - .6 * np.clip(np.convolve(act.astype(float), np.ones(int(.3 * SR)) / int(.3 * SR), 'same'), 0, 1)
mix = music * .32 * duck[:, None] + sfx * .55 + vo[:, None] * 1.0
rms = lambda x, m=None: np.sqrt(np.mean((x if m is None else x[m]) ** 2)) + 1e-12
db = lambda x: 20 * np.log10(x)
print(f'levels while the voice speaks: voice {db(rms(vo, act)):.1f} dB, music {db(rms((music * .32 * duck[:, None]).mean(1), act)):.1f} dB, '
      f'effects {db(rms(sfx.mean(1), act)):.1f} dB; music alone elsewhere {db(rms((music * .32).mean(1), ~act)):.1f} dB')
fo = int(.7 * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]       # fade out with the picture
mix = np.tanh(mix * 1.1) / np.tanh(1.1)                               # soft limit
mix *= .89 / max(1e-9, np.abs(mix).max())

tmp = OUT.replace('.m4a', '.wav')
with wave.open(tmp, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-c:a', 'aac', '-b:a', '192k', OUT], check=True)
os.remove(tmp)
print('wrote', OUT)
