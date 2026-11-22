// video.js: this video's settings (every field is explained in videos/aima-01/video.js).
// TIMING: when things happen, in video time, shared by scene.js and audio/make_audio.py so picture and sound land
// together. Each shot starts where the last ends; the voice lines are placed from these keys in make_audio.py.
const TIMING = {
  hook: 0,          // A: night, the tired creator, tabs piling up, an empty calendar, a post nobody sees
  push: 1.0,        //    the camera pushes in to the laptop
  nobody: 4.4,      //    pull back to the face: "Mà vẫn không ai xem?"
  reveal: 6.4,      // B: iris out, the logo: "Để AIMA lo."
  beats: 10.0,      // C: how it works, four beats
  beatLen: 4.8,
  proof: 29.2,      // D: 23.000+ views, 20 paying customers
  cta: 36.4,        // E: the end card
  proofAvatars: 3.4, // D: the avatars pop on "khách hàng thật" (shot time)
  ctaPlus: 6.0,      // E: the Plus badge on "Gói Plus" (shot time)
  end: 47.0,
};
const PROJECT = {
  title: 'AIMA TVC (16:9): "Để AIMA lo."',
  context: 'aima',
  duration: TIMING.end,
  bpm: 120, offset: 0, flatFills: false,
  audio: 'audio/soundtrack.m4a',
  scenes: ['../../assets/aima_logo.js', '../_aima/set.js', 'scene.js'],
};
