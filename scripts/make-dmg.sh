#!/bin/sh
# Wraps the packaged app into dist/Shinobi-Launcher-<version>.dmg (drag-to-Applications layout).
set -e
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./package.json').version")
APP="dist/Shinobi Launcher-darwin-x64/Shinobi Launcher.app"
STAGE=$(mktemp -d)
cp -R "$APP" "$STAGE/"
ln -s /Applications "$STAGE/Applications"
DMG="dist/Shinobi-Launcher-$VERSION.dmg"
rm -f "$DMG"
hdiutil create -volname "Shinobi Launcher $VERSION" -srcfolder "$STAGE" -ov -format UDZO "$DMG" >/dev/null
rm -rf "$STAGE"
shasum -a 256 "$DMG" | tee "$DMG.sha256"
echo "Built $DMG"
