# context/: what the videos are about

The engine, the guide and `videos/` say **how** to make a video. This folder says **what for**: the product or brand a
video advertises, who it's for, what it says, how it looks and sounds, and the campaign it belongs to. It holds no code.

```
context/
  README.md          this file: how the folder works
  aima/              one folder per project (brand, product, client)
    README.md        start here: what the project is in one screen, and the rules for videos about it
    product.md       what the product does, for whom, and why (features, pains it solves, plans)
    brand.md         name and how it's read aloud, taglines, colours, logo, font, voice, tone
    campaign.md      the communication plan: stages, topics per platform, dates, status
```

## For agents

- A video names its project in `videos/<name>/video.js`: `PROJECT.context = 'aima'`. Before storyboarding or writing a
  line of copy for that video, read `context/<project>/README.md`, then whichever of the other files the task needs.
- Treat these files as the source of truth for facts about the product: feature names, prices, audience, taglines. Don't
  invent features or numbers that aren't here; if the video needs one, ask.
- Copy (captions, voice-over) is written in the project's language and tone (see its `brand.md`).
- When a video ships, note it in the project's `campaign.md` (which post it fulfils, its folder in `videos/`).

## Adding or switching projects

1. Make `context/<project>/` with the same four files (copy `aima/` as a template and replace every fact; keep the
   headings so agents find things in the same place). Put the source documents' content in, normalised: one fact once,
   tables for plans, no spreadsheets or decks (agents can't read those reliably).
2. Brand assets (logo, fonts) go in `assets/`, and `brand.md` points to them. Words the voice must read a special way go
   in `tools/voice/pronunciation.tsv`.
3. New videos for it: `videos/<project>-01/`, … with `context: '<project>'` in their `video.js`.

Older projects stay here: their videos still point at them.
