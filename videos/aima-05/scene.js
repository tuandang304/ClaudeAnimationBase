// scene.js: AIMA #5, TikTok Solution: "POV: Làm 1 content nhưng mở 7 cái app." (context/aima/campaign.md, TikTok 5;
// storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING in video.js). Vertical.
// The same creator, the same room (the series set, ../_aima). Seven apps jump out of the laptop one by one (trend,
// caption, design, video, posting, numbers…) and the creator juggles them, faster and faster, until they all come
// down on their head. Flattened on the desk: "Ước gì… có một đứa ngồi kế bên.", and in a thought bubble someone sits
// down beside them and takes the apps. Then the apps fly into the laptop and AIMA opens: Trend → Idea → Create →
// Optimize → Schedule in one place, and the creator still approves. The first video that names AIMA; the outro is
// the call to action (landing page) instead of a question.
(() => {
  const { BR, CREATOR, TXT, CX, GY, U, SW, SH, APP_TOP, bump, K, squig, SCR_BG } = AIMA;
  const T = TIMING;
  const STW = warp(T.story.rates, T.story.end), V_OUTRO = STW.len;
  const LAND = T.drop + .35;

  // ---------- time of day: a morning that goes nowhere, then the afternoon light when AIMA opens ----------
  const HOURS = [[0, 9], [T.drop, 11], [T.merge, 13.5], [T.story.end, 14.5]];
  const hoursAt = t => kf(t, HOURS);

  // ---------- camera ----------
  const SCRC = [812, 972], THINKV = z => [450, 820, z];
  const CAMK = [
    [0, [545, 920, 1.1]], [3.0, [545, 900, 1.1]], [3.6, [470, 860, 1.12]], [T.drop, [470, 870, 1.14]],      // the juggle
    [LAND + .5, [440, 990, 1.36]], [T.wish[0] - .3, [440, 990, 1.4]], [T.wish[0] + .5, THINKV(1.15)],          // flattened; the wish
    [T.wish[1], THINKV(1.17)], [T.merge + .4, [640, 950, 1.3]], [T.open + .5, [790, 965, 1.72]],                  // into the laptop
    [24.0, [790, 965, 1.78]], [24.6, [660, 945, 1.38]], [T.story.end, [650, 945, 1.42]],                           // and back to the face
  ];
  function camAt(t) {
    const [cx, cy, z] = kf(t, CAMK), sh = t > LAND && t < LAND + .8 ? shakeXY(t, 14 * Math.exp(-(t - LAND) * 5)) : [0, 0];
    return [cx + 6 * wob(t, .07) + sh[0], cy + 4 * wob(t, .05, .3) + sh[1], z];
  }

  // ---------- the creator ----------
  const KEYS = [K(0, 'determined'), K(T.tiles[0] + .1, 'happy'), K(T.tiles[3], 'nervous', { emote: 'sweat' }), K(T.tiles[6], 'scared'),
    K(LAND, 'ko'), K(12.1, 'sad'), K(T.wish[0] + .1, 'hopeful', { lookX: .5, lookY: -.9 }), K(T.wish[1] + .2, 'sad'),
    K(T.merge + .55, 'surprised'), K(T.open + .5, 'starstruck'), K(24.2, 'proud'), K(T.ok, 'happy')];
  const TURNS = [[T.merge + .5, T.merge + .67, 0, .125], [24.4, 24.57, .125, 0]];
  const phaseAt = t => kf(t, [[T.tiles[0], 0], [7, 7], [T.drop, 26]], x => x);    // the juggle speeds up
  function creatorPose(t) {
    const p = emotions(t, KEYS);
    let tv = { ...spinView(0), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const j = bump(t, T.tiles[0], T.tiles[0] + .25, T.drop, T.drop + .1), ph = phaseAt(t);
    p.aL = lerp(p.aL ?? .2, .9 + .55 * Math.sin(ph * 2), j);                                // juggling: the arms
    p.aR = lerp(p.aR ?? .2, .9 + .55 * Math.sin(ph * 2 + 2.6), j);                          // take turns, never in step
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); };
    R(-.8, bump(t, T.open + .3, T.open + .5, 24.3, 24.5));                                 // a hand on the trackpad
    R(-1.05, bump(t, T.ok - .25, T.ok - .1, T.ok + .05, T.ok + .2));                       // ...approve
    p.lookY = lerp(p.lookY || 0, -1, bump(t, T.tiles[0], T.tiles[0] + .2, T.drop + .1, T.drop + .3));   // eyes on the apps
    return p;
  }

  // ---------- the apps: seven tiles, one glyph each (feed, chat, notes, design, video, post, numbers) ----------
  const TILE_COL = ['#2A2540', BR.cyan, '#F3D36B', BR.magenta, BR.violet, BR.blue, '#3FBF8F'];
  function tile(x, y, s, i, rot = 0) {
    push(); translate(x, y); rotate(rot); scale(s);
    paint(rrPts(-35, -35, 70, 70, 16), { wash: TILE_COL[i], ink: PAL.ink, sw: .8 });
    const c = PAL.cream;
    switch (i) {
      case 0: paint([[-10, -16], [-10, 16], [16, 0]], { wash: c, ink: null }); break;                                       // a play button
      case 1: paint(rrPts(-20, -16, 40, 26, 10), { wash: c, ink: null }); paint([[-8, 8], [-14, 20], [2, 9]], { wash: c, ink: null }); break;   // a chat bubble
      case 2: for (let k = 0; k < 3; k++) inkLine([[-18, -12 + k * 12], [18 - k * 8, -12 + k * 12]], 1.4, '#7A5F12', 'ink', 0); break;        // lines of text
      case 3: paint(ellPts(-6, -4, 14, 14, 14), { wash: c, ink: null }); paint(rectPts(2, 2, 18, 16), { wash: '#FFC83D', ink: null }); break;  // shapes
      case 4: paint(rectPts(-20, -14, 40, 28), { wash: c, ink: null }); for (let k = 0; k < 4; k++) paint(rectPts(-17 + k * 10, -12, 5, 5), { wash: BR.violet, ink: null }); break;  // film
      case 5: paint([[-20, 2], [20, -16], [4, 18], [0, 6]], { wash: c, ink: null }); break;                                  // a paper plane
      case 6: for (let k = 0; k < 4; k++) paint(rectPts(-18 + k * 10, 14 - (8 + k * 7), 7, 8 + k * 7), { wash: c, ink: null }); break;     // bars
    }
    pop();
  }
  const ORBIT = [360, 770, 215, 105];
  const LANDS = [[232, 1084], [306, 1090], [380, 1086], [454, 1090], [528, 1084], [600, 1088], [415, 1024]];   // in a heap on the desk
  function tilesAt(t) {                                  // [x, y, spin] for each tile out of the laptop, or null
    const ph = phaseAt(t);
    return T.tiles.map((t0, i) => {
      if (t < t0) return null;
      const a = ph + i * TAU / 7, orbit = [ORBIT[0] + Math.cos(a) * ORBIT[2], ORBIT[1] + Math.sin(a) * ORBIT[3]];
      if (t < t0 + .45) { const k = easeOut(seg(t, t0, t0 + .45)); return [...arcPt(SCRC, orbit, 220, k), k * 5]; }   // out of the laptop
      if (t < T.drop) return [...orbit, Math.sin(a * 2) * .3];
      const d0 = T.drop + i * .04, aD = phaseAt(T.drop) + i * TAU / 7, from = [ORBIT[0] + Math.cos(aD) * ORBIT[2], ORBIT[1] + Math.sin(aD) * ORBIT[3]];
      if (t < T.merge + i * .08) {                       // they all come down
        const k = easeIn(seg(t, d0, d0 + .35)), [x, y] = arcPt(from, LANDS[i], 60, k);
        return [x, y, lerp(Math.sin(aD * 2) * .3, (hash(i + 3) - .5) * .7, k) + .15 * spring(t, d0 + .35, 5, 30)];
      }
      const k = easeIn(seg(t, T.merge + i * .08, T.merge + i * .08 + .5));            // and into the laptop
      if (k >= 1) return null;
      return [...arcPt(LANDS[i], SCRC, 160, k), (hash(i + 3) - .5) * .7 + k * 4, 1 - .7 * k];
    });
  }
  function apps(t) {
    tilesAt(t).forEach((p, i) => { if (!p) return; boilSeed('tile' + i); tile(p[0], p[1], 1.25 * (p[3] ?? 1), i, p[2]); });
    if (t > LAND && t < LAND + .6) for (let i = 0; i < 6; i++) {        // the crash: impact lines
      boilSeed('hit' + i);
      const a = -Math.PI / 2 + (i - 2.5) * .35, k = seg(t, LAND, LAND + .6), d0 = 170 + 60 * k;
      inkLine([[CX + Math.cos(a) * d0, 1060 + Math.sin(a) * d0], [CX + Math.cos(a) * (d0 + 50 * (1 - k)), 1060 + Math.sin(a) * (d0 + 50 * (1 - k))]], 1, PAL.ink, 'ink', 0);
    }
  }

  // ---------- the wish: a thought bubble, someone sits down beside the creator and takes the apps ----------
  const BX = 430, BY = 620, BRX = 240, BRY = 165;
  function bubble(t) {
    const [t0, t1] = T.wish;
    if (t < t0 || t > t1 + .3) return;
    const kin = backOut(seg(t, t0, t0 + .35)), kout = seg(t, t1, t1 + .14), k = kin * (1 + .12 * kout);
    boilSeed('dots');
    [[500, 872, 9, 0], [474, 830, 14, .08]].forEach(([x, y, r, d]) => { const kd = backOut(seg(t, t0 - .1 + d, t0 + .1 + d)) * (1 - kout); if (kd > .02) paint(ellPts(x, y, r * kd, r * kd, 12), { wash: PAL.cream, ink: PAL.ink, sw: .7 }); });
    if (kout < 1) {
      boilSeed('bubble');
      const P = [];
      for (let i = 0; i < 48; i++) { const a = i / 48 * TAU, r = 1 + .07 * Math.abs(Math.sin(a * 4.5)); P.push([BX + Math.cos(a) * BRX * r * k, BY + Math.sin(a) * BRY * r * k]); }
      paint(P, { wash: PAL.cream, washOp: 255 * (1 - kout), ink: kout > .3 ? null : PAL.ink, sw: .9, curv: .4 });
      if (kin > .6 && kout === 0) { push(); translate(BX, BY); scale(k); dream(t); pop(); }
    }
    if (kout > 0) for (let i = 0; i < 8; i++) {
      boilSeed('burst' + i);
      const a = i / 8 * TAU + .2, d0 = 1.05 + .3 * kout, d1 = d0 + .25 * (1 - seg(t, t1 + .1, t1 + .3));
      inkLine([[BX + Math.cos(a) * BRX * d0, BY + Math.sin(a) * BRY * d0], [BX + Math.cos(a) * BRX * d1, BY + Math.sin(a) * BRY * d1]], .9, PAL.ink, 'ink', 0);
    }
  }
  function dream(t) {
    inkLine([[-190, 112], [190, 114]], .7, '#B9AFCB', 'inkfine', 0);
    const relief = t > T.buddy + 1.2;
    AIMA.creator(-85, 112, 15, { ...feel(relief ? 'relieved' : 'sad', t), ...CREATOR, lookX: .8, noShadow: true }, 'mini');
    const kb = backOut(seg(t, T.buddy, T.buddy + .3));                  // someone sits down beside them...
    if (kb > .02) {
      const take = seg(t, T.buddy + .7, T.buddy + 1.0);
      clawd(95, 112 - 30 * (1 - kb), 13 * kb, { ...feel('happy', t), col: '#7FD9EA', dk: '#3AA9BE', lt: '#C9F3FA', lookX: -.8, aL: lerp(.2, 1.3, take), noLegs: true, noShadow: true, boilKey: 'buddy' });
      for (let i = 0; i < 4; i++) {                      // ...and takes the apps: a neat stack in its arm
        const k = seg(t, T.buddy + .6 + i * .12, T.buddy + .9 + i * .12); if (k <= 0) continue;
        boilSeed('stack' + i);
        const [x, y] = arcPt([-85 + i * 8, -60], [150, 20 - i * 22], 50, ease(k));
        tile(x, y, .42, [1, 2, 3, 5][i], (1 - k) * .8);
      }
    }
  }

  // ---------- the laptop: a desktop the apps jump out of, then AIMA ----------
  function stepIcon(i, x, y, r) {
    switch (i) {
      case 0: paint([[0, -1.3], [.55, -.45], [.75, .3], [.45, .85], [0, 1], [-.45, .85], [-.75, .3], [-.4, -.3]].map(([a, b]) => [x + a * r * .6, y + b * r * .6]), { wash: '#FF8A3D', ink: PAL.ink, sw: .4, curv: .5 }); break;
      case 1: paint(ellPts(x, y - r * .15, r * .45, r * .45, 14), { wash: '#FFE27A', ink: PAL.ink, sw: .4 }); paint(rectPts(x - r * .2, y + r * .3, r * .4, r * .25), { wash: '#B9AFCB', ink: null }); break;
      case 2: paint(ribbon([[x - r * .45, y + r * .45], [x + r * .45, y - r * .45]], r * .22, r * .1), { wash: BR.violet, ink: PAL.ink, sw: .4 }); break;
      case 3: [[-1, -1, BR.blue], [1, -1, BR.magenta], [-1, 1, '#3FBF8F'], [1, 1, BR.cyan]].forEach(([a, b, c]) => paint(rectPts(x + a * r * .26 - r * .2, y + b * r * .26 - r * .2, r * .4, r * .4), { wash: c, ink: null })); break;
      case 4: paint(rectPts(x - r * .5, y - r * .4, r, r * .85), { wash: PAL.cream, ink: PAL.ink, sw: .4 }); paint(rectPts(x - r * .5, y - r * .4, r, r * .22), { wash: BR.magenta, ink: null }); break;
    }
  }
  function screen(t) {
    if (t < T.open) {                                    // the desktop: a dock with seven icons, each leaves its slot
      SCR_BG('#3A3466');
      paint(rrPts(50, 240, 420, 46, 14), { wash: '#4E4880', ink: null });
      T.tiles.forEach((t0, i) => {
        boilSeed('dock' + i);
        if (t < t0) tile(85 + i * 58, 263, .5, i);
        else paint(rrPts(85 + i * 58 - 16, 247, 32, 32, 8), { ink: '#8C84A0', sw: .4 });
      });
      if (t > T.merge) { const k = seg(t, T.merge + .2, T.open); glow(SW / 2, SH / 2, 300 * k, '#AFC2FF', k); }
      return;
    }
    const k = backOut(seg(t, T.open, T.open + .3));
    AIMA.app(k);
    if (k < 1) return;
    T.steps.forEach((s, i) => {                          // the workflow, step by step
      const ks = backOut(seg(t, s, s + .25)); if (ks < .02) return;
      boilSeed('step' + i);
      const x = 62 + i * 99, y = 150;
      if (i > 0) inkLine([[x - 64, y], [x - 38, y]], .8 * ks, '#8C84A0', 'ink', 0);
      push(); translate(x, y); scale(ks);
      paint(ellPts(0, 0, 34, 34, 18), { wash: PAL.cream, ink: PAL.ink, sw: .6 });
      stepIcon(i, 0, 0, 40);
      pop();
      squig(x - 26, 52, y + 56, '#8C84A0', .4, i);
    });
    if (t > T.ok - .1) {                                 // approved by the creator
      boilSeed('ok');
      const ko = backOut(seg(t, T.ok, T.ok + .25));
      paint(rrPts(170, 236, 180 * ko + 1, 42, 18), { wash: '#4ED6A0', ink: PAL.ink, sw: .5 });
      if (ko > .5) inkLine([[245, 256], [256, 268], [276, 246]], 2, PAL.cream, 'ink', 0);
    }
  }

  // ---------- the shots ----------
  function story(t, lt, dur) {
    const face = AIMA.room(t, { h: hoursAt(t), cam: camAt(t), pose: creatorPose(t), screen, screenOn: true, mugs: t < T.drop ? 1 : 2, steam: t > T.merge, hf: hoursAt,
      after: et => { apps(et); bubble(et); } });
    AIMA.caption(t, .6, 3.9, 'POV: Làm 1 content', BR.violet, 66, 1400);
    AIMA.caption(t, .95, 3.9, 'nhưng mở 7 cái app', BR.magenta, 66, 1500);
    AIMA.caption(t, T.open + .4, T.story.end - .2, 'AIMA · AI Content Co-pilot', BR.violet, 60, 1460, BR.magenta);
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Truy cập landing page AIMA', 'để tìm hiểu thêm'], feel: 'happy', logoH: 260 });

  shots([[0, story], [V_OUTRO, ending]]);
})();
