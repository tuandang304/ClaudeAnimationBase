#!/usr/bin/env python3
# make_audio.py: the AIMA #1 soundtrack (audio/soundtrack.m4a), in sync with scene.js: synthesized music on the video's
# beat (120 bpm, beat 1 at 0 s), sound effects on the on-screen events, and the voice-over in audio/vo/ (made by
# tools/make_vo.py from lines.tsv). Run from the repo root:  .venv/bin/python videos/aima-01/audio/make_audio.py
#
# Cues are written in the scene's EVENT time and moved onto the video's clock by the same warps the scene uses (TIMING
# in video.js): S(rt) for the story's clock, A(a) for the morning with AIMA. Change the pacing in video.js and rerun.
import os, sys
VDIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(VDIR)), 'tools'))
from audiokit import *

PROJECT, TIMING = load_video(VDIR)
DUR = PROJECT['duration']
SW, MW = warp(TIMING['story']['rates'], TIMING['story']['end']), warp(TIMING['morning']['rates'], TIMING['morning']['end'])
V_PITCH = SW.len; V_AIMA = V_PITCH + TIMING['pitch']; V_END = V_AIMA + MW.len
S = SW.inv                              # story time → video time
A = lambda a: V_AIMA + MW.inv(a)        # time in the morning-with-AIMA shot → video time
music, sfx, vo = buffers(DUR)
OUT = os.path.join(VDIR, 'audio/soundtrack.m4a')


# ---------- music ----------
LOFI = [['F3', 'A3', 'C4', 'E4'], ['E3', 'G3', 'B3', 'D4'], ['D3', 'F3', 'A3', 'C4'], ['C3', 'E3', 'G3', 'B3']]
LOFI_B = ['F2', 'E2', 'D2', 'C2']
BRIGHT = [['C4', 'E4', 'G4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['F3', 'A3', 'C4']]
BRIGHT_B = ['C2', 'G2', 'A2', 'F2']

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
add(music, V_END, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4', 'D5']], DUR - V_END, 2200, 1.0))   # the last chord rings out
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
add(sfx, S(8.42), slide(1300, 260, S(8.7) - S(8.42) + .15, .9), pan=.4)               # ...and it crashes
add(sfx, S(9.4), whoosh(.5, .5, rise=False))                                          # pan to the bin
for i, ti in enumerate([10.4, 10.9, 11.4]):                                           # crumple, throw, land
    add(sfx, S(ti - .4), rustle(.8), pan=-.3)
    add(sfx, S(ti), whoosh(.3, .45), pan=-.5)
    if i == 1: add(sfx, S(ti + .48), clang(.8), pan=-.7); add(sfx, S(ti + .88), thud(.8), pan=-.6)
    else: add(sfx, S(ti + .48), thunk(.8), pan=-.7)
add(sfx, S(11.6), bell(hz('G6'), 1.2, .9))                                            # idea!
add(sfx, S(12.3), whoosh(.3, .7))                                                     # whip back to the desk
add(sfx, S(12.42), pop(650, .5), pan=.4)                                              # the doc opens
typing(sfx, S(12.7), S(13.62)); typing(sfx, S(13.7), S(14.0), 26, .6); typing(sfx, S(14.4), S(15.05), 20)
add(sfx, S(13.8), hiss(.9, .7))                                                       # steaming mad
for i, ti in enumerate([16.5, 16.75, 17.0, 17.25, 17.35]): add(sfx, S(ti), pop(420 + 40 * i, .45), pan=.4)   # clips
add(sfx, S(17.45), riser(S(18.3) - S(17.45), .15), pan=.4)                           # render
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
add(sfx, A(1.0 + 1.45), bell(hz('E6'), .8, .6), pan=.45)
for j in range(3): add(sfx, A(3.3 + .15 + j * .3), pop(600 + j * 90, .45), pan=.45)
add(sfx, A(3.3 + 2.5), pop(820, .5), pan=.45)
add(sfx, A(7.2 + .7), whoosh(.5, .5), pan=.45)
for i in range(4): add(sfx, A(7.2 + 1.6 + i * .15), bell(hz(['C6', 'E6', 'G6', 'C7'][i]), .6, .45), pan=.45)
for i in range(9): add(sfx, A(10.9 + .2 + i * .09), tick(.35, 1800 + 120 * i), pan=.45)
add(sfx, A(10.9 + 2.1), chime(.6), pan=.45)
add(sfx, A(13.5), whoosh(A(14.4) - A(13.5), .35, rise=False))                       # pull out
add(sfx, A(15.72), whoosh(.15, .7)); add(sfx, A(15.75), boing(300, .5, .7))          # 9 a.m.?!
add(sfx, A(16.05), pop(520, .7)); add(sfx, A(16.6), pop(640, .6))
add(sfx, V_END - .3, whoosh(.6, .8))
add(sfx, V_END + .3, sparkle(1.0)); add(sfx, V_END + 1.5, pop(600, .5)); add(sfx, V_END + 2.2, pop(760, .4))

# ---------- voice-over ----------
# Creator lines sit on the acting beats they belong to; each narrator line starts with its feature's caption.
print('voice-over:')
place_vo(vo, VDIR, [
    ('c_hook', .45), ('c_research', S(3.3)), ('c_trend', S(7.62)), ('c_trend2', S(8.7)), ('c_idea', S(9.88)), ('c_idea2', S(11.68)),
    ('c_caption', S(13.75)), ('c_edit', S(16.3)), ('c_done', S(18.5)), ('c_punch1', S(21.2)), ('c_punch2', S(21.8)),
    ('n_1', S(22.85)), ('n_2', V_PITCH + 1.9),
    ('n_3', A(1.1)), ('n_4', A(3.4)), ('n_5', A(7.3)), ('n_6', A(11.0)), ('n_7', A(13.65)),
    ('c_morning1', A(16.0)), ('c_morning2', A(16.6)), ('n_8', V_END + .8)])

mixdown(music, sfx, vo, OUT)
