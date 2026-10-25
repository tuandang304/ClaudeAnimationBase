#!/usr/bin/env python3
# make_audio.py: the AIMA #4 soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# lo-fi on the video's beat (120 bpm, beat 1 at 0 s) that speeds into a frantic double-time under the tab frenzy and
# stops dead on the crash zoom, a click and a pop on every tab, the voice-over in audio/vo/ (tools/make_vo.py from
# lines.tsv), and a light loop under the outro.
# Run from the repo root:  .venv/bin/python videos/aima-04/audio/make_audio.py
import os, sys
VDIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(VDIR)), 'tools'))
from audiokit import *

PROJECT, T = load_video(VDIR)
DUR = PROJECT['duration']
SW = warp(T['story']['rates'], T['story']['end'])
S = SW.inv                              # event time (the times in TIMING) → video time
V_OUTRO = SW.len                        # the question to the viewer and the logo
music, sfx, vo = buffers(DUR)
OUT = os.path.join(VDIR, 'audio/soundtrack.m4a')

# the same tab schedule as scene.js: the frenzy's switches (faster and faster) and the extra tabs
F0, F1 = T['frenzy']
SWITCH, t, d = [], F0, .38
while t < F1: SWITCH.append(t); t += d; d = max(.08, d * .84)
EXTRA = [F0 + 1.0 + k * .21 for k in range(9)]

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

def bright_loop(t0, t1):
    for b, tb in bars(t0, t1):
        ch = BRIGHT[b % 4]
        add(music, tb, pad([hz(n) for n in ch], 2.1, cut=1800, vel=.6))
        arp = [ch[0], ch[1], ch[2], ch[1]] * 2
        for e in range(8):
            if e % 2 == 0: add(music, tb + e * .25, pluck(hz(arp[e][:-1] + str(int(arp[e][-1]) + 1)), .4, .8), pan=.3 * (1 if e % 4 else -1))
        add(music, tb, kick(.5))

lofi_section(0, 2, drums=False, vel=.7)
lofi_section(2, S(F0))
lofi_section(S(F0), S(T['hang']), busy=True)                          # the frenzy: double-time
add(music, S(F0), riser(S(T['hang']) - S(F0), .5))
i0 = int(S(T['hang']) * SR)                                           # the laptop hangs: the music chokes...
music[i0:i0 + 2400] *= np.linspace(1, 0, 2400)[:, None]; music[i0 + 2400:int(S(T['pullOut']) * SR)] = 0
lofi_section(S(T['pullOut']), S(T['crash']), drums=False, vel=.6)     # ...a breath on the pull-back...
i0, i1 = int(S(T['crash']) * SR), int((V_OUTRO - .9) * SR)           # ...and stops on the crash zoom
music[i0:i0 + 2400] *= np.linspace(1, 0, 2400)[:, None]; music[i0 + 2400:i1] = 0
bright_loop(V_OUTRO, DUR)
add(music, V_OUTRO + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - V_OUTRO, 2000, .6))

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                             # iris opens
add(sfx, .6, pop(700, .6)); add(sfx, .95, pop(820, .5))                   # the two caption lines
add(sfx, S(T['turnIn']), whoosh(.2, .4))                                  # to the laptop
for i, s in enumerate(T['tabs']):                                         # seven tabs: click, pop, a little higher each time
    add(sfx, S(s) - .02, click(.8), pan=.35); add(sfx, S(s), pop(600 + 60 * i, .55), pan=.4)
for s in SWITCH: add(sfx, S(s), click(.7), pan=.35 + .1 * np.sin(s * 9))  # the frenzy: tab, tab, tab
for i, s in enumerate(EXTRA): add(sfx, S(s), pop(900 + 50 * i, .35), pan=.4)   # more tabs
add(sfx, S(T['hang']), slide(900, 150, .5, .5), pan=.4)                   # it hangs...
add(sfx, S(T['hang']) + .1, hiss(1.2, .5), pan=.4)                        # ...and steams
add(sfx, S(T['pullOut']), whoosh(.8, .4, rise=False))                     # pull back: the afternoon's gone, the clock spins
for k in range(24): add(sfx, S(T['pullOut']) + .1 + k * .028, tick(.4, 2200 + 300 * (k % 2)))
add(sfx, S(T['crash']) - .08, whoosh(.18, .9)); add(sfx, S(T['crash']), scratch(1.0)); add(sfx, S(T['crash']), boing(330, .5, .6))
add(sfx, S(T['punch'][0]), pop(520, .7)); add(sfx, S(T['punch'][1]), pop(640, .6))
add(sfx, V_OUTRO - .9, riser(.9, .4))                                  # into the outro
add(sfx, V_OUTRO - .3, whoosh(.6, .7))                                 # brush wipe
add(sfx, V_OUTRO + .35, pop(600, .55)); add(sfx, V_OUTRO + .6, pop(760, .45))   # the question
add(sfx, V_OUTRO + 1.3, sparkle(.7))                                   # the logo

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [                    # video time: each tool is named as its tab opens
    ('f_hook', .9), *[(f'f_t{i + 1}', S(s) + .1) for i, s in enumerate(T['tabs'])],
    ('f_lost', S(T['lost'])),
    ('f_punch1', S(T['punch'][0])), ('f_punch2', S(T['punch'][1])), ('f_ask', V_OUTRO + .45)])

mixdown(music, sfx, vo, OUT)
