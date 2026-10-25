// scene.js: AIMA #7, TikTok Product: "Lần đầu dùng AIMA thì bắt đầu từ đâu?" (context/aima/campaign.md, TikTok 7;
// storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING in video.js). Vertical.
// The plan calls for a tutorial screen recording; this is the animated version, in the series room. The old way
// first: one idea rewritten on four sheets, one per platform, all crumpled into the bin. Then AIMA, in four steps
// with a caption each: a brand profile (the candle from #3, its colours, its tone, its customers), one idea typed
// in, one version per platform made from it, and a review where the creator edits one and approves them all.
// Confetti: the first content is done. Outro: the call to action (sign up for the trial).
(() => {
  const { BR, TXT, CX, GY, U, BIN, SW, SH, APP_TOP, bump, K, squig, SCR_BG } = AIMA;
  const T = TIMING;
  const STW = warp(T.story.rates, T.story.end), V_OUTRO = STW.len;
  const [S1, S2, S3, S4] = T.steps;
  let T_ = 0;

  const HOURS = [[0, 9], [T.story.end, 9.6]];          // the first content takes the morning's first half hour, not the day
  const hoursAt = t => kf(t, HOURS);

  // ---------- camera ----------
  const SCRV = z => [812, 968, z], FACEV = z => [650, 945, z];
  const CAMK = [
    [0, [545, 900, 1.1]], [T.crumple + .6, [545, 905, 1.12]], [T.open, [600, 930, 1.25]], [S1[0], SCRV(1.8)],      // the old way; into AIMA
    [T.edit[0] - .4, SCRV(1.84)], [T.edit[0] - .1, FACEV(1.42)], [T.edit[1] + .1, FACEV(1.44)], [T.edit[1] + .4, SCRV(1.8)],   // the creator edits
    [T.confetti, SCRV(1.84)], [T.confetti + .6, [560, 920, 1.14]], [T.story.end, [560, 915, 1.18]],
  ];
  function camAt(t) { const [cx, cy, z] = kf(t, CAMK); return [cx + 6 * wob(t, .07), cy + 4 * wob(t, .05, .3), z]; }

  // ---------- the creator ----------
  const KEYS = [K(0, 'determined'), K(T.sheets[2], 'nervous', { emote: 'sweat' }), K(T.crumple, 'angry'), K(T.crumple + .9, 'sad'), K(T.open - .1, 'hopeful'),
    K(S1[0] + .5, 'thinking'), K(T.done1, 'happy'), K(S2[0] + .4, 'determined'), K(S3[0] + .5, 'surprised'), K(S3[0] + 1.1, 'starstruck'),
    K(S4[0] + .3, 'thinking'), K(T.checks[0], 'happy'), K(T.confetti, 'excited'), K(T.turn + .6, 'proud')];
  const TURNS = [[T.open - .3, T.open - .13, 0, .125], [T.turn, T.turn + .17, .125, 0]];
  function creatorPose(t) {
    const p = emotions(t, KEYS);
    let tv = { ...spinView(0), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); }, L = (a, w) => { p.aL = lerp(p.aL ?? .2, a, w); };
    L(.9 + .25 * Math.sin(t * 17), bump(t, T.sheets[0] - .1, T.sheets[0], T.crumple - .2, T.crumple));   // scribbling in the air
    L(1.5, bump(t, T.crumple - .2, T.crumple, T.crumple + .15, T.crumple + .35));                          // the throw
    R(-.8, bump(t, T.open, T.open + .2, T.turn - .1, T.turn + .1));                                       // a hand on the trackpad
    [T.logo, ...T.colours, T.send, ...T.checks].forEach(c => R(-1.05, bump(t, c - .1, c - .03, c + .03, c + .1)));   // clicks
    R(-.78 + .16 * Math.sin(t * TAU * 7), bump(t, T.typeIdea[0] - .1, T.typeIdea[0], T.typeIdea[1], T.typeIdea[1] + .1) + bump(t, T.edit[0] - .1, T.edit[0], T.edit[1], T.edit[1] + .1));
    p.lookY = lerp(p.lookY || 0, -.8, bump(t, T.sheets[0], T.sheets[0] + .2, T.crumple, T.crumple + .2));
    return p;
  }

  // ---------- the old way: four sheets, one per platform, rewritten by hand, then crumpled into the bin ----------
  const SHEETS = [[180, 700, '#1F1B2E'], [300, 640, BR.magenta], [420, 640, BR.blue], [540, 700, '#3A3450']];
  function sheets(t) {
    SHEETS.forEach(([x, y, c], i) => {
      const t0 = T.sheets[i], k = backOut(seg(t, t0, t0 + .25)); if (k < .02) return;
      boilSeed('sheet' + i);
      const cr = seg(t, T.crumple + i * .05, T.crumple + .2 + i * .05);
      if (cr < 1) {                                      // a sheet, being written
        push(); translate(x, y + 8 * Math.sin(t * 3 + i)); rotate((i - 1.5) * .08); scale(k * (1 - .7 * cr));
        paint(rrPts(-55, -70, 110, 140, 6), { wash: PAL.cream, ink: PAL.ink, sw: .6 });
        paint(rrPts(-55, -70, 110, 18, 6), { wash: c, ink: null });
        const w = seg(t, t0 + .2, T.crumple - .1);
        for (let l = 0; l < 4; l++) squig(-42, 80 * clamp(w * 4 - l), -30 + l * 24, TXT, .45, i + l);
        pop();
        return;
      }
      const f = seg(t, T.crumple + .2 + i * .05, T.crumple + .75 + i * .05); if (f >= 1) return;   // into the bin
      const [bx, by] = arcPt([x, y], [BIN.x - 30 + i * 20, BIN.top - 10], 160, easeIn(f));
      AIMA.ball(bx, by, 22, f * 8 + i);
    });
  }

  // ---------- AIMA, step by step ----------
  function stepDots(t) {                                 // progress in the app bar: done = green, current = magenta
    T.steps.forEach(([a, b], i) => {
      const on = t >= a, done = t >= b || (i === 0 && t > T.done1);
      paint(ellPts(400 + i * 30, APP_TOP / 2, 8, 8, 10), { wash: done ? '#4ED6A0' : on ? BR.magenta : PAL.cream, ink: PAL.ink, sw: .35 });
    });
  }
  const pop_ = (t, t0) => backOut(seg(t, t0, t0 + .25));
  function step1(t) {                                    // the brand profile
    paint(rrPts(20, 56, 150, 150, 12), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    const kl = pop_(t, T.logo);
    if (kl > .02) { push(); translate(95, 175); scale(kl); AIMA.candle(0, 0, 1.6, { t: T_, sw: .5 }); pop(); }
    squig(196, 120, 72, TXT, .5);
    [BR.violet, BR.cyan, BR.magenta, '#3FBF8F', '#FFC83D'].forEach((c, i) => {
      const chosen = i < 3 && t > T.colours[i], k = chosen ? 1 + .25 * Math.exp(-(t - T.colours[i]) * 8) : 1;
      paint(ellPts(206 + i * 42, 112, 14 * k, 14 * k, 12), { wash: c, ink: chosen ? PAL.ink : null, sw: .5 });
    });
    for (let s = 0; s < 2; s++) {                        // tone: two sliders settle where the creator puts them
      const y = 154 + s * 34, v = lerp(.5, [.25, .8][s], ease(seg(t, T.sliders[0] + s * .2, T.sliders[1] + s * .2)));
      inkLine([[196, y], [480, y]], .8, '#C9C0E0', 'ink', 0);
      paint(ellPts(196 + 284 * v, y, 10, 10, 10), { wash: BR.violet, ink: PAL.ink, sw: .4 });
    }
    ['#F3B6E4', '#9ADBE8', '#FFD3A8', '#C5B6F5'].forEach((c, i) => {   // the customers
      const k = pop_(t, T.fans + i * .12); if (k < .02) return;
      push(); translate(214 + i * 50, 252); scale(k);
      paint(ellPts(0, 12, 18, 13, 12), { wash: mixCol(c, PAL.ink, .15), ink: PAL.ink, sw: .35 });
      paint(ellPts(0, -10, 13, 13, 12), { wash: c, ink: PAL.ink, sw: .35 });
      pop();
    });
    const kd = pop_(t, T.done1);
    if (kd > .02) { push(); translate(95, 250); scale(kd); paint(rrPts(-60, -18, 120, 36, 18), { wash: '#4ED6A0', ink: PAL.ink, sw: .45 }); inkLine([[-12, 0], [-2, 10], [16, -10]], 1.6, PAL.cream, 'ink', 0); pop(); }
  }
  function step2(t) {                                    // one idea, typed in
    paint(rrPts(30, 110, SW - 60, 70, 30), { wash: '#FFFFFF', ink: PAL.ink, sw: .7 });
    paint(ellPts(78, 145, 18, 18, 14), { wash: '#FFE27A', ink: PAL.ink, sw: .45 });
    paint(rectPts(70, 165, 16, 8), { wash: '#B9AFCB', ink: null });
    const len = 260 * seg(t, ...T.typeIdea);
    squig(112, len, 145, TXT, .7);
    if (t < T.typeIdea[1] || frac(t * 2) < .5) paint(rectPts(116 + len, 132, 3, 26), { wash: PAL.ink, ink: null });
    const ks = 1 + .2 * Math.exp(-Math.max(0, t - T.send) * 10) * (t > T.send ? 1 : 0);
    push(); translate(440, 145); scale(ks);
    paint(ellPts(0, 0, 26, 26, 16), { wash: t > T.send ? BR.magenta : BR.violet, ink: PAL.ink, sw: .5 });
    paint([[-10, -12], [14, 0], [-10, 12], [-4, 0]], { wash: PAL.cream, ink: null });
    pop();
    if (t > T.send) {                                    // sent: it flies off toward the next step
      const k = seg(t, T.send, T.send + .6);
      paint(ellPts(440 + 120 * k, 145 - 60 * k, 10 * (1 - k) + .5, 10 * (1 - k) + .5, 10), { wash: '#FFE27A', ink: null });
    }
  }
  const PLAT = [[79, 160, 110, 196, '#1F1B2E'], [218, 150, 130, 130, BR.magenta], [395, 116, 196, 100, BR.blue], [395, 238, 196, 66, '#3A3450']];
  function step34(t, review) {                           // one version per platform; then reviewed, edited, approved
    PLAT.forEach(([cx, cy, w, h, c], i) => {
      const k = pop_(t, T.plats[i]); if (k < .02) return;
      boilSeed('plat' + i);
      push(); translate(cx, cy); scale(k);
      paint(rrPts(-w / 2, -h / 2, w, h, 8), { wash: i === 3 ? '#FFFFFF' : mixCol(c, PAL.cream, .7), ink: PAL.ink, sw: .5 });
      paint(rrPts(-w / 2, -h / 2, w, 14, 7), { wash: c, ink: null });
      if (i === 0) AIMA.candle(0, 60, 1.3, { t: T_, rot: .2 * Math.sin(t * TAU), sw: .5 });
      if (i === 1) { AIMA.candle(-24, 46, .9, { t: T_, sw: .45 }); const e = review ? seg(t, ...T.edit) : 0; squig(8, 44, 10, e > 0 ? BR.violet : TXT, .45, 1); squig(8, 44 * (e > 0 ? e : 1), 30, e > 0 ? BR.violet : TXT, .45, 2); }
      if (i === 2) { AIMA.candle(-60, 36, .8, { t: T_, sw: .4 }); squig(-20, 100, -10, TXT, .45, 2); squig(-20, 80, 14, TXT, .45, 3); }
      if (i === 3) { squig(-86, 170, -8, TXT, .5, 4); squig(-86, 130, 14, TXT, .5, 5); }
      if (review && i === 1 && t > T.edit[0] - .3 && t < T.edit[1] + .2) paint(rrPts(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12, 12), { ink: BR.magenta, sw: 1.2 });
      pop();
      if (review) {
        const kc = pop_(t, T.checks[i]);
        if (kc > .02) { boilSeed('check' + i); push(); translate(cx + w / 2 - 6, cy - h / 2 + 6); scale(kc); paint(ellPts(0, 0, 15, 15, 14), { wash: '#4ED6A0', ink: PAL.ink, sw: .45 }); inkLine([[-6, 0], [-1, 6], [8, -6]], 1.4, PAL.cream, 'ink', 0); pop(); }
      }
    });
  }
  function screen(t) {
    if (t < T.open) return SCR_BG('#2A2540');
    AIMA.app(t < T.open + .3 ? backOut(seg(t, T.open, T.open + .3)) : 1);
    if (t < T.open + .3) return;
    boilSeed('dots'); stepDots(t);
    boilSeed('body');
    const enter = s => { const k = easeOut(seg(t, s, s + .25)); if (k < 1) { push(); translate(SW * (1 - k), 0); } return k < 1; };
    if (t < S1[0]) return;
    let pushed;
    if (t < S2[0]) { pushed = enter(S1[0]); step1(t); }
    else if (t < S3[0]) { pushed = enter(S2[0]); step2(t); }
    else if (t < S4[0]) { pushed = enter(S3[0]); step34(t, false); }
    else step34(t, true);
    if (pushed) pop();
  }

  // confetti over the whole frame when it's done (screen space)
  function confetti(t) {
    const a = t - T.confetti; if (a < 0 || a > 2.6) return;
    const C = [BR.cyan, BR.blue, BR.violet, BR.magenta, '#FFC83D', '#4ED6A0'];
    for (let i = 0; i < 40; i++) {
      boilSeed('conf' + i);
      const x = hash(i) * W + 60 * Math.sin(a * 3 + i), y = -40 + a * (500 + 300 * hash(i + 9)) - 200 * hash(i + 4), r = 10 + 8 * hash(i + 2);
      push(); translate(x, y); rotate(a * 6 * (hash(i + 5) - .5) + i);
      paint(rectPts(-r, -r * .45, 2 * r, r * .9), { wash: C[i % C.length], washOp: 255 * (1 - seg(a, 2.0, 2.6)), ink: null });
      pop();
    }
  }

  // ---------- the shots ----------
  const CAPS = ['1 · Tạo hồ sơ thương hiệu', '2 · Nhập một idea', '3 · AIMA chỉnh cho từng nền tảng', '4 · Xem lại & duyệt'];
  function story(t, lt, dur) {
    T_ = t;
    const face = AIMA.room(t, { h: hoursAt(t), cam: camAt(t), pose: creatorPose(t), screen, screenOn: t > T.open, mugs: 1, steam: true, hf: hoursAt,
      after: et => { boilSeed('deskcandle'); AIMA.candle(548, AIMA.DESK.top + 14, 1.15, { t, lean: .4 * Math.sin(t * 2) }); sheets(et); } });
    confetti(t);
    AIMA.caption(t, .6, 4.3, 'Lần đầu dùng AIMA', BR.violet, 66, 1400);
    AIMA.caption(t, .95, 4.3, 'thì bắt đầu từ đâu?', BR.magenta, 66, 1500);
    T.steps.forEach(([a, b], i) => AIMA.caption(t, a + .1, b, CAPS[i], BR.violet, 58, 1460, BR.magenta));
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Đăng ký dùng thử AIMA', 'làm content đầu tiên của bạn'], feel: 'happy', logoH: 260 });

  shots([[0, story], [V_OUTRO, ending]]);
})();
