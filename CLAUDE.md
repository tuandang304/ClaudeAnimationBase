# Agent notes

- **How to make a video:** read [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) first (rules, workflow, API, voice-over and pacing).
- **What a video is about:** [context/](context/README.md) holds one folder per product/brand (product, brand, campaign
  plan). The current project is AIMA: start at [context/aima/README.md](context/aima/README.md). Facts in there are the
  source of truth; don't invent features, prices or links.
- **Where things go:** each video in its own `videos/<name>/` (`video.js`, `scene.js`, `STORYBOARD.md`, `audio/`);
  new episodes get a new folder (`aima-03`, …). AIMA videos are vertical (`size: [1080, 1920]`) and share the room,
  creator, lettering and outro in `videos/_aima/set.js`: reuse it, don't fork it. Render with `node render.mjs --video=<name> ...`; output lands in `out/<name>/`.
- **Voice:** `.venv/bin/python tools/make_vo.py videos/<name>` (VieNeu-TTS, offline), voices in `tools/voice/voices.json`,
  readings of English words in `tools/voice/pronunciation.tsv`. Then the video's `audio/make_audio.py`.
- Copy and voice-over are in Vietnamese for AIMA. Talk to the user in Vietnamese.
