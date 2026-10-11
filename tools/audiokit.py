#!/usr/bin/env python3
# audiokit.py: a small synth for soundtracks, shared by every video's audio/make_audio.py: instruments, sound effects,
# a reverb, the voice-over loader, the final mix, and warp() (the same time warp as src/core.js, so the sound lands on
# the frames the scene draws). Needs numpy and ffmpeg.
#   import sys, os; sys.path.insert(0, os.path.join(ROOT, 'tools')); from audiokit import *
import json, os, subprocess, wave
import numpy as np

SR = 48000
TAU = 2 * np.pi
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
rng = np.random.default_rng(7)


def load_video(vdir):
    """A video's video.js, evaluated by node: returns (PROJECT, TIMING or None)."""
    js = ("const vm = require('vm'), fs = require('fs');"
          "const o = vm.runInNewContext(fs.readFileSync(process.argv[1], 'utf8') + "
          "'\\n;({ PROJECT, TIMING: typeof TIMING === \"undefined\" ? null : TIMING })');"
          "console.log(JSON.stringify(o));")
    o = json.loads(subprocess.run(['node', '-e', js, os.path.join(vdir, 'video.js')], capture_output=True, text=True, check=True).stdout)
    return o['PROJECT'], o['TIMING']


class warp:
    """warp(rates, end, t0): clock time → event time, as in src/core.js. .inv(e): event → clock time; .len."""
    def __init__(self, rates, end, t0=0.):
        self.r = rates; self.K = [(t0, rates[0][0])]
        for i in range(1, len(rates)): self.K.append((self.K[-1][0] + (rates[i][0] - rates[i - 1][0]) / rates[i - 1][1], rates[i][0]))
        self.len = self.inv(end) - t0
    def __call__(self, t):
        i = 0
        while i + 1 < len(self.K) and t >= self.K[i + 1][0]: i += 1
        return self.K[i][1] + (t - self.K[i][0]) * self.r[i][1]
    def inv(self, e):
        i = 0
        while i + 1 < len(self.K) and e >= self.K[i + 1][1]: i += 1
        return self.K[i][0] + (e - self.K[i][1]) / self.r[i][1]


def buffers(dur):
    """Empty (music, sfx, vo) buffers: stereo, stereo, mono."""
    n = int(SR * dur)
    return np.zeros((n, 2)), np.zeros((n, 2)), np.zeros(n)


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
def typing(buf, t0, t1, rate=14, vel=.5):
    t = t0
    while t < t1:
        add(buf, t, click(vel * rng.uniform(.6, 1.1)), pan=.25 + rng.uniform(-.1, .1)); t += rng.uniform(.6, 1.4) / rate



def bars(t0, t1, bar=2.):
    """(index, start time) of every bar that starts in [t0, t1)."""
    b = int(np.ceil(t0 / bar - 1e-6))
    while b * bar < t1 - 1e-6: yield b, b * bar; b += 1


# ---------- voice-over ----------
def load_vo(vdir, name):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', os.path.join(vdir, 'audio/vo', name + '.wav'), '-f', 's16le', '-ac', '1', '-ar', str(SR), '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.int16).astype(float) / 32768


def place_vo(vo, vdir, cues, gap=.25):
    """Adds each (name, t) clip to vo and prints the cue sheet, flagging lines that start less than `gap` s after the last ends."""
    end = -1
    for name, t in sorted(cues, key=lambda c: c[1]):
        clip = load_vo(vdir, name); add(vo, t, clip, .95); d = len(clip) / SR
        warn = '   <-- too close' if t < end + gap else ''
        print(f'  {name:11s} {t:6.2f} → {t + d:6.2f}  ({d:.2f} s, {t - end:+.2f} s after the last){warn}')
        end = t + d


# ---------- mix ----------
def reverb(x, wet=.18, length=1.3, damp=4000):
    t = tt(length); ir = lowpass(rng.uniform(-1, 1, len(t)), damp) * np.exp(-t / .3); ir /= np.sqrt((ir ** 2).sum())
    n = 1 << int(np.ceil(np.log2(len(x) + len(ir))))
    out = np.stack([np.fft.irfft(np.fft.rfft(x[:, c], n) * np.fft.rfft(ir, n), n)[:len(x)] for c in range(2)], 1)
    return x + wet * out


def mixdown(music, sfx, vo, out, music_gain=.32, sfx_gain=.55, fade_out=.7):
    """Reverb, music ducked under the voice, soft limit, -14 LUFS AAC at `out`."""
    music, sfx = reverb(music, .22), reverb(sfx, .12)
    act = np.convolve((np.abs(vo) > .02).astype(float), np.ones(int(.05 * SR)), 'same') > 0
    duck = 1 - .6 * np.clip(np.convolve(act.astype(float), np.ones(int(.3 * SR)) / int(.3 * SR), 'same'), 0, 1)
    mix = music * music_gain * duck[:, None] + sfx * sfx_gain + vo[:, None] * 1.0
    rms = lambda x, m=None: np.sqrt(np.mean((x if m is None else x[m]) ** 2)) + 1e-12
    db = lambda x: 20 * np.log10(x)
    print(f'levels while the voice speaks: voice {db(rms(vo, act)):.1f} dB, music {db(rms((music * music_gain * duck[:, None]).mean(1), act)):.1f} dB, '
          f'effects {db(rms(sfx.mean(1), act)):.1f} dB; music alone elsewhere {db(rms((music * music_gain).mean(1), ~act)):.1f} dB')
    fo = int(fade_out * SR); mix[-fo:] *= np.linspace(1, 0, fo)[:, None]     # fade out with the picture
    mix = np.tanh(mix * 1.1) / np.tanh(1.1)                                # soft limit
    mix *= .89 / max(1e-9, np.abs(mix).max())
    tmp = out.replace('.m4a', '.wav')
    with wave.open(tmp, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(mix, -1, 1) * 32767).astype('<i2').tobytes())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', tmp, '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11', '-ar', str(SR), '-c:a', 'aac', '-b:a', '192k', out], check=True)
    os.remove(tmp)
    print('wrote', out)
