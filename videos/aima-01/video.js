// video.js: this video's settings. studio.html?video=aima-01 and render.mjs --video=aima-01 load it before the engine.
//   title:     a name for people.
//   duration:  the video's length in seconds.
//   bpm:       the rhythm that bounces, dances and pulse() follow. Clawd always moves to some beat; if the video has
//              music, set this to the song's tempo, and set offset to the time in seconds of its first downbeat.
//   flatFills: paint p5.brush's watercolour fills as flat washes instead. Much faster on machines without a GPU.
//   audio:     the soundtrack, relative to this folder (built by audio/make_audio.py).
//   scenes:    the scripts that make the video, in load order, relative to this folder.
//
// TIMING: the pacing, shared by the scene and the soundtrack (audio/make_audio.py reads this file too). The scene's
// keys are written in event time; each part's `rates` slow the stretches where someone speaks or acts (see warp() in
// src/core.js) and leave camera whips and time-lapses at full speed. Change a rate here and picture and sound follow.
const TIMING = {
  story: {                                   // part 1, event time = the room's clock (STORYBOARD.md, A–G); it starts at
                                             // -2.8 at 0 s: the hook, before the story's clock reaches 0
    rates: [[-2.8, 1], [0, .8], [3.0, .75], [5.4, 1], [6.75, .85], [7.6, .48], [9.4, 1], [9.9, .55], [12.3, 1], [12.6, .7],
      [15.0, 1], [16.35, .8], [20.42, 1], [20.6, .6]],
    end: 24.8,
  },
  pitch: 5.6,                                // the AIMA card
  morning: {                                 // part 2, event time = time since the match cut
    rates: [[0, .85], [1.0, .72], [3.3, .88], [7.2, .8], [10.9, .76], [13.5, .58], [15.0, .85], [15.75, 1], [15.84, .7]],
    end: 18.6,
  },
  endcard: 5.5,
};
const PROJECT = {
  title: 'AIMA #1: "Ủa? Hết ngày rồi?"',
  duration: (() => {
    const len = ({ rates, end }) => rates.reduce((d, [e, r], i) => d + ((rates[i + 1] || [end])[0] - e) / r, 0);
    return len(TIMING.story) + TIMING.pitch + len(TIMING.morning) + TIMING.endcard;
  })(),
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', 'scene.js'],
};
