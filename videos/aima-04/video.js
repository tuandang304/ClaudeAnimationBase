// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, shared by scene.js and audio/make_audio.py so picture and sound land together. This
// video was laid out on the video's own clock, so story.at is a straight line (event time = video time); add knots
// there to slow a stretch down without retiming the keys (warp() in src/core.js). Retime here, then rebuild the soundtrack.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  story: knots([[0, 0], [26.6, 26.6]]),
  outroLen: 4.8,                             // the question to the viewer and the logo
  turnIn: 3.0,                               // "Làm một cái content thôi. Bắt đầu!", then to the laptop
  // seven tabs, one tool each: trend, idea, caption, design, video, schedule, numbers ("Tìm trend…" … "Xem số liệu…")
  tabs: [3.8, 5.35, 6.9, 8.45, 10.0, 11.55, 13.1],
  lost: 15.2,                                // "Ơ… cái caption nãy để tab nào ta?"
  frenzy: [17.6, 20.6],                      // tab, tab, tab, faster and faster; more tabs keep opening
  hang: 20.6,                                // the laptop gives up: a spinner, steam
  pullOut: 21.0,                             // the camera pulls back: it's sunset already
  crash: 22.5,                               // crash zoom on the face
  punch: [22.65, 23.9],                      // "Chuyển tab…" ... "còn nhiều hơn làm content!"
};
const PROJECT = {
  title: 'AIMA #4 (TikTok, Problem): "POV: Mở 7 tab để làm 1 cái content"',
  context: 'aima',
  size: [1080, 1920],
  duration: TIMING.story.end + TIMING.outroLen,
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
