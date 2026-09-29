#!/bin/sh
# Packages "Shinobi Launcher.app" (x86_64 — Flash only exists for Intel; runs via Rosetta 2).
set -e
cd "$(dirname "$0")/.."
VERSION=$(node -p "require('./package.json').version")
npx electron-packager . "Shinobi Launcher" \
  --platform=darwin --arch=x64 --electron-version=11.5.0 \
  --app-version="$VERSION" --app-bundle-id=app.shinobi-launcher \
  --app-category-type=public.app-category.games \
  --icon=build/icon.icns --out=dist --overwrite --asar \
  --extra-resource=resources/LoginHelper.app \
  --ignore='^/(dist|resources|build|helper|scripts|docs|\.github)(/|$)' \
  --ignore='^/(README|CHANGELOG|CONTRIBUTING|LICENSE|DISCLAIMER)' \
  --ignore='^/\.(npmrc|gitignore|editorconfig)$'
APP="dist/Shinobi Launcher-darwin-x64/Shinobi Launcher.app"
# Ad-hoc signature: without it macOS reports the downloaded app as "damaged".
codesign --force --deep --sign - "$APP"
echo "Built $APP"
