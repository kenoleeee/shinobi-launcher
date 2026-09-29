# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] — 2026-09-29

First public release.

### Added
- Runs Naruto Online with the real Adobe Flash Player 32 (PPAPI) on macOS 11+,
  Apple Silicon (via Rosetta 2) and Intel.
- First-run setup that downloads Adobe's official Flash installer and verifies its
  SHA-256 and Adobe code signatures. Flash is never bundled.
- One-click start into the last server played.
- Login kept for 30 days, plus a Safari-based sign-in window for Google accounts.
- Multiple accounts in separate windows (`⌘⇧N`, `⌘1`…`⌘9`).
- Clean mode that hides the website bar.
- 2 GB persistent game cache and blocking of ads and trackers.
- Keeps the Mac awake while playing.
- Screenshot (`⌘⇧S`) and mute (`⌘⇧M`) hotkeys.
- Optional Discord status.
- Update notifications through GitHub Releases.

### Fixed
- Loading stuck at 14–15% when the game falls back to an unreachable backup gateway.
- Game servers that only support TLS 1.0 now load.
- The "Are you sure you want to exit?" prompt no longer blocks quitting.

[1.0.0]: https://github.com/kenoleeee/shinobi-launcher/releases/tag/v1.0.0
