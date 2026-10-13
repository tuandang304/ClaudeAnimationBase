#!/usr/bin/env python3
# make_audio.py: the AIMA #2 soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# lo-fi on the video's beat (120 bpm, beat 1 at 0 s) that stops dead on the crash zoom, effects on the on-screen
# events, the voice-over in audio/vo/ (tools/make_vo.py from lines.tsv), and a light loop under the outro.
# Run from the repo root:  .venv/bin/python videos/aima-02/audio/make_audio.py
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

def bright_loop(t0, t1):
    for b, tb in bars(t0, t1):
        ch = BRIGHT[b % 4]
        add(music, tb, pad([hz(n) for n in ch], 2.1, cut=1800, vel=.6))
        arp = [ch[0], ch[1], ch[2], ch[1]] * 2
        for e in range(8):
            if e % 2 == 0: add(music, tb + e * .25, pluck(hz(arp[e][:-1] + str(int(arp[e][-1]) + 1)), .4, .8), pan=.3 * (1 if e % 4 else -1))
        add(music, tb, kick(.5))

lofi_section(0, 2, drums=False, vel=.7)
lofi_section(2, S(T['crash']))
# the record stops on the crash zoom; silence under the punchline, until the outro
i0, i1 = int(S(T['crash']) * SR), int((V_OUTRO - .9) * SR)
music[i0:i0 + 2400] *= np.linspace(1, 0, 2400)[:, None]; music[i0 + 2400:i1] = 0
bright_loop(V_OUTRO, DUR)
add(music, V_OUTRO + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - V_OUTRO, 2000, .6))

# ---------- sound effects on the picture ----------
L0, L1 = S(T['lid'][0]), S(T['lid'][1])
add(sfx, .05, whoosh(.8, .5))                                             # iris opens
add(sfx, .6, pop(700, .6))                                                # the title caption
add(sfx, L0, slide(500, 900, L1 - L0, .35), pan=.4)                       # the lid lifts
add(sfx, L1, blip(.7), pan=.4)                                            # the screen wakes
for i, s in enumerate(T['swipes']): add(sfx, S(s), whoosh(.22 if i < 2 else .16, .45), pan=.4)    # swipe up
for i, s in enumerate(map(S, T['saves'])):                                # tap: saved, a little higher each time
    add(sfx, s - .02, click(.8), pan=.35); add(sfx, s, pop(700 + 45 * i, .55), pan=.4)
add(sfx, S(T['saves'][0]) + .02, bell(hz('E6'), .5, .4), pan=.4); add(sfx, S(T['saves'][1]) + .02, bell(hz('G6'), .5, .4), pan=.4)
for i in range(18): add(sfx, S(T['savedView']) + i * .025, pop(900 + 25 * i, .25), pan=.4)       # the grid fills
for i in range(16): add(sfx, S(T['savedView']) + .5 + i * .035, pop(500 + 40 * i, .4), pan=.4 + .2 * np.sin(i))   # ...and spills
add(sfx, S(T['savedView']) + .1, boing(260, .6, .8))                         # surprise
P = S(T['clockPush'])                                                        # the push-in on the clock: in, ticking flies, out
add(sfx, P, whoosh(.45, .8))
for k in range(18): add(sfx, P + .45 + k * .025, tick(.55, 2400 + 300 * (k % 2)))
add(sfx, P + .9, whoosh(.45, .7, rise=False))
add(sfx, S(T['notesOpen']), pop(650, .5), pan=.4)                            # the notes app
for (a, b), (d0, d1) in zip([map(S, x) for x in T['type']], [list(map(S, x)) for x in T['del']]):
    typing(sfx, a, b, 15)                                                 # typing...
    typing(sfx, d0, d1, 30, .6); add(sfx, d0, slide(900, 300, d1 - d0 + .1, .35), pan=.4)   # ...deleting
add(sfx, S(21.8), hiss(.8, .6))                                              # fuming
add(sfx, S(T['pullOut']), whoosh(S(T['pullOut'] + .8) - S(T['pullOut']), .4, rise=False))                        # pull back: the afternoon, the clock spins
for k in range(24): add(sfx, S(T['pullOut']) + .1 + k * .028, tick(.4, 2200 + 300 * (k % 2)))
add(sfx, S(T['crash']) - .08, whoosh(.18, .9)); add(sfx, S(T['crash']), scratch(1.0)); add(sfx, S(T['crash']), boing(330, .5, .6))
add(sfx, S(T['punch'][0]), pop(520, .7)); add(sfx, S(T['punch'][1]), pop(640, .6))   # "Rồi…" "Rốt cuộc đăng gì đây?"
add(sfx, V_OUTRO - .9, riser(.9, .4))                                  # into the outro
add(sfx, V_OUTRO - .3, whoosh(.6, .7))                                 # brush wipe
add(sfx, V_OUTRO + .35, pop(600, .55)); add(sfx, V_OUTRO + .6, pop(760, .45))   # the question
add(sfx, V_OUTRO + 1.3, sparkle(.7))                                   # the logo

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [                    # video time: each line is placed so its last word lands on the tap it names
    ('d_hook', .9), ('d_scroll', 5.0), ('d_save1', 6.9), ('d_save2', 9.35), ('d_saved', 14.4),
    ('d_notes', 18.4), ('d_del1', 22.3), ('d_del2', 25.5),
    ('d_punch1', S(T['punch'][0])), ('d_punch2', S(T['punch'][1])), ('d_ask', V_OUTRO + .45)])

mixdown(music, sfx, vo, OUT)
