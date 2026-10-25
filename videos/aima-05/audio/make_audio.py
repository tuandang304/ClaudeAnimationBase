#!/usr/bin/env python3
# make_audio.py: the AIMA #5 soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# lo-fi on the video's beat (120 bpm, beat 1 at 0 s) that speeds up with the juggle and crashes with the apps, a
# hush under the wish, then the bright loop when AIMA opens (it carries on under the outro); effects on the on-screen
# events and the voice-over in audio/vo/ (tools/make_vo.py from lines.tsv).
# Run from the repo root:  .venv/bin/python videos/aima-05/audio/make_audio.py
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
LAND = S(T['drop']) + .35

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

W0, W1 = map(S, T['wish'])
lofi_section(0, 2, drums=False, vel=.7)
lofi_section(2, 6)
lofi_section(6, S(T['drop']), busy=True)                              # the juggle speeds up
add(music, 6, riser(S(T['drop']) - 6, .4))
i0 = int(LAND * SR); music[i0 - 2400:i0] *= np.linspace(1, 0, 2400)[:, None]; music[i0:] = 0   # the crash: silence
add(music, W0, pad([hz(n) for n in ['F3', 'A3', 'C4', 'E4']], W1 - W0 + .5, 1200, .5))       # the wish, softly
bright_loop(S(T['open']), DUR)                                       # AIMA: the bright loop, on into the outro
add(music, V_OUTRO + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - V_OUTRO, 2000, .6))

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                             # iris opens
add(sfx, .6, pop(700, .6)); add(sfx, .95, pop(820, .5))                   # the two caption lines
for i, s in enumerate(T['tiles']):                                        # each app jumps out of the laptop
    add(sfx, S(s), boing(300 + 40 * i, .35, .5), pan=.4); add(sfx, S(s) + .1, whoosh(.3, .35), pan=.2)
add(sfx, S(T['drop']), slide(1400, 200, .35, .5))                         # they fall...
for i in range(7): add(sfx, LAND - .05 + i * .04, thunk(.6 if i % 2 else .8), pan=-.3 + .1 * i)   # ...a clatter
add(sfx, LAND, impact(.8)); add(sfx, LAND + .1, clang(.4))
add(sfx, W0, pop(520, .6)); add(sfx, W0 + .1, pop(680, .4))               # the bubble
add(sfx, S(T['buddy']), pop(760, .6)); add(sfx, S(T['buddy']) + .05, chime(.4))   # someone sits down beside
for i in range(4): add(sfx, S(T['buddy']) + .6 + i * .12, pop(900 + 60 * i, .35))  # ...and takes the apps
add(sfx, W1, pop(900, .7))
for i in range(7): add(sfx, S(T['merge']) + i * .08, whoosh(.3, .3), pan=.3)   # the apps fly into the laptop
add(sfx, S(T['open']), sparkle(.8)); add(sfx, S(T['open']) + .05, chime(.7))  # AIMA opens
for i, s in enumerate(T['steps']): add(sfx, S(s), pop(600 + 80 * i, .5), pan=.4)   # the steps
add(sfx, S(T['ok']) - .02, click(.8), pan=.35); add(sfx, S(T['ok']), chime(.8))    # approved
add(sfx, V_OUTRO - .9, riser(.9, .4))                                  # into the outro
add(sfx, V_OUTRO - .3, whoosh(.6, .7))                                 # brush wipe
add(sfx, V_OUTRO + .35, pop(600, .55)); add(sfx, V_OUTRO + .6, pop(760, .45))   # the call to action
add(sfx, V_OUTRO + 1.3, sparkle(.8))                                   # the logo

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [                    # video time
    ('g_hook', .9), ('g_apps', S(T['tiles'][0]) + .5),       # one tool named as each app jumps out
    ('g_tired', LAND + 1.6), ('g_wish', W0 + .5),
    ('g_one', S(T['steps'][0])), ('g_decide', S(T['ok']) - 2.2), ('g_cta', V_OUTRO + .45)])

mixdown(music, sfx, vo, OUT)
