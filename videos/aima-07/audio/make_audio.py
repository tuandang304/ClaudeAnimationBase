#!/usr/bin/env python3
# make_audio.py: the AIMA #7 soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# a nervous lo-fi under the old way that stops when the sheets hit the bin, then the bright loop from the moment AIMA
# opens to the end of the outro; a pop on every step on screen, and the voice-over in audio/vo/ (tools/make_vo.py
# from lines.tsv).
# Run from the repo root:  .venv/bin/python videos/aima-07/audio/make_audio.py
import os, sys
VDIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(VDIR)), 'tools'))
from audiokit import *

PROJECT, T = load_video(VDIR)
DUR = PROJECT['duration']
SW = warp(T['story']['rates'], T['story']['end'])
S = SW.inv                              # event time (the times in TIMING) → video time
V_OUTRO = SW.len                        # the call to action and the logo
music, sfx, vo = buffers(DUR)
OUT = os.path.join(VDIR, 'audio/soundtrack.m4a')

# ---------- music ----------
LOFI = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']]
LOFI_B = ['F2', 'E2', 'D2', 'C2']
BRIGHT = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']]

def lofi_section(t0, t1, drums=True, vel=1., busy=False):
    for b, tb in bars(t0, t1):
        ch, rt = LOFI[b % 4], LOFI_B[b % 4]
        for k, n in enumerate(ch): add(music, tb + k * .012, ep(hz(n), 1.9, .8 * vel), pan=-.3 + k * .2)
        add(music, tb, bass(hz(rt), .9, vel)); add(music, tb + 1.25, bass(hz(rt), .7, .7 * vel))
        if drums:
            steps = 16 if busy else 8
            for e in range(steps):
                te = tb + e * 2 / steps
                if e % (4 if busy else 8) in (0, 3) or (not busy and e == 4): add(music, te, kick(.85 * vel))
                if (busy and e % 4 == 2) or (not busy and e in (2, 6)): add(music, te, snare(.7 * vel))
                add(music, te + (.02 if e % 2 else 0), hat((.5 if e % 2 else .8) * vel, .04 if busy else .06), pan=.3)

def bright_loop(t0, t1, vel=1.):
    for b, tb in bars(t0, t1):
        ch = BRIGHT[b % 4]
        add(music, tb, pad([hz(n) for n in ch], 2.1, cut=1800, vel=.6 * vel))
        arp = [ch[0], ch[1], ch[2], ch[1]] * 2
        for e in range(8):
            if e % 2 == 0: add(music, tb + e * .25, pluck(hz(arp[e][:-1] + str(int(arp[e][-1]) + 1)), .4, .8 * vel), pan=.3 * (1 if e % 4 else -1))
        add(music, tb, kick(.5 * vel))

S1, S2, S3, S4 = [list(map(S, s)) for s in T['steps']]
CR = S(T['crumple'])
lofi_section(0, CR + .8, busy=True, vel=.8)                          # the old way
i0 = int((CR + .8) * SR); music[i0 - 2400:i0] *= np.linspace(1, 0, 2400)[:, None]; music[i0:] = 0
bright_loop(S(T['open']), DUR)                                       # AIMA, step by step
add(music, V_OUTRO + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - V_OUTRO, 2000, .6))

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                             # iris opens
add(sfx, .6, pop(700, .6)); add(sfx, .95, pop(820, .5))                   # the two caption lines
for i, s in enumerate(T['sheets']):                                       # four sheets, scribbled on
    add(sfx, S(s), pop(600 + 70 * i, .5)); typing(sfx, S(s) + .2, CR - .1, 6, .25)
for i in range(4): add(sfx, CR + i * .05, rustle(.6))                     # crumpled...
for i in range(4): add(sfx, CR + .75 + i * .05, thunk(.5), pan=-.5)      # ...in the bin
add(sfx, S(T['open']) - .3, whoosh(.2, .4)); add(sfx, S(T['open']), sparkle(.7), pan=.4)   # AIMA opens
for a, _ in (S1, S2, S3, S4): add(sfx, a, whoosh(.25, .4), pan=.4); add(sfx, a + .1, chime(.45))   # each step slides in
add(sfx, S(T['logo']), pop(700, .55), pan=.4)                                  # step 1: the brand
for i, c in enumerate(T['colours']): add(sfx, S(c), pop(800 + 80 * i, .45), pan=.4)
add(sfx, S(T['sliders'][0]), slide(400, 800, .6, .3), pan=.4)
for i in range(4): add(sfx, S(T['fans']) + i * .12, pop(650 + 60 * i, .35), pan=.4)
add(sfx, S(T['done1']), chime(.6))
typing(sfx, *map(S, T['typeIdea']), 15)                                        # step 2: the idea
add(sfx, S(T['send']) - .02, click(.8), pan=.35); add(sfx, S(T['send']), whoosh(.4, .5, rise=True), pan=.4)
for i, s in enumerate(T['plats']): add(sfx, S(s), pop(560 + 110 * i, .55), pan=-.3 + .2 * i)   # step 3: four platforms
typing(sfx, *map(S, T['edit']), 15)                                            # step 4: an edit...
for i, s in enumerate(T['checks']): add(sfx, S(s), bell(hz(['C6', 'E6', 'G6', 'C7'][i]), .5, .4), pan=.4)   # ...approved
add(sfx, S(T['confetti']), sparkle(1.)); add(sfx, S(T['confetti']) + .05, clap(.6)); add(sfx, S(T['confetti']) + .3, clap(.5))
add(sfx, V_OUTRO - .3, whoosh(.6, .7))                                 # brush wipe
add(sfx, V_OUTRO + .35, pop(600, .55)); add(sfx, V_OUTRO + .6, pop(760, .45))   # the call to action
add(sfx, V_OUTRO + 1.3, sparkle(.8))                                   # the logo

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [                    # video time
    ('i_hook', .9), ('i_s1', S1[0] + .2), ('i_s2', S2[0] + .2), ('i_s3', S3[0] + .2), ('i_s4', S4[0] + .2),
    ('i_done', S(T['turn']) + .4), ('i_cta', V_OUTRO + .45)])

mixdown(music, sfx, vo, OUT)
