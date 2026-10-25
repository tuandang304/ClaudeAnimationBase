// scene.js: AIMA #4, TikTok Problem: "POV: Mở 7 tab để làm 1 cái content" (context/aima/campaign.md, TikTok 4, the
// "7 tab" topic; storyboard in STORYBOARD.md; the soundtrack is built by audio/make_audio.py from TIMING in video.js).
// Vertical. The same creator, the same room (the series set, ../_aima). "Làm một cái content thôi. Bắt đầu!": a tab
// for the trend, one for the idea, the caption, the design, the video, the schedule, the numbers: seven tabs, each
// named as it opens. Then "Ơ… cái caption nãy để tab nào ta?": the creator flips through the tabs faster and faster,
// more keep opening, the laptop hangs and steams. The camera pulls back on the sunset and crash-zooms on the dizzy
// face: "Chuyển tab… còn nhiều hơn làm content!". Then the series' outro: a question to the viewer and the small
// logo. A Problem post: no product pitch.
(() => {
  const { BR, TXT, SW, SH, bump, K, squig, SCR_BG } = AIMA;
  const T = TIMING;
  const STW = warp(T.story.rates, T.story.end), V_OUTRO = STW.len;
  const [F0, F1] = T.frenzy;

  // ---------- the tabs: seven tools, then the frenzy (switching faster and faster) and more tabs ----------
  const APPS = ['#1F1B2E', BR.cyan, '#F3D36B', BR.magenta, BR.violet, BR.blue, '#3FBF8F'];   // each tool's colour
  const SWITCH = (() => { const s = []; let t = F0, d = .38; while (t < F1) { s.push(t); t += d; d = Math.max(.08, d * .84); } return s; })();
  const EXTRA = Array.from({ length: 9 }, (_, k) => F0 + 1.0 + k * .21);                         // more tabs keep opening
  const tabCount = t => T.tabs.filter(s => t >= s).length + EXTRA.filter(s => t >= s).length;
  function activeAt(t) {                                 // [which tab is showing, when it was switched to]
    let a = -1, at = -1;
    T.tabs.forEach((s, i) => { if (t >= s) { a = i; at = s; } });
    SWITCH.forEach((s, i) => { if (t >= s) { const n = tabCount(s); let k = Math.floor(hash(i * 7.3 + 1) * n); if (k === a) k = (k + 1) % n; a = k; at = s; } });
    return [a, at];
  }
  const clicks = [...T.tabs, ...SWITCH, ...EXTRA].sort((a, b) => a - b);

  // ---------- time of day: morning while the tabs open; the pull-back finds the sunset ----------
  const HOURS = [[0, 9], [T.lost, 10.8], [T.pullOut, 11.4], [T.pullOut + .8, 17.6], [T.story.end, 17.9]];
  const hoursAt = t => kf(t, HOURS);

  // ---------- camera ----------
  const MIDV = z => [650, 940, z];
  const CAMK = [
    [0, [545, 920, 1.1]], [2.8, [560, 915, 1.14]], [3.6, MIDV(1.36)], [T.lost, [690, 950, 1.48]],           // tab after tab, easing in
    [F0, [700, 955, 1.52]], [T.hang, [800, 968, 1.95]], [T.pullOut, [800, 968, 1.98]],                         // the frenzy: right into the screen
    [T.pullOut + .8, [540, 900, 1.06]], [T.crash - .17, [540, 895, 1.08]], [T.crash, [385, 1060, 1.8]], [T.story.end, [385, 1060, 1.86]],
  ];
  function camAt(t) {
    const [cx, cy, z] = kf(t, CAMK), fr = bump(t, F0 + 1, F1 - .5, T.hang, T.pullOut);
    const sh = t > T.crash ? shakeXY(t, 12 * Math.exp(-(t - T.crash) * 6)) : fr > 0 ? shakeXY(t, 5 * fr) : [0, 0];
    return [cx + 6 * wob(t, .07) + sh[0], cy + 4 * wob(t, .05, .3) + sh[1], z];
  }

  // ---------- the creator ----------
  const KEYS = [K(0, 'determined'), K(T.tabs[0] - .1, 'happy'), K(T.tabs[3] - .1, 'neutral'), K(T.tabs[5] - .1, 'nervous'),
    K(T.lost, 'confused'), K(F0, 'nervous', { emote: 'sweat' }), K(T.hang - .2, 'dizzy'), K(T.crash, 'sad')];
  const TURNS = [[T.turnIn, T.turnIn + .17, 0, .125], [T.pullOut + .85, T.pullOut + 1.02, .125, 0]];   // to the laptop, back to us
  function creatorPose(t) {
    const p = emotions(t, KEYS);
    let tv = { ...spinView(0), smear: 0 };
    for (const [a, b, h0, h1] of TURNS) if (t >= a) tv = turn(t, a, b, h0, h1);
    Object.assign(p, tv);
    const R = (a, w) => { p.aR = lerp(p.aR ?? .2, a, w); };
    const look = (x, y, w) => { p.lookX = lerp(p.lookX || 0, x, w); p.lookY = lerp(p.lookY || 0, y, w); };
    R(-.8, bump(t, T.turnIn + .2, T.turnIn + .4, T.hang, T.hang + .3));                                  // a hand on the trackpad...
    for (const c of clicks) { const d = Math.min(.1, c >= F0 ? .05 : .1); R(-1.05, bump(t, c - d, c - d / 3, c + d / 3, c + d)); }   // ...click
    const dart = bump(t, T.lost + .1, T.lost + .3, T.hang, T.hang + .2);
    look(.75 + .2 * Math.sin(t * 13) * dart, .2 + .15 * Math.sin(t * 9) * dart, bump(t, T.turnIn + .1, T.turnIn + .3, T.pullOut + .7, T.pullOut + .9));
    return p;
  }

  // ---------- the browser: a tab strip on top, the active tool below ----------
  const TOP = 46;
  function tabStrip(t, active) {
    paint(rectPts(0, 0, SW, TOP), { wash: '#DCD4F0', ink: null });
    const n = tabCount(t), w = Math.min(70, (SW - 40) / Math.max(1, n));
    for (let i = 0; i < n; i++) {
      const born = i < 7 ? T.tabs[i] : EXTRA[i - 7], k = backOut(seg(t, born, born + .18));
      boilSeed('tab' + i);
      const x = 8 + i * w, on = i === active;
      push(); translate(x + w / 2, TOP); scale(k); translate(-w / 2, -TOP);
      paint(rrPts(1, on ? 5 : 9, w - 3, on ? 44 : 35, 7), { wash: on ? '#FBF8FF' : '#C3B9DF', ink: on ? PAL.ink : null, sw: .4 });
      const r = Math.min(10, w / 2 - 4);
      paint(ellPts(w > 44 ? 17 : w / 2, 27, r, r, 12), { wash: APPS[i % 7], ink: PAL.ink, sw: .3 });
      if (w > 50) squig(32, w - 42, 27, on ? TXT : '#8C84A0', .35, i);
      pop();
    }
    if (n < 16) paint(ellPts(8 + n * w + 14, 27, 7, 7, 8), { ink: '#8C84A0', sw: .4 });   // the "+"
  }
  // the seven tools (they draw below the tab strip)
  function app(i, t, a) {                                // a: seconds since this tab showed
    boilSeed('app' + i);
    switch (i % 7) {
      case 0: {                                          // the trend feed: a dancing video, hearts
        paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#16131F', ink: null });
        paint(rectPts(190, TOP + 8, 140, SH - TOP - 16), { wash: '#F59AD9', ink: null });
        const by = 200 - 10 * pulse(t, 6), up = Math.sin(t * TAU * 2);
        paint(ellPts(260, by - 46, 13, 13, 12), { wash: '#FFE3C8', ink: PAL.ink, sw: .4 });
        paint(ellPts(260, by, 20, 27, 14), { wash: BR.blue, ink: PAL.ink, sw: .4 });
        inkLine([[244, by - 10], [224, by - 10 - 26 * up]], .7, PAL.ink, 'ink', 0); inkLine([[276, by - 10], [296, by - 10 + 26 * up]], .7, PAL.ink, 'ink', 0);
        paint(heartPts(360, 150, 11), { wash: '#E2476E', ink: null });
        break;
      }
      case 1: {                                          // the idea chat: bubbles back and forth, a bulb
        paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#EEF9FB', ink: null });
        [[0, 60, 300, 1], [1, 108, 240, 0], [2, 156, 330, 1], [3, 204, 200, 0]].forEach(([j, y, w, me]) => {
          if (a < j * .25) return;
          const x = me ? SW - 30 - w : 30;
          paint(rrPts(x, y, w, 36, 14), { wash: me ? BR.cyan : '#FFFFFF', ink: PAL.ink, sw: .35 });
          squig(x + 14, w - 28, y + 18, me ? '#1E4E58' : TXT, .4, j);
        });
        emote('bulb', 470, 262, 9, seg(a, .3, .5), a);
        break;
      }
      case 2: {                                          // the caption: a notes page, lines being typed
        paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#FFF7CF', ink: null });
        for (let j = 0; j < 5; j++) inkLine([[16, 84 + j * 42], [SW - 16, 84 + j * 42]], .3, '#E5D49A', 'inkfine', 0);
        const W_ = [380, 300, 330], sum = 1010; let left = sum * clamp(a / 1.2);
        W_.forEach((w, j) => { const len = Math.min(w, Math.max(0, left)); left -= w; if (len > 0) squig(40, len, 70 + j * 42, TXT, .6, j); });
        break;
      }
      case 3: {                                          // the design tool: an artboard, a palette
        paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#3A3450', ink: null });
        [BR.magenta, BR.cyan, '#FFC83D', BR.violet].forEach((c, j) => paint(ellPts(28, 70 + j * 46, 13, 13, 12), { wash: c, ink: PAL.cream, sw: .35 }));
        paint(rectPts(120, TOP + 20, 280, SH - TOP - 40), { wash: '#FBF8FF', ink: null });
        const k = backOut(seg(a, .1, .4));
        paint(ellPts(220, 140, 44 * k + 1, 44 * k + 1, 18), { wash: BR.magenta, ink: null });
        paint(rectPts(250, 170, 110 * k + 1, 60), { wash: '#FFC83D', ink: null });
        break;
      }
      case 4: {                                          // the video editor: a preview, clips on a timeline
        paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#2B2742', ink: null });
        paint(rrPts(170, TOP + 10, 180, 110, 6), { wash: '#1E1B30', ink: null });
        paint([[248, 70], [248, 110], [282, 90]], { wash: PAL.cream, ink: null });
        [[0, 20, 150, BR.cyan], [0, 178, 170, BR.violet], [1, 60, 200, BR.magenta], [2, 20, 260, BR.blue]].forEach(([tr, x, w, c], j) => {
          if (a < j * .12) return;
          paint(rrPts(x, 180 + tr * 38, w, 28, 6), { wash: c, ink: PAL.ink, sw: .4 });
        });
        break;
      }
      case 5: {                                          // the scheduler: a calendar, a few days filled
        paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#F2F6FF', ink: null });
        paint(rectPts(0, TOP, SW, 24), { wash: BR.blue, ink: null });
        for (let r = 0; r < 4; r++) for (let c = 0; c < 7; c++) {
          const x = 20 + c * 70, y = 78 + r * 54, on = hash(r * 7 + c + 2) > .62 && a > (r * 7 + c) * .02;
          paint(rrPts(x, y, 62, 48, 5), { wash: on ? mixCol(BR.blue, PAL.cream, .45) : '#FFFFFF', ink: '#B9C4F7', sw: .3 });
        }
        break;
      }
      case 6: {                                          // the numbers: bars and a line
        paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#FFFFFF', ink: null });
        inkLine([[40, 60], [40, 270], [490, 270]], .5, '#8C84A0', 'inkfine', 0);
        const g = ease(clamp(a / .6));
        for (let b = 0; b < 8; b++) { const h = (40 + 140 * hash(b + 11)) * g; paint(rectPts(60 + b * 54, 268 - h, 34, h), { wash: b % 2 ? '#3FBF8F' : '#A9E3C9', ink: null }); }
        const P = []; for (let b = 0; b < 8; b++) P.push([77 + b * 54, 230 - (60 + 120 * hash(b + 31)) * g]);
        inkLine(P, 1, BR.magenta, 'ink', .3);
        break;
      }
    }
  }
  function newTab(t) {                                   // a blank tab: a search pill
    paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#FBF8FF', ink: null });
    paint(rrPts(110, 140, 300, 40, 18), { wash: PAL.cream, ink: PAL.ink, sw: .5 });
    paint(ellPts(136, 160, 9, 9, 12), { ink: PAL.ink, sw: .45 });
    if (frac(t * 2) < .5) paint(rectPts(156, 148, 3, 24), { wash: PAL.ink, ink: null });
  }
  function screen(t) {
    const [a, at] = activeAt(t), fr = t >= F0;
    boilSeed('page');
    if (a < 0) newTab(t); else app(a, t, fr ? 9 : t - at);    // in the frenzy every page shows finished: there's no time to look
    if (t - at < .1 && a >= 0) paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#FFFFFF', washOp: 180 * (1 - (t - at) / .1), ink: null });
    boilSeed('strip');
    tabStrip(t, a);
    if (t > T.hang) {                                    // it hangs: dimmed, a spinner
      const k = seg(t, T.hang, T.hang + .25);
      paint(rectPts(0, TOP, SW, SH - TOP), { wash: '#2A2540', washOp: 200 * k, ink: null });
      boilSeed('spin');
      for (let i = 0; i < 8; i++) {
        const ang = i / 8 * TAU + t * 7;
        paint(ellPts(SW / 2 + Math.cos(ang) * 50, 172 + Math.sin(ang) * 50, 13, 13, 12), { wash: [BR.cyan, BR.blue, BR.violet, BR.magenta][i % 4], washOp: 255 * k * (.3 + .7 * i / 8), ink: null });
      }
    }
  }
  // the laptop overheats: steam over the lid
  function steam(t) {
    const k = seg(t, T.hang - .3, T.hang + .2); if (k <= 0) return;
    for (let s = 0; s < 4; s++) {
      boilSeed('steam' + s);
      const ph = t * 1.3 + s * .27, P = [];
      for (let j = 0; j < 6; j++) P.push([680 + s * 80 + 10 * Math.sin(ph * 5 + j * 1.2), 800 - j * 18 - frac(ph) * 24]);
      inkLine(P, 1.2 * k, '#B8AFC4', 'ink', .6);
    }
  }

  // ---------- the shots ----------
  function story(t, lt, dur) {
    const face = AIMA.room(t, { h: hoursAt(t), cam: camAt(t), pose: creatorPose(t), screen, screenOn: true, mugs: t < T.tabs[4] ? 1 : 2, steam: true, hf: hoursAt, after: steam });
    AIMA.caption(t, .6, 3.9, 'POV: Mở 7 tab', BR.violet, 66, 1400);                       // the hook: the post's title, two lines
    AIMA.caption(t, .95, 3.9, 'để làm 1 cái content', BR.magenta, 66, 1500);
    AIMA.shout(t, T.punch[0], 'Chuyển tab…', BR.violet, 'còn nhiều hơn làm content!', BR.magenta, { y: 300, gap: T.punch[1] - T.punch[0], s1: 150 });
    if (lt < .8) iris(...face, lerp(0, 2100, ease(lt / .8)));
    if (lt > dur - .3) { flushLetters(); brushWipe((lt - (dur - .3)) / .6, [BR.violet, BR.magenta]); }
  }
  const ending = (t, lt, dur) => AIMA.outro(t, lt, dur, { q: ['Bạn đang mở', 'bao nhiêu tab vậy?'], feel: 'shy' });

  shots([[0, story], [V_OUTRO, ending]]);
})();
