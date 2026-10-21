// scene.js: AIMA #3, TikTok Problem: "Trend này đang viral… nhưng brand mình làm gì với nó?" (context/aima/campaign.md,
// TikTok 3; storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING in video.js).
// Vertical. The same creator, the same room (the series set, ../_aima); this time the creator also sells something: a
// scented candle sits on the desk. Scrolling in the afternoon, the creator lands on a viral dance: "Bắt trend liền thôi!".
// Three thought bubbles try to fit the trend to the brand: the candle dances and tips over; neon paint over the brand
// colours gets an X; the customers only have question marks. The afternoon flies by on the clock. Back on the feed,
// everyone has done the dance already and the flame goes out. Crash zoom: "Thấy trend thì dễ… Biến thành content mới
// khó!". Then the series' outro: a question to the viewer and the small logo. A Problem post: no product pitch.
(() => {
  const { BR, TXT, SW, SH, bump, K, squig, SCR_BG } = AIMA;
  const T = TIMING;
  const STW = warp(T.story.rates, T.story.end), V_OUTRO = STW.len;

  // ---------- time of day: mid-afternoon; the clock spins on the push-in, and it's sunset by the end ----------
  const HOURS = [[0, 14], [T.clockPush, 14.6], [T.clockPush + .45, 14.9], [T.clockPush + .9, 17.1], [T.back, 17.4], [T.story.end, 17.9]];
  const hoursAt = t => kf(t, HOURS);

  // ---------- camera ----------
  const DESKV = z => [622, 900, z], MIDV = z => [650, 940, z], THINKV = z => [450, 820, z], CLOCKV = z => [AIMA.CLK[0], AIMA.CLK[1], z];
  const CAMK = [
    [0, DESKV(1.22)], [2.7, DESKV(1.24)], [3.25, MIDV(1.36)], [7.3, MIDV(1.38)],                          // the viral video
    [8.1, THINKV(1.15)], [T.clockPush, THINKV(1.17)],                                                    // thinking: bubbles 1, 2
    [T.clockPush + .45, CLOCKV(3.0)], [T.clockPush + .9, CLOCKV(3.06)], [T.clockPush + 1.35, THINKV(1.17)],   // the afternoon goes by
    [T.bubbles[2][1], THINKV(1.18)], [T.back + .35, MIDV(1.36)], [T.grid, MIDV(1.42)], [T.turn - .05, MIDV(1.44)],   // back to the feed
    [T.turn + .2, [620, 920, 1.22]], [T.crash - .1, [560, 905, 1.12]], [T.crash, [385, 1060, 1.8]], [T.story.end, [385, 1060, 1.86]],   // crash zoom
  ];
  function camAt(t) {
    const [cx, cy, z] = kf(t, CAMK), sh = t > T.crash ? shakeXY(t, 12 * Math.exp(-(t - T.crash) * 6)) : [0, 0];
    return [cx + 6 * wob(t, .07) + sh[0], cy + 4 * wob(t, .05, .3) + sh[1], z];
  }

  // ---------- the creator ----------
  const [B1, B2, B3] = T.bubbles;
  const KEYS = [K(0, 'bored'), K(T.notice, 'surprised'), K(T.notice + .7, 'starstruck'), K(T.go - .15, 'determined'),
    K(B1[0] + .1, 'thinking'), K(T.tip + .15, 'disgusted'), K(B2[0], 'thinking'), K(T.neon + .1, 'hopeful'), K(T.stamp, 'sad'),
    K(T.clockPush - .2, 'neutral'), K(B3[0], 'thinking'), K(T.qs, 'nervous'), K(T.back - .1, 'neutral'),
    K(T.grid + .2, 'surprised'), K(T.grid + 1.1, 'sad'), K(T.crash, 'confused')];
  const TURNS = [[7.45, 7.62, .125, 0], [T.back - .2, T.back - .03, 0, .125], [T.turn, T.turn + .17, .125, 0]];   // to us, to the laptop, to us
  function creatorPose(t) {
    const p = emotions(t, KEYS);
    let tv = { ...spinView(.125), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); };
    const L = (a, w) => { p.aL = lerp(p.aL ?? .2, a, w); };
    const look = (x, y, w) => { p.lookX = lerp(p.lookX || 0, x, w); p.lookY = lerp(p.lookY || 0, y, w); };
    R(-.8 + .08 * Math.sin(t * TAU * 2), bump(t, 0, .2, T.notice - .1, T.notice + .1));                  // scrolling...
    for (const s of T.swipes) R(-1.0, bump(t, s - .1, s - .03, s + .05, s + .15));                       // ...flick
    L(1.35 + .08 * Math.sin(t * 9), bump(t, T.go - .2, T.go - .05, T.go + .8, T.go + 1.05));             // fist up: let's go
    R(-.8 + .08 * Math.sin(t * TAU * 2), bump(t, T.back + .1, T.back + .3, T.grid, T.grid + .2));         // scrolling again
    for (const s of T.late) R(-1.0, bump(t, s - .1, s - .03, s + .05, s + .15));
    look(.75, .2, bump(t, .1, .3, 7.3, 7.5) + bump(t, T.back, T.back + .2, T.turn, T.turn + .1));        // at the laptop
    look(.55, -.9, bump(t, B1[0] - .1, B1[0] + .1, T.clockPush, T.clockPush + .15) + bump(t, T.clockPush + 1.2, T.clockPush + 1.4, B3[1], B3[1] + .15));   // up at the bubble
    return p;
  }

  // ---------- the brand: a scented candle (jar, wax, wick, flame). x, y = the jar's base centre; s = scale ----------
  const JAR = '#E7DEFF', BAND = BR.violet, NEON = ['#B6F23A', '#FF7A1A', '#FF3FA4'];
  function candle(x, y, s, o = {}) {
    const fl = o.flame ?? 1, n = o.neon ?? 0, sw = (o.sw ?? .7);
    push(); translate(x, y); rotate(o.rot || 0);
    if (fl > .02) glow(0, -66 * s, 70 * s * fl, '#FFC766', .5 * fl);
    paint(rrPts(-22 * s, -56 * s, 44 * s, 56 * s, 8 * s), { wash: mixCol(JAR, NEON[0], n), ink: PAL.ink, sw });
    paint(rectPts(-22 * s, -36 * s, 44 * s, 16 * s), { wash: mixCol(BAND, NEON[1], n), ink: null });
    paint(ellPts(0, -28 * s, 6 * s, 4 * s, 10), { wash: mixCol(BR.cyan, NEON[2], n), ink: null });
    paint(ellPts(0, -52 * s, 18 * s, 4 * s, 14), { wash: PAL.cream, ink: null });
    inkLine([[0, -52 * s], [1 * s, -60 * s]], sw * .9, PAL.ink, 'inkfine', 0);
    if (fl > .02) {
      const w = 1 + .1 * Math.sin(T_ * 23), lean = (o.lean || 0) * 6 * s, h = 20 * s * fl * w;
      paint([[0, -60 * s - h], [6 * s * fl + lean * .3, -64 * s], [5 * s * fl, -59 * s], [0, -57 * s], [-5 * s * fl, -59 * s], [-6 * s * fl + lean * .3, -64 * s]].map(([a, b], i) => [a + (i === 0 ? lean : 0), b]),
        { wash: '#FFB13D', ink: PAL.ink, sw: sw * .7, curv: .6 });
    }
    pop();
  }
  let T_ = 0;                                            // the frame's time, for the flicker
  function smoke(x, y, s, age) {                         // a curl of smoke from a candle that just went out
    if (age < 0 || age > 1.6) return;
    const P = [];
    for (let k = 0; k < 7; k++) P.push([x + 8 * s * Math.sin(k * 1.1 + age * 4), y - k * 9 * s - age * 30 * s]);
    inkLine(P, .6 * s, mixCol('#9C94B0', PAL.cream, seg(age, .8, 1.6)), 'inkfine', .6);
  }

  // ---------- the thought bubble: a cloud above the creator's head; what's in it is drawn around its centre ----------
  const BX = 430, BY = 620, BRX = 240, BRY = 165;
  function bubble(t, [t0, t1], content) {
    if (t < t0 || t > t1 + .3) return;
    const kin = backOut(seg(t, t0, t0 + .35)), kout = seg(t, t1, t1 + .14), k = kin * (1 + .12 * kout);
    boilSeed('dots' + t0);
    [[505, 850, 9, 0], [478, 812, 14, .08]].forEach(([x, y, r, d]) => { const kd = backOut(seg(t, t0 - .1 + d, t0 + .1 + d)) * (1 - kout); if (kd > .02) paint(ellPts(x, y, r * kd, r * kd, 12), { wash: PAL.cream, ink: PAL.ink, sw: .7 }); });
    if (kout < 1) {
      boilSeed('bubble' + t0);
      const P = [];
      for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, r = 1 + .07 * Math.abs(Math.sin(a * 4.5)); P.push([BX + Math.cos(a) * BRX * r * k, BY + Math.sin(a) * BRY * r * k]); }
      paint(P, { wash: PAL.cream, washOp: 255 * (1 - kout), ink: kout > .3 ? null : PAL.ink, sw: .9, curv: .4 });
      if (kin > .6 && kout === 0) { push(); translate(BX, BY); scale(k); content(t, t - t0); pop(); }
    }
    if (kout > 0) for (let i = 0; i < 8; i++) {          // it pops
      boilSeed('burst' + t0 + i);
      const a = i / 8 * TAU + .2, d0 = 1.05 + .3 * kout, d1 = d0 + .25 * (1 - seg(t, t1 + .1, t1 + .3));
      inkLine([[BX + Math.cos(a) * BRX * d0, BY + Math.sin(a) * BRY * d0], [BX + Math.cos(a) * BRX * d1, BY + Math.sin(a) * BRY * d1]], .9, PAL.ink, 'ink', 0);
    }
  }
  const floorLine = () => inkLine([[-150, 92], [150, 94]], .7, '#B9AFCB', 'inkfine', 0);
  // 1: the candle does the dance... and tips over
  function think1(t, a) {
    floorLine();
    const dancing = t < T.tip, kf_ = seg(t, T.tip, T.tip + .28);
    let rot = .32 * Math.sin(t * TAU), dy = -16 * pulse(t, 6);
    if (!dancing) { rot = lerp(.32 * Math.sin(T.tip * TAU), 1.5, easeIn(kf_)) - .08 * spring(t, T.tip + .28, 6, 28); dy = 0; }
    boilSeed('c1');
    candle(0, 92 + dy, 2.1, { rot, flame: dancing ? 1 : 1 - seg(t, T.tip + .2, T.tip + .35), lean: -Math.cos(t * TAU) * (dancing ? 1 : 0), sw: .8 });
    if (dancing) emote('music', 110, -70, 13, seg(a, .3, .55), a);
    else { boilSeed('smoke1'); const tipX = Math.sin(1.5) * 2.1 * 62, tipY = 92 - Math.cos(1.5) * 2.1 * 62; smoke(tipX, tipY, 1.5, t - T.tip - .3); }
    if (!dancing) emote('sweat', -120, -60, 12, seg(t, T.tip + .4, T.tip + .6), t - T.tip);
  }
  // 2: neon paint over the brand colours, and an X
  function think2(t, a) {
    floorLine();
    boilSeed('swatch');                                  // the brand's colours, on the left
    [BR.violet, BR.cyan, BR.magenta].forEach((c, i) => paint(ellPts(-170, -70 + i * 44, 17, 17, 14), { wash: c, ink: PAL.ink, sw: .5 }));
    const n = ease(seg(t, T.neon, T.neon + .5));
    boilSeed('c2');
    candle(10, 92, 2.1, { neon: n, rot: .04 * Math.sin(t * 3), sw: .8 });
    for (let i = 0; i < 3; i++) {                        // neon strokes swipe on
      const k = seg(t, T.neon + i * .12, T.neon + .25 + i * .12); if (k <= 0) continue;
      boilSeed('neon' + i);
      const P = []; for (let j = 0; j <= 6 * k; j++) P.push([-70 + j * 26 + 10, -40 + i * 38 + (j % 2 ? -8 : 8)]);
      if (P.length > 1) paint(ribbon(P, 9, 7), { wash: NEON[i], ink: PAL.ink, sw: .45 });
    }
    if (t > T.stamp) {                                   // the X
      const k = backOut(seg(t, T.stamp, T.stamp + .2)) * (1 + .3 * Math.exp(-(t - T.stamp) * 10));
      for (const s of [-1, 1]) { boilSeed('x' + s); paint(ribbon([[-70 * s * k + 10, -60 * k + 30], [70 * s * k + 10, 60 * k + 30]], 13 * k, 13 * k), { wash: '#E2476E', ink: PAL.ink, sw: .6 }); }
    }
  }
  // 3: the customers look at it... and wonder
  const FANS = [[-150, '#F3B6E4', '#E06FB5'], [-50, '#9ADBE8', '#4F8CF0'], [50, '#FFD3A8', '#E9A27A'], [150, '#C5B6F5', '#8B6CF5']];
  function think3(t, a) {
    boilSeed('c3');
    candle(0, -30, 1.2, { sw: .6 });
    FANS.forEach(([x, head, body], i) => {
      const k = backOut(seg(t, T.fans[i], T.fans[i] + .22)); if (k < .02) return;
      boilSeed('fan' + i);
      const bob = 4 * Math.sin(t * 5 + i * 1.7), y = 112 + bob;
      push(); translate(x, y); scale(k);
      paint(ellPts(0, 0, 36, 26, 16), { wash: body, ink: PAL.ink, sw: .6 });
      paint(ellPts(0, -40, 24, 24, 16), { wash: head, ink: PAL.ink, sw: .6 });
      const lx = -x * .03;                               // they look up at the candle
      for (const s of [-1, 1]) paint(ellPts(s * 8 + lx, -44, 2.6, 3.4, 8), { wash: PAL.ink, ink: null });
      pop();
      const tq = T.qs + i * .14;
      if (t > tq) emote('?', x + 22, y - 72, 10, seg(t, tq, tq + .25), t - tq);
    });
  }

  // ---------- the feed: a vertical video player; the viral one is a dance ----------
  const VP = [8, SH - 8], CARD = [182, 156, 296];
  const PLAIN = ['#9ADBE8', '#A9E3C9', '#FFD3A8'], HOT = 3;
  const swipeLen = .26;
  const scrollAt = t => [...T.swipes, ...T.late].reduce((s, ts) => s + ease(seg(t, ts, ts + swipeLen)), 0);
  const isHot = t => t > T.hot && t < T.grid + .6;
  function clipRect(x, y, w, h, o) {
    const y0 = Math.max(y, VP[0]), y1 = Math.min(y + h, VP[1]);
    if (y1 - y0 > 2) paint(rectPts(x, y0, w, y1 - y0), o);
  }
  const inVP = (y0, y1) => y0 >= VP[0] && y1 <= VP[1];
  // the trend's dance: arms swap up and down on every beat, a hop, a sway (identical on every copy: that's the joke)
  function dancer(bx, by, s, t, col) {
    const sw = Math.sin(t * TAU), hop = 12 * s * pulse(t, 6), y = by - hop;
    paint(ellPts(bx + 6 * s * sw, y - 50 * s, 14 * s, 14 * s, 14), { wash: '#FFE3C8', ink: PAL.ink, sw: .45 });
    paint(ellPts(bx + 3 * s * sw, y, 22 * s, 30 * s, 16), { wash: col, ink: PAL.ink, sw: .45 });
    const up = Math.sin(t * TAU * 2);                    // arms swap twice a second
    inkLine([[bx - 18 * s, y - 12 * s], [bx - 40 * s, y - 12 * s - 30 * s * up]], .8, PAL.ink, 'ink', 0);
    inkLine([[bx + 18 * s, y - 12 * s], [bx + 40 * s, y - 12 * s + 30 * s * up]], .8, PAL.ink, 'ink', 0);
    inkLine([[bx - 8 * s, y + 28 * s], [bx - 14 * s, by + 44 * s]], .8, PAL.ink, 'ink', 0);
    inkLine([[bx + 8 * s, y + 28 * s], [bx + 14 * s, by + 44 * s]], .8, PAL.ink, 'ink', 0);
  }
  const DCOL = [BR.magenta, BR.blue, '#FF8A3D', BR.violet, '#3FBF8F'];
  function card(i, y, t) {
    const [x, w] = CARD, h = VP[1] - VP[0];
    boilSeed('card' + i);
    if (i < HOT) {                                       // ordinary videos: a bowl, a cat, a sunset
      const col = PLAIN[i];
      clipRect(x, y, w, h, { wash: col, ink: null });
      clipRect(x, y + h * .62, w, h * .38, { wash: mixCol(col, PAL.ink, .2), ink: null });
      const cy = y + h * .45;
      if (inVP(cy - 40, cy + 40)) {
        if (i === 0) { paint(ellPts(x + w / 2, cy + 10, 44, 22, 16), { wash: PAL.cream, ink: PAL.ink, sw: .45 }); paint(ellPts(x + w / 2, cy, 34, 9, 12), { wash: '#E9A27A', ink: null }); }
        if (i === 1) { paint(ellPts(x + w / 2, cy, 30, 26, 16), { wash: '#F0B27A', ink: PAL.ink, sw: .45 }); for (const s of [-1, 1]) paint([[x + w / 2 + s * 26, cy - 10], [x + w / 2 + s * 18, cy - 38], [x + w / 2 + s * 8, cy - 22]], { wash: '#F0B27A', ink: PAL.ink, sw: .45 }); }
        if (i === 2) paint(ellPts(x + w / 2, cy + 20, 30, 30, 18), { wash: '#FF9A5A', ink: null });
      }
    } else {                                             // the dance, and later every copy of it
      clipRect(x, y, w, h * .55, { wash: '#F59AD9', ink: null });
      clipRect(x, y + h * .55, w, h * .45, { wash: '#FFB46B', ink: null });
      const by = y + h * .55;
      if (inVP(by - 80, by + 50)) dancer(x + w / 2, by, 1, t, DCOL[(i - HOT) % DCOL.length]);
    }
    if (inVP(y + h - 52, y + h - 14)) { squig(x + 12, w * .7, y + h - 44, PAL.cream, .45, i); squig(x + 12, w * .45, y + h - 24, PAL.cream, .45, i + 1); }
  }
  function flameIcon(x, y, r, lit, dieAge) {
    const d = clamp(dieAge / .4), f = 1 + .08 * Math.sin(T_ * 20) * (1 - d);
    const P = [[0, -1.3], [.55, -.45], [.75, .3], [.45, .85], [0, 1], [-.45, .85], [-.75, .3], [-.4, -.3], [-.2, .1]].map(([a, b]) => [x + a * r, y + b * r * f * (1 - .35 * d)]);
    paint(P, { wash: lit ? mixCol('#FF8A3D', '#8C8AA0', d) : '#5C5670', ink: lit ? PAL.ink : null, sw: .45, curv: .5 });
    if (dieAge > .3) smoke(x, y - r * 1.1, .9, dieAge - .3);
  }
  function scrFeed(t) {
    SCR_BG('#16131F');
    const p = scrollAt(t), i0 = Math.floor(p);
    for (let i = Math.max(0, i0 - 1); i <= i0 + 1; i++) card(i, VP[0] + (i - p) * CARD[2], t);
    boilSeed('icons');
    paint(ellPts(372, 70, 15, 15, 14), { wash: '#C5B6F5', ink: PAL.cream, sw: .4 });
    paint(heartPts(372, 120, 13), { wash: isHot(t) ? '#E2476E' : '#8C84A0', ink: null });
    paint(ellPts(372, 165, 13, 11, 12), { wash: PAL.cream, ink: null });
    const hk = isHot(t) ? backOut(seg(t, T.hot, T.hot + .25)) : 1;
    push(); translate(372, 216); scale(hk); flameIcon(0, 0, 16, t > T.hot, t - T.grid - .6); pop();
    // the left panel: views climbing while it's hot, then sliding as it gets old
    boilSeed('views');
    paint(rectPts(10, 10, 150, SH - 20), { wash: '#221E30', ink: null });
    const rise = ease(seg(t, T.hot, T.hot + 1.2)), fall = ease(seg(t, T.late[0], T.grid + .8));
    for (let b = 0; b < 6; b++) {
      const base = 18 + 10 * hash(b + 3), top = b >= 2 ? (b - 1) * 38 * rise : 0, hh = Math.max(6, base + top * (1 - fall * (b >= 3 ? (b - 2) * .32 : 0)));
      paint(rectPts(24 + b * 22, SH - 30 - hh, 15, hh), { wash: b >= 2 && rise > .1 ? mixCol(BR.magenta, '#8C84A0', fall) : '#4A4466', ink: null });
    }
    // hearts fly up off the viral video
    if (t > T.hot) for (let i = 0; i < 40; i++) {
      const t0 = T.hot + i * .3, a = t - t0;
      if (a < 0 || a > 1.1 || t0 > T.grid + .4) continue;
      boilSeed('fh' + i);
      paint(heartPts(250 + 30 * hash(i) + 14 * Math.sin(a * 6 + i), 250 - a * 220, 9 + 4 * hash(i + 5)), { wash: i % 2 ? '#E2476E' : BR.magenta, washOp: 255 * (1 - seg(a, .75, 1.1)), ink: PAL.ink, sw: .35 });
    }
  }
  // everyone's done it: a grid of the same dance, in sync, and the flame dies
  function scrGrid(t) {
    scrFeed(t);
    for (let i = 0; i < 6; i++) {
      const k = backOut(seg(t, T.grid + i * .06, T.grid + .2 + i * .06)); if (k < .02) continue;
      boilSeed('copy' + i);
      const c = i % 3, r = Math.floor(i / 3), x = 14 + c * 166, y = 10 + r * 142;
      push(); translate(x + 78, y + 66); scale(k); translate(-78, -66);
      paint(rrPts(0, 0, 156, 132, 6), { wash: '#F59AD9', ink: PAL.ink, sw: .4 });
      paint(rectPts(2, 74, 152, 56), { wash: '#FFB46B', ink: null });
      dancer(78, 76, .62, t, DCOL[(i + 1) % DCOL.length]);
      pop();
    }
    boilSeed('badge');                                   // the flame, on top: it goes out
    const kb = backOut(seg(t, T.grid + .35, T.grid + .55));
    push(); translate(470, 252); scale(kb);
    paint(ellPts(0, 0, 30, 30, 18), { wash: '#16131F', ink: PAL.cream, sw: .5 });
    flameIcon(0, 2, 17, true, t - T.grid - .6);
    pop();
  }
  function screen(t) { return t < T.grid ? scrFeed(t) : scrGrid(t); }

  // ---------- the shots ----------
  function story(t, lt, dur) {
    T_ = t;
    const after = (et, p) => {
      boilSeed('deskcandle');
      candle(548, AIMA.DESK.top + 14, 1.15, { sw: .7, lean: .4 * Math.sin(t * 2) });
      bubble(et, B1, think1); bubble(et, B2, think2); bubble(et, B3, think3);
    };
    const face = AIMA.room(t, { h: hoursAt(t), cam: camAt(t), pose: creatorPose(t), screen, screenOn: true, mugs: t < T.clockPush + .45 ? 1 : 2, steam: true, hf: hoursAt, after });
    AIMA.caption(t, .6, 5.6, 'Trend này đang viral…', BR.violet, 60, 1400);                // the hook: the post's title, two lines
    AIMA.caption(t, 1.0, 5.6, '…nhưng brand mình làm gì với nó?', BR.magenta, 60, 1500);
    AIMA.shout(t, T.punch[0], 'Thấy trend thì dễ…', BR.violet, 'Biến thành content mới khó!', BR.magenta, { y: 300, gap: T.punch[1] - T.punch[0], s1: 130 });
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Có ai từng nghĩ mãi', 'tới lúc trend hết hot chưa?'], feel: 'shy' });

  shots([[0, story], [V_OUTRO, ending]]);
})();
