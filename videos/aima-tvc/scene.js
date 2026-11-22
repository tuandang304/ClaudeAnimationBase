// scene.js: the AIMA TVC, 16:9 (storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING
// in video.js). A: the series room at night, the creator worn out: tabs pile up on the laptop, the calendar is empty, the
// post has no views. B: iris out to the AIMA stage, the logo and "AI Marketing Assistant". C: how it works, four beats on
// the AIMA app (brand profile, trend research, content per platform, schedule & auto-post to Facebook) with the creator
// presenting from the corner. D: proof (23.000+ views, 20 paying customers: real numbers, no names). E: the end card.
// Only what context/aima/ says: AIMA writes text content; auto-posting is Facebook only.
(() => {
  const { BR, CREATOR, TXT, SW, SH, APP_TOP, K, squig, SCR_BG, font, fit } = AIMA;
  const T = TIMING, BL = T.beatLen;
  const BEZEL = '#3A3450', FB = '#1877F2';

  // ---------- shared pieces ----------
  // a caption pill at any x (AIMA.caption is always centred)
  function pill(t, t0, t1, txt, x, y, size, col, dot) {
    if (t < t0 || t > t1) return;
    const c = letG.drawingContext; c.font = font(size);
    const tw = c.measureText(txt).width, k = backOut(seg(t, t0, t0 + .3)), out = 1 - seg(t, t1 - .25, t1), ph = size * 1.3, pad = size * .55 + (dot ? size * .9 : 0);
    boilSeed('pill' + txt);
    push(); translate(x, y); scale(Math.max(.01, k));
    paint(rrPts(-tw / 2 - pad, -ph / 2, tw + pad + size * .55, ph, ph / 2, 1.5), { wash: PAL.cream, washOp: 255 * out, ink: out > .95 ? PAL.ink : null, sw: 1 });
    if (dot) paint(ellPts(-tw / 2 - pad + size * .62, 0, size * .3, size * .3, 16), { wash: dot, washOp: 255 * out, ink: out > .95 ? PAL.ink : null, sw: .7 });
    pop();
    letter(txt, x + (dot ? size * .45 : 0), y + size * .04, size, col, { screen: true, pop: seg(t, t0, t0 + .3), alpha: out, font: font(size) });
  }
  // the AIMA stage: paper with the brand's colours drifting in soft blobs
  function stage(t) {
    boilSeed('paper'); paint(rectPts(-200, -200, W + 400, H + 400), { wash: PAL.paper, ink: null });
    [[BR.cyan, 150, 930, 400], [BR.magenta, 1790, 150, 430], [BR.violet, 1720, 1010, 330], [BR.blue, 180, 110, 300]].forEach(([c, x, y, r], i) => {
      boilSeed('blob' + i);
      paint(ellPts(x + 26 * wob(t, .15, i * .3), y + 18 * wob(t, .12, i * .7), r, r * .8, 26, 6), { wash: mixCol(c, PAL.paper, .78), ink: null });
    });
  }
  function plane(x, y, s, rot) {
    push(); translate(x, y); rotate(rot); scale(s);
    paint([[-22, 4], [24, -14], [6, 16], [0, 6]], { wash: PAL.cream, ink: PAL.ink, sw: .6 });
    inkLine([[0, 6], [24, -14]], .5, PAL.ink, 'inkfine', 0);
    pop();
  }
  function tick(x, y, r, k) {
    if (k < .02) return;
    push(); translate(x, y); scale(k);
    paint(ellPts(0, 0, r, r, 14), { wash: '#4ED6A0', ink: PAL.ink, sw: .4 });
    inkLine([[-r * .42, 0], [-r * .08, r * .4], [r * .5, -r * .42]], r * .09, PAL.cream, 'ink', 0);
    pop();
  }
  function fbBadge(x, y, r) {                            // a Facebook-blue disc with a painted "f"
    paint(ellPts(x, y, r, r, 20), { wash: FB, ink: PAL.ink, sw: .5 });
    paint(rectPts(x - r * .14, y - r * .32, r * .26, r * .94), { wash: PAL.cream, ink: null });
    paint(rectPts(x - r * .38, y - r * .1, r * .66, r * .2), { wash: PAL.cream, ink: null });
    paint(ribbon([[x - r * .01, y - r * .3], [x + r * .08, y - r * .54], [x + r * .38, y - r * .58]], r * .26, r * .2), { wash: PAL.cream, ink: null });
  }
  const popK = (t, t0, d = .25) => backOut(seg(t, t0, t0 + d));
  const nf = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');      // 23000 → "23.000"

  // ---------- A: the hook, in the series room at night ----------
  const HOOKH = t => 22.4 + t * .03;
  const HCAM = [[0, [560, 960, 1.45]], [T.push, [560, 965, 1.5]], [T.push + .7, [812, 972, 3.0]], [T.nobody - .3, [812, 972, 3.12]],
    [T.nobody + .25, [470, 930, 2.1]], [T.reveal, [440, 950, 2.3]]];
  const hcam = t => { const [x, y, z] = kf(t, HCAM); return [x + 5 * wob(t, .07), y + 3 * wob(t, .05, .3), z]; };
  const HKEYS = [K(0, 'sleepy'), K(T.push + .5, 'bored'), K(3.0, 'nervous', { emote: 'sweat' }), K(T.nobody + .1, 'sad', { emote: 'cloud' })];
  function hookPose(t) {
    const p = emotions(t, HKEYS);
    Object.assign(p, { ...spinView(.125), smear: 0 });
    p.aR = lerp(p.aR ?? .2, -.78 + .16 * Math.sin(t * TAU * 6), AIMA.bump(t, .3, .5, T.nobody - .2, T.nobody + .1));   // typing
    p.lookX = lerp(p.lookX || 0, .75, AIMA.bump(t, .2, .4, T.nobody, T.nobody + .3)); p.lookY = (p.lookY || 0) + .25;
    return p;
  }
  function hookScreen(t) {
    SCR_BG('#F4F1FA');
    const n = Math.floor(lerp(3, 24, easeIn(seg(t, T.push + .4, T.nobody - .4)))), tw = SW / n;   // tabs pile up
    boilSeed('tabs');
    for (let i = 0; i < n; i++) paint(rrPts(i * tw + 1, 4, tw - 2, 24, Math.min(6, tw / 3)), { wash: i === n - 1 ? '#FFFFFF' : ['#D6CEF0', '#C9DDF5', '#F2CBEA'][i % 3], ink: PAL.ink, sw: .3 });
    inkLine([[0, 28], [SW, 28]], .4, '#B9AFCB', 'inkfine', 0);
    boilSeed('cal');                                     // the calendar: four empty weeks
    paint(rrPts(18, 44, 300, 240, 10), { wash: '#FFFFFF', ink: PAL.ink, sw: .45 });
    paint(rrPts(18, 44, 300, 30, 10), { wash: '#C9C0E0', ink: null });
    for (let c = 1; c < 7; c++) inkLine([[18 + c * 300 / 7, 74], [18 + c * 300 / 7, 284]], .3, '#C9C0E0', 'inkfine', 0);
    for (let r = 1; r < 4; r++) inkLine([[18, 74 + r * 52.5], [318, 74 + r * 52.5]], .3, '#C9C0E0', 'inkfine', 0);
    paint(rrPts(18 + 4 * 300 / 7 + 3, 74 + 2 * 52.5 + 3, 300 / 7 - 6, 46, 6), { ink: BR.magenta, sw: .8 });     // today: nothing
    boilSeed('post');                                    // the post: no views
    paint(rrPts(336, 44, 166, 240, 10), { wash: '#FFFFFF', ink: PAL.ink, sw: .45 });
    paint(rrPts(348, 56, 142, 96, 6), { wash: '#E6E0F2', ink: null });
    squig(350, 120, 172, TXT, .45, 1); squig(350, 90, 194, TXT, .45, 2);
    paint(ellPts(366, 248, 14, 8, 14), { wash: PAL.cream, ink: PAL.ink, sw: .4 });
    paint(ellPts(366, 248, 4, 4, 8), { wash: PAL.ink, ink: null });
    inkLine([[392, 252], [488, 252]], .7, '#B9AFCB', 'ink', 0);                    // a flat line: nobody
    if (t > T.nobody) emote('?', 470, 110, 9, seg(t, T.nobody, T.nobody + .3), t - T.nobody);
  }
  function hook(t, lt, dur) {
    const face = AIMA.room(t, { h: HOOKH(t), cam: hcam(t), pose: hookPose(t), screen: hookScreen, screenOn: true, mugs: 4, steam: false, hf: HOOKH });
    pill(t, 1.8, T.nobody - .2, 'Nghĩ nội dung', 470, 110, 60, BR.violet);
    pill(t, 2.6, T.nobody - .2, 'Bắt trend', 960, 110, 60, BR.violet);
    pill(t, 3.3, T.nobody - .2, 'Đăng bài', 1420, 110, 60, BR.violet);
    pill(t, T.nobody + .2, dur - .5, '…mà vẫn không ai xem?', W / 2, 960, 72, BR.magenta);
    if (lt < .8) iris(...face, lerp(0, 2300, ease(lt / .8)), AIMA.NIGHT);
    if (lt > dur - .7) { flushLetters(); iris(...face, lerp(2300, 0, easeIn(seg(lt, dur - .7, dur - .05))), AIMA.NIGHT); }
  }

  // ---------- B: the reveal ----------
  const LOGO0 = [960, 440, 400];                         // the logo's place and height on the reveal card
  function reveal(t, lt, dur) {
    stage(t);
    const k = popK(lt, .45, .5);
    for (let i = 0; i < 8; i++) {                        // sparkles burst out of the logo
      const a = i / 8 * TAU + .3, d = 260 + 140 * easeOut(seg(lt, .5, 1.6)), s = 18 * (1 - seg(lt, 1.4, 2.4)) * seg(lt, .5, .6);
      if (s > .5) { boilSeed('spk' + i); paint(starPts(LOGO0[0] + Math.cos(a) * d * 1.3, LOGO0[1] + Math.sin(a) * d * .8, s, .35, 4, lt * 2), { wash: [BR.cyan, BR.magenta, '#FFC83D', BR.violet][i % 4], ink: null }); }
    }
    AIMA.drawLogo(LOGO0[0], LOGO0[1] + 6 * Math.sin(lt * 2.2), LOGO0[2] * k, clamp(k * 3));
    const out = 1 - seg(lt, dur - .35, dur - .05);
    if (lt > 1.4) letter('AI Marketing Assistant', W / 2, 790, 96, BR.violet, { screen: true, pop: (lt - 1.4) * 3, alpha: out, stroke: PAL.cream, font: font(96) });
    if (lt < .7) iris(W / 2, H / 2, lerp(0, 1200, ease(lt / .7)), AIMA.NIGHT);
  }

  // ---------- C: how it works, on the AIMA app ----------
  const WX = 720, WY = 200, WK = 2.1, WW = SW * WK, WH = SH * WK;
  const BEATS = [['1 · Khai báo thương hiệu một lần', BR.cyan], ['2 · AI tìm trend đang hot', BR.blue], ['3 · Nội dung chuẩn từng nền tảng', BR.violet], ['4 · Lên lịch & tự đăng Facebook', BR.magenta]];
  let CT = 0;                                            // video time, for candle flicker inside the screens
  function beat1(bt) {                                   // the brand profile (the candle brand from #3)
    paint(rrPts(20, 56, 150, 150, 12), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    const kl = popK(bt, .3);
    if (kl > .02) { push(); translate(95, 182); scale(kl); AIMA.candle(0, 0, 1.6, { t: CT, sw: .5 }); pop(); }
    squig(196, 150 * seg(bt, .6, 1.1), 72, TXT, .6);
    [BR.violet, BR.cyan, BR.magenta, '#3FBF8F', '#FFC83D'].forEach((c, i) => {
      const ct = 1.2 + i * .2, chosen = i < 3 && bt > ct, k = chosen ? 1 + .3 * Math.exp(-(bt - ct) * 8) : 1;
      paint(ellPts(206 + i * 42, 112, 14 * k, 14 * k, 12), { wash: c, ink: chosen ? PAL.ink : null, sw: .5 });
    });
    for (let s = 0; s < 2; s++) {                        // tone of voice: two sliders
      const y = 154 + s * 34, v = lerp(.5, [.25, .8][s], ease(seg(bt, 1.9 + s * .2, 2.6 + s * .2)));
      inkLine([[196, y], [480, y]], .8, '#C9C0E0', 'ink', 0);
      paint(ellPts(196 + 284 * v, y, 10, 10, 10), { wash: BR.violet, ink: PAL.ink, sw: .4 });
    }
    ['#F3B6E4', '#9ADBE8', '#FFD3A8', '#C5B6F5'].forEach((c, i) => {   // the customers it talks to
      const k = popK(bt, 2.8 + i * .12); if (k < .02) return;
      push(); translate(214 + i * 50, 252); scale(k);
      paint(ellPts(0, 12, 18, 13, 12), { wash: mixCol(c, PAL.ink, .15), ink: PAL.ink, sw: .35 });
      paint(ellPts(0, -10, 13, 13, 12), { wash: c, ink: PAL.ink, sw: .35 });
      pop();
    });
    const kd = popK(bt, 3.7);                            // saved, once
    if (kd > .02) { push(); translate(95, 250); scale(kd); paint(rrPts(-60, -18, 120, 36, 18), { wash: '#4ED6A0', ink: PAL.ink, sw: .45 }); inkLine([[-12, 0], [-2, 10], [16, -10]], 1.6, PAL.cream, 'ink', 0); pop(); }
  }
  function flame(x, y, s, t) {
    const w = 1 + .08 * Math.sin(t * 19 + x);
    paint([[x, y - 16 * s * w], [x + 9 * s, y - 2 * s], [x + 6 * s, y + 8 * s], [x - 6 * s, y + 8 * s], [x - 9 * s, y - 2 * s]], { wash: '#FF8A3D', ink: PAL.ink, sw: .35, curv: .6 });
    paint(ellPts(x, y + 2 * s, 3.5 * s, 5 * s, 10), { wash: '#FFD25A', ink: null });
  }
  function beat2(bt) {                                   // trend research for the brand's industry
    const kc = popK(bt, .15);
    if (kc > .02) { push(); translate(105, 70); scale(kc); paint(rrPts(-85, -16, 170, 32, 16), { wash: mixCol(BR.violet, PAL.cream, .75), ink: PAL.ink, sw: .45 }); AIMA.candle(-62, 11, .45, { t: CT, sw: .35 }); squig(-40, 100, 0, TXT, .45); pop(); }
    const HOT = [.95, .6, .35];
    HOT.forEach((h, i) => {
      const y = 100 + i * 64, k = popK(bt, .5 + i * .2); if (k < .02) return;
      boilSeed('trow' + i);
      const best = i === 0 && bt > 2.9, kb = best ? 1 + .05 * Math.exp(-(bt - 2.9) * 6) : 1;
      push(); translate(SW / 2, y + 26); scale(k * kb); translate(-SW / 2, -y - 26);
      paint(rrPts(20, y, SW - 40, 52, 10), { wash: best ? '#FFF0FB' : '#FFFFFF', ink: best ? BR.magenta : PAL.ink, sw: best ? 1.1 : .45 });
      flame(48, y + 28, 1.1 * (.6 + h * .5), CT);
      squig(70, 130, y + 26, TXT, .5, i);
      const f = seg(bt, .9 + i * .25, 1.9 + i * .25), P = [];             // the sparkline climbs
      for (let s = 0; s <= 10 * f; s++) { const u = s / 10; P.push([230 + u * 150, y + 40 - u * 26 * h - 4 * Math.sin(u * 9 + i)]); }
      if (P.length > 1) inkLine(P, 1.1, i === 0 ? BR.magenta : BR.blue, 'ink', .3);
      paint(rrPts(400, y + 20, 90, 12, 6), { wash: '#EEE9F7', ink: null });
      paint(rrPts(400, y + 20, Math.max(6, 90 * h * ease(seg(bt, 1.2 + i * .2, 2.2 + i * .2))), 12, 6), { wash: i === 0 ? BR.magenta : mixCol(BR.blue, PAL.cream, .3), ink: null });
      pop();
      if (best) tick(SW - 26, y + 4, 13, popK(bt, 2.9));
    });
    const m = seg(bt, .6, 2.6);                          // the magnifier sweeps the rows
    if (m > 0 && m < 1) {
      boilSeed('mag');
      const mx = 60 + 400 * ease(m), my = 128 + 64 * Math.sin(m * Math.PI * 2) * .9 + 40 * m;
      inkLine([[mx + 14, my + 14], [mx + 30, my + 30]], 2.4, BEZEL, 'ink', 0);
      paint(ellPts(mx, my, 20, 20, 16), { wash: '#E9F7FF', washOp: 120, ink: BEZEL, sw: 1.2 });
    }
  }
  const PLATS = [[FB, 'fb'], ['#1F1B2E', 'tt'], [BR.magenta, 'ig']];
  function beat3(bt) {                                   // one text version per platform, in seconds
    PLATS.forEach(([c], i) => {
      const cx = 95 + i * 165, k = popK(bt, .2 + i * .15); if (k < .02) return;
      boilSeed('pc' + i);
      push(); translate(cx, 170); scale(k);
      paint(rrPts(-74, -112, 148, 228, 10), { wash: '#FFFFFF', ink: PAL.ink, sw: .5 });
      paint(rrPts(-74, -112, 148, 26, 10), { wash: c, ink: null });
      paint(ellPts(-56, -99, 7, 7, 10), { wash: PAL.cream, ink: null });
      const f = seg(bt, .6 + i * .35, 1.6 + i * .35);   // the lines write themselves
      const L = i === 1 ? [100, 80, 100, 70, 90] : [110, 90, 116, 60];
      L.forEach((w, j) => { const len = w * clamp(f * L.length - j); if (i === 1) paint(ellPts(-58, -60 + j * 30, 3, 3, 8), { wash: BR.violet, ink: null }); squig(i === 1 ? -48 : -60, len * (i === 1 ? .9 : 1), -60 + j * 30, TXT, .45, i + j); });
      if (f >= 1) squig(-60, 70, 96, BR.blue, .55, 9);   // hashtags, in blue
      pop();
      tick(cx + 64, 64, 13, popK(bt, 1.8 + i * .35));
    });
    boilSeed('watch');                                   // a stopwatch in the bar: the hand barely moves
    const a = -Math.PI / 2 + 1.1 * ease(seg(bt, .5, 2.6));
    paint(ellPts(470, 20, 13, 13, 14), { wash: PAL.cream, ink: PAL.ink, sw: .45 });
    paint(rectPts(467, 3, 6, 4), { wash: PAL.ink, ink: null });
    inkLine([[470, 20], [470 + Math.cos(a) * 10, 20 + Math.sin(a) * 10]], .8, BR.magenta, 'ink', 0);
  }
  const SLOTS = [[0, 0], [2, 0], [4, 0], [1, 1], [3, 1], [5, 1], [0, 2], [2, 2], [4, 2]];
  function beat4(bt) {                                   // the calendar fills up; the posts go out to Facebook
    paint(rrPts(18, 52, 320, 236, 10), { wash: '#FFFFFF', ink: PAL.ink, sw: .45 });
    paint(rrPts(18, 52, 320, 28, 10), { wash: '#C9C0E0', ink: null });
    const cw = 320 / 7, rh = 208 / 3;
    for (let c = 1; c < 7; c++) inkLine([[18 + c * cw, 80], [18 + c * cw, 288]], .3, '#C9C0E0', 'inkfine', 0);
    for (let r = 1; r < 3; r++) inkLine([[18, 80 + r * rh], [338, 80 + r * rh]], .3, '#C9C0E0', 'inkfine', 0);
    SLOTS.forEach(([c, r], i) => {
      const k = popK(bt, .3 + i * .16); if (k < .02) return;
      boilSeed('chip' + i);
      const x = 18 + c * cw + cw / 2, y = 80 + r * rh + rh / 2, sent = bt > 2.3 + i * .12;
      push(); translate(x, y); scale(k);
      paint(rrPts(-cw / 2 + 4, -rh / 2 + 6, cw - 8, rh - 12, 6), { wash: sent ? '#E4F8EE' : mixCol([BR.cyan, BR.violet, BR.magenta][i % 3], PAL.cream, .5), ink: PAL.ink, sw: .35 });
      squig(-cw / 2 + 10, cw - 22, -6, TXT, .35, i);
      pop();
      if (sent) tick(x + cw / 2 - 8, y - rh / 2 + 10, 7, popK(bt, 2.3 + i * .12));
    });
    const kb = popK(bt, .2);
    if (kb > .02) { boilSeed('fb'); push(); translate(432, 150); scale(kb * (1 + .08 * pulse(CT, 4))); fbBadge(0, 0, 46); pop(); }
    SLOTS.forEach(([c, r], i) => {                       // each post flies to Facebook
      const s = 2.3 + i * .12, k = seg(bt, s, s + .7); if (k <= 0 || k >= 1) return;
      boilSeed('pl' + i);
      const [x, y] = arcPt([18 + c * cw + cw / 2, 80 + r * rh + rh / 2], [420, 140], 70, easeIn(k));
      plane(x, y, .9 * (1 - .4 * k), -.3);
    });
    const kq = seg(bt, 2.3, 3.6);                        // a counter of posted ticks under the badge
    for (let i = 0; i < 3; i++) tick(392 + i * 40, 240, 13, popK(bt, 2.6 + i * .35) * (kq > 0 ? 1 : 0));
  }
  const BEATFN = [beat1, beat2, beat3, beat4];
  const CKEYS = [K(0, 'happy'), K(T.beats + .5, 'thinking'), K(T.beats + 4, 'happy'), K(T.beats + BL + .3, 'surprised'), K(T.beats + BL + 3, 'excited'),
    K(T.beats + 2 * BL + .3, 'starstruck'), K(T.beats + 3 * BL + .3, 'determined'), K(T.beats + 3 * BL + 2.6, 'proud')];
  function how(t, lt, dur) {
    CT = t;
    camBegin(960 + 8 * wob(t, .07), 540 + 5 * wob(t, .05, .3), 1 + .006 * lt);
    stage(t);
    const ws = Math.max(.01, backOut(seg(lt, .05, .6)));
    push(); translate(WX + WW / 2, WY + WH / 2); scale(ws); translate(-WX - WW / 2, -WY - WH / 2);
    boilSeed('win');
    paint(rrPts(WX + 4, WY + 26, WW + 16, WH + 16, 24), { wash: mixCol(BR.violet, PAL.paper, .55), ink: null });          // shadow
    paint(rrPts(WX - 16, WY - 16, WW + 32, WH + 32, 24), { wash: BEZEL, ink: PAL.ink, sw: 1 });
    push(); translate(WX, WY); scale(WK);
    AIMA.app(lt < .75 ? .949 : 1);                       // .949: full size, its logo still flying in from the reveal
    const i = clamp(Math.floor((t - T.beats) / BL), 0, 3), bt = t - T.beats - i * BL;
    const s = i > 0 && bt < .3 ? backOut(seg(bt, 0, .3)) : i < 3 && bt > BL - .15 ? 1 - easeIn(seg(bt, BL - .15, BL)) : 1;
    boilSeed('beat' + i);
    push(); translate(SW / 2, (SH + APP_TOP) / 2); scale(Math.max(.01, s)); translate(-SW / 2, -(SH + APP_TOP) / 2);
    if (lt > .5) BEATFN[i](bt);
    pop(); pop(); pop();
    const logoTo = toScreen(WX + 60 * WK, WY + 20 * WK);
    // the presenter, in the corner, pointing at the app
    const p = emotions(t, CKEYS);
    p.dy = (p.dy || 0) + 6 * (1 - easeOut(seg(lt, .3, 1.0)));
    p.aR = lerp(p.aR ?? .2, .55 + .08 * Math.sin(t * 5), AIMA.bump(t - T.beats - i * BL, .2, .5, 1.6, 2.0));
    p.lookX = .7; p.lookY = -.2;
    AIMA.creator(380, 1070, 44, p, 'presenter');
    camEnd();
    if (lt < .75) {                                      // the logo flies from the reveal into the app bar
      const k = ease(seg(lt, 0, .75));
      AIMA.drawLogo(lerp(LOGO0[0], logoTo[0], k), lerp(LOGO0[1], logoTo[1], k) - 80 * Math.sin(k * Math.PI), lerp(LOGO0[2], 30 * WK, k));
    }
    BEATS.forEach(([txt, c], j) => pill(t, T.beats + j * BL + .15, T.beats + (j + 1) * BL - (j === 3 ? .45 : .1), txt, WX + WW / 2, 104, 58, BR.violet, c));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.cyan, BR.blue]); }
  }

  // ---------- D: proof ----------
  const AV = T.proofAvatars ?? 3.2;                      // when the avatars start (after "khách hàng thật")
  function eye(x, y, R, t) {
    const bl = 1 - .9 * Math.max(0, 1 - Math.abs(frac(t / 2.7) - .5) * 30), P = [];
    for (let k = 0; k <= 16; k++) P.push([x - R + 2 * R * k / 16, y - R * .55 * bl * Math.sin(Math.PI * k / 16)]);
    for (let k = 15; k > 0; k--) P.push([x - R + 2 * R * k / 16, y + R * .55 * bl * Math.sin(Math.PI * k / 16)]);
    paint(P, { wash: PAL.cream, ink: PAL.ink, sw: 1.2 });
    if (bl > .4) { paint(ellPts(x, y, R * .38, R * .38 * bl, 18), { wash: BR.blue, ink: null }); paint(ellPts(x, y, R * .17, R * .17 * bl, 12), { wash: PAL.ink, ink: null }); }
  }
  function confetti(a) {
    if (a < 0 || a > 2.6) return;
    const C = [BR.cyan, BR.blue, BR.violet, BR.magenta, '#FFC83D', '#4ED6A0'];
    for (let i = 0; i < 44; i++) {
      boilSeed('conf' + i);
      const x = hash(i) * W + 60 * Math.sin(a * 3 + i), y = -40 + a * (500 + 300 * hash(i + 9)) - 200 * hash(i + 4), r = 10 + 8 * hash(i + 2);
      push(); translate(x, y); rotate(a * 6 * (hash(i + 5) - .5) + i);
      paint(rectPts(-r, -r * .45, 2 * r, r * .9), { wash: C[i % C.length], washOp: 255 * (1 - seg(a, 2.0, 2.6)), ink: null });
      pop();
    }
  }
  const DKEYS = [K(0, 'surprised'), K(T.proof + 2.5, 'excited'), K(T.proof + AV + 1.4, 'starstruck')];
  function proof(t, lt, dur) {
    camBegin(960 + 6 * wob(t, .06), 540 + 4 * wob(t, .05, .4), 1 + .008 * lt);
    stage(t);
    boilSeed('eye'); eye(560, 300, 110, t);
    const AC = ['#F3B6E4', '#9ADBE8', '#FFD3A8', '#C5B6F5', '#B9E6A8'];
    for (let i = 0; i < 20; i++) {                       // 20 paying customers: faceless, nameless
      const k = popK(lt, AV + i * .05); if (k < .02) continue;
      boilSeed('av' + i);
      const x = 1380 + ((i % 5) - 2) * 104, y = 260 + Math.floor(i / 5) * 104 + 4 * Math.sin(t * 3 + i), c = AC[(i * 3) % 5];
      push(); translate(x, y); scale(k);
      paint(ellPts(0, 22, 32, 22, 14), { wash: mixCol(c, PAL.ink, .15), ink: PAL.ink, sw: .5 });
      paint(ellPts(0, -14, 22, 22, 14), { wash: c, ink: PAL.ink, sw: .5 });
      const kc = popK(lt, AV + 1.1 + i * .03);
      if (kc > .02) { paint(ellPts(26, 26, 12 * kc, 12 * kc, 12), { wash: '#FFC83D', ink: PAL.ink, sw: .4 }); }
      pop();
    }
    const p = emotions(t, DKEYS);
    const cheer = seg(lt, 2.5, 2.8);
    p.aR = lerp(p.aR ?? .2, 1.3 + .2 * Math.sin(t * 9), cheer); p.aL = lerp(p.aL ?? .2, 1.2 + .2 * Math.sin(t * 9 + 1.3), cheer);
    p.dy = (p.dy || 0) + 5 * (1 - easeOut(seg(lt, .4, 1.1)));
    AIMA.creator(960, 1150, 40, p, 'cheer');
    camEnd();
    confetti(lt - 2.6);
    const v = Math.round(23000 * easeOut(seg(lt, .5, 2.6)) / 10) * 10, done = lt > 2.6;
    const s1 = fit('23.000+', 200, 760);
    if (lt > .4) letter(nf(v) + (done ? '+' : ''), 560, 530, s1 * (done ? 1 + .1 * Math.exp(-(lt - 2.6) * 6) : 1), BR.violet, { screen: true, pop: (lt - .4) * 3, rot: -.03, stroke: PAL.cream, font: font(s1 * (done ? 1 + .1 * Math.exp(-(lt - 2.6) * 6) : 1)) });
    if (lt > 1.0) letter('lượt xem', 560, 690, 84, BR.magenta, { screen: true, pop: (lt - 1.0) * 3, rot: -.02, stroke: PAL.cream, font: font(84) });
    if (lt > AV + 1.3) letter('20 khách hàng trả phí', 1380, 730, fit('20 khách hàng trả phí', 72, 720), BR.violet, { screen: true, pop: (lt - AV - 1.3) * 3, rot: -.02, stroke: PAL.cream, font: font(fit('20 khách hàng trả phí', 72, 720)) });
    if (lt < .3) brushWipe(.5 + lt / .6, [BR.cyan, BR.blue]);
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }

  // ---------- E: the end card ----------
  const PLUS = T.ctaPlus ?? 4.0;                         // "Gói Plus…" (lt)
  const EKEYS = [K(0, 'happy'), K(T.cta + PLUS, 'excited')];
  function cta(t, lt, dur) {
    camBegin(960 + 5 * wob(t, .06), 540 + 3 * wob(t, .05, .4), 1 + .005 * lt);
    stage(t);
    const p = emotions(t, EKEYS);
    p.aR = lerp(p.aR ?? .2, 1.45 + .22 * Math.sin(t * 8), AIMA.bump(lt, .5, .8, dur, dur + 1));   // waving
    p.dy = (p.dy || 0) + 5 * (1 - easeOut(seg(lt, .3, 1.0)));
    AIMA.creator(300, 1060, 40, p, 'wave');
    const ku = popK(lt, .8, .35), url = 'aima-marketing.id.vn', us = 104;
    const c = letG.drawingContext; c.font = font(us); const uw = c.measureText(url).width;
    if (ku > .02) { boilSeed('url'); push(); translate(1120, 590); scale(ku); paint(rrPts(-uw / 2 - 60, -us * .75, uw + 120, us * 1.5, us * .75, 1.5), { wash: PAL.cream, ink: PAL.ink, sw: 1.4 }); pop(); }
    const kp = popK(lt, PLUS, .35), ps = 70; c.font = font(ps); const pw = c.measureText('Plus 199k/tháng').width;
    if (kp > .02) { boilSeed('plus'); push(); translate(1120, 790); rotate(-.03); scale(kp); paint(rrPts(-pw / 2 - 44, -ps * .72, pw + 88, ps * 1.44, ps * .72, 1.5), { wash: BR.violet, ink: PAL.ink, sw: 1.2 }); pop(); }
    camEnd();
    const kl = popK(lt, .3, .45);
    AIMA.drawLogo(1120, 230 + 5 * Math.sin(lt * 2), 270 * kl, clamp(kl * 3));
    if (lt > .6) letter('Dùng thử miễn phí', 1120, 440, 66, BR.magenta, { screen: true, pop: (lt - .6) * 3, rot: -.02, stroke: PAL.cream, font: font(66) });
    if (ku > .02) letter(url, 1120, 594, us * ku, BR.violet, { screen: true, font: font(us * ku) });
    if (kp > .02) letter('Plus 199k/tháng', 1120, 793, ps * kp, PAL.cream, { screen: true, rot: -.03, font: font(ps * kp) });
    if (lt < .3) brushWipe(.5 + lt / .6, [BR.violet, BR.magenta]);
    if (lt > dur - .7) { flushLetters(); flash(ease(seg(lt, dur - .7, dur - .05)), PAL.paper); }
  }

  shots([[0, hook], [T.reveal, reveal], [T.beats, how], [T.proof, proof], [T.cta, cta]]);
})();
