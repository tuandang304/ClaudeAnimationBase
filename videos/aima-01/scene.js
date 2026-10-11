// scene.js: AIMA #1, TikTok Awareness: "Tôi chỉ định làm 1 cái content thôi…" (context/aima/campaign.md, TikTok 1;
// storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from the same timings). Vertical.
// A creator sits down to make ONE piece of content and loses the whole day to research, trends, ideas, captions and
// editing. The sky in the window runs through the AIMA gradient (cyan → blue → violet → magenta → night) while the
// creator never notices, until the clock strikes midnight: "Ủa? Hết ngày rồi?". One room (the series set, ../_aima),
// one continuous camera (two time-lapse push-ins on the clock, a pan to the bin, a crash zoom). Then the series'
// outro: a question to the viewer and the small logo. An Awareness post: no product pitch.
// Keys below are in EVENT time; TIMING in video.js stretches them onto the clock (warp() in core.js), so the pacing is
// tuned there, not here.
(() => {
  const { BR, CREATOR, TXT, CX, GY, U, BIN, FLOOR_Y, SW, SH, bump, K, squig, SCR_BG } = AIMA;

  // ---------- the cut (video time) ----------
  // STW maps video time onto the story's clock (event time; it reaches 0 after the hook).
  const STW = warp(TIMING.story.rates, TIMING.story.end), V_OUTRO = STW.len;

  // ---------- time ----------
  // The clock creeps while the camera is elsewhere and spins during the two push-ins; the last minute clicks onto 12.
  const HOURS = [[0, 8], [5.8, 9], [6.3, 12.5], [9.4, 13.5], [9.9, 14.5], [12.3, 15.5], [12.6, 16.5], [15.4, 17.5], [15.9, 22.5], [18.6, 23.82], [19.85, 23.917]];
  const T_MIDNIGHT = 19.9;
  const hoursAt = t => t < T_MIDNIGHT ? kf(t, HOURS) : lerp(23.917, 24, backOut(seg(t, T_MIDNIGHT, T_MIDNIGHT + .14)));

  // ---------- camera: one continuous move through the room ----------
  // DESK = the creator and the laptop together; CLOCK = a push-in on the clock; the bin is down by the floor.
  const DESKV = z => [622, 900, z], CLOCKV = z => [AIMA.CLK[0], AIMA.CLK[1], z];
  const CAMK = [
    [0, [545, 920, 1.1]], [3.0, [560, 915, 1.14]], [3.5, DESKV(1.28)], [5.4, DESKV(1.31)],
    [5.85, CLOCKV(3.0)], [6.3, CLOCKV(3.06)], [6.75, DESKV(1.28)], [9.4, DESKV(1.31)],                       // clock push 1
    [9.9, [360, 1180, 1.2]], [12.3, [366, 1185, 1.24]], [12.55, DESKV(1.3)], [15.0, DESKV(1.34)],           // pan to the bin, whip back
    [15.45, CLOCKV(3.0)], [15.9, CLOCKV(3.06)], [16.35, DESKV(1.28)], [18.6, DESKV(1.31)],                  // clock push 2
    [19.4, [540, 900, 1.06]], [20.42, [540, 895, 1.08]], [20.6, [385, 1060, 1.8]], [23.5, [385, 1060, 1.86]],  // pull out, crash zoom
  ];
  const CAMK_V = STW.keys(CAMK);
  function camAt(t, ct) {                                // t: event time, ct: video time
    const [cx, cy, z] = kf(ct, CAMK_V), sh = t > 20.5 ? shakeXY(t, 12 * Math.exp(-(t - 20.5) * 6)) : [0, 0];
    return [cx + 6 * wob(ct, .07) + sh[0], cy + 4 * wob(ct, .05, .3) + sh[1], z];
  }

  // ---------- the creator ----------
  const KEYS = [K(0, 'hopeful'), K(.95, 'determined'), K(2.25, 'excited'), K(3.25, 'thinking'), K(4.8, 'dizzy'), K(6.0, 'neutral'),
    K(7.75, 'starstruck'), K(8.75, 'sad'), K(9.8, 'thinking'), K(11.6, 'idea'), K(12.55, 'determined'), K(13.8, 'angry'),
    K(14.35, 'determined'), K(15.6, 'sleepy'), K(18.4, 'relieved'), K(19.45, 'neutral'), K(20.5, 'surprised'), K(21.15, 'confused', { emote: null })];
  // drawn turns: [t0, t1, from, to] in turns (0 = facing us, .125 = 3/4 toward the laptop)
  const TURNS = [[1.6, 1.78, 0, .125], [9.6, 9.78, .125, 0], [12.3, 12.46, 0, .125], [20.45, 20.58, .125, 0]];
  const TOSS = [10.4, 10.9, 11.4];                       // paper-ball throws (the middle one misses)
  const KEYS_V = STW.keys(KEYS);
  function creatorPose(t, ct) {                          // t: event time, ct: video time (idles and blinks run on it)
    const p = emotions(ct, KEYS_V);
    let tv = { ...spinView(0), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); };
    const look = (x, y, w) => { p.lookX = lerp(p.lookX || 0, x, w); p.lookY = lerp(p.lookY || 0, y, w); };
    // A: tap a key; the screen wakes
    R(-.95, bump(t, 1.72, 1.86, 1.95, 2.15));
    // B: clicking through tabs on the music's eighth notes, eyes darting across them
    R(-.72 + .12 * pulse2(ct, 9), bump(t, 3.2, 3.5, 4.7, 4.9));
    look(.55 + .4 * Math.sin(t * 9), .15 * Math.sin(t * 5), bump(t, 3.5, 3.6, 4.7, 4.8));
    // C: scrolling the feed
    R(-.75 + .1 * Math.sin(t * TAU * 3), bump(t, 6.4, 6.6, 7.6, 7.75));
    look(.8, .25 + .2 * Math.sin(t * 7), bump(t, 6.5, 6.7, 7.6, 7.75));
    // E: typing, then retyping faster
    R(-.78 + .16 * Math.sin(t * TAU * 7), bump(t, 12.5, 12.65, 13.68, 13.78));
    R(-.78 + .18 * Math.sin(t * TAU * 9), bump(t, 14.3, 14.45, 15.15, 15.3));
    look(.8, .2, bump(t, 12.5, 12.65, 13.7, 13.8) + bump(t, 14.3, 14.45, 15.2, 15.3));
    // F: dragging clips on the beat, half asleep
    R(-.7 + .12 * pulse(ct, 8), bump(t, 16.3, 16.45, 17.3, 17.45));
    // G: the big stretch when it's finally done, then a glance up at the clock
    const st = bump(t, 18.4, 18.7, 19.2, 19.45);
    p.aL = lerp(p.aL ?? .2, 1.45, st); p.aR = lerp(p.aR ?? .2, 1.45, st); p.sq = (p.sq || 0) - .1 * st;
    look(.5, -1, bump(t, 19.42, 19.5, 20.42, 20.5));
    // D: three paper balls tossed over the shoulder into the bin
    for (const ti of TOSS) {
      if (t < ti - .5 || t > ti + .45) continue;
      const a = t < ti - .12 ? kf(t, [[ti - .5, p.aL ?? .2], [ti - .25, 1.35], [ti - .12, 1.6]]) : t < ti + .06 ? lerp(1.6, -.15, easeIn(seg(t, ti - .12, ti + .06))) : lerp(-.15, p.aL ?? .2, backOut(seg(t, ti + .06, ti + .45)));
      p.aL = a; p.rot = (p.rot || 0) - .06 * Math.sin(seg(t, ti - .5, ti + .45) * Math.PI);
    }
    return p;
  }

  // ---------- paper balls: two land in the bin, the middle one bounces off the rim onto the floor ----------
  const BIN_IN = [[BIN.x - 18, BIN.top - 6], null, [BIN.x + 20, BIN.top - 9]];
  const MISS_RIM = [BIN.x + 58, BIN.top - 4], MISS_FLOOR = [BIN.x + 165, FLOOR_Y + 12];
  function balls(t, p) {
    if (t < TOSS[0] - .4) return;
    TOSS.forEach((ti, i) => {
      boilSeed('ball' + i);
      if (t < ti - .4) return;
      const r = 16;
      if (t < ti + .06) { const [hx, hy] = AIMA.leftHand(p); return AIMA.ball(hx, hy, r * backOut(seg(t, ti - .4, ti - .25)) + .5, (t - ti) * 3); }   // crumpled up in the hand
      const h0 = AIMA.leftHand({ ...p, aL: -.15 }), fl = .42;
      if (i !== 1) {
        const k = seg(t, ti + .06, ti + .06 + fl), [x, y] = arcPt(h0, BIN_IN[i], 150, k);
        return AIMA.ball(x, y, r, k * 6 + i);
      }
      const k1 = seg(t, ti + .06, ti + .06 + fl);
      if (k1 < 1) { const [x, y] = arcPt(h0, MISS_RIM, 140, k1); return AIMA.ball(x, y, r, k1 * 6); }
      const k2 = seg(t, ti + .06 + fl, ti + .06 + fl + .4), [x, y] = arcPt(MISS_RIM, MISS_FLOOR, 70, easeOut(k2));
      return AIMA.ball(x, y, r, 6 + k2 * 5);
    });
  }

  // ---------- what's on the laptop (screen design space, SW × SH) ----------
  function scrOff(t) {
    SCR_BG('#2A2540');
    inkLine([[SW * .55, 20], [SW * .8, 110]], 1.2, '#3E3858', 'dry', 0);
  }
  function scrResearch(t) {
    SCR_BG('#EAF1FB');
    const on = clamp((t - 1.95) / .12);
    paint(rrPts(110, 120, 300, 40, 18), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    paint(ellPts(136, 140, 9, 9, 12), { ink: PAL.ink, sw: .45 });
    squig(156, 120, 140, '#9C94B0', .45);
    const T0 = [3.5, 3.8, 4.05, 4.27, 4.46, 4.61, 4.72, 4.81, 4.88, 4.94], COL = [BR.cyan, BR.blue, BR.violet, BR.magenta];
    T0.forEach((ti, i) => {
      if (t < ti) return;
      boilSeed('tab' + i);
      const k = backOut(seg(t, ti, ti + .16)), w = 230, h = 150, spill = i >= 5;
      const x = spill ? -90 + hash(i * 5.3) * (SW - 60) : 15 + hash(i * 5.3) * (SW - 260), y = spill ? -60 + hash(i * 2.9 + 1) * (SH - 40) : 15 + hash(i * 2.9 + 1) * (SH - 180);
      const sh = t > 4.8 ? Math.sin(t * 30 + i) * 2 : 0;
      push(); translate(x + w / 2 + sh, y + h / 2); scale(k); translate(-w / 2, -h / 2);
      paint(rrPts(0, 0, w, h, 8), { wash: '#FFFDF8', ink: PAL.ink, sw: .5 });
      paint(rrPts(0, 0, w, 24, 7), { wash: COL[i % 4], ink: null });
      for (let d = 0; d < 3; d++) paint(ellPts(12 + d * 12, 12, 3.5, 3.5, 8), { wash: PAL.cream, ink: null });
      for (let l = 0; l < 3; l++) squig(16, (w - 40) * (.55 + .45 * hash(i * 3 + l)), 48 + l * 22, TXT, .45, i + l);
      if (i % 3 === 0) paint(rectPts(16, 112, 80, 26), { wash: mixCol(COL[(i + 1) % 4], PAL.cream, .5), ink: null });
      pop();
    });
    if (on < 1) paint(rectPts(0, 0, SW, SH), { wash: '#2A2540', washOp: 255 * (1 - on), ink: null });
  }
  // the feed scrolls, lands on a hot trend, the trend line shoots up and then crashes
  const PITCH = 205, CARD = 180, VP = [36, 264], HOT = 6;
  const scrollAt = t => kf(t, [[6.65, 0], [7.6, HOT * PITCH - 24]]);
  function clipRect(x, y, w, h, o) {
    const y0 = Math.max(y, VP[0]), y1 = Math.min(y + h, VP[1]);
    if (y1 - y0 > 2) paint(rectPts(x, y0, w, y1 - y0), o);
  }
  function scrTrend(t) {
    SCR_BG('#F4EEFF');
    boilSeed('feed');
    const s = scrollAt(t), THUMB = ['#9ADBE8', '#F3B6E4', '#B9C4F7', '#FFD3A8', '#C5B6F5', '#A9E3C9'];
    for (let i = 0; i <= HOT + 1; i++) {
      const y = 60 + i * PITCH - s;
      if (y > VP[1] || y + CARD < VP[0]) continue;
      clipRect(24, y, 180, CARD, { wash: '#FFFDF8', ink: PAL.ink, sw: .4 });
      const hot = i === HOT;
      clipRect(32, y + 8, 164, 118, { wash: hot ? mixCol(BR.magenta, '#FFB070', .35) : THUMB[i % 6], ink: null });
      if (y + 140 > VP[0] && y + 168 < VP[1]) { squig(36, 110, y + 144, TXT, .45, i); squig(36, 70, y + 162, TXT, .45, i + 2); }
      if (y + 120 < VP[1] && y + 100 > VP[0]) paint(heartPts(180, y + 112, 9), { wash: hot ? '#E2476E' : '#C9BFD9', ink: null });
    }
    paint(rectPts(0, 0, SW, VP[0]), { wash: '#E3DAF7', ink: null });
    paint(rectPts(0, VP[1], SW, SH - VP[1]), { wash: '#E3DAF7', ink: null });
    // the hot one: a flame
    if (t > 7.6) {
      boilSeed('flame');
      const k = backOut(seg(t, 7.6, 7.8)), fx = 114, fy = 60 + HOT * PITCH - s + 62, fl = 1 + .08 * Math.sin(t * 25), dead = seg(t, 8.45, 8.7);
      const P = [[0, -36], [14, -12], [22, 6], [14, 24], [0, 30], [-14, 24], [-22, 6], [-12, -8], [-6, 2]].map(([a, b]) => [fx + a * k, fy + b * k * fl * (1 - .4 * dead)]);
      paint(P, { wash: mixCol('#FF8A3D', '#9AA0B4', dead), ink: PAL.ink, sw: .5, curv: .5 });
    }
    // chart
    boilSeed('chart');
    paint(rectPts(226, VP[0] + 10, 274, VP[1] - VP[0] - 20), { wash: '#FFFDF8', ink: PAL.ink, sw: .4 });
    inkLine([[246, 70], [246, 236], [486, 236]], .5, '#8C84A0', 'inkfine', 0);
    const rise = ease(seg(t, 7.6, 8.25)), crash = easeIn(seg(t, 8.42, 8.66)), N = 12, P = [];
    for (let i = 0; i < N; i++) {
      const x = 254 + i * 20; let y = 210 - 12 * hash(i + 4);
      if (i >= 7) y = lerp(y, 210 - (i - 6) * 28, rise);
      if (i >= 10) y = lerp(y, 228, crash * (i === 10 ? .55 : 1));
      if (i < 7 || (i - 6) / 5 <= rise + .01) P.push([x, y]);
    }
    const lc = mixCol(BR.magenta, '#8C94B4', crash);
    if (t > 6.6) inkLine(P, 1.1, lc, 'ink', .3);
    if (rise > .05 && P.length > 1) {
      const [a, b] = P.slice(-2), ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
      paint([[b[0] + Math.cos(ang) * 12, b[1] + Math.sin(ang) * 12], [b[0] + Math.cos(ang + 2.4) * 10, b[1] + Math.sin(ang + 2.4) * 10], [b[0] + Math.cos(ang - 2.4) * 10, b[1] + Math.sin(ang - 2.4) * 10]], { wash: lc, ink: null });
    }
    // hearts fly up out of the screen while it's hot
    for (let i = 0; i < 6; i++) {
      const t0 = 7.65 + i * .12, a = t - t0;
      if (a < 0 || a > .9) continue;
      boilSeed('fh' + i);
      paint(heartPts(70 + i * 22 + 18 * Math.sin(a * 6 + i), 160 - a * 260, 10 + 5 * hash(i)), { wash: i % 2 ? '#E2476E' : BR.magenta, washOp: 255 * (1 - seg(a, .6, .9)), ink: PAL.ink, sw: .4 });
    }
  }
  // the caption: four lines typed, all deleted, typed again faster with emoji
  const LINES1 = [400, 350, 420, 230], LINES2 = [430, 380, 300, 210];
  function textLines(widths, total, y0, ph) {
    let left = total, end = [40, y0];
    widths.forEach((w, j) => {
      const len = Math.min(w, Math.max(0, left)); left -= w;
      if (len > 0) { squig(40, len, y0 + j * 46, j === 3 ? BR.blue : TXT, .7, ph + j); end = [40 + len, y0 + j * 46]; }
    });
    return end;
  }
  function scrCaption(t) {
    boilSeed('doc');
    if (t < 12.62) scrTrend(t);
    const k = t < 12.62 ? backOut(seg(t, 12.42, 12.62)) : 1;
    push(); translate(SW / 2, SH / 2); scale(k); translate(-SW / 2, -SH / 2);
    paint(rectPts(0, 0, SW, SH), { wash: '#FFFDF8', ink: null });
    paint(rectPts(0, 0, SW, 30), { wash: '#E6E0F5', ink: null });
    for (let i = 0; i < 4; i++) paint(rrPts(14 + i * 26, 8, 16, 14, 3), { wash: [BR.cyan, BR.blue, BR.violet, BR.magenta][i], ink: null });
    pop();
    if (k < 1) return;
    let end;
    const sum1 = LINES1.reduce((a, b) => a + b), sum2 = LINES2.reduce((a, b) => a + b);
    if (t < 13.7) end = textLines(LINES1, sum1 * seg(t, 12.7, 13.62), 72, 0);
    else if (t < 14.35) end = textLines(LINES1, sum1 * (1 - easeIn(seg(t, 13.7, 14.0))), 72, 0);
    else {
      end = textLines(LINES2, sum2 * seg(t, 14.4, 15.05), 72, 3);
      [[1, 395, 'heart'], [2, 315, 'fire']].forEach(([j, x, kind], n) => {
        const ka = seg(t, 14.4 + (LINES2.slice(0, j + 1).reduce((a, b) => a + b) / sum2) * .65, 14.5 + (LINES2.slice(0, j + 1).reduce((a, b) => a + b) / sum2) * .65 + .1);
        if (ka <= 0) return;
        boilSeed('emo' + n); const y = 72 + j * 46, r = 13 * backOut(ka) + 1e-3;
        if (kind === 'heart') paint(heartPts(40 + x + 18, y, r), { wash: '#E2476E', ink: PAL.ink, sw: .4 });
        else paint([[0, -1.2], [.6, -.2], [.7, .5], [0, .9], [-.7, .5], [-.5, -.3]].map(([a, b]) => [40 + x + 18 + a * r, y + b * r]), { wash: '#FF8A3D', ink: PAL.ink, sw: .4, curv: .5 });
      });
    }
    // the cursor blinks while idle
    const typing = (t > 12.7 && t < 14.0) || (t > 14.4 && t < 15.05);
    if (typing || frac(t * 2) < .5) paint(rectPts(end[0] + 4, end[1] - 13, 3, 26), { wash: PAL.ink, ink: null });
  }
  // the edit: clips drop onto the timeline, the render runs, a check mark
  const CLIPS = [[0, 20, 150, BR.cyan, 16.5], [0, 178, 170, BR.violet, 16.75], [1, 60, 200, BR.magenta, 17.0], [2, 20, 260, BR.blue, 17.25], [1, 272, 150, BR.cyan, 17.35]];
  function scrEdit(t) {
    SCR_BG('#2B2742');
    boilSeed('edit');
    paint(rrPts(150, 14, 220, 120, 6), { wash: '#1E1B30', ink: null });
    [BR.cyan, BR.blue, BR.violet, BR.magenta].forEach((c, i) => paint(rectPts(160 + i * 50, 22, 50, 104), { wash: c, ink: null }));
    paint([[248, 56], [248, 94], [282, 75]], { wash: PAL.cream, ink: PAL.ink, sw: .4 });
    paint(rectPts(10, 160, 500, 130), { wash: '#221F36', ink: null });
    for (let i = 0; i < 3; i++) inkLine([[16, 172 + i * 40 + 34], [504, 172 + i * 40 + 34]], .3, '#4A4466', 'inkfine', 0);
    CLIPS.forEach(([tr, x, w, c, ti], i) => {
      if (t < ti) return;
      boilSeed('clip' + i);
      const k = backOut(seg(t, ti, ti + .2));
      push(); translate(x + w / 2, 172 + tr * 40 + 15); scale(k);
      paint(rrPts(-w / 2, -15, w, 30, 6), { wash: c, ink: PAL.ink, sw: .45 });
      pop();
    });
    const r = seg(t, 17.45, 18.3);
    if (t > 17.45) {
      boilSeed('render');
      paint(rrPts(150, 141, 220, 10, 4), { wash: '#1E1B30', ink: null });
      if (r > .02) paint(rrPts(150, 141, 220 * r, 10, 4), { wash: BR.cyan, ink: null });
      const px = lerp(20, 490, r);
      inkLine([[px, 164], [px, 290]], .8, BR.magenta, 'ink', 0);
      paint([[px - 7, 160], [px + 7, 160], [px, 170]], { wash: BR.magenta, ink: null });
    }
    if (t > 18.32) {
      boilSeed('check');
      const k = backOut(seg(t, 18.32, 18.55));
      paint(ellPts(260, 74, 46 * k + 1, 46 * k + 1, 22), { wash: '#4ED6A0', ink: PAL.ink, sw: .6 });
      if (k > .3) inkLine([[238, 74], [254, 92], [284, 56]].map(([x, y]) => [260 + (x - 260) * k, 74 + (y - 74) * k]), 2.2, PAL.cream, 'ink', 0);
    }
  }
  function storyScreen(t) {
    if (t < 1.95) scrOff(t);
    else if (t < 6.0) scrResearch(t);
    else if (t < 12.42) scrTrend(t);
    else if (t < 15.6) scrCaption(t);
    else scrEdit(t);
  }


  // ---------- the story (the room's clock reaches 0 after the hook) ----------
  function story(t, lt, dur) {
    const rt = STW(t);
    const face = AIMA.room(rt, { ct: t, h: hoursAt(rt), cam: camAt(rt, t), pose: creatorPose(rt, t), screen: storyScreen, screenOn: rt > 1.95,
      mugs: rt < 6 ? 1 : rt < 15.6 ? 3 : 5, steam: rt < 6, after: balls, hf: hoursAt, strikeT: T_MIDNIGHT });
    AIMA.caption(t, .75, 4.6, 'Tôi chỉ định làm 1 cái content thôi…', BR.violet, 60);   // the hook, after the iris
    AIMA.shout(rt, 21.2, 'Ủa?', BR.magenta, 'Hết ngày rồi?', BR.violet, { y: 300 });     // the punchline, after the take
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Bạn mất bao lâu', 'cho 1 cái content?'], feel: 'shy' });

  shots([[0, story], [V_OUTRO, ending]]);
})();
