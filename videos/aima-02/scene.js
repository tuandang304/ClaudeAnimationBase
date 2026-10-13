// scene.js: AIMA #2, TikTok Awareness: "Mở laptop ra… và không biết đăng gì." (context/aima/campaign.md, TikTok 2;
// storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING in video.js). Vertical.
// The same creator, the same room as #1 (the series set, ../_aima). Determined to post something today, the creator
// opens the laptop, scrolls a video feed for a trend and saves one video, another, then everything; the saved folder
// overflows. The morning flies by on the clock. The notes app: write, delete; write again, delete; one word, delete.
// The camera pulls back on the afternoon and crash-zooms on the face: "Rồi… Rốt cuộc đăng gì đây?". Then the series'
// outro: a question to the viewer and the small logo. An Awareness post: no product pitch.
(() => {
  const { BR, TXT, SW, SH, bump, K, squig, SCR_BG } = AIMA;
  const T = TIMING;
  const LID_ON = T.lid[1];
  // STW maps video time onto event time (the times in TIMING and below); the outro starts when the story ends
  const STW = warp(T.story.rates, T.story.end), V_OUTRO = STW.len;

  // ---------- time of day: 8:00, the clock spins through the morning on the push-in and again on the pull-out ----------
  const HOURS = [[0, 8], [T.clockPush, 8.7], [T.clockPush + .45, 9], [T.clockPush + .9, 11.5], [T.pullOut, 13.2], [T.pullOut + .8, 16.4]];
  const hoursAt = t => kf(t, HOURS);

  // ---------- camera ----------
  const DESKV = z => [622, 900, z], CLOCKV = z => [AIMA.CLK[0], AIMA.CLK[1], z];
  const CAMK = [
    [0, [545, 920, 1.1]], [3.0, [560, 915, 1.14]], [4.4, DESKV(1.28)], [9.9, DESKV(1.31)], [10.3, [790, 960, 1.75]], [12.15, [790, 960, 1.82]], [12.45, DESKV(1.24)],   // in on the binge
    [T.clockPush, DESKV(1.25)],
    [T.clockPush + .45, CLOCKV(3.0)], [T.clockPush + .9, CLOCKV(3.06)], [T.clockPush + 1.35, DESKV(1.28)],            // the morning flies by
    [T.pullOut, DESKV(1.36)], [T.pullOut + .8, [540, 900, 1.06]], [T.crash - .17, [540, 895, 1.08]],                    // pull back: afternoon
    [T.crash, [385, 1060, 1.8]], [T.story.end, [385, 1060, 1.86]],                                                         // crash zoom
  ];
  const CAMK_V = STW.keys(CAMK);
  function camAt(t, ct) {                                // t: event time, ct: video time
    const [cx, cy, z] = kf(ct, CAMK_V), sh = t > T.crash ? shakeXY(t, 12 * Math.exp(-(t - T.crash) * 6)) : [0, 0];
    return [cx + 6 * wob(ct, .07) + sh[0], cy + 4 * wob(ct, .05, .3) + sh[1], z];
  }

  // ---------- the creator ----------
  const KEYS = [K(0, 'hopeful'), K(.9, 'determined'), K(3.9, 'excited'), K(4.9, 'thinking'), K(7.65, 'happy'), K(8.4, 'thinking'),
    K(9.75, 'happy'), K(10.3, 'starstruck'), K(12.4, 'surprised'), K(13.0, 'nervous'), K(16.2, 'determined'), K(19.1, 'thinking'),
    K(20.6, 'determined'), K(21.8, 'angry'), K(23.4, 'determined'), K(24.0, 'sad'), K(25.95, 'neutral'), K(T.crash, 'confused')];
  const KEYS_V = STW.keys(KEYS);
  const TURNS = [[3.05, 3.22, 0, .125], [25.75, 25.92, .125, 0]];   // to the laptop, and back to us
  function creatorPose(t, ct) {                          // t: event time, ct: video time (idles and blinks run on it)
    const p = emotions(ct, KEYS_V);
    let tv = { ...spinView(0), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); };
    const look = (x, y, w) => { p.lookX = lerp(p.lookX || 0, x, w); p.lookY = lerp(p.lookY || 0, y, w); };
    const [l0, l1] = T.lid;
    R(lerp(-.95, -.15, ease(seg(t, l0, l1))), bump(t, l0 - .25, l0 - .05, l1 + .05, l1 + .3));          // lifts the lid
    R(-.8 + .08 * Math.sin(t * TAU * 2), bump(t, 4.5, 4.7, 12.2, 12.4));                                // scrolling...
    for (const s of T.saves) R(-1.05, bump(t, s - .09, s - .03, s + .03, s + .1));                      // ...tap: saved
    T.type.forEach(([a, b], i) => R(-.78 + (.16 + .03 * i) * Math.sin(t * TAU * (7 + i)), bump(t, a - .15, a, b, b + .15)));   // typing
    for (const [a, b] of T.del) R(-.88 + .12 * Math.sin(t * TAU * 11), bump(t, a - .1, a, b, b + .1));  // holding delete
    look(.75 + .12 * Math.sin(t * 6) * bump(t, 10.3, 10.4, 12.1, 12.2), .2, bump(t, 3.9, 4.1, T.pullOut + .1, T.pullOut + .35));
    return p;
  }

  // ---------- the feed: a vertical video player; swipe up to the next one, tap the bookmark to save ----------
  const VP = [8, SH - 8];                                // the player's top and bottom
  const CARD = [182, 156, 296];                          // x, width, pitch
  const THUMB = ['#9ADBE8', '#F3B6E4', '#B9C4F7', '#FFD3A8', '#C5B6F5', '#A9E3C9', '#F7A3A3', '#FFE27A'];
  const swipeLen = i => i < 2 ? .26 : .16;
  const scrollAt = t => T.swipes.reduce((s, ts, i) => s + ease(seg(t, ts, ts + swipeLen(i))), 0);
  const savedN = t => T.saves.filter(s => t >= s).length;
  function clipRect(x, y, w, h, o) {
    const y0 = Math.max(y, VP[0]), y1 = Math.min(y + h, VP[1]);
    if (y1 - y0 > 2) paint(rectPts(x, y0, w, y1 - y0), o);
  }
  const inVP = (y0, y1) => y0 >= VP[0] && y1 <= VP[1];
  function card(i, y, t) {                               // video i, its top at y
    const [x, w] = CARD, h = VP[1] - VP[0], col = THUMB[i % THUMB.length];
    boilSeed('card' + i);
    clipRect(x, y, w, h, { wash: col, ink: null });
    clipRect(x, y + h * .62, w, h * .38, { wash: mixCol(col, PAL.ink, .22), ink: null });
    // a little dancer, on the beat
    const by = y + h * .55 - 18 * pulse(t, 5), bx = x + w / 2 + 10 * Math.sin(t * 4 + i);
    if (inVP(by - 70, by + 40)) {
      paint(ellPts(bx, by - 52, 16, 16, 14), { wash: mixCol(col, PAL.cream, .5), ink: PAL.ink, sw: .45 });
      paint(ellPts(bx, by, 26, 34, 16), { wash: [BR.magenta, BR.blue, BR.violet, '#FF8A3D'][i % 4], ink: PAL.ink, sw: .45 });
      const a = .6 + .5 * Math.sin(t * TAU * 2 + i);
      inkLine([[bx - 22, by - 12], [bx - 46, by - 12 - 30 * a]], .8, PAL.ink, 'ink', 0);
      inkLine([[bx + 22, by - 12], [bx + 46, by - 42 + 30 * a]], .8, PAL.ink, 'ink', 0);
    }
    if (inVP(y + h - 52, y + h - 14)) { squig(x + 12, w * .7, y + h - 44, PAL.cream, .45, i); squig(x + 12, w * .45, y + h - 24, PAL.cream, .45, i + 1); }
  }
  function bookmark(x, y, s, on, k = 1) {
    push(); translate(x, y); scale(s * k);
    paint([[-7, -9], [7, -9], [7, 10], [0, 4], [-7, 10]], { wash: on ? '#FFC83D' : null, ink: on ? PAL.ink : PAL.cream, sw: .45 });
    pop();
  }
  function scrFeed(t) {
    SCR_BG('#16131F');
    const p = scrollAt(t), i0 = Math.floor(p);
    for (let i = Math.max(0, i0 - 1); i <= i0 + 1; i++) card(i, VP[0] + (i - p) * CARD[2], t);
    // the icons beside the player; the bookmark lights up on a saved video
    boilSeed('icons');
    const cur = Math.round(p), sAt = cur >= 1 ? T.saves[cur - 1] : Infinity, on = t >= sAt, k = on ? backOut(seg(t, sAt, sAt + .2)) * (1 + .25 * Math.exp(-(t - sAt) * 8)) : 1;
    paint(ellPts(372, 70, 15, 15, 14), { wash: '#C5B6F5', ink: PAL.cream, sw: .4 });
    paint(heartPts(372, 120, 13), { wash: '#E2476E', ink: null });
    paint(ellPts(372, 165, 13, 11, 12), { wash: PAL.cream, ink: null });
    bookmark(372, 212, 1.3, on, k);
    inkLine([[362, 262], [382, 252], [372, 272]], .7, PAL.cream, 'ink', 0);
    // the saved tray on the left: a thumbnail for every video saved so far
    paint(rectPts(10, 10, 150, SH - 20), { wash: '#221E30', ink: null });
    squig(22, 70, 28, '#8C84A0', .45);
    const n = savedN(t);
    for (let j = 0; j < n; j++) {
      const sAtj = T.saves[j], kj = backOut(seg(t, sAtj, sAtj + .18)), cx = 34 + (j % 3) * 44, cy = 66 + Math.floor(j / 3) * 60;
      boilSeed('tray' + j);
      push(); translate(cx, cy); scale(kj);
      paint(rrPts(-18, -26, 36, 52, 4), { wash: THUMB[(j + 1) % THUMB.length], ink: PAL.ink, sw: .35 });
      pop();
    }
  }
  // the saved folder, overflowing: a grid fills, then thumbnails spill out of the laptop
  function scrSaved(t) {
    const a = t - T.savedView;
    SCR_BG('#FBF8FF');
    paint(rectPts(0, 0, SW, 30), { wash: BR.violet, ink: null });
    bookmark(22, 15, 1, true);
    squig(42, 80, 15, PAL.cream, .5);
    for (let i = 0; i < 18; i++) {
      const k = backOut(seg(a, i * .025, i * .025 + .15)); if (k <= .01) continue;
      boilSeed('grid' + i);
      const cx = 52 + (i % 6) * 83, cy = 84 + Math.floor(i / 6) * 90;
      push(); translate(cx, cy); scale(k);
      paint(rrPts(-34, -38, 68, 76, 6), { wash: THUMB[i % THUMB.length], ink: PAL.ink, sw: .4 });
      paint(ellPts(0, -4, 10, 13, 10), { wash: mixCol(THUMB[(i + 3) % THUMB.length], PAL.ink, .2), ink: null });
      pop();
    }
    for (let i = 0; i < 16; i++) {                       // the spill
      const t0 = .5 + i * .035, k = backOut(seg(a, t0, t0 + .18)); if (k <= .01) continue;
      boilSeed('spill' + i);
      const x = -130 + hash(i * 3.1) * (SW + 260), y = -110 + hash(i * 5.7 + 2) * (SH + 200), sh = a > .9 ? Math.sin(t * 30 + i) * 2 : 0;
      push(); translate(x + sh, y); rotate((hash(i + 9) - .5) * .6); scale(k);
      paint(rrPts(-34, -38, 68, 76, 6), { wash: THUMB[(i + 2) % THUMB.length], ink: PAL.ink, sw: .45 });
      pop();
    }
  }
  // the notes app: written and deleted, three times
  const TRIES = [[380, 300], [420, 360, 250], [110]];
  function scrNotes(t) {
    if (t < T.notesOpen + .2) scrSaved(t);
    const k = backOut(seg(t, T.notesOpen, T.notesOpen + .2));
    push(); translate(SW / 2, SH / 2); scale(k); translate(-SW / 2, -SH / 2);
    boilSeed('notes');
    paint(rectPts(0, 0, SW, SH), { wash: '#FFF7CF', ink: null });
    paint(rectPts(0, 0, SW, 30), { wash: '#F3D36B', ink: null });
    for (let i = 0; i < 3; i++) paint(ellPts(18 + i * 18, 15, 5, 5, 10), { wash: '#B9932E', ink: null });
    for (let j = 0; j < 6; j++) inkLine([[16, 92 + j * 40], [SW - 16, 92 + j * 40]], .3, '#E5D49A', 'inkfine', 0);
    inkLine([[46, 36], [46, SH - 6]], .35, '#E9A0A0', 'inkfine', 0);
    pop();
    if (k < 1) return;
    let i = -1; T.type.forEach(([a], j) => { if (t >= a) i = j; });
    let end = [56, 76];
    if (i >= 0) {
      const W_ = TRIES[i], sum = W_.reduce((x, y) => x + y), [a, b] = T.type[i], [d0, d1] = T.del[i];
      let shown = sum * seg(t, a, b);
      if (t > d0) shown = sum * (1 - easeIn(seg(t, d0, d1)));
      let left = shown;
      W_.forEach((w, j) => {
        const len = Math.min(w, Math.max(0, left)); left -= w;
        if (len > 0) { squig(56, len, 76 + j * 40, TXT, .7, i * 3 + j); end = [56 + len, 76 + j * 40]; }
      });
    }
    const busy = T.type.some(([a, b]) => t > a && t < b) || T.del.some(([a, b]) => t > a && t < b);
    if (busy || frac(t * 2) < .5) paint(rectPts(end[0] + 4, end[1] - 13, 3, 26), { wash: PAL.ink, ink: null });   // the cursor
  }
  function screen(t) {
    if (t < LID_ON) return SCR_BG('#2A2540');
    if (t < T.savedView) { scrFeed(t); const on = seg(t, LID_ON, LID_ON + .35); if (on < 1) paint(rectPts(0, 0, SW, SH), { wash: '#2A2540', washOp: 255 * (1 - on), ink: null }); return; }
    if (t < T.notesOpen) return scrSaved(t);
    scrNotes(t);
  }

  // ---------- the shots ----------
  function story(t, lt, dur) {
    const et = STW(t);
    const face = AIMA.room(et, { ct: t, h: hoursAt(et), cam: camAt(et, t), pose: creatorPose(et, t), screen, screenOn: et > LID_ON, lid: ease(seg(et, T.lid[0], T.lid[1])),
      mugs: et < T.clockPush + .45 ? 1 : 2, steam: true, hf: hoursAt });
    AIMA.caption(t, .6, 4.4, 'Mở laptop ra… và không biết đăng gì.', BR.violet, 60);      // the hook: the post's title
    AIMA.shout(et, T.punch[0], 'Rồi…', BR.violet, 'Rốt cuộc đăng gì đây?', BR.magenta, { y: 300, gap: T.punch[1] - T.punch[0] });
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Có ai cũng từng', 'bị đứng hình như vậy không?'], feel: 'shy' });

  shots([[0, story], [V_OUTRO, ending]]);
})();
