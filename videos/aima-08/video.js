// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, shared by scene.js and audio/make_audio.py so picture and sound land together. Laid out
// on the video's own clock, so story.at is a straight line (event time = video time); add knots there to slow a
// stretch down without retiming the keys (warp() in src/core.js). Retime here, then rebuild the soundtrack.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  // slowed between the plan cards and auto-posting so the prices are read in full
  story: knots([[0, 0], [11.6, 11.6], [15.8, 17.0], [27.0, 28.2]]),
  outroLen: 5.2,                             // the call to action and the logo
  drain: [.8, 3.2],                          // Free: the token meter runs dry while AIMA writes; it stops half-way
  clockPush: 5.0,                            // the camera rushes to the clock: 23:00 (back at +1.35)
  manual: [8.6, 9.2, 9.8],                   // at the posting hour the creator, half asleep, posts each one by hand
  cards: [11.0, 11.3, 11.6],                 // Free · Plus 199k · Pro 499k
  auto: 15.8,                                // the auto-posting row lights up on Plus and Pro
  tokens: 17.4,                              // the token bars grow
  choose: 19.4,                              // the creator upgrades
  away: 20.0,                                // the cards fly off: night again
  posts: [21.4, 22.4, 23.4],                 // asleep at the desk, the posts go out by themselves
  wake: 24.6,                                // morning: everything's posted
  turn: 25.5,                                // the creator turns to us
};
const PROJECT = {
  title: 'AIMA #8 (TikTok, Conversion): "Dùng Free rồi, vậy nâng cấp để làm gì?"',
  context: 'aima',
  size: [1080, 1920],
  duration: (() => {
    const { rates, end } = TIMING.story;
    return rates.reduce((d, [e, r], i) => d + ((rates[i + 1] || [end])[0] - e) / r, 0) + TIMING.outroLen;
  })(),
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
