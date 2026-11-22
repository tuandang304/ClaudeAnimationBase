#!/usr/bin/env python3
# make_audio.py: the AIMA TVC soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# a slow, drumless lo-fi under the tired hook, a record scratch and riser into the reveal, the bright loop under how it
# works, the proof and the end card; effects on the on-screen events, and the voice-over in audio/vo/ (tools/make_vo.py).
# Run from the repo root:  .venv/bin/python videos/aima-tvc/audio/make_audio.py
import os, sys
VDIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(VDIR)), 'tools'))
from audiokit import *

PROJECT, T = load_video(VDIR)
DUR = PROJECT['duration']
music, sfx, vo = buffers(DUR)
OUT = os.path.join(VDIR, 'audio/soundtrack.m4a')
R, B, BL, P, C = T['reveal'], T['beats'], T['beatLen'], T['proof'], T['cta']

# ---------- music ----------
LOFI = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']]
LOFI_B = ['F2', 'E2', 'D2', 'C2']
BRIGHT = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']]

def lofi_section(t0, t1, vel=1.):
    for b, tb in bars(t0, t1):
        ch, rt = LOFI[b % 4], LOFI_B[b % 4]
        for k, n in enumerate(ch): add(music, tb + k * .012, ep(hz(n), 1.9, .8 * vel), pan=-.3 + k * .2)
        add(music, tb, bass(hz(rt), .9, vel)); add(music, tb + 1.25, bass(hz(rt), .7, .7 * vel))
        for e in range(8): add(music, tb + e * .25 + (.02 if e % 2 else 0), hat((.4 if e % 2 else .6) * vel, .05), pan=.3)

def bright_loop(t0, t1, vel=1., drums=True):
    for b, tb in bars(t0, t1):
        ch = BRIGHT[b % 4]
        add(music, tb, pad([hz(n) for n in ch], 2.1, cut=1800, vel=.6 * vel))
        arp = [ch[0], ch[1], ch[2], ch[1]] * 2
        for e in range(8):
            if e % 2 == 0: add(music, tb + e * .25, pluck(hz(arp[e][:-1] + str(int(arp[e][-1]) + 1)), .4, .8 * vel), pan=.3 * (1 if e % 4 else -1))
        if drums:
            for e in range(4): add(music, tb + e * .5, kick(.55 * vel) if e % 2 == 0 else clap(.35 * vel))
            for e in range(8): add(music, tb + e * .25, hat(.35 * vel, .04), pan=.3)

lofi_section(0, R - .3, .8)                                           # the tired night
i0 = int((R - .3) * SR); music[i0 - 2400:i0] *= np.linspace(1, 0, 2400)[:, None]; music[i0:] = 0
bright_loop(R + .4, B, .6, drums=False)                               # the logo
bright_loop(B, C)                                                     # how it works, the proof
bright_loop(C, DUR, .8, drums=False)                                  # the end card
add(music, C + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - C, 2000, .6))

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                         # iris opens
add(sfx, T['push'], whoosh(.6, .4))                                   # push in to the laptop
for k in range(20): add(sfx, T['push'] + .4 + 3 * (k / 20) ** 2, click(.35), pan=.4)   # tabs piling up
for i, s in enumerate([1.8, 2.6, 3.3]): add(sfx, s, pop(600 + 80 * i, .5), pan=-.4 + .4 * i)
add(sfx, T['nobody'], whoosh(.45, .5, rise=False)); add(sfx, T['nobody'] + .2, boing(200, .5, .5))
add(sfx, R - .7, whoosh(.6, .5, rise=False))                          # iris closes
add(sfx, R - .3, scratch(.6))
add(sfx, R + .2, riser(.4, .4)); add(sfx, R + .45, impact(.5)); add(sfx, R + .5, sparkle(.8))   # the logo
add(sfx, R + 1.4, pop(700, .5))                                       # tagline
add(sfx, B, whoosh(.7, .6))                                           # the logo flies into the app
for j in range(4):
    b = B + j * BL
    add(sfx, b + .15, pop(650 + 60 * j, .5))                          # each beat's title
    if j: add(sfx, b, whoosh(.3, .4))
add(sfx, B + 1.2, blip(.3)); add(sfx, B + 1.4, blip(.3)); add(sfx, B + 1.6, blip(.3)); add(sfx, B + 3.7, chime(.6))   # brand saved
typing(sfx, B + BL + .6, B + BL + 2.6, 12, .3); add(sfx, B + BL + 2.9, chime(.6))           # trends scanned, the best one
typing(sfx, B + 2 * BL + .6, B + 2 * BL + 2.4, 18, .35)
for i in range(3): add(sfx, B + 2 * BL + 1.8 + i * .35, blip(.35), pan=-.3 + .3 * i)        # each version done
for i in range(9): add(sfx, B + 3 * BL + .3 + i * .16, pop(500 + 40 * i, .3), pan=-.3)      # the calendar fills
for i in range(9): add(sfx, B + 3 * BL + 2.3 + i * .12, whoosh(.25, .25), pan=.4)            # posts fly to Facebook
add(sfx, B + 3 * BL + 3.4, chime(.7))
add(sfx, P - .3, whoosh(.6, .7))                                      # brush wipe
for k in range(26): add(sfx, P + .5 + 2.1 * (k / 26) ** .6, tick(.3, 2200 + 200 * (k % 3)))   # the counter
add(sfx, P + 2.6, impact(.5)); add(sfx, P + 2.6, sparkle(.8))
for i in range(20): add(sfx, P + T['proofAvatars'] + i * .05, pop(500 + 15 * i, .25), pan=.4)
add(sfx, P + T['proofAvatars'] + 1.3, chime(.6))
add(sfx, C - .3, whoosh(.6, .7))
add(sfx, C + .3, sparkle(.7)); add(sfx, C + .8, pop(650, .55)); add(sfx, C + T['ctaPlus'], pop(800, .55)); add(sfx, C + T['ctaPlus'] + .1, chime(.5))

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [
    ('v_hook1', .5), ('v_hook2', T['nobody'] + .2), ('v_reveal', R + .9),
    ('v_s1', B + .4), ('v_s2', B + BL + .4), ('v_s3', B + 2 * BL + .4), ('v_s4', B + 3 * BL + .4),
    ('v_proof', P + .4), ('v_cta1', C + .5), ('v_cta2', C + T['ctaPlus'])])

mixdown(music, sfx, vo, OUT)
