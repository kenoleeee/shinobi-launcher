# Reddit post — r/macgaming

**Post type:** text post with an image. Attach `docs/social-preview.png` or, better, a screenshot or GIF of
the game running on your Mac.

**Title (pick one):**
- I made a free, open-source launcher to play Naruto Online on Apple Silicon Macs (with the real Flash Player)
- Naruto Online finally runs on M-series Macs — free open-source launcher using the real Flash Player

---

**Body:**

Hey r/macgaming! I'm the developer. I wanted to play **Naruto Online** (the Flash MMO from Oasis Games /
Tencent) on my MacBook, but it's been a dead end on Mac for a while:

- browsers dropped Flash years ago,
- the official "mini-client" is Windows-only,
- Ruffle can't run it yet (loading stops around 17% because the game unpacks its own encrypted modules),
- CrossOver / Wine setups are paid or fiddly.

So I built **Shinobi Launcher**, a small native-feeling Mac app that runs the game with the **real Adobe
Flash Player**.

**How it works (for the curious):**
- It's built on Electron 11, the last Electron that can still load the PPAPI Flash plugin. It's x86_64,
  so on M-series Macs it runs through Rosetta 2, and performance is fine.
- Flash isn't bundled because it can't be redistributed. On first launch the app downloads Adobe's own
  Flash Player 32 installer from the Internet Archive mirror of Adobe's archive, checks the SHA-256 and the
  Adobe code signatures, and unpacks only the plugin into its own folder. Nothing is installed system-wide.
- It fixes a few Mac-specific problems: game servers that only speak TLS 1.0, and a hard-coded unreachable
  backup gateway that made loading hang at 14–15% (it's routed through a tiny local relay).
- Google sign-in is blocked in old Chromium, so there's a small Swift/WebKit (Safari engine) sign-in window
  that hands the login back to the app.
- Flash is sandboxed to the game: the app only opens the game's own sites and login pages. Every other link
  opens in your normal browser.

**Extras:** one click straight into your last server, several accounts in separate windows, a clean mode
that hides the website bar, a 2 GB game cache, blocked ads and trackers, keep-Mac-awake while AFK,
screenshot and mute hotkeys.

**Download / source:** https://github.com/kenoleeee/shinobi-launcher

Requires macOS 11+. It's not notarized (I'm not paying Apple $99/yr for a free fan project), so on first
open use *System Settings → Privacy & Security → Open Anyway*. Details are in the README.

It's unofficial and doesn't modify or automate the game, it only makes the official game run on macOS.
I'd love feedback and bug reports, especially from Intel Macs and older macOS versions. 🍥

---

## Tips for posting

- Read the subreddit rules and the self-promotion policy first. Some subs only allow self-promotion
  with the right flair or on certain days.
- Post in the evening US time (about 17:00–21:00 ET) on a weekday. That's when r/macgaming is most active.
- Reply to comments quickly in the first 2–3 hours. Early activity is what pushes a post up.
- Don't cross-post the same text to many subreddits on the same day. Adapt it for each community.
- Good follow-ups a few days later: the game's own subreddit (if there is one) and Mac subreddits for
  Portuguese, Spanish or German speakers, with the post translated.
