<p align="center">
  <img src="docs/icon.png" width="128" height="128" alt="Shinobi Launcher Symbol">
</p>

<h1 align="center">Shinobi Launcher</h1>

<p align="center">
  <a href="README.md">English</a> · <a href="README.es.md">Español</a> · <a href="README.pt-BR.md">Português</a> · <b>Deutsch</b> · <a href="README.ru.md">Русский</a>
</p>

<p align="center">
  <b>Naruto Online auf deinem Mac spielen.</b><br>
  Ein inoffizieller, kostenloser Open-Source-Launcher für macOS für das Flash-MMO <i>Naruto Online</i> –
  mit dem echten Adobe Flash Player, Start per Klick und praktischen Extras.
</p>

<p align="center">
  <a href="https://github.com/kenoleeee/shinobi-launcher/releases/latest"><img alt="Neueste Version" src="https://img.shields.io/github/v/release/kenoleeee/shinobi-launcher?label=download&color=ff7a1a"></a>
  <img alt="macOS 11+" src="https://img.shields.io/badge/macOS-11%2B-black?logo=apple">
  <img alt="Apple Silicon und Intel" src="https://img.shields.io/badge/Apple%20Silicon%20%26%20Intel-unterst%C3%BCtzt-555">
  <a href="LICENSE"><img alt="MIT-Lizenz" src="https://img.shields.io/badge/Lizenz-MIT-blue"></a>
</p>

---

Naruto Online läuft immer noch mit Adobe Flash, das kein moderner Browser mehr unterstützt, und den
offiziellen Launcher gibt es nur für Windows. Emulatoren wie Ruffle schaffen das Spiel noch nicht
(das Laden bleibt bei etwa 17 % stehen). Shinobi Launcher startet das Spiel mit dem **echten Flash
Player**, deshalb läuft es genauso wie unter Windows.

## Funktionen

- 🎮 **Echter Flash Player.** Das Spiel läuft mit dem originalen Adobe Flash Player 32, nicht mit einem Emulator.
- 🚀 **Ein Klick zum Spielen.** Öffnet den zuletzt gespielten Server wieder, direkt im Spiel.
- 🔐 **Bleibt angemeldet.** Deine Anmeldung bleibt 30 Tage gespeichert, auch die Google-Anmeldung funktioniert.
- 👥 **Mehrere Accounts.** Jeder Account öffnet sich in einem eigenen Fenster, z. B. Haupt- und Zweitaccount gleichzeitig.
- 🖥 **Clean Mode.** Blendet die Leiste der Website aus, damit das Spiel das ganze Fenster oder den ganzen Bildschirm füllt.
- ⚡ **Schnelleres Laden.** Dauerhafter 2-GB-Cache für das Spiel, Werbung und Tracker werden blockiert.
- 😴 **Mac bleibt wach.** Dein Mac geht nicht in den Ruhezustand, solange ein Spielfenster offen ist – praktisch zum AFK-Farmen.
- 📸 **Tastenkürzel.** Screenshots landen direkt in *Bilder → Naruto Online*, eine Taste schaltet den Ton stumm.
- 🩹 **Behebt einen häufigen Hänger.** Das Laden bleibt nicht mehr bei 14–15 % stehen, wenn das Spiel einen unerreichbaren Ausweichserver wählt.
- 🔄 **Update-Hinweise**, sobald eine neue Version erscheint.

## Installation

