// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, shared by scene.js and audio/make_audio.py so picture and sound land together. Laid out
// on the video's own clock, so story.at is a straight line (event time = video time); add knots there to slow a
// stretch down without retiming the keys (warp() in src/core.js). Retime here, then rebuild the soundtrack.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  story: knots([[0, 0], [24.4, 24.4]]),
  outroLen: 5.2,                             // the call to action and the logo
  sheets: [1.0, 1.3, 1.6, 1.9],              // the old way: one idea rewritten on four sheets...
  crumple: 3.1,                              // ...crumpled and thrown away
  open: 4.6,                                 // the creator turns to the laptop; AIMA opens
  // the four steps, [start, end]: brand profile, one idea, one version per platform, review and approve
  steps: [[4.9, 9.1], [9.2, 12.5], [12.6, 16.5], [16.6, 20.4]],
  logo: 5.4, colours: [6.0, 6.2, 6.4], sliders: [6.7, 7.3], fans: 7.5, done1: 8.5,   // step 1
  typeIdea: [10.0, 11.0], send: 11.6,                                                  // step 2
  plats: [13.0, 13.25, 13.5, 13.75],                                                   // step 3
  edit: [17.6, 18.3], checks: [18.8, 19.0, 19.2, 19.4],                                // step 4
  confetti: 20.4,                            // the first content is done
  turn: 20.6,                                // the creator turns to us
};
const PROJECT = {
  title: 'AIMA #7 (TikTok, Product): "Lần đầu dùng AIMA thì bắt đầu từ đâu?"',
  context: 'aima',
  size: [1080, 1920],
  duration: TIMING.story.end + TIMING.outroLen,
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
