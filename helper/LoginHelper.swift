// Login helper for the Naruto Online Mac launcher.
// The launcher's Chromium 87 is too old for Google sign-in, so this tiny WebKit (Safari engine)
// window does the sign-in, then hands the game site's cookies back to the launcher as JSON.
//
// Usage: LoginHelper <output.json> <start url>
// Exit code 0 + output file = signed in; exit code 1 = window closed without signing in.
import Cocoa
import WebKit

let args = CommandLine.arguments
guard args.count >= 3, let parsedURL = URL(string: args[2]) else {
    FileHandle.standardError.write("usage: LoginHelper <output.json> <start url>\n".data(using: .utf8)!)
    exit(2)
}
let startURL: URL = parsedURL
let outputPath = args[1]
let safariUA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Safari/605.1.15"
let gameDomains = ["narutowebgame.com", "oasgames.com"]

func isGameCookie(_ c: HTTPCookie) -> Bool {
    let d = c.domain.hasPrefix(".") ? String(c.domain.dropFirst()) : c.domain
    return gameDomains.contains { d == $0 || d.hasSuffix("." + $0) }
}

final class Helper: NSObject, NSApplicationDelegate, WKUIDelegate, NSWindowDelegate {
    let config = WKWebViewConfiguration()
    var window: NSWindow!
    var popups: [NSWindow] = []
    var timer: Timer?
    var finished = false

    func applicationDidFinishLaunching(_ note: Notification) {
        config.websiteDataStore = .nonPersistent() // fresh login every time, nothing left on disk
        let web = WKWebView(frame: .zero, configuration: config)
        web.customUserAgent = safariUA
        web.uiDelegate = self

        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 1000, height: 760),
                          styleMask: [.titled, .closable, .resizable, .miniaturizable],
                          backing: .buffered, defer: false)
        window.title = "Sign in to Naruto Online — the window closes by itself after you log in"
        window.contentView = web
        window.delegate = self
        window.center()
        window.makeKeyAndOrderFront(nil)
        NSApp.activate(ignoringOtherApps: true)
        web.load(URLRequest(url: startURL))

        // Poll the cookie jar; the site sets `oas_user` once the login succeeded.
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: true) { [weak self] _ in self?.checkLogin() }
    }

    func checkLogin() {
        config.websiteDataStore.httpCookieStore.getAllCookies { cookies in
            let game = cookies.filter(isGameCookie)
            guard !self.finished, game.contains(where: { $0.name == "oas_user" && !$0.value.isEmpty }) else { return }
            self.finished = true
            self.write(game)
            NSApp.terminate(nil)
        }
    }

    func write(_ cookies: [HTTPCookie]) {
        let expiry = Date().timeIntervalSince1970 + 30 * 24 * 3600
        let list: [[String: Any]] = cookies.map { c in
            let host = c.domain.hasPrefix(".") ? String(c.domain.dropFirst()) : c.domain
            var o: [String: Any] = [
                "url": "\(c.isSecure ? "https" : "http")://\(host)\(c.path.isEmpty ? "/" : c.path)",
                "name": c.name,
                "value": c.value,
                "path": c.path.isEmpty ? "/" : c.path,
                "secure": c.isSecure,
                "httpOnly": c.isHTTPOnly,
                "expirationDate": c.expiresDate?.timeIntervalSince1970 ?? expiry,
            ]
            if c.domain.hasPrefix(".") { o["domain"] = c.domain }
            return o
        }
        if let data = try? JSONSerialization.data(withJSONObject: list) {
            FileManager.default.createFile(atPath: outputPath, contents: data,
                                           attributes: [.posixPermissions: 0o600])
        }
    }

    // Google / Facebook login popups (window.open) get their own window sharing the same cookies.
    func webView(_ webView: WKWebView, createWebViewWith configuration: WKWebViewConfiguration,
                 for navigationAction: WKNavigationAction, windowFeatures: WKWindowFeatures) -> WKWebView? {
        let popup = WKWebView(frame: .zero, configuration: configuration)
        popup.customUserAgent = safariUA
        popup.uiDelegate = self
        let w = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 520, height: 680),
                         styleMask: [.titled, .closable, .resizable], backing: .buffered, defer: false)
        w.contentView = popup
        w.isReleasedWhenClosed = false
        w.center()
        w.makeKeyAndOrderFront(nil)
        popups.append(w)
        return popup
    }

    func webViewDidClose(_ webView: WKWebView) {
        if let w = popups.first(where: { $0.contentView === webView }) {
            w.close()
            popups.removeAll { $0 === w }
        }
    }

    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String,
                 initiatedByFrame frame: WKFrameInfo, completionHandler: @escaping () -> Void) {
        let a = NSAlert()
        a.messageText = message
        a.runModal()
        completionHandler()
    }

    func windowWillClose(_ notification: Notification) {
        if !finished { exit(1) }
    }
}

let app = NSApplication.shared
let delegate = Helper()
app.delegate = delegate
app.setActivationPolicy(.regular)
app.run()