1. Lade **`Shinobi-Launcher-x.y.z.dmg`** aus der [neuesten Version](https://github.com/kenoleeee/shinobi-launcher/releases/latest) herunter.
2. Öffne die Datei und zieh **Shinobi Launcher** in den Ordner **Programme**.
3. Öffne Shinobi Launcher. Beim ersten Mal blockiert macOS die App, weil sie nicht aus dem App Store kommt:
   - Öffne **Systemeinstellungen → Datenschutz & Sicherheit**, scrolle nach unten und klicke neben *Shinobi Launcher* auf **Dennoch öffnen**.
   - Oder führe diesen Befehl einmal im Terminal aus:
     ```sh
     xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
     ```
4. **Apple Silicon (M1/M2/M3/M4):** Wenn macOS anbietet, **Rosetta** zu installieren, klicke auf *Installieren*.
   Adobe hat Flash nie für Apple-Chips gebaut, deshalb wird Rosetta gebraucht.
5. Beim ersten Start lädt der Launcher den Flash Player herunter (etwa 20 MB). Das dauert ungefähr eine Minute.
   Danach öffnet sich das Spiel.

**Voraussetzungen:** macOS 11 Big Sur oder neuer, auf Apple Silicon oder Intel.

## Bedienung

Die Menüs der App sind auf Englisch:

| Aktion | Menü / Kürzel |
|---|---|
| Mit Google (oder E-Mail) anmelden | **Account → Sign In with Google / Email…** · `⌘⇧L` |
| Zweiten Account hinzufügen (neues Fenster) | **Account → Add Another Account** · `⌘⇧N` |
| Zwischen Accounts wechseln | `⌘1`, `⌘2`, … |
| Zurück zur Serverliste | `⌘H` |
| Screenshot | `⌘⇧S` |
| Ton aus / an | `⌘⇧M` |
| Clean Mode an/aus | `⌘⇧C` |
| Vollbild | `⌃⌘F` |

Die Anmeldung mit E-Mail und Passwort funktioniert direkt auf der Website des Spiels. Die
**Google-Anmeldung** blockiert Google in Browsern, die Flash unterstützen, deshalb nutze
**Account → Sign In with Google / Email…**. Es öffnet sich ein kleines Fenster auf Safari-Basis;
sobald du angemeldet bist, schließt es sich von selbst und der Launcher meldet dich an.

## Wie Flash eingerichtet wird

Der Adobe Flash Player darf nicht weitergegeben werden, deshalb ist er **weder in dieser App noch in diesem Repository enthalten.**
Beim ersten Start macht der Launcher Folgendes:

1. Er lädt Adobes eigenen Installer *Flash Player 32.0.0.330 für Mac* vom
   [Internet-Archive-Spiegel des offiziellen Flash-Player-Archivs von Adobe](https://archive.org/details/fp_32.0.0.330_archive) herunter.
2. Er prüft die SHA-256-Prüfsumme gegen die bekannte Adobe-Version.
3. Er prüft, ob das Installationspaket von **Adobe Systems, Inc. (JQ525L2MZD)** signiert ist.
4. Er entpackt nur das Browser-Plugin nach `~/Library/Application Support/Shinobi Launcher/`.
   Im System wird nichts installiert.
5. Er prüft die Code-Signatur des Plugins, die ebenfalls von Adobe stammen muss.

Der Code dazu steht in [`src/flash-setup.js`](src/flash-setup.js).

## Sicherheit

Flash Player 32 bekommt von Adobe keine Updates mehr. Damit er abgeschottet bleibt:

- Der Launcher öffnet nur die Websites des Spiels und die Anmeldeseiten von Google/Facebook. Alle anderen Links öffnen sich in deinem normalen Browser.
- Flash gibt es nur in diesem Launcher, deine Browser bekommen also kein Flash.
- Der Launcher sammelt keine Daten. Sein Debug-Log bleibt lokal und enthält nie Passwörter oder Anmelde-Tokens.

## Problemlösung

<details>
<summary><b>„Shinobi Launcher ist beschädigt / kann nicht geöffnet werden“</b></summary>

Die macOS-Quarantäne blockiert Apps, die nicht aus dem App Store stammen. Führe aus:

```sh
xattr -dr com.apple.quarantine "/Applications/Shinobi Launcher.app"
```
</details>

<details>
<summary><b>Klick auf Login tut nichts / „The login server is temporarily limiting attempts“</b></summary>

Nach zu vielen Anmeldeversuchen hintereinander sperrt der Anmeldeserver des Spiels deine IP für etwa 5 Minuten.
Warte kurz und klicke dann nur einmal auf **Login**.
</details>

<details>
<summary><b>Schwarzer Bildschirm oder das Spiel lädt nicht</b></summary>

Probiere **Game → Force Reload**. Wenn das nicht hilft, öffne **Help → Open Debug Log** und hänge das
Log an ein [neues Issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose) an.
</details>

<details>
<summary><b>Die Ersteinrichtung ist fehlgeschlagen</b></summary>

Der Flash-Download braucht Zugriff auf `archive.org`. Klicke auf **Try again**. Wenn es weiter nicht klappt,
[öffne ein Issue](https://github.com/kenoleeee/shinobi-launcher/issues/new/choose) mit der Fehlermeldung.
</details>

## Aus dem Quellcode bauen

Siehe den Abschnitt [*Building from source*](README.md#building-from-source) in der englischen README.

## Projekt unterstützen

Shinobi Launcher ist kostenlos und bleibt es auch. Wenn er dir Naruto Online auf dem Mac
zurückgebracht hat, kannst du die Entwicklung unterstützen:

| Coin | Adresse |
|---|---|
| **ETH / ERC-20** (USDT, USDC) | `0x92277bbeb48218dee7e6fc1248a1cfa768d83850` |
| **BTC** | `1Nsq5PtU8YueBTxpRWXo1BUvihyaRLuaG4` |

⚠️ Sende ERC-20-Token **nur über das Ethereum-Netzwerk** an die ETH-Adresse und nur BTC an die BTC-Adresse.
Du findest die Adressen auch in der App unter **Help → Support the Project**.

Ein ⭐ auf GitHub hilft auch!

## Haftungsausschluss

Shinobi Launcher ist ein **inoffizielles Fanprojekt**. Es steht in keiner Verbindung zu Oasis Games,
Mars Era, Tencent, Bandai Namco, Masashi Kishimoto / Shueisha oder Adobe und wird von ihnen weder
unterstützt noch gebilligt. *Naruto* und *Naruto Online* sind Marken ihrer jeweiligen Inhaber. Adobe
Flash Player ist © Adobe und wird beim ersten Start aus Adobes eigenem Installer geladen; er wird hier
nicht verbreitet.

Der Launcher verändert das Spiel nicht, verschafft keine Vorteile und automatisiert nichts. Er sorgt
nur dafür, dass das offizielle Spiel unter macOS läuft.

## Lizenz

[MIT](LICENSE) © 2026 kenoleeee
