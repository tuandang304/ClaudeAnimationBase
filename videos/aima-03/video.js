// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, shared by scene.js and audio/make_audio.py so picture and sound land together. This
// video was laid out on the video's own clock, so story.at is a straight line (event time = video time); add knots
// there to slow a stretch down without retiming the keys (warp() in src/core.js). Retime here, then rebuild the soundtrack.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  story: knots([[0, 0], [34.4, 34.4]]),
  outroLen: 5.0,                             // the question to the viewer and the logo
  swipes: [1.1, 1.9, 2.6],                   // the feed moves on; the third lands on the viral video
  hot: 2.9,                                  // it's hot: the flame lights, hearts fly
  notice: 3.3,                               // the creator notices ("Ơ! Trend này đang viral nè!")
  go: 6.4,                                   // "Bắt trend liền thôi!" (a fist up)
  // three thought bubbles: [opens, pops]. In each, the brand's candle tries the trend
  bubbles: [[8.3, 12.9], [13.3, 18.0], [20.0, 24.2]],
  tip: 10.6,                                 // 1: the dancing candle tips over and goes out
  neon: 14.2, stamp: 15.6,                  // 2: neon paint over the brand colours; an X
  fans: [20.5, 20.7, 20.9, 21.1], qs: 22.6,  // 3: the customers pop up; each gets a "?"
  clockPush: 18.2,                           // the camera rushes to the clock: the afternoon goes by (back at +1.35)
  back: 24.5,                                // back to the laptop
  late: [24.9, 25.4, 25.8, 26.15],           // swipes: everyone's doing the same dance now
  grid: 26.5,                                // the copies fill the screen, the flame dies
  turn: 29.6,                                // the creator turns to us
  crash: 30.1,                               // crash zoom on the face
  punch: [30.25, 31.9],                      // "Thấy trend thì dễ…" ... "Biến thành content mới khó!"
};
const PROJECT = {
  title: 'AIMA #3 (TikTok, Problem): "Trend này đang viral… nhưng brand mình làm gì với nó?"',
  context: 'aima',
  size: [1080, 1920],
  duration: TIMING.story.end + TIMING.outroLen,
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
