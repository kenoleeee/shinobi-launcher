#!/bin/sh
# Regenerates build/icon.icns from build/icon-1024.png (export icon.svg to that PNG first).
set -e
cd "$(dirname "$0")/../build"
rm -rf icon.iconset && mkdir icon.iconset
for s in 16 32 128 256 512; do
  sips -z $s $s icon-1024.png --out "icon.iconset/icon_${s}x${s}.png" >/dev/null
  d=$((s * 2))
  sips -z $d $d icon-1024.png --out "icon.iconset/icon_${s}x${s}@2x.png" >/dev/null
done
iconutil -c icns icon.iconset -o icon.icns
rm -rf icon.iconset
echo "Built build/icon.icns"
