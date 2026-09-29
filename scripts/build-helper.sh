#!/bin/sh
# Builds resources/LoginHelper.app — the small WebKit window used for Google / email sign-in
# (universal: arm64 + x86_64). Needs the Xcode command line tools (swiftc).
set -e
cd "$(dirname "$0")/.."
APP=resources/LoginHelper.app
TMP=$(mktemp -d)
swiftc -O -target arm64-apple-macos11 helper/LoginHelper.swift -o "$TMP/arm64"
swiftc -O -target x86_64-apple-macos11 helper/LoginHelper.swift -o "$TMP/x86_64"
rm -rf "$APP" && mkdir -p "$APP/Contents/MacOS"
lipo -create "$TMP/arm64" "$TMP/x86_64" -output "$APP/Contents/MacOS/LoginHelper"
cp helper/Info.plist "$APP/Contents/Info.plist"
codesign --force --sign - "$APP"
rm -rf "$TMP"
echo "Built $APP"
