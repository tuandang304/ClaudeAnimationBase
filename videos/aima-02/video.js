// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, in seconds of video time, shared by scene.js and audio/make_audio.py so picture and
// sound land together. Retime here, then rebuild the soundtrack.
const TIMING = {
  lid: [3.3, 3.8],                           // the laptop opens; the screen comes on at the end
  swipes: [6.3, 8.2, 10.3, 10.65, 10.95, 11.2, 11.42, 11.6, 11.76, 11.9, 12.02],    // the feed moves on to the next video
  saves: [7.7, 9.8, 10.5, 10.82, 11.1, 11.33, 11.53, 11.69, 11.84, 11.97, 12.1],   // ...and it's saved (one per video)
  savedView: 12.3,                           // the saved folder, overflowing
  clockPush: 14.9,                           // the camera rushes to the clock: the morning goes by (back at +1.35)
  notesOpen: 16.6,                           // the notes app opens
  type: [[17.9, 19.0], [20.7, 21.7], [23.5, 23.8]],          // three tries at writing...
  del: [[19.95, 20.25], [22.85, 23.05], [24.5, 24.75]],      // ...each one deleted
  pullOut: 24.8,                             // the camera pulls back: it's the afternoon already
  crash: 26.42,                              // crash zoom on the creator's face
  punch: [26.5, 27.3],                       // "Rồi…" ... "Rốt cuộc đăng gì đây?"
  outro: 29.6,                               // the question to the viewer and the logo
  end: 34.2,
};
const PROJECT = {
  title: 'AIMA #2 (TikTok, Awareness): "Mở laptop ra… và không biết đăng gì."',
  context: 'aima',
  size: [1080, 1920],
  duration: TIMING.end,
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
