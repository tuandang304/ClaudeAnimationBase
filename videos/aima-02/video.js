// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, shared by scene.js and audio/make_audio.py so picture and sound land together. The
// moments below are in EVENT time; story.at pins them to the video's clock as [event time, video time] pairs, so each
// "lưu!" and "xoá" lands on its tap and every line gets room to breathe (warp() in src/core.js). Retime here, then
// rebuild the soundtrack.
const knots = at => ({ rates: at.slice(0, -1).map(([e, v], i) => [e, (at[i + 1][0] - e) / (at[i + 1][1] - v)]), end: at[at.length - 1][0] });
const TIMING = {
  story: knots([
    [0, 0], [3.3, 3.5], [3.8, 4.0],           // "Hôm nay nhất định phải đăng một cái content!"; the lid
    [6.3, 6.6], [7.7, 8.45], [8.2, 9.1],      // "Lướt tìm trend tí đã…"; "Cái này hay… lưu!" on the tap
    [9.8, 11.2], [10.3, 11.8],                // "Cái này cũng hay… lưu luôn!" on the tap
    [12.3, 13.8], [14.9, 17.0],               // the binge (full speed); "Ơ… lưu ba chục cái rồi à?"
    [16.25, 18.35], [16.6, 19.9],             // clock push; "Thôi, mở ghi chú viết luôn!"
    [17.9, 21.0], [19.0, 22.1], [19.95, 23.5], [20.25, 23.8],   // type; "Không ổn… xoá."
    [20.7, 24.3], [21.7, 25.3], [22.85, 26.8], [23.05, 27.0],   // type again; "Cũng không được… xoá!"
    [23.5, 27.6], [23.8, 27.9], [24.5, 28.7], [24.75, 28.95],   // one word; deleted
    [24.8, 29.1], [25.6, 29.9], [26.42, 30.72],                 // pull back: the afternoon; turn; crash zoom
    [26.5, 30.8], [27.3, 31.9], [29.6, 34.6],                   // "Rồi…" … "Rốt cuộc là đăng gì đây?", a beat to land
  ]),
  outroLen: 4.8,                             // the question to the viewer and the logo
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
};
const PROJECT = {
  title: 'AIMA #2 (TikTok, Awareness): "Mở laptop ra… và không biết đăng gì."',
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
