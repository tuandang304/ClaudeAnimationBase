// scene.js: AIMA #8, TikTok Conversion: "Dùng Free rồi, vậy nâng cấp để làm gì?" (context/aima/campaign.md, TikTok 8;
// storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING in video.js). Vertical.
// The plan calls for a talking head and a screen recording; this is the animated version, in the series room. On the
// Free plan the token meter runs dry half-way through a post, and at 23:00 the creator, half asleep, posts each one by
// hand. Then the three plans side by side (only what context/aima/product.md says: Free, Plus 199k, Pro 499k; Plus
// and Pro add auto-posting and a higher token quota). The creator upgrades: the next night they sleep at the desk while
// the posts go out by themselves, and wake to a sunrise with everything posted. Outro: the call to action (upgrade).
(() => {
  const { BR, TXT, SW, SH, APP_TOP, bump, K, squig, SCR_BG, font, fit } = AIMA;
  const T = TIMING;
  const STW = warp(T.story.rates, T.story.end), V_OUTRO = STW.len;
  const P = T.clockPush;

  // ---------- time: the clock's hours, and the sky's (it runs back from night to morning: a sunrise) ----------
  const CLOCKH = [[0, 16], [P, 16.4], [P + .45, 17], [P + .9, 23], [T.away, 23.2], [T.away + .4, 23.3], [T.wake - .5, 30], [T.wake, 31], [T.story.end, 31.2]];
  const hf = t => kf(t, CLOCKH);
  const skyH = t => t < T.away + .4 ? Math.min(hf(t), 23) : kf(t, [[T.away + .4, 21.5], [T.wake - .5, 21.5], [T.wake + .2, 8]]);

  // ---------- camera ----------
  const DESKV = z => [600, 930, z], CLOCKV = z => [AIMA.CLK[0], AIMA.CLK[1], z];
  const CAMK = [
    [0, DESKV(1.3)], [P, DESKV(1.32)], [P + .45, CLOCKV(3.0)], [P + .9, CLOCKV(3.06)], [P + 1.35, DESKV(1.28)],    // to 23:00
    [T.manual[0] - .4, [680, 930, 1.36]], [T.cards[0] - .4, [680, 930, 1.38]], [T.cards[0], [545, 960, 1.04]],     // the plans
    [T.away, [545, 960, 1.06]], [T.away + .5, DESKV(1.22)], [T.wake, DESKV(1.26)], [T.story.end, [560, 925, 1.32]],
  ];
  function camAt(t) { const [cx, cy, z] = kf(t, CAMK); return [cx + 6 * wob(t, .07), cy + 4 * wob(t, .05, .3), z]; }

  // ---------- the creator ----------
  const KEYS = [K(0, 'happy'), K(T.drain[1], 'surprised'), K(T.drain[1] + .7, 'sad'), K(P + 1.4, 'sleepy'), K(T.manual[0] - .5, 'surprised'),
    K(T.manual[0], 'sleepy'), K(T.cards[0] + .3, 'thinking'), K(T.auto, 'excited'), K(T.tokens, 'starstruck'), K(T.choose, 'happy'),
    K(T.away + .6, 'sleepy'), K(T.wake, 'surprised'), K(T.wake + .6, 'happy'), K(T.turn + .4, 'proud')];
  const TURNS = [[T.turn, T.turn + .17, .125, 0]];
  function creatorPose(t) {
    const p = emotions(t, KEYS);
    let tv = { ...spinView(.125), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); };
    R(-.78 + .16 * Math.sin(t * TAU * 7), bump(t, .1, .3, T.drain[1], T.drain[1] + .15));      // typing...
    R(-.8, bump(t, T.drain[1], T.drain[1] + .15, T.cards[0], T.cards[0] + .2));
    for (const c of T.manual) R(-1.05, bump(t, c - .12, c - .04, c + .04, c + .12));            // ...post, by hand
    R(-1.05, bump(t, T.choose - .12, T.choose - .04, T.choose + .04, T.choose + .12));          // upgrade
    const asleep = bump(t, T.away + .5, T.away + 1, T.wake - .1, T.wake + .1);                  // head on the desk
    p.dy = (p.dy || 0) + 1.2 * asleep; p.rot = (p.rot || 0) + .12 * asleep;
    p.lookX = lerp(p.lookX || 0, .75, bump(t, .1, .3, T.turn - .1, T.turn + .1)); p.lookY = lerp(p.lookY || 0, .2, bump(t, .1, .3, T.turn - .1, T.turn + .1));
    return p;
  }

  // ---------- the laptop ----------
  function meter(f, warn) {                              // the token meter in the app bar
    paint(rrPts(330, 12, 160, 16, 8), { wash: PAL.cream, ink: PAL.ink, sw: .4 });
    if (f > .01) paint(rrPts(332, 14, 156 * f, 12, 6), { wash: f < .2 ? '#E2476E' : '#4ED6A0', ink: null });
    paint(ellPts(316, 20, 9, 9, 12), { wash: '#FFC83D', ink: PAL.ink, sw: .35 });
    if (warn) emote('!', 500, 30, 6, warn, 1);
  }
  function rows(t, times, manual) {                      // three scheduled posts; each turns green when it goes out
    times.forEach((s, i) => {
      const y = 76 + i * 70, on = t > s, k = on ? backOut(seg(t, s, s + .2)) : 1;
      boilSeed('row' + i);
      paint(rrPts(30, y, SW - 60, 56, 10), { wash: on ? '#E4F8EE' : '#FFFFFF', ink: PAL.ink, sw: .45 });
      paint(rectPts(42, y + 8, 40, 40), { wash: ['#F59AD9', '#FFD3A8', '#C9C2F2', '#9ADBE8'][i], ink: null });
      squig(96, 200, y + 28, TXT, .5, i);
      push(); translate(430, y + 28); scale(k);
      if (on) { paint(ellPts(0, 0, 16, 16, 14), { wash: '#4ED6A0', ink: PAL.ink, sw: .4 }); inkLine([[-7, 0], [-2, 6], [8, -7]], 1.4, PAL.cream, 'ink', 0); }
      else if (manual) paint(rrPts(-34, -14, 68, 28, 14), { wash: BR.violet, ink: PAL.ink, sw: .4 });
      else { paint(ellPts(0, 0, 14, 14, 14), { wash: PAL.cream, ink: PAL.ink, sw: .4 }); inkLine([[0, 0], [0, -9], [6, 0]], .6, PAL.ink, 'inkfine', 0); }
      pop();
    });
  }
  function screen(t) {
    AIMA.app(1);
    if (t < P + 1) {                                     // Free: the post stops half-way when the tokens run out
      const f = 1 - seg(t, ...T.drain), W_ = [360, 300, 380, 260], sum = 1300;
      let left = sum * .55 * seg(t, T.drain[0], T.drain[1]);
      paint(rrPts(30, 60, SW - 60, 220, 10), { wash: '#FFFFFF', ink: PAL.ink, sw: .45 });
      W_.forEach((w, j) => { const len = Math.min(w, Math.max(0, left)); left -= w; if (len > 0) squig(52, len, 96 + j * 44, TXT, .6, j); });
      boilSeed('meter'); meter(f, t > T.drain[1] ? seg(t, T.drain[1], T.drain[1] + .25) : 0);
      return;
    }
    if (t < T.away) { rows(t, T.manual, true); boilSeed('meter'); meter(.6, 0); return; }
    rows(t, T.posts.slice(0, 3), false); boilSeed('meter'); meter(1, 0);
  }
  function plane(x, y, s, rot) {
    push(); translate(x, y); rotate(rot); scale(s);
    paint([[-22, 4], [24, -14], [6, 16], [0, 6]], { wash: PAL.cream, ink: PAL.ink, sw: .6 });
    inkLine([[0, 6], [24, -14]], .5, PAL.ink, 'inkfine', 0);
    pop();
  }
  function planes(t) {                                   // each post flies out of the laptop and away
    [...T.manual, ...T.posts].forEach((s, i) => {
      const k = seg(t, s, s + 1.1); if (k <= 0 || k >= 1) return;
      boilSeed('plane' + i);
      const [x, y] = arcPt([812, 960], [1150, 420 + 60 * (i % 3)], 120, easeIn(k));
      plane(x, y, 1.3, -.4 - .3 * k);
    });
  }

  // ---------- the plans: three cards over the room (screen space) ----------
  const PLANS = [['Free', 'Miễn phí', TXT, .25], ['Plus', '199k', BR.violet, .6], ['Pro', '499k', BR.magenta, 1]];
  function cards(t) {
    const dim = bump(t, T.cards[0] - .4, T.cards[0], T.away, T.away + .3);
    if (dim <= 0) return;
    boilSeed('dim'); paint(rectPts(-60, -60, W + 120, H + 120), { wash: '#2A2540', washOp: 150 * dim, ink: null });
    PLANS.forEach(([name, price, col, tok], i) => {
      const k = backOut(seg(t, T.cards[i], T.cards[i] + .3)), off = easeIn(seg(t, T.away + i * .06, T.away + .35 + i * .06)) * -1500;
      if (k < .02) return;
      const chosen = i === 1 && t > T.choose, ck = chosen ? 1 + .06 * Math.exp(-(t - T.choose) * 6) : 1;
      const cx = 192 + i * 348, cy = 1000 + off, s = k * ck;
      boilSeed('card' + i);
      push(); translate(cx, cy); scale(s);
      paint(rrPts(-160, -400, 320, 800, 26), { wash: PAL.cream, ink: PAL.ink, sw: 1 });
      paint(rrPts(-160, -400, 320, 36, 18), { wash: i ? col : '#C9C0E0', ink: null });
      // auto-posting: a paper plane, crossed out on Free, a tick on Plus and Pro once the row lights up
      const lit = seg(t, T.auto, T.auto + .25);
      plane(-70, -40, 2.4, -.3);
      if (i === 0) { const kx = lit; if (kx > 0) for (const d of [-1, 1]) inkLine([[60 - 28 * kx, -40 - 28 * d * kx], [60 + 28 * kx, -40 + 28 * d * kx]], 2.6, '#E2476E', 'ink', 0); }
      else if (lit > 0) { paint(ellPts(60, -40, 34 * backOut(lit), 34 * backOut(lit), 16), { wash: '#4ED6A0', ink: PAL.ink, sw: .6 }); if (lit > .5) inkLine([[44, -40], [56, -26], [78, -56]], 2.6, PAL.cream, 'ink', 0); }
      // tokens: a coin and a bar that grows on the paid plans
      const f = lerp(.25, tok, ease(seg(t, T.tokens, T.tokens + .6)));
      paint(ellPts(-110, 140, 22, 22, 14), { wash: '#FFC83D', ink: PAL.ink, sw: .6 });
      paint(rrPts(-74, 126, 200, 28, 14), { wash: '#FFFFFF', ink: PAL.ink, sw: .5 });
      paint(rrPts(-72, 128, 196 * f, 24, 12), { wash: i ? col : '#9C94B0', ink: null });
      paint(rrPts(-110, 290, 220, 60, 30), { wash: i ? col : '#DCD4F0', ink: PAL.ink, sw: .6 });
      pop();
      if (chosen) { boilSeed('ring'); paint(rrPts(cx - 172 * s, cy - 412 * s, 344 * s, 824 * s, 32), { ink: BR.magenta, sw: 2 }); }
      // lettering (composited after the frame; it follows the card)
      if (off > -1400) {
        letter(name, cx, cy - 300 * s, fit(name, 84, 260) * s, i ? col : TXT, { screen: true, pop: seg(t, T.cards[i] + .1, T.cards[i] + .4), font: font(84 * s) });
        letter(price, cx, cy - 215 * s, 54 * s, TXT, { screen: true, pop: seg(t, T.cards[i] + .2, T.cards[i] + .5), font: font(54 * s) });
      }
    });
  }

  // ---------- the shots ----------
  function story(t, lt, dur) {
    const face = AIMA.room(t, { h: skyH(t), cam: camAt(t), pose: creatorPose(t), screen, screenOn: true, mugs: t < P ? 1 : t < T.away ? 3 : 1, steam: t > T.wake, hf, strikeT: T.manual[0] - .5, after: planes });
    cards(t);
    AIMA.caption(t, .6, 4.6, 'Dùng Free rồi,', BR.violet, 66, 1400);
    AIMA.caption(t, .95, 4.6, 'vậy nâng cấp để làm gì?', BR.magenta, 66, 1500);
    AIMA.caption(t, T.auto, T.tokens - .1, 'Tự động đăng bài', BR.violet, 60, 1560, '#4ED6A0');
    AIMA.caption(t, T.tokens, T.away, 'Hạn mức token cao hơn', BR.violet, 60, 1560, '#FFC83D');
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Chọn gói phù hợp', 'và nâng cấp AIMA'], feel: 'happy', logoH: 260 });

  shots([[0, story], [V_OUTRO, ending]]);
})();
