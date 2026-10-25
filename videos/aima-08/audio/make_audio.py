#!/usr/bin/env python3
# make_audio.py: the AIMA #8 soundtrack (audio/soundtrack.m4a), in sync with scene.js through TIMING in video.js:
# lo-fi on the video's beat (120 bpm, beat 1 at 0 s) that stalls when the tokens run out, a sleepy night, the bright
# loop under the plans, a soft lullaby while the posts go out by themselves and a bright morning into the outro;
# effects on the on-screen events, and the voice-over in audio/vo/ (tools/make_vo.py from lines.tsv).
# Run from the repo root:  .venv/bin/python videos/aima-08/audio/make_audio.py
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

P = S(T['clockPush']); A = S(T['away'])
lofi_section(0, S(T['drain'][1]))                                    # making a post on Free...
i0 = int(S(T['drain'][1]) * SR); music[i0 - 2400:i0] *= np.linspace(1, 0, 2400)[:, None]; music[i0:] = 0   # ...out of tokens
lofi_section(P + 1.35, S(T['cards'][0]) - .4, drums=False, vel=.5)   # 23:00, posting by hand
bright_loop(S(T['cards'][0]) - .4, A)                                # the plans
add(music, A + .5, pad([hz(n) for n in ['F3', 'A3', 'C4', 'E4']], S(T['wake']) - A - .5, 1200, .5))   # asleep: the posts go out
for k, n in enumerate(['E5', 'C5', 'A4', 'C5', 'E5', 'G5', 'E5', 'C5'] * 3):
    if A + .6 + k * .5 < S(T['wake']): add(music, A + .6 + k * .5, pluck(hz(n), .5, .35), pan=.2)
bright_loop(S(T['wake']), DUR)                                       # morning, on into the outro
add(music, V_OUTRO + .1, pad([hz(n) for n in ['C3', 'G3', 'C4', 'E4']], DUR - V_OUTRO, 2000, .6))

# ---------- sound effects on the picture ----------
add(sfx, .05, whoosh(.8, .5))                                             # iris opens
add(sfx, .6, pop(700, .6)); add(sfx, .95, pop(820, .5))                   # the two caption lines
typing(sfx, .3, S(T['drain'][1]), 15)
add(sfx, S(T['drain'][1]), slide(900, 200, .5, .5)); add(sfx, S(T['drain'][1]) + .1, boing(220, .5, .6))   # out of tokens
add(sfx, P, whoosh(.45, .8))                                             # the clock: to 23:00
for k in range(18): add(sfx, P + .45 + k * .025, tick(.55, 2400 + 300 * (k % 2)))
add(sfx, P + .9, whoosh(.45, .7, rise=False))
alarm = S(T['manual'][0]) - .5
for k in range(6): add(sfx, alarm + k * .09, bell(hz('A6'), .15, .5, dec=20))    # the posting-hour alarm
for s in T['manual']: add(sfx, S(s) - .02, click(.8), pan=.35); add(sfx, S(s), whoosh(.5, .4), pan=.5)   # posted, by hand
for i, s in enumerate(T['cards']): add(sfx, S(s), whoosh(.3, .5), pan=-.4 + .4 * i); add(sfx, S(s) + .1, pop(600 + 100 * i, .5), pan=-.4 + .4 * i)   # the plans
add(sfx, S(T['auto']), chime(.6)); add(sfx, S(T['auto']) + .05, thunk(.4), pan=-.4)     # auto-posting: a tick on Plus and Pro, an X on Free
add(sfx, S(T['tokens']), slide(300, 1000, .6, .35)); add(sfx, S(T['tokens']) + .6, sparkle(.5))   # the token bars grow
add(sfx, S(T['choose']) - .02, click(.8)); add(sfx, S(T['choose']), chime(.8))          # upgraded
for i in range(3): add(sfx, A + i * .06, whoosh(.35, .5))                               # the cards fly off
for s in T['posts']: add(sfx, S(s), whoosh(.6, .35), pan=.5); add(sfx, S(s) + .05, blip(.3), pan=.5)   # posts, by themselves
add(sfx, S(T['wake']) - .4, riser(.5, .3)); add(sfx, S(T['wake']), bell(hz('E6'), .8, .5))   # sunrise, awake
add(sfx, V_OUTRO - .3, whoosh(.6, .7))                                 # brush wipe
add(sfx, V_OUTRO + .35, pop(600, .55)); add(sfx, V_OUTRO + .6, pop(760, .45))   # the call to action
add(sfx, V_OUTRO + 1.3, sparkle(.8))                                   # the logo

# ---------- voice-over ----------
print('voice-over:')
place_vo(vo, VDIR, [                    # video time
    ('j_hook', .9), ('j_out', S(T['drain'][1]) + .2), ('j_night', S(T['manual'][0]) - .3),
    ('j_plans', S(T['cards'][0]) + .5), ('j_auto', S(T['auto'])), ('j_token', S(T['tokens'])),
    ('j_after', S(T['posts'][0]) + .2), ('j_cta', V_OUTRO + .45)])

mixdown(music, sfx, vo, OUT)
