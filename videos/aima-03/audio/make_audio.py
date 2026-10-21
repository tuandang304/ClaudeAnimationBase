#!/usr/bin/env python3
# make_audio.py: the AIMA #3 soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# lo-fi on the video's beat (120 bpm, beat 1 at 0 s) that gets a bouncy "trend" groove while the viral dance plays and
# stops dead on the crash zoom, effects on the on-screen events, the voice-over in audio/vo/ (tools/make_vo.py from
# lines.tsv), and a light loop under the outro.
# Run from the repo root:  .venv/bin/python videos/aima-03/audio/make_audio.py
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

# ---------- music ----------
LOFI = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']]
LOFI_B = ['F2', 'E2', 'D2', 'C2']
BRIGHT = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']]

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

def trend_groove(t0, t1, vel=1.):     # the viral dance's beat: four on the floor, claps, a plucky hook
    hook = ['A4', 'C5', 'A4', 'E5', 'D5', 'C5', 'A4', 'G4']
    for b, tb in bars(t0, t1):
        for e in range(8):
            te = tb + e * .25
            if e % 2 == 0: add(music, te, kick(.9 * vel))
            if e in (2, 6): add(music, te, clap(.7 * vel))
            add(music, te + .125, hat(.5 * vel), pan=.35)
            add(music, te, pluck(hz(hook[e]), .22, .55 * vel), pan=.25)

def bright_loop(t0, t1):
    for b, tb in bars(t0, t1):
        ch = BRIGHT[b % 4]
        add(music, tb, pad([hz(n) for n in ch], 2.1, cut=1800, vel=.6))
        arp = [ch[0], ch[1], ch[2], ch[1]] * 2
        for e in range(8):
            if e % 2 == 0: add(music, tb + e * .25, pluck(hz(arp[e][:-1] + str(int(arp[e][-1]) + 1)), .4, .8), pan=.3 * (1 if e % 4 else -1))
        add(music, tb, kick(.5))

B1, B2, B3 = [list(map(S, b)) for b in T['bubbles']]
lofi_section(0, 2, drums=False, vel=.7)
lofi_section(2, S(T['hot']) - .1)
trend_groove(S(T['hot']) - .1, B1[0])                                 # the viral video's song, loud...
trend_groove(B1[0], S(T['tip']), vel=.55)                             # ...and in the creator's head, with the candle
lofi_section(S(T['tip']) + .4, S(T['late'][0]), vel=.8)
trend_groove(S(T['late'][0]), S(T['grid']) + 1.0, vel=.7)            # everyone's doing it now
lofi_section(S(T['grid']) + 1.0, S(T['crash']), drums=False, vel=.7)
# the record stops on the crash zoom; silence under the punchline, until the outro
i0, i1 = int(S(T['crash']) * SR), int((V_OUTRO - .9) * SR)
music[i0:i0 + 2400] *= np.linspace(1, 0, 2400)[:, None]; music[i0 + 2400:i1] = 0
bright_loop(V_OUTRO, DUR)
add(music, V_OUTRO + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - V_OUTRO, 2000, .6))

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                             # iris opens
add(sfx, .6, pop(700, .6)); add(sfx, 1.0, pop(820, .5))                   # the two caption lines
for s in T['swipes'] + T['late']: add(sfx, S(s), whoosh(.22, .45), pan=.4)    # swipe up
add(sfx, S(T['hot']), sparkle(.7), pan=.4)                                # it's viral
add(sfx, S(T['notice']), boing(300, .5, .7))                              # the take
add(sfx, S(T['go']), whoosh(.3, .6, rise=True)); add(sfx, S(T['go']) + .1, chime(.6))   # fist up
for i, (a, b) in enumerate([B1, B2, B3]):                                 # bubbles: in with a pop, out with a pop
    add(sfx, a, pop(520, .6)); add(sfx, a + .1, pop(680, .4))
    add(sfx, b, pop(900, .7))
add(sfx, S(T['tip']), slide(800, 200, .3, .5)); add(sfx, S(T['tip']) + .28, thud(.6))   # the candle tips over...
add(sfx, S(T['tip']) + .3, hiss(.5, .35))                                 # ...and goes out
for i in range(3): add(sfx, S(T['neon']) + i * .12, whoosh(.18, .4), pan=-.2 + .2 * i)   # neon swipes
add(sfx, S(T['stamp']), impact(.6)); add(sfx, S(T['stamp']) + .02, boing(180, .4, .5))  # the X
P = S(T['clockPush'])                                                    # the push-in on the clock: in, ticking flies, out
add(sfx, P, whoosh(.45, .8))
for k in range(18): add(sfx, P + .45 + k * .025, tick(.55, 2400 + 300 * (k % 2)))
add(sfx, P + .9, whoosh(.45, .7, rise=False))
for i, f in enumerate(T['fans']): add(sfx, S(f), pop(600 + 90 * i, .45))      # the customers pop up...
for i in range(4): add(sfx, S(T['qs']) + i * .14, blip(.4))                    # ...each with a "?"
for i in range(6): add(sfx, S(T['grid']) + i * .06, pop(700 + 40 * i, .3), pan=.4)   # the copies
add(sfx, S(T['grid']) + .6, hiss(.6, .4), pan=.4)                              # the flame dies
add(sfx, S(T['crash']) - .08, whoosh(.18, .9)); add(sfx, S(T['crash']), scratch(1.0)); add(sfx, S(T['crash']), boing(330, .5, .6))
add(sfx, S(T['punch'][0]), pop(520, .7)); add(sfx, S(T['punch'][1]), pop(640, .6))
add(sfx, V_OUTRO - .9, riser(.9, .4))                                  # into the outro
add(sfx, V_OUTRO - .3, whoosh(.6, .7))                                 # brush wipe
add(sfx, V_OUTRO + .35, pop(600, .55)); add(sfx, V_OUTRO + .6, pop(760, .45))   # the question
add(sfx, V_OUTRO + 1.3, sparkle(.7))                                   # the logo

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [                    # video time
    ('e_hook', S(T['notice']) + .3), ('e_go', S(T['go']) - .1),
    ('e_try1', S(T['tip']) - .9),                       # "Nến thơm mà nhảy…" while it dances, "kỳ kỳ." once it's down
    ('e_try2', S(T['neon']) - .3),                      # "Đổi màu cho bắt mắt?…" then "Không giống brand mình." on the X
    ('e_try3', S(T['fans'][0]) + .8),                   # "Mà khách của mình…" then "có thích không ta?" on the question marks
    ('e_late', S(T['grid']) + .5),
    ('e_punch1', S(T['punch'][0])), ('e_punch2', S(T['punch'][1])), ('e_ask', V_OUTRO + .45)])

mixdown(music, sfx, vo, OUT)
