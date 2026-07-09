#!/usr/bin/env bash
# Render the README demo (demo.gif + demo.mp4). No agent/API key needed.
set -euo pipefail
cd "$(dirname "$0")"
echo "› recording demo.gif (vhs)…"
vhs demo.tape
if command -v ffmpeg >/dev/null 2>&1; then
  echo "› demo.gif → demo.mp4…"
  ffmpeg -y -loglevel error -i demo.gif -movflags faststart -pix_fmt yuv420p \
    -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2" demo.mp4
fi
ls -lh demo.gif demo.mp4 2>/dev/null | awk '{print "   "$9" "$5}'
