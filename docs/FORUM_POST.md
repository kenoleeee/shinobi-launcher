# Forum post (copy & paste)

Suggested title: **[Mac] Play Naruto Online on macOS: free launcher with the real Flash (Apple Silicon + Intel)**

---

Hi ninjas! 👋

If you're on a Mac, you know the problem: browsers dropped Flash, the official mini-client is
Windows-only, and Ruffle stops loading at around 17%.

So I made **Shinobi Launcher**, a free, open-source Mac app that runs Naruto Online with the
**real Adobe Flash Player**, the same way the Windows client does.

**What it does**
- Works on Apple Silicon (M1/M2/M3/M4) and Intel Macs, macOS 11 or newer
- One click: straight into the last server you played
- Stays logged in, and **Google login works**
- **Several accounts at once**, each in its own window
- Clean full-screen mode without the website bar
- Faster loading (big game cache, ads and trackers blocked)
- Keeps your Mac awake while you AFK
- Screenshot and mute hotkeys
- Fixes the "stuck at 14–15%" loading hang

**Download:** https://github.com/kenoleeee/shinobi-launcher/releases/latest

**Install:** open the .dmg and drag the app into Applications. On first launch, allow it under
*System Settings → Privacy & Security → Open Anyway*. On the first run the app downloads Adobe's
official Flash (~20 MB), and after that you go straight into the game.

**Is it safe?** The code is fully open on GitHub. Flash isn't bundled: the app downloads Adobe's
own installer and checks Adobe's digital signature before using it. It only opens the game's
websites, and it doesn't change or automate the game in any way.

It's an unofficial fan project, not affiliated with Oasis Games, Tencent or Bandai Namco.

Bugs or ideas? Post here or open an issue on GitHub. If you'd like to support the project, the
donation addresses are in the README and under *Help → Support the Project* in the app.

Have fun! 🍥
