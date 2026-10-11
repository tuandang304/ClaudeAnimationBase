#!/usr/bin/env bash
# make_vo.sh: regenerates the voice-over clips in assets/audio/vo/ from lines.tsv (id, voice, rate, text) with edge-tts,
# trimming the silence at both ends. To use your own recordings instead, save them as assets/audio/vo/<id>.wav.
# Then rebuild the soundtrack: python3 tools/make_audio.py
#   pip install edge-tts      (needs internet)
set -euo pipefail
cd "$(dirname "$0")/../assets/audio/vo"
while IFS=$'\t' read -r id voice rate text; do
  edge-tts --voice "$voice" --rate="$rate" --text "$text" --write-media "/tmp/$id.mp3"
  ffmpeg -v error -y -i "/tmp/$id.mp3" -ar 24000 -ac 1 \
    -af "silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-60dB:start_silence=0.05,areverse" "$id.wav"
  echo "$id"
done < lines.tsv
