#!/usr/bin/env python3
# make_audio.py: the AIMA #6 soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# a light lo-fi on the video's beat (120 bpm, beat 1 at 0 s) under the demo, the trend's groove from #3 when the candle
# finally dances, and the bright loop under the outro; a pop or a chime on every step on screen, and the voice-over in
# audio/vo/ (tools/make_vo.py from lines.tsv).
# Run from the repo root:  .venv/bin/python videos/aima-06/audio/make_audio.py
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

def trend_groove(t0, t1, vel=1.):     # the viral dance's beat (as in #3)
    hook = ['A4', 'C5', 'A4', 'E5', 'D5', 'C5', 'A4', 'G4']
    for b, tb in bars(t0, t1):
        for e in range(8):
            te = tb + e * .25
            if e % 2 == 0: add(music, te, kick(.9 * vel))
            if e in (2, 6): add(music, te, clap(.7 * vel))
            add(music, te + .125, hat(.5 * vel), pan=.35)
            add(music, te, pluck(hz(hook[e]), .22, .55 * vel), pan=.25)

P = S(T['payoff'])
trend_groove(0, S(T['open']), vel=.5)                                 # the viral video in the feed
lofi_section(S(T['open']), P, vel=.8)                                 # the demo
trend_groove(P, V_OUTRO - .5)                                         # the candle dances: the trend's song, full
bright_loop(V_OUTRO - .5, DUR)
add(music, V_OUTRO + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - V_OUTRO, 2000, .6))

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                             # iris opens
add(sfx, .6, pop(700, .6)); add(sfx, .95, pop(820, .5))                   # the two caption lines
d0, d1 = map(S, T['drag'])
add(sfx, d0 - .02, click(.8), pan=.35); add(sfx, d0, slide(400, 900, d1 - d0, .4), pan=.4); add(sfx, d1, thunk(.5), pan=.4)   # drag, drop
add(sfx, S(T['open']), sparkle(.7), pan=.4)                               # AIMA opens
add(sfx, S(T['brand']), whoosh(.3, .4), pan=.5); add(sfx, S(T['brand']) + .2, pop(700, .45), pan=.5)   # the brand profile
add(sfx, S(T['scan'][0]), riser(S(T['scan'][1]) - S(T['scan'][0]), .3), pan=.2)                    # reading the trend
add(sfx, S(T['fit'][0]), slide(300, 900, S(T['fit'][1]) - S(T['fit'][0]), .35), pan=.4); add(sfx, S(T['fit'][1]), chime(.7))   # it fits
for i, s in enumerate(T['ideas']): add(sfx, S(s), pop(600 + 90 * i, .5), pan=.4)   # three ideas
add(sfx, S(T['pick']) - .02, click(.8), pan=.35); add(sfx, S(T['pick']), bell(hz('G5'), .6, .5), pan=.4)   # picked
add(sfx, S(T['doc']), whoosh(.35, .5), pan=.4)                                   # it grows into content
for j in range(3): add(sfx, S(T['doc']) + .3 + j * .2, pop(650 + 60 * j, .4), pan=.4)
typing(sfx, S(T['doc']) + .8, S(T['doc']) + 1.8, 16, .4)
for j in range(3): add(sfx, S(T['hashtags']) + j * .1, blip(.4), pan=.4)
add(sfx, S(T['cta']), pop(820, .55), pan=.4)
typing(sfx, *map(S, T['edit']), 15)                                              # the creator's own line
for i, s in enumerate(T['platforms']): add(sfx, S(s), pop(560 + 110 * i, .55), pan=-.3 + .2 * i)   # four platforms
add(sfx, P, whoosh(.5, .7))                                                      # dive into the TikTok version
add(sfx, P + .6, sparkle(.6))
add(sfx, V_OUTRO - .3, whoosh(.6, .7))                                 # brush wipe
add(sfx, V_OUTRO + .35, pop(600, .55)); add(sfx, V_OUTRO + .6, pop(760, .45))   # the call to action
add(sfx, V_OUTRO + 1.3, sparkle(.8))                                   # the logo

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [                    # video time
    ('h_hook', .9), ('h_scan', S(T['brand']) + .2), ('h_idea', S(T['ideas'][0]) + .3),
    ('h_write', S(T['doc']) + .3), ('h_opt', S(T['platforms'][0]) + .1), ('h_done', S(T['turn']) + .3),
    ('h_cta', V_OUTRO + .45)])

mixdown(music, sfx, vo, OUT)
