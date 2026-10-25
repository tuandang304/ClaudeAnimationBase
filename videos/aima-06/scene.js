// scene.js: AIMA #6, TikTok Solution: "Một trend vào AIMA thì chuyện gì xảy ra?" (context/aima/campaign.md, TikTok 6;
// storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING in video.js). Vertical.
// The plan calls for a screen recording; this is the animated version, in the series room. The same viral dance and
// the same candle brand as #3, where the creator got nowhere: this time the trend is dragged into AIMA. AIMA reads
// it against the brand profile (a fit gauge fills), offers three ideas, the creator picks one, it becomes a script,
// a caption, hashtags and a CTA that the creator still edits, then one version per platform. The camera dives into
// the TikTok version: the candle does the dance and stays lit (in #3 it fell over). Outro: the call to action.
(() => {
  const { BR, TXT, SW, SH, APP_TOP, bump, K, squig, SCR_BG } = AIMA;
  const T = TIMING;
  const STW = warp(T.story.rates, T.story.end), V_OUTRO = STW.len;
  let T_ = 0;                                            // the frame's time (flicker, dance)

  const HOURS = [[0, 14], [T.story.end, 15]];
  const hoursAt = t => kf(t, HOURS);

  // ---------- camera: on the screen for the demo, out to the creator for the choices ----------
  const SCRV = z => [812, 968, z], FACEV = z => [650, 945, z];
  const TIKTOK = [604 + 79 * .8, 852 + 150 * .8];        // the TikTok version's centre in the world
  const CAMK = [
    [0, [600, 930, 1.25]], [T.drag[0] - .3, [610, 930, 1.28]], [T.drag[0] + .3, SCRV(1.8)],               // into the screen
    [T.pick - .9, SCRV(1.82)], [T.pick - .4, FACEV(1.4)], [T.pick + .5, FACEV(1.42)], [T.doc, SCRV(1.8)],   // the pick
    [T.edit[0] - .4, SCRV(1.84)], [T.edit[0], FACEV(1.4)], [T.edit[1] + .3, FACEV(1.42)], [T.platforms[0], SCRV(1.8)],   // the edit
    [T.payoff, SCRV(1.84)], [T.payoff + .5, [...TIKTOK, 3.4]], [T.turn + .7, [...TIKTOK, 3.5]],               // the dance
    [T.turn + 1.3, FACEV(1.35)], [T.story.end, FACEV(1.38)],
  ];
  function camAt(t) { const [cx, cy, z] = kf(t, CAMK); return [cx + 6 * wob(t, .07), cy + 4 * wob(t, .05, .3), z]; }

  // ---------- the creator ----------
  const KEYS = [K(0, 'hopeful'), K(T.drag[0], 'determined'), K(T.scan[0], 'thinking'), K(T.fit[1], 'excited'), K(T.ideas[0] + .2, 'thinking'),
    K(T.pick, 'happy'), K(T.doc + .3, 'excited'), K(T.edit[0] - .1, 'determined'), K(T.platforms[0], 'starstruck'), K(T.payoff + .6, 'proud'), K(T.turn + 1.4, 'happy')];
  const TURNS = [[T.turn + 1.2, T.turn + 1.37, .125, 0]];
  function creatorPose(t) {
    const p = emotions(t, KEYS);
    let tv = { ...spinView(.125), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); };
    R(-.8, bump(t, .2, .4, T.turn + 1, T.turn + 1.2));                                       // a hand on the trackpad
    R(-1.0, bump(t, T.drag[0] - .1, T.drag[0], T.drag[1], T.drag[1] + .1));                   // drag...
    R(-1.05, bump(t, T.pick - .12, T.pick - .04, T.pick + .04, T.pick + .12));                // click
    R(-.78 + .16 * Math.sin(t * TAU * 7), bump(t, T.edit[0] - .1, T.edit[0], T.edit[1], T.edit[1] + .1));   // typing
    p.lookX = lerp(p.lookX || 0, .75, bump(t, .1, .3, T.turn + 1.1, T.turn + 1.3)); p.lookY = lerp(p.lookY || 0, .2, bump(t, .1, .3, T.turn + 1.1, T.turn + 1.3));
    return p;
  }

  // ---------- the screen ----------
  const DCOL = BR.magenta;
  function trendCard(cx, cy, w, h, t) {                  // the viral video: pink over orange, the dance
    paint(rectPts(cx - w / 2, cy - h / 2, w, h * .55), { wash: '#F59AD9', ink: null });
    paint(rectPts(cx - w / 2, cy - h / 2 + h * .55, w, h * .45), { wash: '#FFB46B', ink: null });
    paint(rectPts(cx - w / 2, cy - h / 2, w, h), { ink: PAL.ink, sw: .4 });
    AIMA.dancer(cx, cy + h * .05, h / 284, t, DCOL);
  }
  const SLOT = [80, 160, 110, 196];                      // where the trend sits in AIMA (cx, cy, w, h)
  function feed(t) {
    SCR_BG('#16131F');
    paint(rectPts(10, 10, 150, SH - 20), { wash: '#221E30', ink: null });
    for (let b = 0; b < 6; b++) { const hh = 20 + b * 28; paint(rectPts(24 + b * 22, SH - 30 - hh, 15, hh), { wash: BR.magenta, ink: null }); }
    paint(heartPts(372, 120, 13), { wash: '#E2476E', ink: null });
  }
  function brandCard(t) {                                // the brand profile: candle, colours, customers
    const k = backOut(seg(t, T.brand, T.brand + .3)); if (k < .02) return;
    boilSeed('brand');
    push(); translate(430, 160); scale(k); translate(-430, -160);
    paint(rrPts(362, 62, 136, 196, 10), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    AIMA.candle(430, 150, .95, { t: T_, sw: .5 });
    [BR.violet, BR.cyan, BR.magenta].forEach((c, i) => paint(ellPts(400 + i * 30, 184, 9, 9, 12), { wash: c, ink: PAL.ink, sw: .3 }));
    ['#F3B6E4', '#9ADBE8', '#FFD3A8', '#C5B6F5'].forEach((c, i) => { paint(ellPts(392 + i * 25, 238, 10, 8, 10), { wash: mixCol(c, PAL.ink, .15), ink: null }); paint(ellPts(392 + i * 25, 222, 8, 8, 10), { wash: c, ink: PAL.ink, sw: .25 }); });
    pop();
  }
  function gauge(t) {                                    // how well the trend fits the brand
    const k = backOut(seg(t, T.brand + .1, T.brand + .4)); if (k < .02) return;
    boilSeed('gauge');
    const cx = 250, cy = 190, r = 72, f = .86 * ease(seg(t, ...T.fit));
    const arc = (a0, a1) => { const P = []; for (let i = 0; i <= 16; i++) { const a = Math.PI + (a1 - a0) * i / 16 * Math.PI + a0 * Math.PI; P.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]); } return P; };
    inkLine(arc(0, 1), 8 * k, '#E3DAF7', 'ink', 0);
    if (f > .02) inkLine(arc(0, f), 8 * k, mixCol('#FFC83D', '#3FBF8F', seg(f, .4, .86)), 'ink', 0);
    const a = Math.PI + f * Math.PI;
    inkLine([[cx, cy], [cx + Math.cos(a) * r * .8 * k, cy + Math.sin(a) * r * .8 * k]], 1.4, PAL.ink, 'ink', 0);
    paint(ellPts(cx, cy, 7, 7, 10), { wash: BR.violet, ink: null });
    if (t > T.fit[1]) emote('spark', cx + 60, cy - 90, 9, seg(t, T.fit[1], T.fit[1] + .25), t - T.fit[1]);
  }
  // three ideas (no words: each a little picture of the candle doing something)
  function idea(i, x, y, t) {
    paint(rrPts(x, y, 140, 190, 10), { wash: '#FFFFFF', ink: PAL.ink, sw: .5 });
    paint(rectPts(x + 10, y + 10, 120, 110), { wash: ['#F59AD9', '#FFE3C8', '#C9C2F2'][i], ink: null });
    if (i === 0) { AIMA.candle(x + 70, y + 108, .9, { t: T_, rot: .2 * Math.sin(t * TAU), sw: .45 }); emote('music', x + 112, y + 40, 6, 1, t); }
    if (i === 1) { AIMA.candle(x + 70, y + 108, .9, { t: T_, sw: .45 }); for (const s of [-1, 1]) paint(ellPts(x + 70 + s * 42, y + 92, 14, 10, 12), { wash: '#F0C9A8', ink: PAL.ink, sw: .35 }); }
    if (i === 2) { AIMA.candle(x + 52, y + 108, .8, { t: T_, sw: .45 }); paint(ellPts(x + 100, y + 56, 20, 20, 14), { wash: PAL.cream, ink: PAL.ink, sw: .4 }); inkLine([[x + 100, y + 56], [x + 100, y + 42], [x + 110, y + 56]], .6, PAL.ink, 'inkfine', 0); }
    squig(x + 12, 110, y + 142, TXT, .45, i); squig(x + 12, 70, y + 166, TXT, .45, i + 3);
  }
  function hashMark(x, y, s) {                            // a painted "#"
    for (const d of [-1, 1]) { inkLine([[x + d * 4 * s, y - 10 * s], [x + d * 4 * s - 3 * s, y + 10 * s]], 1.1, BR.blue, 'ink', 0); inkLine([[x - 10 * s, y + d * 4 * s], [x + 9 * s, y + d * 4 * s]], 1.1, BR.blue, 'ink', 0); }
  }
  function doc(t) {                                      // the content: storyboard frames, caption, hashtags, CTA
    const k = backOut(seg(t, T.doc, T.doc + .3));
    push(); translate(SW / 2, 165); scale(k); translate(-SW / 2, -165);
    paint(rrPts(14, 52, SW - 28, 236, 10), { wash: '#FFFFFF', ink: PAL.ink, sw: .5 });
    for (let j = 0; j < 3; j++) {
      const kj = seg(t, T.doc + .3 + j * .2, T.doc + .5 + j * .2); if (kj <= 0) continue;
      boilSeed('frame' + j);
      paint(rectPts(28, 64 + j * 72, 96, 62), { wash: ['#F59AD9', '#FFD3A8', '#C9C2F2'][j], ink: PAL.ink, sw: .35 });
      AIMA.candle(76, 116 + j * 72, .55, { t: T_, rot: .25 * Math.sin(t * TAU + j), sw: .35 });
    }
    const W_ = [320, 280, 240], sum = 840, ed = T.edit;
    let left = sum * seg(t, T.doc + .8, T.doc + 1.8);
    W_.forEach((w, j) => {
      let len = Math.min(w, Math.max(0, left)); left -= w;
      if (j === 1 && t > ed[0]) len = w * (t < ed[1] ? 1 - seg(t, ed[0], ed[0] + .25) + seg(t, ed[0] + .3, ed[1]) : 1);   // rewritten by the creator
      if (len > 0) squig(146, len, 82 + j * 34, j === 1 && t > ed[0] ? BR.violet : TXT, .6, j);
    });
    [0, 1, 2].forEach(j => { const kh = backOut(seg(t, T.hashtags + j * .1, T.hashtags + .2 + j * .1)); if (kh > .02) { boilSeed('hash' + j); hashMark(160 + j * 70, 196, kh); squig(176 + j * 70, 34, 196, BR.blue, .45, j); } });
    const kc = backOut(seg(t, T.cta, T.cta + .25));
    if (kc > .02) { boilSeed('cta'); push(); translate(210, 246); scale(kc); paint(rrPts(-64, -18, 128, 36, 18), { wash: BR.magenta, ink: PAL.ink, sw: .45 }); squig(-40, 80, 0, PAL.cream, .5); pop(); }
    pop();
  }
  // one version per platform: vertical, square, wide, and a text post
  const PLAT = [[79, 150, 110, 196, '#1F1B2E'], [218, 140, 130, 130, BR.magenta], [395, 106, 196, 100, BR.blue], [395, 228, 196, 70, '#3A3450']];
  function platforms(t) {
    PLAT.forEach(([cx, cy, w, h, c], i) => {
      const k = backOut(seg(t, T.platforms[i], T.platforms[i] + .3)); if (k < .02) return;
      boilSeed('plat' + i);
      push(); translate(cx, cy); scale(k);
      paint(rrPts(-w / 2, -h / 2, w, h, 8), { wash: i === 3 ? '#FFFFFF' : mixCol(c, PAL.cream, .7), ink: PAL.ink, sw: .5 });
      paint(rrPts(-w / 2, -h / 2, w, 14, 7), { wash: c, ink: null });
      if (i === 0) AIMA.candle(0, 60, 1.3, { t: T_, rot: .25 * Math.sin(t * TAU), lean: -Math.cos(t * TAU), sw: .5 });         // it dances, and stays lit
      if (i === 1) { AIMA.candle(0, 50, 1.0, { t: T_, sw: .45 }); paint(heartPts(44, 44, 7), { wash: '#E2476E', ink: null }); }
      if (i === 2) { AIMA.candle(-60, 40, .8, { t: T_, sw: .4 }); squig(-20, 100, -10, TXT, .45, 2); squig(-20, 80, 14, TXT, .45, 3); }
      if (i === 3) { squig(-86, 170, -10, TXT, .5, 4); squig(-86, 130, 12, TXT, .5, 5); }
      pop();
    });
  }
  function screen(t) {
    const [d0, d1] = T.drag, dk = ease(seg(t, d0, d1));
    if (t < T.open) feed(t); else if (t < T.doc + .3 || t < T.pick) AIMA.app(t < T.open + .3 ? backOut(seg(t, T.open, T.open + .3)) : 1);
    if (t < T.open || t < T.ideas[0]) {                  // the trend: dragged out of the feed into AIMA's slot, then read
      const s = lerp(1, SLOT[3] / 284, dk), cx = lerp(260, SLOT[0], dk), cy = lerp(150, SLOT[1], dk) - 30 * Math.sin(dk * Math.PI);
      boilSeed('trend'); trendCard(cx, cy, 156 * s, 284 * s, t);
      if (t > T.scan[0] && t < T.scan[1] + .2) {
        const sx = SLOT[0] - SLOT[2] / 2 + SLOT[2] * ease(seg(t, ...T.scan));
        glow(sx, SLOT[1], 70, BR.cyan, .8); inkLine([[sx, SLOT[1] - SLOT[3] / 2], [sx, SLOT[1] + SLOT[3] / 2]], 1.6, BR.cyan, 'ink', 0);
      }
      if (t > T.open) { brandCard(t); gauge(t); }
      return;
    }
    if (t < T.doc) {                                     // three ideas; one is picked
      T.ideas.forEach((s, i) => {
        const k = backOut(seg(t, s, s + .3)), out = i !== 0 ? seg(t, T.pick + .1, T.pick + .4) : 0; if (k < .02 || out >= 1) return;
        boilSeed('idea' + i);
        const x = 30 + i * 160, y = 66;
        push(); translate(x + 70, y + 95); scale(k * (1 - out) + (i === 0 ? .06 * pulse(t, 4) * seg(t, T.pick, T.pick + .1) : 0)); translate(-x - 70, -y - 95);
        idea(i, x, y, t);
        if (i === 0 && t > T.pick) paint(rrPts(x - 6, y - 6, 152, 202, 14), { ink: BR.magenta, sw: 1.4 });
        pop();
      });
      return;
    }
    if (t < T.platforms[0]) { AIMA.app(1); doc(t); return; }
    AIMA.app(1); platforms(t);
  }

  // ---------- the shots ----------
  function story(t, lt, dur) {
    T_ = t;
    const face = AIMA.room(t, { h: hoursAt(t), cam: camAt(t), pose: creatorPose(t), screen, screenOn: true, mugs: 1, steam: true, hf: hoursAt,
      after: () => { boilSeed('deskcandle'); AIMA.candle(548, AIMA.DESK.top + 14, 1.15, { t, lean: .4 * Math.sin(t * 2) }); } });
    AIMA.caption(t, .6, 4.1, 'Một trend vào AIMA', BR.violet, 66, 1400);
    AIMA.caption(t, .95, 4.1, 'thì chuyện gì xảy ra?', BR.magenta, 66, 1500);
    AIMA.caption(t, T.platforms[0] + .2, T.payoff + .4, 'Facebook · TikTok · Instagram · Threads', BR.violet, 52, 1460);
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Truy cập landing page AIMA', 'để đăng ký dùng thử'], feel: 'happy', logoH: 260 });

  shots([[0, story], [V_OUTRO, ending]]);
})();
