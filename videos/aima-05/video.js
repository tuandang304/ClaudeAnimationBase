// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, shared by scene.js and audio/make_audio.py so picture and sound land together. Laid out
// on the video's own clock, so story.at is a straight line (event time = video time); add knots there to slow a
// stretch down without retiming the keys (warp() in src/core.js). Retime here, then rebuild the soundtrack.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  story: knots([[0, 0], [28.4, 28.4]]),
  outroLen: 5.2,                             // the call to action and the logo
  tiles: [3.4, 4.3, 5.3, 6.2, 7.1, 8.0, 8.9],   // seven apps jump out of the laptop, one by one, into the juggle
  drop: 10.4,                                // too many: they all come down (the creator is flattened at +.35)
  wish: [13.8, 18.6],                        // the thought bubble: "Ước gì… có một đứa ngồi kế bên."
  buddy: 14.9,                               // ...someone sits down beside the creator in it, and takes the apps (+1.0)
  merge: 19.0,                               // the real apps fly into the laptop...
  open: 19.85,                               // ...and AIMA opens
  steps: [21.0, 21.5, 22.0, 22.5, 23.0],     // Trend → Idea → Create → Optimize → Schedule, in one place
  ok: 26.6,                                  // "…mình vẫn là người quyết định": the creator approves
};
const PROJECT = {
  title: 'AIMA #5 (TikTok, Solution): "POV: Làm 1 content nhưng mở 7 cái app."',
  context: 'aima',
  size: [1080, 1920],
  duration: TIMING.story.end + TIMING.outroLen,
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
