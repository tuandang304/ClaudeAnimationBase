// scene.js: "Tôi chỉ định làm 1 cái content thôi…", a 73.5-second spot for AIMA (storyboard in STORYBOARD.md; the
// soundtrack is built by audio/make_audio.py from the same timings). Keys below are in EVENT time; TIMING in video.js
// stretches them onto the clock (warp() in core.js), so the pacing is tuned there, not here.
// Part 1 (story): a creator sits down to make ONE piece of content and loses the whole day to research,
// trends, ideas, captions and editing. The sky in the window runs through the AIMA gradient (cyan → blue → violet →
// magenta → night) while the creator never notices, until the clock strikes midnight: "Ủa? Hết ngày rồi?". One room,
// one continuous camera (two time-lapse push-ins on the clock, pans, a crash zoom).
// Part 2 (pitch): the AIMA card, a match cut into the same room the next morning with AIMA on the screen
// (trends, content, platforms, scheduling), and it's only 9 a.m. Then the logo card.
(() => {
  const BR = { cyan: '#4FD9EC', blue: '#4F8CF0', violet: '#8B6CF5', magenta: '#E64FE6', purple: '#9445D6' };
  const CREATOR = { col: '#9583F2', dk: '#5D49C6', lt: '#CFC4FF' };
  const WALL = '#F2E2CF', FLOOR = '#BE9572', WOOD = '#CC9C6C', WOODK = '#A0714A', BEZEL = '#3A3450', NIGHT = '#17183F';
  const WIPE = [BR.violet, BR.magenta];
  const TXT = '#4A4060';

  // ---------- layout (world px; at zoom 1 the world is the frame) ----------
  const CX = 720, GY = 820, U = 30;                      // the creator: ground point and size
  const WIN = [140, 130, 380, 370];                      // window x, y, w, h
  const CLK = [960, 190, 95];                            // clock centre and radius
  const SCR = [1180, 380, 520, 300];                     // monitor screen x, y, w, h
  const DESK = { x0: 380, x1: 1780, top: 738, edge: 770 };
  const FLOOR_Y = 985;
  const BIN = { x: 265, top: 875 };

  // ---------- the cut (video time) ----------
  // STW maps video time onto the story's clock (event time; it reaches 0 after the hook). MTW does the same for the
  // morning with AIMA, from the match cut.
  const STW = warp(TIMING.story.rates, TIMING.story.end), MTW = warp(TIMING.morning.rates, TIMING.morning.end);
  const V_PITCH = STW.len, V_AIMA = V_PITCH + TIMING.pitch, V_END = V_AIMA + MTW.len;   // the AIMA card, the morning with AIMA, the logo card

  // ---------- time ----------
  // The clock creeps while the camera is elsewhere and spins during the two push-ins; the last minute clicks onto 12.
  const HOURS = [[0, 8], [5.8, 9], [6.3, 12.5], [9.4, 13.5], [9.9, 14.5], [12.3, 15.5], [12.6, 16.5], [15.4, 17.5], [15.9, 22.5], [18.6, 23.82], [19.85, 23.917]];
  const T_MIDNIGHT = 19.9;
  const hoursAt = t => t < T_MIDNIGHT ? kf(t, HOURS) : lerp(23.917, 24, backOut(seg(t, T_MIDNIGHT, T_MIDNIGHT + .14)));
  const darkAt = h => .72 * clamp((h - 16.8) / 4.5);
  // sky [top, horizon] by the hour: the brand gradient, then night
  const SKY = [[8, '#8FE6F0', '#E4FAF5'], [12, '#62A9F2', '#C6E3FA'], [15, '#8E8EF0', '#DCD2FA'], [17.5, '#B867E6', '#F7A3CC'], [19.5, '#4E3A96', '#B35AAE'], [21, '#232557', '#3A2F6E']];
  function skyAt(h) {
    if (h <= SKY[0][0]) return SKY[0].slice(1);
    for (let i = 1; i < SKY.length; i++) if (h < SKY[i][0]) {
      const k = ease((h - SKY[i - 1][0]) / (SKY[i][0] - SKY[i - 1][0]));
      return [mixCol(SKY[i - 1][1], SKY[i][1], k), mixCol(SKY[i - 1][2], SKY[i][2], k)];
    }
    return SKY[SKY.length - 1].slice(1);
  }

  // ---------- camera: one continuous move through the whole room ----------
  const CAMK = [
    [0, [930, 560, 1.12]], [3.0, [960, 550, 1.2]], [3.5, [1150, 560, 1.36]], [5.4, [1150, 560, 1.4]],
    [5.85, [960, 150, 3.3]], [6.3, [960, 150, 3.36]], [6.75, [1150, 560, 1.4]], [9.4, [1160, 560, 1.44]],           // clock push 1
    [9.9, [640, 600, 1.4]], [12.3, [650, 600, 1.46]], [12.55, [1150, 560, 1.5]], [15.0, [1150, 560, 1.54]],      // pan to the bin, whip back
    [15.45, [960, 150, 3.3]], [15.9, [960, 150, 3.36]], [16.35, [1150, 560, 1.4]], [18.6, [1150, 560, 1.45]],       // clock push 2
    [19.4, [900, 520, 1.08]], [20.42, [900, 510, 1.11]], [20.6, [880, 560, 2.2]], [23.5, [880, 560, 2.28]],      // pull out, crash zoom
  ];
  const CAMK_V = STW.keys(CAMK);
  function camAt(t, ct) {                                // t: event time, ct: video time
    const [cx, cy, z] = kf(ct, CAMK_V), sh = t > 20.5 ? shakeXY(t, 12 * Math.exp(-(t - 20.5) * 6)) : [0, 0];
    return [cx + 6 * wob(ct, .07) + sh[0], cy + 4 * wob(ct, .05, .3) + sh[1], z];
  }

  // ---------- the creator: the kit's character, recoloured in the brand violet, with headphones ----------
  const K = (t, name, o = {}) => [t, name, { ...CREATOR, ...o }];
  const KEYS = [K(0, 'hopeful'), K(.95, 'determined'), K(2.25, 'excited'), K(3.25, 'thinking'), K(4.8, 'dizzy'), K(6.0, 'neutral'),
    K(7.75, 'starstruck'), K(8.75, 'sad'), K(9.8, 'thinking'), K(11.6, 'idea'), K(12.55, 'determined'), K(13.8, 'angry'),
    K(14.35, 'determined'), K(15.6, 'sleepy'), K(18.4, 'relieved'), K(19.45, 'neutral'), K(20.5, 'surprised'), K(21.15, 'confused', { emote: null })];
  // drawn turns: [t0, t1, from, to] in turns (0 = facing us, .125 = 3/4 toward the monitor)
  const TURNS = [[1.6, 1.78, 0, .125], [9.6, 9.78, .125, 0], [12.3, 12.46, 0, .125], [20.45, 20.58, .125, 0]];
  const TOSS = [10.4, 10.9, 11.4];                       // paper-ball throws (the middle one misses)
  const bump = (t, a, b, c, d) => seg(t, a, b) * (1 - seg(t, c, d));

  let LIT = 0;                                           // how far the creator's colours sink into the night
  function headphones(u, sw) {
    paint(ribbon([[-5 * u, -8.4 * u], [-4.3 * u, -10 * u], [0, -10.8 * u], [4.3 * u, -10 * u], [5 * u, -8.4 * u]], .6 * u), { wash: mixCol(BR.magenta, NIGHT, LIT), ink: PAL.ink, sw: sw * .6 });
    for (const s of [-1, 1]) paint(rrPts(s < 0 ? -5.8 * u : 4.6 * u, -9.4 * u, 1.2 * u, 2.3 * u, .5 * u), { wash: mixCol(BR.cyan, NIGHT, LIT), ink: PAL.ink, sw: sw * .7 });
  }
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
    // B: clicking through tabs, eyes darting across them
    R(-.72 + .12 * pulse2(ct, 9), bump(t, 3.2, 3.5, 4.7, 4.9));     // clicks on the music's eighth notes
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
    look(.55, -1, bump(t, 19.42, 19.5, 20.42, 20.5));
    // D: three paper balls tossed over the shoulder into the bin
    for (const ti of TOSS) {
      if (t < ti - .5 || t > ti + .45) continue;
      const a = t < ti - .12 ? kf(t, [[ti - .5, p.aL ?? .2], [ti - .25, 1.35], [ti - .12, 1.6]]) : t < ti + .06 ? lerp(1.6, -.15, easeIn(seg(t, ti - .12, ti + .06))) : lerp(-.15, p.aL ?? .2, backOut(seg(t, ti + .06, ti + .45)));
      p.aL = a; p.rot = (p.rot || 0) - .06 * Math.sin(seg(t, ti - .5, ti + .45) * Math.PI);
    }
    return p;
  }
  // world position of the front view's screen-left arm tip (where a held ball sits), from the same pose clawd() gets
  function leftHand(p) {
    const a = p.aL ?? .2, c = clamp((Math.abs(a) - .7) / .9), rx = (-4.9 - .55 * c) * U, ry = -4.5 * U;
    const lx = rx - 2.75 * U * Math.cos(a), ly = ry - 2.75 * U * Math.sin(a);
    const sq = p.sq || 0, sx = 1 + sq * .6, sy = 1 - sq, r = p.rot || 0;
    return [CX + (p.dx || 0) * U + Math.cos(r) * lx * sx - Math.sin(r) * ly * sy, GY + (p.dy || 0) * U + Math.sin(r) * lx * sx + Math.cos(r) * ly * sy];
  }

  // ---------- paper balls ----------
  const BIN_IN = [[BIN.x - 18, BIN.top - 6], null, [BIN.x + 20, BIN.top - 9]];
  const MISS_RIM = [BIN.x + 58, BIN.top - 4], MISS_FLOOR = [BIN.x + 150, FLOOR_Y + 12];
  function ball(x, y, r, spin = 0) {
    push(); translate(x, y); rotate(spin);
    paint(ellPts(0, 0, r, r * .92, 11, r * .12), { wash: PAL.cream, ink: PAL.ink, sw: .55 });
    inkLine([[-r * .5, -r * .2], [0, r * .1], [r * .4, -r * .3]], .35, '#A79C8C', 'inkfine', .2);
    inkLine([[-r * .2, r * .5], [r * .1, r * .1]], .3, '#A79C8C', 'inkfine', 0);
    pop();
  }
  function balls(t, p) {
    TOSS.forEach((ti, i) => {
      boilSeed('ball' + i);
      if (t < ti - .4) return;
      const r = 15;
      if (t < ti + .06) { const [hx, hy] = leftHand(p); return ball(hx, hy, r * backOut(seg(t, ti - .4, ti - .25)) + .5, (t - ti) * 3); }   // crumpled up in the hand
      const h0 = leftHand({ ...p, aL: -.15 }), fl = .42;
      if (i !== 1) {
        const k = seg(t, ti + .06, ti + .06 + fl), [x, y] = arcPt(h0, BIN_IN[i], 190, k);
        return ball(x, y, r, k * 6 + i);
      }
      // the miss: off the rim, bounce, roll to a stop on the floor
      const k1 = seg(t, ti + .06, ti + .06 + fl);
      if (k1 < 1) { const [x, y] = arcPt(h0, MISS_RIM, 180, k1); return ball(x, y, r, k1 * 6); }
      const k2 = seg(t, ti + .06 + fl, ti + .06 + fl + .4), [x, y] = arcPt(MISS_RIM, MISS_FLOOR, 70, easeOut(k2));
      return ball(x, y + 0, r, 6 + k2 * 5);
    });
  }

  // ---------- the room ----------
  function wall() {
    boilSeed('wall');
    paint(rectPts(-400, -400, W + 800, FLOOR_Y + 400), { wash: WALL, ink: null });
    paint(rectPts(-400, FLOOR_Y, W + 800, 600), { wash: FLOOR, ink: null });
    inkLine([[-300, FLOOR_Y], [W / 2, FLOOR_Y + 2], [W + 300, FLOOR_Y]], .8, PAL.ink, 'ink', 0);
    // a brand poster: the infinity-A ribbon, painted
    boilSeed('poster');
    const px = 1480, py = 110, pw = 270, ph = 200;
    paint(rectPts(px, py, pw, ph, 1.5), { wash: PAL.cream, ink: PAL.ink, sw: .8 });
    const P = pts => pts.map(([a, b]) => [px + 30 + a * 210, py + 25 + b * 210]);
    paint(ribbon(P([[.42, .42], [.3, .58], [.13, .6], [.03, .45], [.1, .3], [.27, .3], [.42, .42]]), 20, 16), { wash: BR.cyan, ink: PAL.ink, sw: .5 });
    paint(ribbon(P([[.42, .42], [.56, .6], [.75, .66], [.95, .62], [.9, .5], [.74, .2], [.66, .1], [.58, .16]]), 14, 24), { wash: BR.magenta, ink: PAL.ink, sw: .5 });
    paint(ribbon(P([[.58, .16], [.5, .28], [.42, .42], [.36, .52]]), 22, 20), { wash: BR.violet, ink: PAL.ink, sw: .5 });
  }

  function windowView(t, h, dim) {
    const [x, y, w, hh] = WIN, [top, bot] = skyAt(h);
    boilSeed('sky');
    paint(rectPts(x, y, w, hh * .5), { wash: top, ink: null });
    paint(rectPts(x, y + hh * .5, w, hh * .25), { wash: mixCol(top, bot, .5), ink: null });
    paint(rectPts(x, y + hh * .75, w, hh * .25), { wash: bot, ink: null });
    // sun (day), moon and stars (night)
    if (h < 19) {
      boilSeed('sun');
      const k = clamp((h - 8) / 10.5), sx = x + w * (.18 + .66 * k), sy = y + hh * (.82 - .6 * Math.sin(k * Math.PI)), sr = 30;
      paint(ellPts(sx, sy, sr, sr, 20, .8), { wash: mixCol('#FFF3C4', '#FF9A5A', clamp((h - 15) / 3)), washOp: 255 * (1 - clamp((h - 18) / 1)), ink: null });
    }
    if (h > 19.5) {
      const n = clamp((h - 19.5) / 1.5);
      for (let i = 0; i < 16; i++) {
        boilSeed('wstar' + i);
        const tw = .55 + .45 * Math.sin(t * (2 + 2 * hash(i + 40)) + i);
        paint(starPts(x + 12 + hash(i + 7) * (w - 24), y + 10 + hash(i + 70) * hh * .5, (3 + 4 * hash(i + 3)) * tw * n, .35, 4), { wash: PAL.cream, washOp: 230 * n, ink: null });
      }
      boilSeed('moon');
      const mx = x + w * .72, my = y + hh * .26;
      glow(mx, my, 110, '#E8E4FF', .55 * n);
      paint(ellPts(mx, my, 30, 30, 22, .8), { wash: PAL.cream, washOp: 255 * n, ink: null });
      paint(ellPts(mx + 13, my - 8, 25, 25, 20), { wash: top, washOp: 255 * n, ink: null });
    }
    // clouds by day
    if (h < 19) for (let i = 0; i < 2; i++) {
      boilSeed('cloud' + i);
      const cx = x + 90 + i * 170 + t * 3, cy = y + 70 + i * 60, P = [];
      for (let k = 0; k < 18; k++) { const a = k / 18 * TAU, r = 1 + .35 * Math.abs(Math.sin(a * 2.5 + i)); P.push([cx + Math.cos(a) * 52 * r, cy + Math.sin(a) * 18 * r]); }
      paint(P, { wash: mixCol(PAL.cream, bot, .25), washOp: 235 * (1 - clamp((h - 17.5) / 1.5)), ink: null });
    }
    // the city, lighting up at night
    boilSeed('city');
    const city = mixCol(mixCol(bot, PAL.ink, .45), NIGHT, clamp((h - 18) / 3) * .6);
    for (let i = 0; i < 7; i++) {
      const bx = x + i * w / 7, bw = w / 7 + 4, bh = 60 + 90 * hash(i + 11);
      paint(rectPts(bx, y + hh - bh, bw, bh), { wash: city, ink: null });
      if (h > 18.5) for (let j = 0; j < 4; j++) {
        if (hash(i * 9 + j) < .45) continue;
        const on = clamp((h - 18.5 - hash(i * 4 + j) * 2) * 2);
        paint(rectPts(bx + 8 + (j % 2) * 22, y + hh - bh + 14 + Math.floor(j / 2) * 26, 10, 12), { wash: '#FFD98A', washOp: 255 * on, ink: null });
      }
    }
    // frame
    boilSeed('frame');
    const fc = mixCol('#FFF6EA', NIGHT, dim * .9), b = 14;
    for (const r of [[x - b, y - b, w + 2 * b, b], [x - b, y + hh, w + 2 * b, b], [x - b, y, b, hh], [x + w, y, b, hh], [x + w / 2 - 5, y, 10, hh], [x, y + hh * .45 - 5, w, 10]])
      paint(rectPts(...r), { wash: fc, ink: null });
    paint(rectPts(x - b, y - b, w + 2 * b, hh + 2 * b), { ink: PAL.ink, sw: .8 });
    paint(rectPts(x, y, w, hh), { ink: PAL.ink, sw: .5 });
    paint(rectPts(x - 34, y + hh + b, w + 68, 16), { wash: mixCol(WOOD, NIGHT, dim * .9), ink: PAL.ink, sw: .7 });
  }

  const handPts = (a, L, w) => [[Math.cos(a + Math.PI / 2) * w, Math.sin(a + Math.PI / 2) * w], [Math.cos(a) * L, Math.sin(a) * L], [Math.cos(a - Math.PI / 2) * w, Math.sin(a - Math.PI / 2) * w], [-Math.cos(a) * w * 1.6, -Math.sin(a) * w * 1.6]];
  function clock(t, h, dim, hf, strikeT) {
    const [x, y, r] = CLK, strike = strikeT == null ? 0 : spring(t, strikeT + .05, 4, 34), D = c => mixCol(c, NIGHT, dim * .55);
    boilSeed('clock');
    push(); translate(x, y - 40 * Math.abs(strike) * .3); rotate(.12 * strike);
    paint(ellPts(0, 0, r * 1.14, r * 1.14, 32, .8), { wash: D(BR.magenta), ink: PAL.ink, sw: .9 });
    paint(ellPts(0, 0, r, r, 32, .6), { wash: D(PAL.cream), ink: PAL.ink, sw: .6 });
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * TAU, l = i % 3 ? .1 : .18;
      inkLine([[Math.cos(a) * r * (.9 - l), Math.sin(a) * r * (.9 - l)], [Math.cos(a) * r * .9, Math.sin(a) * r * .9]], i % 3 ? .45 : .8, PAL.ink, 'inkfine', 0);
    }
    const ma = h => frac(h) * TAU - Math.PI / 2, ha = h => (h % 12) / 12 * TAU - Math.PI / 2;
    // time-lapse: ghost minute hands trail the spin
    const speed = (hf(t + .02) - hf(t - .02)) / .04;
    if (speed > 2) for (let k = 4; k >= 1; k--) paint(handPts(ma(hf(t - k * .012)), r * .78, r * .05), { wash: PAL.ink, washOp: 50 * (5 - k), ink: null });
    paint(handPts(ha(h), r * .5, r * .075), { wash: PAL.ink, ink: null });
    paint(handPts(ma(h), r * .78, r * .05), { wash: PAL.ink, ink: null });
    paint(ellPts(0, 0, r * .07, r * .07, 10), { wash: D(BR.magenta), ink: PAL.ink, sw: .4 });
    pop();
    // spin arcs while the hours fly, and ring lines when it strikes midnight
    if (speed > 2) for (let i = 0; i < 3; i++) {
      boilSeed('spin' + i);
      const a0 = t * 9 + i * TAU / 3, P = [];
      for (let k = 0; k <= 8; k++) { const a = a0 + k * .09; P.push([x + Math.cos(a) * r * 1.38, y + Math.sin(a) * r * 1.38]); }
      inkLine(P, .9, PAL.ink, 'ink', .5);
    }
    const ra = strikeT == null ? -1 : t - strikeT;
    if (ra > 0 && ra < .7) for (const s of [-1, 1]) for (let i = 0; i < 3; i++) {
      boilSeed('ring' + s + i);
      const a = (s < 0 ? Math.PI : 0) + (i - 1) * .45, d0 = r * (1.3 + ra * .6), d1 = d0 + r * .35 * (1 - ra / .7);
      inkLine([[x + Math.cos(a) * d0, y + Math.sin(a) * d0], [x + Math.cos(a) * d1, y + Math.sin(a) * d1]], .9, PAL.ink, 'ink', 0);
    }
  }

  function desk(t) {
    boilSeed('desk');
    const { x0, x1, top, edge } = DESK;
    paint(rectPts(x0 + 40, edge, x1 - x0 - 80, FLOOR_Y - edge), { wash: mixCol(WALL, PAL.ink, .4), ink: null });               // shadow under
    paint(rectPts(x0, top, x1 - x0, edge - top, 1.2), { wash: mixCol(WOOD, PAL.cream, .3), ink: PAL.ink, sw: .8 });            // top
    paint(rectPts(x0 - 12, edge, x1 - x0 + 24, 24, 1), { wash: WOOD, ink: PAL.ink, sw: .8 });                                  // lip
    paint(rectPts(x0 + 10, edge + 24, 40, FLOOR_Y - edge - 24), { wash: WOODK, ink: PAL.ink, sw: .7 });                       // left leg
    paint(rectPts(x1 - 330, edge + 24, 320, FLOOR_Y - edge - 24), { wash: WOODK, ink: PAL.ink, sw: .8 });                     // drawers
    for (let i = 0; i < 3; i++) {
      paint(rectPts(x1 - 315, edge + 36 + i * 60, 290, 50), { wash: WOOD, ink: PAL.ink, sw: .6 });
      paint(ellPts(x1 - 170, edge + 61 + i * 60, 14, 5, 10), { wash: BEZEL, ink: null });
    }
    // monitor
    boilSeed('monitor');
    const [sx, sy, sw, sh] = SCR;
    paint(rectPts(sx + sw / 2 - 30, sy + sh + 10, 60, top - sy - sh - 6), { wash: BEZEL, ink: PAL.ink, sw: .7 });
    paint(ellPts(sx + sw / 2, top + 6, 110, 12, 18), { wash: BEZEL, ink: PAL.ink, sw: .7 });
    paint(rrPts(sx - 18, sy - 18, sw + 36, sh + 36, 14, 1), { wash: BEZEL, ink: PAL.ink, sw: .9 });
    // keyboard and mouse
    boilSeed('keys');
    paint(rrPts(880, top + 4, 250, 22, 7), { wash: '#ECE6F6', ink: PAL.ink, sw: .7 });
    for (let i = 0; i < 2; i++) inkLine([[896, top + 11 + i * 8], [1114, top + 11 + i * 8]], .35, '#9A90AE', 'inkfine', 0);
    paint(ellPts(1185, top + 16, 20, 11, 14), { wash: '#ECE6F6', ink: PAL.ink, sw: .6 });
  }

  // coffee: one mug in the morning, three by the afternoon, a stack of five at night (they change behind the clock push-ins);
  // the last one poured still steams
  const MUGS = [[470, 0, BR.magenta], [405, 0, BR.cyan], [440, -1, BR.violet], [345, 0, BR.magenta], [520, 0, BR.cyan]];
  function mugs(t, n, steam, dim) {
    for (let i = 0; i < n; i++) {
      boilSeed('mug' + i);
      const [x, lvl, col] = MUGS[i], b = DESK.top + 14 + lvl * 52;
      inkLine([[x + 20, b - 38], [x + 34, b - 32], [x + 32, b - 16], [x + 20, b - 12]], .9, PAL.ink, 'ink', .5);
      paint(rrPts(x - 22, b - 50, 44, 50, 7), { wash: mixCol(col, NIGHT, dim), ink: PAL.ink, sw: .7 });
      paint(ellPts(x, b - 49, 20, 5, 14), { wash: i === n - 1 && steam ? '#6B4630' : mixCol(mixCol(col, PAL.ink, .5), NIGHT, dim), ink: null });
      if (i === n - 1 && steam) for (let s = 0; s < 2; s++) {      // the first cup still steams
        const ph = t * .9 + s * .5, P = [];
        for (let k = 0; k < 5; k++) P.push([x - 6 + s * 12 + 5 * Math.sin(ph * 4 + k * 1.3), b - 62 - k * 11 - frac(ph) * 10]);
        inkLine(P, .5, '#B8AFC4', 'inkfine', .6);
      }
    }
  }
  function bin(t) {
    boilSeed('bin');
    const { x, top } = BIN;
    paint([[x - 70, top], [x + 70, top], [x + 55, FLOOR_Y + 14], [x - 55, FLOOR_Y + 14]], { wash: '#7B86B8', ink: PAL.ink, sw: .8 });
    for (let i = -2; i <= 2; i++) inkLine([[x + i * 26, top + 14], [x + i * 21, FLOOR_Y + 2]], .35, '#5D6795', 'inkfine', 0);
    paint(ellPts(x, top, 70, 10, 20), { wash: '#56608E', ink: PAL.ink, sw: .7 });
  }

  // ---------- what's on the monitor (screen-local coordinates) ----------
  const [SW, SH] = [SCR[2], SCR[3]];
  function squig(x0, len, y, col = TXT, sw = .6, ph = 0) {
    if (len < 6) return;
    const P = []; for (let x = 0; x <= len; x += 11) P.push([x0 + x, y + 2.6 * Math.sin(x * .33 + ph)]);
    if (P.length < 2) P.push([x0 + len, y]);
    inkLine(P, sw, col, 'inkfine', .5);
  }
  const SCR_BG = (c) => paint(rectPts(0, 0, SW, SH), { wash: c, ink: null });
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

  // ---------- the room, for any time of day ----------
  // t: event time. r = { ct (video time, for clouds, stars and steam), h (hours), cam [cx, cy, zoom], pose, screen(t),
  // screenOn, mugs, steam, balls, hf (hours function), strikeT }. Returns the creator's face on screen (for irises).
  function drawRoom(t, r) {
    const h = r.h, dim = darkAt(h), [cx, cy, z] = r.cam, ct = r.ct;
    // Night falls on the room: a wash over the wall, and another over the desk. The window, the clock and the screen
    // make their own light, and the creator only sinks halfway, lit by the screen, so the last act still reads.
    const night = y => { if (dim > .005) { boilSeed('night' + y); paint(rectPts(-400, y, W + 800, H + 800 - y), { wash: NIGHT, washOp: 255 * dim, ink: null }); } };
    camBegin(cx, cy, z);
    wall();
    night(-400);
    windowView(ct, h, dim);
    clock(t, h, dim, r.hf, r.strikeT);
    const p = r.pose;
    LIT = dim * .45;
    if (LIT > 0) for (const f of ['col', 'dk', 'lt']) p[f] = mixCol(p[f] || CREATOR[f], NIGHT, LIT);
    clawd(CX, GY, U, { ...p, draw: headphones, boilKey: 'creator', noLegs: true, noShadow: true });   // seated behind the desk
    if (dim > .005) glow(CX + 90, GY - 190, 360, '#A9B8FF', .7 * dim);
    desk(t);
    bin(t);
    if (r.balls) balls(t, p);
    night(DESK.top - 3);
    mugs(ct, r.mugs, r.steam, LIT);
    if (r.screenOn) glow(SCR[0] + SCR[2] / 2, SCR[1] + SCR[3] / 2, 420 + 380 * dim, '#AFC2FF', .15 + 1.1 * dim);
    push(); translate(SCR[0], SCR[1]); boilSeed('screen'); r.screen(t); pop();
    const face = toScreen(CX, GY - 6 * U);
    camEnd();
    return face;
  }

  // ---------- lettering: a big two-line exclamation, and captions on a painted pill ----------
  const font = (px) => `800 ${px}px "Baloo 2"`;
  function shout(t, t0, l1, c1, l2, c2, ox = 0, oy = 0, s2 = 112) {
    if (t > t0) letter(l1, 1190 + ox, 150 + oy, 210, c1, { screen: true, pop: (t - t0) * 4, rot: -.07 + .02 * Math.sin(t * 3), stroke: PAL.cream, font: font(210) });
    if (t > t0 + .55) letter(l2, 1215 + ox, 312 + oy * 1.6, s2, c2, { screen: true, pop: (t - t0 - .55) * 4, rot: -.03 + .015 * Math.sin(t * 2.4 + 1), stroke: PAL.cream, font: font(s2) });
  }
  // A caption pill at the bottom of the frame between t0 and t1 (screen space, after camEnd): pops in, fades out.
  function caption(t, t0, t1, txt, col = BR.violet, size = 64, y = 985, dot = null) {
    if (t < t0 || t > t1) return;
    const c = letG.drawingContext; c.font = font(size);
    const tw = c.measureText(txt).width, k = backOut(seg(t, t0, t0 + .3)), out = 1 - seg(t, t1 - .25, t1), ph = size * 1.25, pad = size * .55 + (dot ? size * .9 : 0);
    boilSeed('cap' + txt.length);
    push(); translate(W / 2, y); scale(k);
    paint(rrPts(-tw / 2 - pad, -ph / 2, tw + pad + size * .55, ph, ph / 2, 1.5), { wash: PAL.cream, washOp: 255 * out, ink: out > .95 ? PAL.ink : null, sw: 1 });
    if (dot) paint(ellPts(-tw / 2 - pad + size * .62, 0, size * .3, size * .3, 16), { wash: dot, washOp: 255 * out, ink: out > .95 ? PAL.ink : null, sw: .7 });
    pop();
    letter(txt, W / 2, y + size * .04, size, col, { screen: true, pop: seg(t, t0, t0 + .3), alpha: out, font: font(size) });
  }

  // ---------- part 1: the story (the room's clock reaches 0 after the hook) ----------
  function story(t, lt, dur) {
    const rt = STW(t);
    const face = drawRoom(rt, { ct: t, h: hoursAt(rt), cam: camAt(rt, t), pose: creatorPose(rt, t), screen: storyScreen, screenOn: rt > 1.95,
      mugs: rt < 6 ? 1 : rt < 15.6 ? 3 : 5, steam: rt < 6, balls: rt > TOSS[0] - .4, hf: hoursAt, strikeT: T_MIDNIGHT });
    caption(t, .75, 4.5, 'Tôi chỉ định làm 1 cái content thôi…', BR.violet, 70);   // after the iris, so it sits on the room
    shout(rt, 21.2, 'Ủa?', BR.magenta, 'Hết ngày rồi?', BR.violet);       // the punchline, after the take
    if (lt < .8) iris(...face, lerp(0, 1500, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, WIPE); }
  }

  // ---------- part 2: the next morning, with AIMA (a = time since the match cut) ----------
  const A_HOURS = [[0, 8], [15.2, 8.97], [15.42, 9]];
  const aHours = a => kf(a, A_HOURS);
  const A_CAM = [[0, [1440, 530, 3.4]], [.3, [1440, 530, 3.32]], [1.1, [1120, 560, 1.34]], [3.3, [1150, 560, 1.4]], [10.9, [1150, 560, 1.44]],
    [13.5, [1150, 560, 1.46]], [14.4, [900, 520, 1.08]], [15.62, [900, 515, 1.1]], [15.84, [880, 560, 2.2]], [18.6, [880, 560, 2.28]]];
  const A_CAM_V = MTW.keys(A_CAM);
  const aCam = (a, lt) => { const [cx, cy, z] = kf(lt, A_CAM_V), sh = a > 15.75 ? shakeXY(a, 8 * Math.exp(-(a - 15.75) * 7)) : [0, 0]; return [cx + 6 * wob(lt, .07) + sh[0], cy + 4 * wob(lt, .05, .3) + sh[1], z]; };
  const BEATS = [1.0, 3.3, 7.2, 10.9, 13.5];             // trends, content, platforms, scheduling, "all in one flow"
  const A_KEYS = [K(0, 'happy'), K(1.55, 'excited'), K(3.55, 'starstruck'), K(8.05, 'excited'), K(11.25, 'proud'), K(13.75, 'cool'),
    K(15.05, 'neutral'), K(15.75, 'surprised'), K(17.45, 'laugh')];
  const A_KEYS_V = MTW.keys(A_KEYS);
  function aimaPose(a, lt) {
    const p = emotions(lt, A_KEYS_V);
    Object.assign(p, a < 13.55 ? { ...spinView(.125), smear: 0 } : turn(a, 13.55, 13.72, .125, 0));
    const look = (x, y, w) => { p.lookX = lerp(p.lookX || 0, x, w); p.lookY = lerp(p.lookY || 0, y, w); };
    for (const b of BEATS.slice(0, 4)) p.aR = lerp(p.aR ?? .2, -.95, bump(a, b - .14, b - .04, b + .06, b + .22));   // a click per feature
    look(.8, .15, bump(a, 1.0, 1.2, 13.3, 13.5));
    const lean = bump(a, 13.7, 14.0, 15.6, 15.75);       // leaning back, done already
    p.rot = (p.rot || 0) - .07 * lean; p.dx = (p.dx || 0) - .4 * lean;
    look(.4, -1, bump(a, 15.0, 15.1, 15.7, 15.76));      // ...and a glance at the clock
    return p;
  }

  // The AIMA app: a splash with the logo, then a sidebar of four tools and the active one's panel.
  function drawLogo(cx, cy, h, alpha = 1) {
    if (!LOGO || h < 1) return;
    flushBrush();
    const w = h * LOGO.width / LOGO.height;
    push(); tint(255, 255 * clamp(alpha)); image(LOGO, cx - w / 2, cy - h / 2, w, h); noTint(); pop();
  }
  const pill = (x, y, w, h, o) => paint(rrPts(x, y, w, h, Math.min(h / 2, 10)), { ink: PAL.ink, sw: .4, ...o });
  const pop2 = (a, a0, d = .18) => backOut(seg(a, a0, a0 + d));
  function at(x, y, k, f) { if (k <= .01) return; push(); translate(x, y); scale(k); f(); pop(); }
  function flame(x, y, s, col) { paint([[0, -1.3], [.55, -.4], [.75, .35], [.4, .85], [0, 1], [-.4, .85], [-.75, .35], [-.45, -.25], [-.2, .15]].map(([a, b]) => [x + a * s, y + b * s]), { wash: col, ink: PAL.ink, sw: .35, curv: .5 }); }
  function check(x, y, r, k = 1) {
    at(x, y, k, () => { paint(ellPts(0, 0, r, r, 16), { wash: '#4ED6A0', ink: PAL.ink, sw: .4 }); inkLine([[-r * .45, 0], [-r * .1, r * .38], [r * .5, -r * .38]], Math.max(.5, r / 12), PAL.cream, 'ink', 0); });
  }
  function toolIcon(i, x, y, s) {
    if (i === 0) flame(x, y, s, '#FF8A3D');
    else if (i === 1) { paint(ellPts(x, y - s * .2, s * .7, s * .7, 14), { wash: '#FFE27A', ink: PAL.ink, sw: .35 }); paint(rectPts(x - s * .3, y + s * .45, s * .6, s * .4), { wash: '#B9B2C9', ink: null }); }
    else if (i === 2) for (let k = 0; k < 4; k++) paint(rrPts(x - s * .9 + (k % 2) * s, y - s * .9 + Math.floor(k / 2) * s, s * .8, s * .8, 3), { wash: [BR.blue, '#111111', BR.magenta, '#555555'][k], ink: null });
    else { paint(rrPts(x - s * .85, y - s * .7, s * 1.7, s * 1.5, 3), { wash: PAL.cream, ink: PAL.ink, sw: .35 }); paint(rectPts(x - s * .85, y - s * .7, s * 1.7, s * .45), { wash: BR.magenta, ink: null }); }
  }
  function scrAima(a) {
    SCR_BG('#FBF8FF');
    if (a < 1.15) drawLogo(SW / 2, SH / 2, 200 * (1 + .03 * a), 1 - seg(a, .95, 1.1));
    const k = backOut(seg(a, 1.0, 1.2));
    if (k <= .01) return;
    push(); translate(SW / 2, SH / 2); scale(k); translate(-SW / 2, -SH / 2);
    boilSeed('app');
    paint(rectPts(0, 0, 64, SH), { wash: '#2B2742', ink: null });
    const cur = BEATS.filter(b => a >= b).length - 1, active = Math.min(3, Math.max(0, cur));
    for (let i = 0; i < 4; i++) {
      if (i === active) pill(8, 26 + i * 64, 48, 48, { wash: [BR.cyan, BR.violet, BR.blue, BR.magenta][i], ink: null });
      toolIcon(i, 32, 50 + i * 64, 12);
    }
    pop();
    if (k < 1) return;
    const b = a - BEATS[active];
    boilSeed('panel' + active);
    if (active === 0) {            // trends: matching trends rank themselves, the best one gets a check
      squig(84, 120, 24, BR.violet, .6);
      [.96, .82, .67, .45].forEach((pc, j) => {
        const y = 44 + j * 60, kj = pop2(b, .12 + j * .1);
        at(290, y + 24, kj, () => {
          pill(-210, -24, 420, 48, { wash: j === 0 && b > 1.4 ? '#FFF0FB' : PAL.cream, ink: j === 0 && b > 1.4 ? BR.magenta : PAL.ink, sw: j === 0 && b > 1.4 ? .9 : .4 });
          flame(-186, 0, 11, j === 0 ? '#FF6A3D' : '#FFAA5E');
          squig(-166, 120 - j * 14, 0, TXT, .45, j);
          pill(-20, -6, 160, 12, { wash: '#E9E3F7', ink: null });
          const f = ease(seg(b, .35 + j * .1, 1.1 + j * .1));
          if (f > .02) pill(-20, -6, 160 * pc * f, 12, { wash: [BR.magenta, BR.violet, BR.blue, BR.cyan][j], ink: null });
        });
      });
      check(492, 68, 13, pop2(b, 1.45, .25));
    } else if (active === 1) {     // content: idea, script and caption fill in by themselves, then a call to action
      ['idea', 'script', 'caption'].forEach((kind, j) => {
        const x = 80 + j * 142, kj = pop2(b, .15 + j * .3);
        at(x + 64, 130, kj, () => {
          pill(-64, -98, 128, 196, { wash: PAL.cream });
          if (j === 0) toolIcon(1, 0, -70, 12);
          else if (j === 1) { pill(-14, -84, 28, 22, { wash: '#2B2742', ink: null }); paint([[-4, -79], [-4, -67], [6, -73]], { wash: PAL.cream, ink: null }); }
          else paint(heartPts(0, -72, 12), { wash: '#E2476E', ink: PAL.ink, sw: .35 });
          for (let l = 0; l < 5; l++) {
            const f = ease(seg(b, .45 + j * .3 + l * .12, .7 + j * .3 + l * .12));
            squig(-50, (70 + 30 * hash(j * 7 + l)) * f, -36 + l * 24, j === 2 && l > 2 ? BR.blue : TXT, .45, j + l);
          }
        });
      });
      at(287, 266, pop2(b, 2.5, .25), () => { pill(-90, -15, 180, 30, { wash: BR.magenta, ink: PAL.ink }); squig(-50, 100, 0, PAL.cream, .6); });
    } else if (active === 2) {     // platforms: one piece splits into a version for each network
      const split = ease(seg(b, .7, 1.25));
      const CARDS = [[150, 78, 140, 100, '#1877F2'], [150, 222, 108, 108, '#E1306C'], [292, 222, 122, 100, '#222222'], [432, 150, 96, 200, '#111111']];
      if (split < 1) at(287, 150, pop2(b, .05) * (1 - .3 * split), () => { pill(-60, -78, 120, 156, { wash: PAL.cream }); pill(-48, -66, 96, 64, { wash: '#C5B6F5', ink: null }); squig(-44, 80, 16, TXT, .45); squig(-44, 60, 36, TXT, .45, 2); });
      if (split > 0) CARDS.forEach(([x, y, w, h, c], i) => {
        const cx = lerp(287, x, split), cy = lerp(150, y, split), sc = lerp(.4, 1, split);
        at(cx, cy, sc, () => {
          pill(-w / 2, -h / 2, w, h, { wash: PAL.cream });
          paint(rectPts(-w / 2 + 2, -h / 2 + 2, w - 4, 16), { wash: c, ink: null });
          if (i === 3) { paint(rectPts(-w / 2 + 2, -h / 2 + 18, 4, h - 22), { wash: BR.cyan, ink: null }); paint(rectPts(w / 2 - 6, -h / 2 + 18, 4, h - 22), { wash: BR.magenta, ink: null }); }
          paint(rectPts(-w / 2 + 10, -h / 2 + 26, w - 20, h * .42), { wash: ['#9ADBE8', '#F3B6E4', '#E3DAF7', '#C5B6F5'][i], ink: null });
          squig(-w / 2 + 10, w * .6, h / 2 - 22, TXT, .4, i);
        });
        check(x + w / 2 - 8, y - h / 2 + 8, 11, pop2(b, 1.6 + i * .15, .25));
      });
    } else {                       // scheduling and results: posts drop onto a calendar, the numbers climb
      pill(78, 24, 226, 252, { wash: PAL.cream });
      paint(rectPts(80, 26, 222, 26), { wash: BR.violet, ink: null });
      for (let c = 0; c < 5; c++) for (let r = 0; r < 3; r++) paint(rectPts(88 + c * 42, 62 + r * 70, 38, 64), { wash: '#F1ECFA', ink: null });
      for (let i = 0; i < 9; i++) {
        const c = (i * 2) % 5, r = Math.floor(i * 2 / 5) % 3, ki = seg(b, .2 + i * .09, .45 + i * .09);
        if (ki <= 0) continue;
        pill(91 + c * 42, 70 + r * 70 - 30 * (1 - easeOut(ki)), 32, 26, { wash: [BR.cyan, BR.magenta, BR.blue][i % 3], ink: PAL.ink, sw: .35 });
      }
      pill(318, 24, 186, 252, { wash: PAL.cream });
      for (let i = 0; i < 5; i++) {
        const hgt = (40 + i * 34) * ease(seg(b, .9 + i * .08, 1.4 + i * .08));
        if (hgt > 2) paint(rectPts(334 + i * 32, 252 - hgt, 22, hgt), { wash: i === 4 ? '#4ED6A0' : '#B9C4F7', ink: null });
      }
      const up = ease(seg(b, 1.5, 2.0));
      if (up > .05) inkLine([[340, 220], [380, 190], [420, 196], [460, 140 - 40 * up]].slice(0, 2 + Math.round(up * 2)), 1, '#2EA77A', 'ink', .3);
      check(480, 50, 13, pop2(b, 2.1, .25));
    }
  }

  function aimaMorning(t, lt, dur) {
    const a = MTW(lt);
    drawRoom(a, { ct: t, h: aHours(a), cam: aCam(a, lt), pose: aimaPose(a, lt), screen: scrAima, screenOn: true, mugs: 1, steam: true, balls: false, hf: aHours, strikeT: null });
    const B = BEATS;
    caption(a, B[0] + .1, B[1] - .05, 'Bắt trend tự động theo ngành hàng', BR.violet, 62, 985, BR.cyan);
    caption(a, B[1] + .1, B[2] - .05, 'Ý tưởng · Kịch bản · Caption · Hashtag', BR.violet, 62, 985, BR.violet);
    caption(a, B[2] + .1, B[3] - .05, 'Facebook · TikTok · Instagram · Threads', BR.violet, 62, 985, BR.blue);
    caption(a, B[3] + .1, B[4] - .05, 'Lên lịch · Tự đăng bài · Đo hiệu quả', BR.violet, 62, 985, BR.magenta);
    caption(a, B[4] + .1, 15.5, 'Tất cả trong một luồng làm việc', BR.magenta, 66);
    shout(a, 16.05, 'Ơ…', BR.blue, 'Mới 9 giờ sáng?', BR.violet, 190, -40, 100);   // the rhyme with "Ủa? Hết ngày rồi?" (higher: the take stretches the head up)
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, WIPE2); }
  }

  // ---------- the logo cards ----------
  let LOGO = null;
  (window.PRELOAD ||= []).push(async () => {
    LOGO = await loadImage(AIMA_LOGO);
    await document.fonts.load(font(100), 'Tôi chỉ định làm 1 cái content thôi… Ủa? Hết ngày rồi? Ơ… Mới 9 giờ sáng? Bắt trend tự động theo ngành hàng · Ý tưởng Kịch bản Lên lịch Tự đăng bài Đo hiệu quả Tất cả trong một luồng làm việc Trợ lý AI Làm nhẹ tênh doanh nghiệp nhỏ');
  });
  const WIPE2 = [BR.cyan, BR.blue];
  // lines: [[text, y, size, colour, appears at]]; grow: the logo swells toward the camera at the end (the match cut)
  function logoCard(lt, dur, o) {
    [[BR.cyan, 260, 820, 420], [BR.magenta, 1680, 260, 460], [BR.violet, 1600, 960, 300], [BR.blue, 300, 150, 260]].forEach(([c, x, y, r], i) => {
      boilSeed('blob' + i);
      paint(ellPts(x + 20 * wob(lt, .15, i * .3), y + 14 * wob(lt, .12, i * .7), r, r * .8, 26, 6), { wash: mixCol(c, PAL.paper, .78), ink: null });
    });
    const k = seg(lt, .25, .85), g = o.grow ? ease(seg(lt, dur - .5, dur)) : 0;
    if (k > 0) drawLogo(W / 2, lerp(o.logoY, H / 2, g) + 8 * wob(lt, .35) * (1 - g), lerp(o.logoH * backOut(k), 680, g), clamp(k * 3));
    [[620, 260, BR.cyan], [1310, 220, BR.magenta], [1380, 640, BR.violet], [560, 680, BR.blue], [1440, 420, BR.purple]].forEach(([x, y, c], i) => {
      const a = lt - (.8 + i * .12); if (a < 0) return;
      boilSeed('spark' + i);
      const r = 26 * backOut(seg(a, 0, .3)) * (1 + .18 * Math.sin(lt * 5 + i * 2)) * (1 - g);
      if (r > 1) paint(starPts(x, y, r, .32, 4, a * .5), { wash: c, ink: PAL.ink, sw: .5 });
    });
    for (const [txt, y, size, col, t0] of o.lines) if (lt > t0) letter(txt, W / 2, y, size, col, { screen: true, pop: (lt - t0) * 3.5, alpha: Math.max(0, 1 - g * 1.6), stroke: PAL.cream, font: font(size) });
    if (lt < .3) brushWipe(.5 + lt / .6, o.wipe);
    if (o.fade && lt > dur - .7) { flushLetters(); flash(ease(seg(lt, dur - .7, dur - .05)), PAL.paper); }
  }
  const pitchCard = (t, lt, dur) => logoCard(lt, dur, { wipe: WIPE, logoY: 450, logoH: 520, grow: true, lines: [
    ['Trợ lý AI cho Content Marketing', 820, 76, BR.violet, 2.15], ['AI Content Marketing Co-pilot', 905, 44, '#6A5C8E', 2.6]] });
  const endCard = (t, lt, dur) => logoCard(lt, dur, { wipe: WIPE2, logoY: 440, logoH: 500, fade: true, lines: [
    ['Làm content, nhẹ tênh.', 815, 92, BR.magenta, 1.5], ['Trợ lý AI cho creator & doanh nghiệp nhỏ', 910, 46, '#6A5C8E', 2.2]] });

  shots([[0, story], [V_PITCH, pitchCard], [V_AIMA, aimaMorning], [V_END, endCard]]);
})();
