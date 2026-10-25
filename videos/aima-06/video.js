// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, shared by scene.js and audio/make_audio.py so picture and sound land together. Laid out
// on the video's own clock, so story.at is a straight line (event time = video time); add knots there to slow a
// stretch down without retiming the keys (warp() in src/core.js). Retime here, then rebuild the soundtrack.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  story: knots([[0, 0], [22.8, 22.8]]),
  outroLen: 5.2,                             // the call to action and the logo
  drag: [4.3, 5.2],                          // the trend (the dance from #3) is dragged into AIMA, which opens at 4.6
  open: 4.6,
  brand: 5.4,                                // the brand profile slides in (the candle, its colours, its customers)
  scan: [5.8, 7.0],                          // AIMA reads the trend...
  fit: [6.9, 7.8],                           // ...and how well it fits the brand
  ideas: [8.6, 8.8, 9.0],                    // three ideas
  pick: 10.3,                                // the creator picks one
  doc: 11.0,                                 // it becomes content: script, caption, hashtags, CTA
  hashtags: 13.0, cta: 13.4,
  edit: [14.4, 15.0],                        // the creator rewrites a line (they decide)
  platforms: [15.8, 16.0, 16.2, 16.4],       // one version per platform: TikTok, Instagram, Facebook, Threads
  payoff: 18.6,                              // the camera dives into the TikTok one: the candle does the dance, and stays lit
  turn: 19.3,                                // the creator turns to us
};
const PROJECT = {
  title: 'AIMA #6 (TikTok, Solution): "Một trend vào AIMA thì chuyện gì xảy ra?"',
  context: 'aima',
  size: [1080, 1920],
  duration: TIMING.story.end + TIMING.outroLen,
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
