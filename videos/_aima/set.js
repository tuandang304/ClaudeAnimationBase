// set.js: the AIMA series set, shared by every videos/aima-NN video (what AIMA is: context/aima/). Not a video itself:
// a video lists it in PROJECT.scenes ('../_aima/set.js') before its own scene.js, which then uses the global AIMA.
// Vertical 1080 × 1920 (TikTok). One room for the whole series: a window and a clock on the wall, the creator (the
// kit's character in the brand violet, with headphones) behind a desk, a laptop on it, mugs, a paper bin.
//   AIMA.room(t, r)           the room at any hour (the sky runs through the brand gradient, night falls on the room)
//   AIMA.caption / .shout     the series' lettering: a caption pill, and a big two-line exclamation
//   AIMA.outro(t, lt, dur, o) the series' ending: a question to the viewer (or a call to action) and the AIMA logo
//   AIMA.app(k)               the AIMA app's page on the laptop screen (from #5, when the series starts naming AIMA)
//   AIMA.candle / .dancer     the brand's candle and the viral dance (from #3)
// Screens on the laptop draw in a 520 × 300 design space (AIMA.SW × AIMA.SH); the room scales them to fit.
const AIMA = (() => {
  const BR = { cyan: '#4FD9EC', blue: '#4F8CF0', violet: '#8B6CF5', magenta: '#E64FE6', purple: '#9445D6' };
  const CREATOR = { col: '#9583F2', dk: '#5D49C6', lt: '#CFC4FF' };
  const WALL = '#F2E2CF', FLOOR = '#BE9572', WOOD = '#CC9C6C', WOODK = '#A0714A', BEZEL = '#3A3450', NIGHT = '#17183F';
  const TXT = '#4A4060';

  // ---------- layout (world px; at zoom 1 with the camera at HOME, the world is the frame) ----------
  const HOME = [540, 960, 1];
  const CX = 360, GY = 1210, U = 32;                     // the creator: ground point and size
  const WIN = [80, 300, 360, 380];                       // window x, y, w, h
  const CLK = [790, 430, 100];                           // clock centre and radius
  const DESK = { x0: 30, x1: 1050, top: 1125, edge: 1155 };
  const FLOOR_Y = 1580;
  const BIN = { x: 175, top: 1440 };
  const SW = 520, SH = 300;                              // screen design space
  const SCR = [604, 852, 416, 240], SCR_K = SCR[2] / SW;  // the laptop's screen in the world (x, y, w, h)
  const HINGE = SCR[1] + SCR[3];

  // ---------- time of day ----------
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

  // ---------- helpers ----------
  const bump = (t, a, b, c, d) => seg(t, a, b) * (1 - seg(t, c, d));
  const K = (t, name, o = {}) => [t, name, { ...CREATOR, ...o }];     // an emotion key for the creator
  function squig(x0, len, y, col = TXT, sw = .6, ph = 0) {            // a line of "text": handwriting, never letters
    if (len < 6) return;
    const P = []; for (let x = 0; x <= len; x += 11) P.push([x0 + x, y + 2.6 * Math.sin(x * .33 + ph)]);
    if (P.length < 2) P.push([x0 + len, y]);
    inkLine(P, sw, col, 'inkfine', .5);
  }
  const SCR_BG = c => paint(rectPts(0, 0, SW, SH), { wash: c, ink: null });

  // ---------- the creator ----------
  let LIT = 0;                                           // how far the creator's colours sink into the night
  function headphones(u, sw) {
    paint(ribbon([[-5 * u, -8.4 * u], [-4.3 * u, -10 * u], [0, -10.8 * u], [4.3 * u, -10 * u], [5 * u, -8.4 * u]], .6 * u), { wash: mixCol(BR.magenta, NIGHT, LIT), ink: PAL.ink, sw: sw * .6 });
    for (const s of [-1, 1]) paint(rrPts(s < 0 ? -5.8 * u : 4.6 * u, -9.4 * u, 1.2 * u, 2.3 * u, .5 * u), { wash: mixCol(BR.cyan, NIGHT, LIT), ink: PAL.ink, sw: sw * .7 });
  }
  function creator(x, y, u, p, key = 'creator') { clawd(x, y, u, { ...p, draw: headphones, boilKey: key, noLegs: true, noShadow: true }); }
  // world position of the front view's screen-left arm tip (where a held thing sits), from the same pose clawd() gets
  function leftHand(p) {
    const a = p.aL ?? .2, c = clamp((Math.abs(a) - .7) / .9), rx = (-4.9 - .55 * c) * U, ry = -4.5 * U;
    const lx = rx - 2.75 * U * Math.cos(a), ly = ry - 2.75 * U * Math.sin(a);
    const sq = p.sq || 0, sx = 1 + sq * .6, sy = 1 - sq, r = p.rot || 0;
    return [CX + (p.dx || 0) * U + Math.cos(r) * lx * sx - Math.sin(r) * ly * sy, GY + (p.dy || 0) * U + Math.sin(r) * lx * sx + Math.cos(r) * ly * sy];
  }
  function ball(x, y, r, spin = 0) {                     // a crumpled paper ball
    push(); translate(x, y); rotate(spin);
    paint(ellPts(0, 0, r, r * .92, 11, r * .12), { wash: PAL.cream, ink: PAL.ink, sw: .55 });
    inkLine([[-r * .5, -r * .2], [0, r * .1], [r * .4, -r * .3]], .35, '#A79C8C', 'inkfine', .2);
    inkLine([[-r * .2, r * .5], [r * .1, r * .1]], .3, '#A79C8C', 'inkfine', 0);
    pop();
  }

  // ---------- the room ----------
  function wall() {
    boilSeed('wall');
    paint(rectPts(-400, -400, W + 800, FLOOR_Y + 400), { wash: WALL, ink: null });
    paint(rectPts(-400, FLOOR_Y, W + 800, H + 800 - FLOOR_Y), { wash: FLOOR, ink: null });
    inkLine([[-300, FLOOR_Y], [W / 2, FLOOR_Y + 2], [W + 300, FLOOR_Y]], .8, PAL.ink, 'ink', 0);
    // a shelf with a plant and two books, under the clock
    boilSeed('shelf');
    paint(rectPts(600, 640, 380, 16, 1), { wash: WOOD, ink: PAL.ink, sw: .7 });
    paint(rectPts(640, 560, 34, 80, 2), { wash: BR.blue, ink: PAL.ink, sw: .6 });
    paint(rectPts(678, 574, 28, 66, 2), { wash: BR.magenta, ink: PAL.ink, sw: .6 });
    paint([[860, 640], [920, 640], [910, 596], [870, 596]], { wash: '#E9A27A', ink: PAL.ink, sw: .6 });
    for (const [a, l] of [[-2.0, 70], [-1.5, 80], [-1.1, 66], [-2.5, 56]]) paint(ellPts(890 + Math.cos(a) * l * .5, 596 + Math.sin(a) * l * .5, l * .5, 13, 12, 0, a), { wash: '#7FB069', ink: PAL.ink, sw: .45 });
  }

  function windowView(t, h, dim) {
    const [x, y, w, hh] = WIN, [top, bot] = skyAt(h);
    boilSeed('sky');
    paint(rectPts(x, y, w, hh * .5), { wash: top, ink: null });
    paint(rectPts(x, y + hh * .5, w, hh * .25), { wash: mixCol(top, bot, .5), ink: null });
    paint(rectPts(x, y + hh * .75, w, hh * .25), { wash: bot, ink: null });
    if (h < 19) {                                        // the sun crosses the window through the day
      boilSeed('sun');
      const k = clamp((h - 8) / 10.5), sx = x + w * (.18 + .66 * k), sy = y + hh * (.82 - .6 * Math.sin(k * Math.PI)), sr = 30;
      paint(ellPts(sx, sy, sr, sr, 20, .8), { wash: mixCol('#FFF3C4', '#FF9A5A', clamp((h - 15) / 3)), washOp: 255 * (1 - clamp((h - 18) / 1)), ink: null });
    }
    if (h > 19.5) {                                      // moon and stars at night
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
    if (h < 19) for (let i = 0; i < 2; i++) {            // clouds drift by day
      boilSeed('cloud' + i);
      const cx = x + 80 + i * 160 + ((t * 3 + i * 90) % (w + 60)) - 60, cy = y + 70 + i * 60, P = [];
      for (let k = 0; k < 18; k++) { const a = k / 18 * TAU, r = 1 + .35 * Math.abs(Math.sin(a * 2.5 + i)); P.push([cx + Math.cos(a) * 48 * r, cy + Math.sin(a) * 17 * r]); }
      paint(P, { wash: mixCol(PAL.cream, bot, .25), washOp: 235 * (1 - clamp((h - 17.5) / 1.5)), ink: null });
    }
    boilSeed('city');                                    // the city, lighting up at night
    const city = mixCol(mixCol(bot, PAL.ink, .45), NIGHT, clamp((h - 18) / 3) * .6);
    for (let i = 0; i < 6; i++) {
      const bx = x + i * w / 6, bw = w / 6 + 4, bh = 60 + 90 * hash(i + 11);
      paint(rectPts(bx, y + hh - bh, bw, bh), { wash: city, ink: null });
      if (h > 18.5) for (let j = 0; j < 4; j++) {
        if (hash(i * 9 + j) < .45) continue;
        const on = clamp((h - 18.5 - hash(i * 4 + j) * 2) * 2);
        paint(rectPts(bx + 8 + (j % 2) * 22, y + hh - bh + 14 + Math.floor(j / 2) * 26, 10, 12), { wash: '#FFD98A', washOp: 255 * on, ink: null });
      }
    }
    boilSeed('frame');
    const fc = mixCol('#FFF6EA', NIGHT, dim * .9), b = 14;
    for (const r of [[x - b, y - b, w + 2 * b, b], [x - b, y + hh, w + 2 * b, b], [x - b, y, b, hh], [x + w, y, b, hh], [x + w / 2 - 5, y, 10, hh], [x, y + hh * .45 - 5, w, 10]])
      paint(rectPts(...r), { wash: fc, ink: null });
    paint(rectPts(x - b, y - b, w + 2 * b, hh + 2 * b), { ink: PAL.ink, sw: .8 });
    paint(rectPts(x, y, w, hh), { ink: PAL.ink, sw: .5 });
    paint(rectPts(x - 34, y + hh + b, w + 68, 16), { wash: mixCol(WOOD, NIGHT, dim * .9), ink: PAL.ink, sw: .7 });
  }

  // The clock: hf(t) gives the hour at time t (it spins in a time-lapse: ghost hands and spin arcs appear by themselves
  // when the hours fly); strikeT, if set, rings it.
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
    const speed = (hf(t + .02) - hf(t - .02)) / .04;
    if (speed > 2) for (let k = 4; k >= 1; k--) paint(handPts(ma(hf(t - k * .012)), r * .78, r * .05), { wash: PAL.ink, washOp: 50 * (5 - k), ink: null });
    paint(handPts(ha(h), r * .5, r * .075), { wash: PAL.ink, ink: null });
    paint(handPts(ma(h), r * .78, r * .05), { wash: PAL.ink, ink: null });
    paint(ellPts(0, 0, r * .07, r * .07, 10), { wash: D(BR.magenta), ink: PAL.ink, sw: .4 });
    pop();
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

  function desk() {
    boilSeed('desk');
    const { x0, x1, top, edge } = DESK;
    paint(rectPts(x0 + 40, edge, x1 - x0 - 80, FLOOR_Y - edge), { wash: mixCol(WALL, PAL.ink, .4), ink: null });               // shadow under
    paint(rectPts(x0, top, x1 - x0, edge - top, 1.2), { wash: mixCol(WOOD, PAL.cream, .3), ink: PAL.ink, sw: .8 });            // top
    paint(rectPts(x0 - 12, edge, x1 - x0 + 24, 24, 1), { wash: WOOD, ink: PAL.ink, sw: .8 });                                  // lip
    paint(rectPts(x0 + 10, edge + 24, 40, FLOOR_Y - edge - 24), { wash: WOODK, ink: PAL.ink, sw: .7 });                       // left leg
    paint(rectPts(x1 - 330, edge + 24, 320, FLOOR_Y - edge - 24), { wash: WOODK, ink: PAL.ink, sw: .8 });                     // drawers
    for (let i = 0; i < 4; i++) {
      paint(rectPts(x1 - 315, edge + 38 + i * 98, 290, 84), { wash: WOOD, ink: PAL.ink, sw: .6 });
      paint(ellPts(x1 - 170, edge + 80 + i * 98, 16, 6, 10), { wash: BEZEL, ink: null });
    }
  }
  // the laptop: lid 0 = shut, 1 = open; the screen is drawn by room() into the lid
  function laptop(lid) {
    boilSeed('laptop');
    const [sx, , sw] = SCR, top = DESK.top;
    paint([[sx - 40, top + 2], [sx + sw + 40, top + 2], [sx + sw + 18, HINGE + 4], [sx - 18, HINGE + 4]], { wash: '#D9D3E8', ink: PAL.ink, sw: .7 });   // the deck
    for (let i = 0; i < 2; i++) inkLine([[sx + 10 - i * 8, HINGE + 12 + i * 8], [sx + sw - 10 + i * 8, HINGE + 12 + i * 8]], .35, '#9A90AE', 'inkfine', 0);
    paint(rrPts(sx + sw / 2 - 50, top - 9, 100, 7, 3), { wash: '#BDB5D0', ink: null });                                                              // trackpad
    if (lid < .03) { paint(rrPts(sx - 16, HINGE - 10, sw + 32, 14, 5), { wash: '#B9B1CC', ink: PAL.ink, sw: .7 }); return; }
    const lh = (SCR[3] + 30) * lid;
    paint(rrPts(sx - 15, HINGE + 2 - lh, sw + 30, lh, Math.min(12, lh / 2)), { wash: BEZEL, ink: PAL.ink, sw: .9 });
  }

  // coffee: one mug in the morning, more as the day goes; the last one poured steams
  const MUGS = [[150, 0, BR.magenta], [92, 0, BR.cyan], [122, -1, BR.violet], [205, 0, BR.magenta], [258, 0, BR.cyan]];
  function mugs(t, n, steam, dim) {
    for (let i = 0; i < n; i++) {
      boilSeed('mug' + i);
      const [x, lvl, col] = MUGS[i], b = DESK.top + 14 + lvl * 52;
      inkLine([[x + 20, b - 38], [x + 34, b - 32], [x + 32, b - 16], [x + 20, b - 12]], .9, PAL.ink, 'ink', .5);
      paint(rrPts(x - 22, b - 50, 44, 50, 7), { wash: mixCol(col, NIGHT, dim), ink: PAL.ink, sw: .7 });
      paint(ellPts(x, b - 49, 20, 5, 14), { wash: i === n - 1 && steam ? '#6B4630' : mixCol(mixCol(col, PAL.ink, .5), NIGHT, dim), ink: null });
      if (i === n - 1 && steam) for (let s = 0; s < 2; s++) {
        const ph = t * .9 + s * .5, P = [];
        for (let k = 0; k < 5; k++) P.push([x - 6 + s * 12 + 5 * Math.sin(ph * 4 + k * 1.3), b - 62 - k * 11 - frac(ph) * 10]);
        inkLine(P, .5, '#B8AFC4', 'inkfine', .6);
      }
    }
  }
  function bin() {
    boilSeed('bin');
    const { x, top } = BIN;
    paint([[x - 70, top], [x + 70, top], [x + 55, FLOOR_Y + 14], [x - 55, FLOOR_Y + 14]], { wash: '#7B86B8', ink: PAL.ink, sw: .8 });
    for (let i = -2; i <= 2; i++) inkLine([[x + i * 26, top + 14], [x + i * 21, FLOOR_Y + 2]], .35, '#5D6795', 'inkfine', 0);
    paint(ellPts(x, top, 70, 10, 20), { wash: '#56608E', ink: PAL.ink, sw: .7 });
  }

  // t: event time. r = { ct (video time: clouds, stars, steam), h (hours), cam [cx, cy, zoom], pose, screen(t) (draws
  // in SW × SH), lid (0..1, default open), screenOn, mugs, steam, after(t, pose) (world-space props in front of the
  // desk, e.g. paper balls), hf (hours function for the clock), strikeT }. Returns the creator's face on screen.
  function room(t, r) {
    const h = r.h, dim = darkAt(h), [cx, cy, z] = r.cam, ct = r.ct ?? t, lid = r.lid ?? 1;
    const night = y => { if (dim > .005) { boilSeed('night' + y); paint(rectPts(-400, y, W + 800, H + 800 - y), { wash: NIGHT, washOp: 255 * dim, ink: null }); } };
    camBegin(cx, cy, z);
    wall();
    night(-400);
    windowView(ct, h, dim);
    clock(t, h, dim, r.hf, r.strikeT);
    const p = r.pose;
    LIT = dim * .45;
    if (LIT > 0) for (const f of ['col', 'dk', 'lt']) p[f] = mixCol(p[f] || CREATOR[f], NIGHT, LIT);
    creator(CX, GY, U, p);
    if (dim > .005) glow(CX + 90, GY - 190, 360, '#A9B8FF', .7 * dim);
    desk();
    laptop(lid);
    bin();
    if (r.after) r.after(t, p);
    night(DESK.top - 3);
    mugs(ct, r.mugs ?? 1, r.steam ?? true, LIT);
    if (lid > .03) {
      if (r.screenOn) glow(SCR[0] + SCR[2] / 2, SCR[1] + SCR[3] / 2, 360 + 340 * dim, '#AFC2FF', (.15 + 1.1 * dim) * lid);
      push(); translate(SCR[0], HINGE); scale(SCR_K, SCR_K * lid); translate(0, -SH); boilSeed('screen'); r.screen(t); pop();
    }
    const face = toScreen(CX, GY - 6 * U);
    camEnd();
    return face;
  }

  // ---------- lettering (screen space, after camEnd) ----------
  const font = px => `800 ${px}px "Baloo 2"`;
  const fit = (txt, size, maxW) => { const c = letG.drawingContext; c.font = font(size); return Math.min(size, size * maxW / c.measureText(txt).width); };
  // The big two-line exclamation: l1 at t0, l2 half a second later. o: { y (first line), s1, s2 } in frame px.
  function shout(t, t0, l1, c1, l2, c2, o = {}) {
    const y = o.y ?? 330, s1 = fit(l1, o.s1 ?? 200, W - 140), s2 = fit(l2, o.s2 ?? 110, W - 120), d = o.gap ?? .55;
    if (t > t0) letter(l1, W / 2 - 20, y, s1, c1, { screen: true, pop: (t - t0) * 4, rot: -.06 + .02 * Math.sin(t * 3), stroke: PAL.cream, font: font(s1) });
    if (t > t0 + d) letter(l2, W / 2 + 10, y + s1 * .62 + s2 * .55, s2, c2, { screen: true, pop: (t - t0 - d) * 4, rot: -.03 + .015 * Math.sin(t * 2.4 + 1), stroke: PAL.cream, font: font(s2) });
  }
  // A caption pill between t0 and t1: pops in, fades out. Shrinks to fit the frame; sits above TikTok's own caption.
  function caption(t, t0, t1, txt, col = BR.violet, size = 58, y = 1440, dot = null) {
    if (t < t0 || t > t1) return;
    size = fit(txt, size, W - 200 - (dot ? size : 0));
    const c = letG.drawingContext; c.font = font(size);
    const tw = c.measureText(txt).width, k = backOut(seg(t, t0, t0 + .3)), out = 1 - seg(t, t1 - .25, t1), ph = size * 1.3, pad = size * .55 + (dot ? size * .9 : 0);
    boilSeed('cap' + txt.length);
    push(); translate(W / 2, y); scale(k);
    paint(rrPts(-tw / 2 - pad, -ph / 2, tw + pad + size * .55, ph, ph / 2, 1.5), { wash: PAL.cream, washOp: 255 * out, ink: out > .95 ? PAL.ink : null, sw: 1 });
    if (dot) paint(ellPts(-tw / 2 - pad + size * .62, 0, size * .3, size * .3, 16), { wash: dot, washOp: 255 * out, ink: out > .95 ? PAL.ink : null, sw: .7 });
    pop();
    letter(txt, W / 2 + (dot ? size * .45 : 0), y + size * .04, size, col, { screen: true, pop: seg(t, t0, t0 + .3), alpha: out, font: font(size) });
  }

  // ---------- the logo and the outro ----------
  let LOGO = null;
  function drawLogo(cx, cy, h, alpha = 1) {
    if (!LOGO || h < 1) return;
    flushBrush();
    const w = h * LOGO.width / LOGO.height;
    push(); tint(255, 255 * clamp(alpha)); image(LOGO, cx - w / 2, cy - h / 2, w, h); noTint(); pop();
  }
  // The series' ending: a brush wipe in, the creator asking the viewer a question (o.q: two lines), then the small AIMA
  // logo underneath (Awareness posts don't pitch the product; the logo just signs the channel). Fades to paper.
  // From Solution on, o.q is the call to action instead and o.logoH (default 150) makes the logo bigger.
  function outro(t, lt, dur, o) {
    [[BR.cyan, 120, 1500, 380], [BR.magenta, 960, 260, 420], [BR.violet, 980, 1250, 300], [BR.blue, 80, 380, 260]].forEach(([c, x, y, r], i) => {
      boilSeed('blob' + i);
      paint(ellPts(x + 20 * wob(lt, .15, i * .3), y + 14 * wob(lt, .12, i * .7), r, r * .8, 26, 6), { wash: mixCol(c, PAL.paper, .78), ink: null });
    });
    const p = emotions(lt, [K(0, 'hopeful'), K(.5, o.feel || 'shy')]);
    p.aR = lerp(p.aR ?? .2, 1.5 + .12 * Math.sin(lt * 7), bump(lt, .4, .65, dur, dur + 1));      // a hand up: "who else?"
    creator(W / 2, 1280, 44, p, 'outro');
    const s1 = fit(o.q[0], 96, W - 140), s2 = fit(o.q[1], 96, W - 140);
    if (lt > .35) letter(o.q[0], W / 2, 560, s1, BR.violet, { screen: true, pop: (lt - .35) * 3.5, rot: -.03, stroke: PAL.cream, font: font(s1) });
    if (lt > .6) letter(o.q[1], W / 2, 560 + s1 * 1.15, s2, BR.magenta, { screen: true, pop: (lt - .6) * 3.5, rot: -.02, stroke: PAL.cream, font: font(s2) });
    const k = seg(lt, 1.3, 1.8);
    if (k > 0) { flushLetters(); drawLogo(W / 2, 1490 + ((o.logoH || 150) - 150) * .3, (o.logoH || 150) * backOut(k), clamp(k * 3)); }
    if (lt < .3) brushWipe(.5 + lt / .6, o.wipe || [BR.violet, BR.magenta]);
    if (lt > dur - .7) { flushLetters(); flash(ease(seg(lt, dur - .7, dur - .05)), PAL.paper); }
  }
  // ---------- the recurring props from #3 on ----------
  // The brand's product: a scented candle in a jar (x, y = the jar's base centre, s = scale). o: { t (flicker time),
  // flame 0..1, lean, rot, neon 0..1 (the brand colours painted over), sw }.
  const JAR = '#E7DEFF', NEON = ['#B6F23A', '#FF7A1A', '#FF3FA4'];
  function candle(x, y, s, o = {}) {
    const fl = o.flame ?? 1, n = o.neon ?? 0, sw = o.sw ?? .7, t = o.t ?? 0;
    push(); translate(x, y); rotate(o.rot || 0);
    if (fl > .02) glow(0, -66 * s, 70 * s * fl, '#FFC766', .5 * fl);
    paint(rrPts(-22 * s, -56 * s, 44 * s, 56 * s, 8 * s), { wash: mixCol(JAR, NEON[0], n), ink: PAL.ink, sw });
    paint(rectPts(-22 * s, -36 * s, 44 * s, 16 * s), { wash: mixCol(BR.violet, NEON[1], n), ink: null });
    paint(ellPts(0, -28 * s, 6 * s, 4 * s, 10), { wash: mixCol(BR.cyan, NEON[2], n), ink: null });
    paint(ellPts(0, -52 * s, 18 * s, 4 * s, 14), { wash: PAL.cream, ink: null });
    inkLine([[0, -52 * s], [1 * s, -60 * s]], sw * .9, PAL.ink, 'inkfine', 0);
    if (fl > .02) {
      const w = 1 + .1 * Math.sin(t * 23), lean = (o.lean || 0) * 6 * s, h = 20 * s * fl * w;
      paint([[lean, -60 * s - h], [6 * s * fl + lean * .3, -64 * s], [5 * s * fl, -59 * s], [0, -57 * s], [-5 * s * fl, -59 * s], [-6 * s * fl + lean * .3, -64 * s]],
        { wash: '#FFB13D', ink: PAL.ink, sw: sw * .7, curv: .6 });
    }
    pop();
  }
  // The viral dance from #3: arms swap up and down on every beat, a hop, a sway. bx, by = the body's centre.
  function dancer(bx, by, s, t, col) {
    const sw = Math.sin(t * TAU), hop = 12 * s * pulse(t, 6), y = by - hop, up = Math.sin(t * TAU * 2);
    paint(ellPts(bx + 6 * s * sw, y - 50 * s, 14 * s, 14 * s, 14), { wash: '#FFE3C8', ink: PAL.ink, sw: .45 });
    paint(ellPts(bx + 3 * s * sw, y, 22 * s, 30 * s, 16), { wash: col, ink: PAL.ink, sw: .45 });
    inkLine([[bx - 18 * s, y - 12 * s], [bx - 40 * s, y - 12 * s - 30 * s * up]], .8, PAL.ink, 'ink', 0);
    inkLine([[bx + 18 * s, y - 12 * s], [bx + 40 * s, y - 12 * s + 30 * s * up]], .8, PAL.ink, 'ink', 0);
    inkLine([[bx - 8 * s, y + 28 * s], [bx - 14 * s, by + 44 * s]], .8, PAL.ink, 'ink', 0);
    inkLine([[bx + 8 * s, y + 28 * s], [bx + 14 * s, by + 44 * s]], .8, PAL.ink, 'ink', 0);
  }

  // The AIMA app on the laptop (screen design space): a pale page, a bar in the logo's gradient, the logo at its left.
  // k (0..1) opens it from the centre. Draw the app's own content after it, below y = APP_TOP.
  const APP_TOP = 40;
  function app(k = 1) {
    push(); translate(SW / 2, SH / 2); scale(Math.max(.01, k)); translate(-SW / 2, -SH / 2);
    paint(rectPts(0, 0, SW, SH), { wash: '#FBF8FF', ink: null });
    [BR.cyan, BR.blue, BR.violet, BR.magenta].forEach((c, i) => paint(rectPts(i * SW / 4, 0, SW / 4 + 1, APP_TOP), { wash: mixCol(c, PAL.cream, .55), ink: null }));
    inkLine([[0, APP_TOP], [SW, APP_TOP]], .4, '#B9AFCB', 'inkfine', 0);
    if (k > .95) drawLogo(60, APP_TOP / 2, 30);
    pop();
  }
  (window.PRELOAD ||= []).push(async () => {
    LOGO = await loadImage(AIMA_LOGO);
    await document.fonts.load(font(100), 'ÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬĐÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴàáảãạăằắẳẵặâầấẩẫậđèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ abcdefghijklmnopqrstuvwxyz ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789 …?!.,');
  });

  return { BR, CREATOR, NIGHT, TXT, HOME, CX, GY, U, WIN, CLK, DESK, FLOOR_Y, BIN, SW, SH, SCR, HINGE,
    darkAt, skyAt, bump, K, squig, SCR_BG, creator, leftHand, ball, room, font, fit, shout, caption, drawLogo, outro, app, APP_TOP, candle, dancer };
})();
