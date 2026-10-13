// video.js: this video's settings. studio.html?video=aima-01 and render.mjs --video=aima-01 load it before the engine.
//   title:     a name for people.
//   context:   the project the video is about: context/<context>/ (product, brand, campaign). Read it before writing copy.
//   size:      the frame [w, h]: TikTok is vertical, 1080 × 1920.
//   duration:  the video's length in seconds.
//   bpm:       the rhythm that bounces, dances and pulse() follow; the soundtrack is built on it (120 bpm, beat 1 at 0 s).
//   flatFills: paint p5.brush's watercolour fills as flat washes instead. Much faster on machines without a GPU.
//   audio:     the soundtrack, relative to this folder (built by audio/make_audio.py).
//   scenes:    the scripts that make the video, in load order, relative to this folder (the logo and the series set first).
//
// TIMING: the pacing, shared by the scene and the soundtrack (audio/make_audio.py reads this file too). The scene's
// keys are written in event time (STORYBOARD.md, A–G). story.at pins story moments to the video's clock as
// [event time, video time] pairs; between two pairs the story plays at a steady speed (warp() in src/core.js), so a
// pair close in event time but far apart in video time is a hold (someone is talking), and camera whips and
// time-lapses keep their own speed. Emotion and camera keys move with it; idles and blinks run at full speed.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  story: knots([
    [-3.8, 0], [0, 4.6],                      // the hook: "Hôm nay làm đúng một cái content thôi. Ba mươi phút là xong!"
    [3.0, 7.6], [3.3, 8.0],                   // A: to the laptop, the screen wakes; the camera moves in
    [4.8, 14.6], [5.4, 15.6],                 // B: research, tab after tab while it's said; dizzy
    [6.75, 16.95],                            //    clock push 1: 8:05 → 11:30
    [7.6, 17.95], [8.42, 21.2], [8.7, 21.9],  // C: a hot trend, "Làm liền!"... it crashes
    [9.4, 24.3], [9.9, 24.8],                 //    "Ơ. Hết hot rồi?"; pan to the bin
    [10.0, 27.9], [11.95, 32.9],              // D: "Năm phút thôi." three throws, a "Không…" each; the idea
    [12.3, 34.8], [12.55, 35.05],             //    "A! Có rồi!"; whip back
    [12.7, 35.3], [13.62, 36.9], [13.7, 37.9], // E: typing; "Ừm, nghe sến quá."
    [14.0, 38.5], [14.35, 39.4], [15.0, 40.3], //    deleted, "Viết lại!", retyped
    [16.35, 41.65],                           //    clock push 2: 17:30 → 22:30
    [17.45, 43.4], [18.3, 44.9],              // F: "Edit nốt… Render nữa là xong…"; the render
    [19.42, 48.9],                            //    "Xong! Thấy chưa, một cái content thôi, nhanh mà…"
    [19.9, 49.6], [20.42, 50.3], [20.6, 50.48], // G: a glance up, midnight; crash zoom
    [21.2, 51.3], [21.8, 52.39], [23.4, 55.3], //    "Ủa?" "Hết ngày rồi?", a beat to land
  ]),
  outro: 5.6,                                // the question to the viewer and the logo
};
const PROJECT = {
  title: 'AIMA #1 (TikTok, Awareness): "Tôi chỉ định làm 1 cái content thôi…"',
  context: 'aima',
  size: [1080, 1920],
  duration: (() => {
    const len = ({ rates, end }) => rates.reduce((d, [e, r], i) => d + ((rates[i + 1] || [end])[0] - e) / r, 0);
    return len(TIMING.story) + TIMING.outro;
  })(),
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
