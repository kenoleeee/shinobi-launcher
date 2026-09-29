// Shinobi Launcher — unofficial macOS launcher for Naruto Online.
//
// Naruto Online is a Flash game. Electron 11 is the last Electron that can host the Adobe Flash
// Player (PPAPI) plugin, so the app is built for x86_64 and runs under Rosetta 2 on Apple Silicon.
// Its Chromium 87 also still accepts the game servers' TLS 1.0.
const {
  app, BrowserWindow, Menu, dialog, session, shell, powerSaveBlocker, Notification, net, clipboard,
} = require('electron');
const path = require('path');
const fs = require('fs');
const tcp = require('net');
const { execFile } = require('child_process');
const discord = require('./discord');
const config = require('./config');
const { installFlash, isFlashInstalled, FLASH_VERSION } = require('./flash-setup');

const APP_NAME = 'Shinobi Launcher';
const START_URL = 'https://naruto.narutowebgame.com/serverlist';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.141 Safari/537.36';
const RES = app.isPackaged ? process.resourcesPath : path.join(__dirname, '..', 'resources');
const LOGIN_HELPER = path.join(RES, 'LoginHelper.app', 'Contents', 'MacOS', 'LoginHelper');

// ---------- profile folder (migrates the pre-release "Naruto Online Flash" folder once) ----------
// Must run before app.setName(), which already creates the new profile folder.
const USER_DATA = path.join(app.getPath('appData'), APP_NAME);
const LEGACY_USER_DATA = path.join(app.getPath('appData'), 'Naruto Online Flash');
if (!fs.existsSync(USER_DATA) && fs.existsSync(LEGACY_USER_DATA)) {
  try { fs.renameSync(LEGACY_USER_DATA, USER_DATA); } catch {}
}
app.setName(APP_NAME);
app.setPath('userData', USER_DATA);

// Flash is downloaded on first launch into the profile folder (it may not be redistributed).
const FLASH_PLUGIN = path.join(USER_DATA, 'PepperFlashPlayer.plugin');
app.commandLine.appendSwitch('ppapi-flash-path', FLASH_PLUGIN);
app.commandLine.appendSwitch('ppapi-flash-version', FLASH_VERSION);
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
// The game pulls hundreds of SWF modules; a big persistent cache makes later launches much faster.
app.commandLine.appendSwitch('disk-cache-size', String(2 * 1024 * 1024 * 1024));
app.userAgentFallback = UA;

// ---------- fallback-gateway relay ----------
// When the game's first connection attempt fails, entry.swf falls back to a hard-coded gateway
// (101.227.160.29, in Shanghai) that is unreachable from most networks, and loading hangs at ~14%.
// We route that address to a local relay which forwards to the server the site handed out for
// the chosen world. Port 843 (Flash socket policy) needs root to listen on, so it is remapped.
const DEAD_GATEWAY = '101.227.160.29';
const POLICY_RELAY_PORT = 18843;
app.commandLine.appendSwitch('host-resolver-rules',
  `MAP ${DEAD_GATEWAY}:843 127.0.0.1:${POLICY_RELAY_PORT}, MAP ${DEAD_GATEWAY} 127.0.0.1`);

let gameServer = null; // { ip, port } from the site's query_svr_info
const relayPorts = new Set();
function relay(listenPort, targetPort) {
  if (relayPorts.has(listenPort)) return;
  relayPorts.add(listenPort);
  const server = tcp.createServer((client) => {
    if (!gameServer) { client.destroy(); return; }
    const upstream = tcp.connect(targetPort || gameServer.port, gameServer.ip);
    client.pipe(upstream).pipe(client);
    const close = () => { client.destroy(); upstream.destroy(); };
    client.on('error', close);
    upstream.on('error', close);
  });
  server.on('error', (e) => log(`relay :${listenPort} failed: ${e.message}`));
  server.listen(listenPort, '127.0.0.1');
}
function learnGameServer(url) {
  const req = net.request(url);
  let body = '';
  req.on('response', (res) => {
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
      try {
        const [ip, port] = JSON.parse(body);
        if (!/^\d+\.\d+\.\d+\.\d+$/.test(ip) || !Number(port)) return;
        gameServer = { ip, port: Number(port) };
        relay(gameServer.port, gameServer.port);
      } catch {}
    });
  });
  req.on('error', () => {});
  req.end();
}

// Old Flash is unpatched, so this app only ever shows the game and the login providers.
const ALLOWED_SITES = /(^|\.)(narutowebgame\.com|oasgames\.com|huoying\.qq\.com|facebook\.com|facebook\.net|fbcdn\.net|google\.com|googleapis\.com|gstatic\.com|googleusercontent\.com|youtube\.com)$/;
function isAllowedUrl(url) {
  try {
    const u = new URL(url);
    return (u.protocol === 'https:' || u.protocol === 'http:') && ALLOWED_SITES.test(u.hostname);
  } catch {
    return false;
  }
}

// Analytics / ad pixels / dead servers: blocking them makes the page load faster.
const BLOCKED = [
  /(^|\.)google-analytics\.com$/, /(^|\.)googletagmanager\.com$/, /(^|\.)doubleclick\.net$/,
  /^vipsac\.oasgames\.com$/,
  // Note: report.huoying.qq.com / 182.254.116.117 look like telemetry but are part of the game's
  // connect sequence — don't block them.
];
const BLOCKED_URLS = [/facebook\.com\/tr\b/, /oasgames\.com\/ext\/conversionCode\//, /facebook\.com\/plugins\/like\.php/];
function isBlocked(url) {
  try {
    const h = new URL(url).hostname;
    return BLOCKED.some((r) => r.test(h)) || BLOCKED_URLS.some((r) => r.test(url));
  } catch {
    return false;
  }
}

// A game page is naruto.narutowebgame.com/[lang/]serverlist/s<id>
const GAME_PAGE = /^https:\/\/naruto\.narutowebgame\.com\/(?:[a-z]{2}\/)?serverlist\/s(\d+)/;

// ---------- settings ----------
let settingsFile;
let settings = {
  cleanMode: true,
  autoResume: true,
  keepAwake: true,
  muted: false,
  discord: false,
  accounts: [{ id: 'main', name: 'Main' }],
  lastServers: {}, // account id -> url
  openAccounts: ['main'], // reopened on launch
  lastUpdateCheck: 0,
};
function loadSettings() {
  try {
    const saved = JSON.parse(fs.readFileSync(settingsFile, 'utf8'));
    if (saved.lastServer && !saved.lastServers) saved.lastServers = { main: saved.lastServer }; // pre-release format
    delete saved.lastServer;
    delete saved.graphics;
    settings = { ...settings, ...saved };
  } catch {}
}
function saveSettings() {
  try { fs.writeFileSync(settingsFile, JSON.stringify(settings, null, 2)); } catch {}
}

// ---------- debug log, credentials never logged ----------
let logFile;
function log(line) {
  const safe = String(line).replace(/(pwd|password|email|loginKey|token|sign|user_name)=[^&\s]*/gi, '$1=***');
  try { fs.appendFileSync(logFile, `[${new Date().toISOString()}] ${safe.slice(0, 1000)}\n`); } catch {}
}
function trimLog() {
  try { if (fs.statSync(logFile).size > 5 * 1024 * 1024) fs.writeFileSync(logFile, ''); } catch {}
}

// ---------- accounts: every account is its own cookie jar (session partition) ----------
function partitionFor(accountId) {
  return accountId === 'main' ? '' : `persist:account-${accountId}`;
}
function sessionFor(accountId) {
  return accountId === 'main' ? session.defaultSession : session.fromPartition(partitionFor(accountId));
}
function accountName(accountId) {
  const a = settings.accounts.find((x) => x.id === accountId);
  return a ? a.name : accountId;
}

// ---------- login rate-limit notice ----------
let rateLimitShownAt = 0;
function notifyRateLimited(headers) {
  const retry = Number((Object.entries(headers).find(([k]) => /^retry-after$/i.test(k)) || [])[1]?.[0]) || 300;
  log(`login server rate-limited us, retry after ${retry}s`);
  if (Date.now() - rateLimitShownAt < 30000) return;
  rateLimitShownAt = Date.now();
  const min = Math.max(1, Math.ceil(retry / 60));
  setImmediate(() => dialog.showMessageBox({
    type: 'warning',
    message: 'The login server is temporarily limiting attempts',
    detail: `Too many login attempts in a row. Wait about ${min} min, then press Login once.`,
  }));
}

// ---------- per-session setup (blocking, cookie persistence, server discovery) ----------
const preparedSessions = new WeakSet();
function prepareSession(ses) {
  if (preparedSessions.has(ses)) return;
  preparedSessions.add(ses);

  ses.webRequest.onBeforeRequest((details, cb) => cb({ cancel: isBlocked(details.url) }));
  ses.webRequest.onHeadersReceived((details, cb) => {
    if (details.statusCode === 429 && /passport\./.test(new URL(details.url).hostname)) notifyRateLimited(details.responseHeaders);
    cb({ responseHeaders: details.responseHeaders });
  });
  ses.webRequest.onCompleted((d) => {
    if (/\/fcgi-bin\/query_svr_info\.fcgi/.test(d.url) && d.statusCode === 200) learnGameServer(d.url);
    if (d.statusCode >= 400 && !/passport\./.test(d.url)) log(`HTTP ${d.statusCode} ${d.method} ${d.url.split('?')[0]}`);
  });
  ses.webRequest.onErrorOccurred((d) => {
    if (d.error !== 'net::ERR_ABORTED' && d.error !== 'net::ERR_BLOCKED_BY_CLIENT') log(`NET ${d.error} ${d.method} ${d.url.split('?')[0]}`);
  });

  // The site stores the login (oas_user etc.) as session cookies, which die when the app quits.
  // Turn game-site session cookies into 30-day cookies so the login survives restarts.
  const cookies = ses.cookies;
  cookies.on('changed', (_, c, cause, removed) => {
    if (removed || c.expirationDate || c.session === false) return;
    const host = c.domain.replace(/^\./, '');
    if (!/(^|\.)(narutowebgame|oasgames)\.com$/.test(host)) return;
    cookies.set({
      url: `${c.secure ? 'https' : 'http'}://${host}${c.path || '/'}`,
      name: c.name,
      value: c.value,
      domain: c.hostOnly ? undefined : c.domain,
      path: c.path,
      secure: c.secure,
      httpOnly: c.httpOnly,
      sameSite: c.sameSite,
      expirationDate: Date.now() / 1000 + 30 * 24 * 3600,
    }).catch((e) => log(`cookie persist failed ${c.name}: ${e.message}`));
  });
}

async function importCookies(ses, file) {
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));
  await Promise.all(list.map((c) => ses.cookies.set(c).catch((e) => log(`cookie import ${c.name}: ${e.message}`))));
  fs.unlinkSync(file);
  log(`imported ${list.length} login cookies`);
}

// ---------- clean mode: hide the site's top bar so the game fills the whole window ----------
const CLEAN_CSS = `
  .oas-bar, #oas-bar, #oas-bar-hide, .oas-bar-hide { display: none !important; }
  html, body { overflow: hidden !important; margin: 0 !important; }
  #oas-player { position: fixed !important; top: 0 !important; left: 0 !important;
    width: 100vw !important; height: 100vh !important; margin: 0 !important; z-index: 9998 !important; }
`;
const cleanCssKeys = new Map(); // webContents id -> inserted css key
async function applyCleanMode(wc) {
  const key = cleanCssKeys.get(wc.id);
  if (key) { cleanCssKeys.delete(wc.id); wc.removeInsertedCSS(key).catch(() => {}); }
  if (settings.cleanMode && GAME_PAGE.test(wc.getURL())) {
    cleanCssKeys.set(wc.id, await wc.insertCSS(CLEAN_CSS));
  }
}

// ---------- keep the Mac awake while a game page is open (AFK farming) ----------
let awakeId = null;
function gameWindows() {
  return BrowserWindow.getAllWindows().filter((w) => !w.isDestroyed() && GAME_PAGE.test(w.webContents.getURL()));
}
function updateKeepAwake() {
  const want = settings.keepAwake && gameWindows().length > 0;
  if (want && awakeId === null) awakeId = powerSaveBlocker.start('prevent-app-suspension');
  if (!want && awakeId !== null) { powerSaveBlocker.stop(awakeId); awakeId = null; }
}

// ---------- Discord status ----------
const playingSince = Date.now();
function updateDiscord() {
  if (!settings.discord || !config.discordClientId) { discord.stop(); return; }
  const focused = BrowserWindow.getFocusedWindow();
  const win = (focused && GAME_PAGE.test(focused.webContents.getURL()) && focused) || gameWindows()[0];
  const m = win && win.webContents.getURL().match(GAME_PAGE);
  discord.start(config.discordClientId, log);
  discord.setActivity({
    details: m ? `Server S${m[1]}` : 'Choosing a server',
    state: 'Playing on Mac',
    timestamps: { start: Math.floor(playingSince / 1000) },
    assets: { large_image: 'icon', large_text: APP_NAME },
  });
}

// ---------- screenshots ----------
async function takeScreenshot(win) {
  if (!win) return;
  const img = await win.webContents.capturePage();
  const dir = path.join(app.getPath('pictures'), 'Naruto Online');
  fs.mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 19);
  const file = path.join(dir, `Naruto-${stamp}.png`);
  fs.writeFileSync(file, img.toPNG());
  const n = new Notification({ title: 'Screenshot saved', body: `Pictures/Naruto Online/${path.basename(file)}`, silent: true });
  n.on('click', () => shell.showItemInFolder(file));
  n.show();
}

// ---------- sign-in via the WebKit helper (Google refuses this old Chromium) ----------
const wcAccount = new Map(); // webContents id -> account id
function signInWithHelper(win) {
  const accountId = (win && wcAccount.get(win.webContents.id)) || 'main';
  if (!fs.existsSync(LOGIN_HELPER)) {
    dialog.showMessageBox({ type: 'error', message: 'The sign-in helper is missing from this build.' });
    return;
  }
  const out = path.join(app.getPath('userData'), `import-cookies-${accountId}.json`);
  try { fs.unlinkSync(out); } catch {}
  log(`sign-in helper started for account ${accountId}`);
  execFile(LOGIN_HELPER, [out, START_URL], async (err) => {
    if (!fs.existsSync(out)) { log(`sign-in helper closed without login${err ? `: ${err.message}` : ''}`); return; }
    await importCookies(sessionFor(accountId), out);
    const target = win && !win.isDestroyed() ? win : openAccountWindow(accountId);
    target.webContents.loadURL(settings.lastServers[accountId] || START_URL);
    target.focus();
  });
}

// ---------- windows ----------
function webPrefs(accountId) {
  return {
    plugins: true, // Flash
    partition: partitionFor(accountId) || undefined,
    contextIsolation: true,
    sandbox: true,
    nodeIntegration: false,
    nativeWindowOpen: true, // popups keep window.opener (social login)
    allowRunningInsecureContent: true, // the game's Flash loads some data over plain http
    backgroundThrottling: false,
  };
}

let pendingPopupAccount = 'main';
function setupWebContents(wc, accountId) {
  wcAccount.set(wc.id, accountId);
  wc.setAudioMuted(settings.muted);

  wc.on('console-message', (_, level, message) => {
    if (level >= 3) log(`console ${wc.getURL().split('?')[0]} :: ${message}`);
  });
  wc.on('did-fail-load', (_, code, desc, url, isMain) => {
    if (code === -3 || code === -20) return; // aborted / blocked on purpose
    log(`load failed ${code} ${desc} ${isMain ? '(page)' : '(frame)'} ${url.split('?')[0]}`);
  });
  wc.on('render-process-gone', (_, d) => log(`renderer gone: ${d.reason}`));
  wc.on('plugin-crashed', (_, name, version) => log(`plugin crashed: ${name} ${version}`));

  wc.on('did-navigate', (_, url) => {
    if (GAME_PAGE.test(url)) { settings.lastServers[accountId] = url.split('?')[0]; saveSettings(); }
    updateKeepAwake();
    updateDiscord();
  });
  wc.on('dom-ready', () => applyCleanMode(wc));
  // The game asks "Are you sure you want to exit?" on unload, which blocks quitting / reloading the app.
  wc.on('will-prevent-unload', (e) => e.preventDefault());
  wc.on('destroyed', () => {
    cleanCssKeys.delete(wc.id);
    wcAccount.delete(wc.id);
    setImmediate(() => { updateKeepAwake(); updateDiscord(); });
  });

  // Anything outside the game / login sites opens in the normal browser instead.
  wc.on('will-navigate', (e, url) => {
    if (!isAllowedUrl(url)) { e.preventDefault(); shell.openExternal(url); }
  });
  wc.on('new-window', (e, url, frameName, disposition, options) => {
    if (!isAllowedUrl(url)) { e.preventDefault(); shell.openExternal(url); return; }
    // Server links (target=_blank) open in this window instead of a second one.
    if (GAME_PAGE.test(url)) { e.preventDefault(); wc.loadURL(url); return; }
    const isGame = /narutowebgame\.com|oasgames\.com/.test(new URL(url).hostname);
    options.width = isGame ? 1280 : 520;
    options.height = isGame ? 800 : 680;
    options.backgroundColor = '#000000';
    // Popups must stay in the same account (cookie jar) as their opener.
    options.webPreferences = { ...(options.webPreferences || {}), ...webPrefs(accountId) };
    pendingPopupAccount = accountId;
  });
}

const accountWindows = new Map(); // account id -> main window of that account
let creatingMainWindow = false;

// Popups (login, payment) get the same setup as their opener's account.
app.on('browser-window-created', (_, win) => {
  if (creatingMainWindow || !app.isReady() || !settingsFile) return;
  const accountId = pendingPopupAccount;
  setupWebContents(win.webContents, accountId);
  const opener = accountWindows.get(accountId);
  // Social login popup: once it lands back on the game site, close it and refresh the opener.
  let leftSite = false;
  win.webContents.on('did-navigate', (_, url) => {
    const onSite = /^https?:\/\/([^/]+\.)?(narutowebgame|oasgames)\.com\//.test(url);
    if (!onSite) { leftSite = true; return; }
    if (leftSite && !/passport\./.test(url)) setTimeout(() => { if (!win.isDestroyed()) win.close(); }, 800);
  });
  win.on('closed', () => { if (leftSite && opener && !opener.isDestroyed()) opener.webContents.reload(); });
});

function openAccountWindow(accountId) {
  const existing = accountWindows.get(accountId);
  if (existing && !existing.isDestroyed()) { existing.focus(); return existing; }

  prepareSession(sessionFor(accountId));
  creatingMainWindow = true;
  let win;
  try {
    win = new BrowserWindow({
      width: 1280,
      height: 800,
      backgroundColor: '#000000',
      title: 'Naruto Online',
      webPreferences: webPrefs(accountId),
    });
  } finally {
    creatingMainWindow = false;
  }
  accountWindows.set(accountId, win);
  setupWebContents(win.webContents, accountId);

  if (settings.accounts.length > 1) {
    win.on('page-title-updated', (e, title) => { e.preventDefault(); win.setTitle(`${title} — ${accountName(accountId)}`); });
  }
  win.on('focus', updateDiscord);
  win.on('closed', () => accountWindows.delete(accountId));

  const url = settings.autoResume && settings.lastServers[accountId] ? settings.lastServers[accountId] : START_URL;
  win.loadURL(url);
  return win;
}

function addAccount() {
  let n = settings.accounts.length + 1;
  while (settings.accounts.some((a) => a.id === `acc${n}`)) n += 1;
  const acc = { id: `acc${n}`, name: `Account ${n}` };
  settings.accounts.push(acc);
  saveSettings();
  buildMenu();
  openAccountWindow(acc.id);
}

async function removeAccount(accountId) {
  const { response } = await dialog.showMessageBox({
    type: 'warning',
    buttons: ['Remove', 'Cancel'],
    defaultId: 1,
    message: `Remove "${accountName(accountId)}" from the launcher?`,
    detail: 'This signs that window out and forgets it in the launcher. Your game account itself is not affected.',
  });
  if (response !== 0) return;
  const w = accountWindows.get(accountId);
  if (w && !w.isDestroyed()) w.close();
  await sessionFor(accountId).clearStorageData().catch(() => {});
  settings.accounts = settings.accounts.filter((a) => a.id !== accountId);
  delete settings.lastServers[accountId];
  saveSettings();
  buildMenu();
}

// ---------- help, donations, updates ----------
const repoUrl = config.repo ? `https://github.com/${config.repo}` : '';

function showDonate() {
  const { buyMeACoffee, crypto } = config.donate;
  const buttons = [];
  const actions = [];
  if (buyMeACoffee) { buttons.push('Buy Me a Coffee'); actions.push(() => shell.openExternal(buyMeACoffee)); }
  crypto.forEach((c) => {
    buttons.push(`Copy ${c.name} address`);
    actions.push(() => { clipboard.writeText(c.address); dialog.showMessageBox({ message: `${c.name} address copied`, detail: c.address }); });
  });
  buttons.push('Close');
  dialog.showMessageBox({
    type: 'info',
    buttons,
    cancelId: buttons.length - 1,
    message: 'Support Shinobi Launcher',
    detail: 'The launcher is free and always will be. If it saved your Naruto Online on Mac, a small tip helps keep it working.\n\n'
      + crypto.map((c) => `${c.name}: ${c.address}`).join('\n'),
  }).then(({ response }) => { if (actions[response]) actions[response](); });
}
const hasDonate = () => Boolean(config.donate.buyMeACoffee || config.donate.crypto.length);

function newerVersion(a, b) {
  const pa = a.replace(/^v/, '').split('.').map(Number);
  const pb = b.replace(/^v/, '').split('.').map(Number);
  for (let i = 0; i < 3; i += 1) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0);
  }
  return false;
}
function checkForUpdates(manual) {
  if (!config.repo) return;
  if (!manual && Date.now() - settings.lastUpdateCheck < 24 * 3600 * 1000) return;
  settings.lastUpdateCheck = Date.now();
  saveSettings();
  const req = net.request({ url: `https://api.github.com/repos/${config.repo}/releases/latest`, headers: { Accept: 'application/vnd.github+json' } });
  let body = '';
  req.on('response', (res) => {
    res.on('data', (d) => { body += d; });
    res.on('end', () => {
      let latest = null;
      try { latest = JSON.parse(body); } catch {}
      if (latest && latest.tag_name && newerVersion(latest.tag_name, app.getVersion())) {
        dialog.showMessageBox({
          type: 'info',
          buttons: ['Download', 'Later'],
          message: `Shinobi Launcher ${latest.tag_name.replace(/^v/, '')} is available`,
          detail: `You have ${app.getVersion()}.`,
        }).then(({ response }) => { if (response === 0) shell.openExternal(latest.html_url); });
      } else if (manual) {
        dialog.showMessageBox({ message: 'You are up to date', detail: `Shinobi Launcher ${app.getVersion()}` });
      }
    });
  });
  req.on('error', () => { if (manual) dialog.showMessageBox({ type: 'error', message: 'Could not check for updates' }); });
  req.end();
}

function buildMenu() {
  const focusedWin = () => BrowserWindow.getFocusedWindow();
  const accountItems = settings.accounts.map((a, i) => ({
    label: `Open ${a.name}`,
    accelerator: i < 9 ? `CmdOrCtrl+${i + 1}` : undefined,
    click: () => openAccountWindow(a.id),
  }));
  const removable = settings.accounts.filter((a) => a.id !== 'main');

  const template = [
    {
      label: APP_NAME,
      submenu: [
        { role: 'about' },
        { label: 'Check for Updates…', visible: Boolean(config.repo), click: () => checkForUpdates(true) },
        { type: 'separator' },
        { role: 'hide' }, { role: 'hideOthers' }, { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    { role: 'editMenu' },
    {
      label: 'Game',
      submenu: [
        { label: 'Server List', accelerator: 'CmdOrCtrl+H', click: () => { const w = focusedWin(); if (w) w.loadURL(START_URL); } },
        { role: 'reload' },
        { role: 'forceReload' },
        { type: 'separator' },
        { label: 'Take Screenshot', accelerator: 'CmdOrCtrl+Shift+S', click: () => takeScreenshot(focusedWin()) },
        {
          label: 'Mute Sound', type: 'checkbox', checked: settings.muted, accelerator: 'CmdOrCtrl+Shift+M',
          click: (item) => {
            settings.muted = item.checked; saveSettings();
            BrowserWindow.getAllWindows().forEach((w) => w.webContents.setAudioMuted(settings.muted));
          },
        },
        { role: 'togglefullscreen' },
        { role: 'resetZoom' }, { role: 'zoomIn' }, { role: 'zoomOut' },
        { type: 'separator' },
        {
          label: 'Clean Mode (hide site bar)', type: 'checkbox', checked: settings.cleanMode, accelerator: 'CmdOrCtrl+Shift+C',
          click: (item) => {
            settings.cleanMode = item.checked; saveSettings();
            BrowserWindow.getAllWindows().forEach((w) => applyCleanMode(w.webContents));
          },
        },
        {
          label: 'Open Last Server on Launch', type: 'checkbox', checked: settings.autoResume,
          click: (item) => { settings.autoResume = item.checked; saveSettings(); },
        },
        {
          label: 'Keep Mac Awake While Playing', type: 'checkbox', checked: settings.keepAwake,
          click: (item) => { settings.keepAwake = item.checked; saveSettings(); updateKeepAwake(); },
        },
        {
          label: 'Show Status in Discord', type: 'checkbox', checked: settings.discord, visible: Boolean(config.discordClientId),
          click: (item) => { settings.discord = item.checked; saveSettings(); updateDiscord(); },
        },
      ],
    },
    {
      label: 'Account',
      submenu: [
        { label: 'Sign In with Google / Email…', accelerator: 'CmdOrCtrl+Shift+L', click: () => signInWithHelper(focusedWin()) },
        { type: 'separator' },
        ...accountItems,
        { type: 'separator' },
        { label: 'Add Another Account', accelerator: 'CmdOrCtrl+Shift+N', click: addAccount },
        {
          label: 'Remove Account',
          enabled: removable.length > 0,
          submenu: removable.length ? removable.map((a) => ({ label: a.name, click: () => removeAccount(a.id) })) : [{ label: '—', enabled: false }],
        },
      ],
    },
    { role: 'windowMenu' },
    {
      role: 'help',
      submenu: [
        { label: 'Project Page', visible: Boolean(repoUrl), click: () => shell.openExternal(repoUrl) },
        { label: 'Report a Problem…', visible: Boolean(repoUrl), click: () => shell.openExternal(`${repoUrl}/issues/new/choose`) },
        { label: 'Support the Project ❤️', visible: hasDonate(), click: showDonate },
        { type: 'separator' },
        { label: 'Open Debug Log', click: () => shell.openPath(logFile) },
        { role: 'toggleDevTools' },
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

// ---------- first-run Flash setup ----------
function runFlashSetup() {
  return new Promise((resolve) => {
    const win = new BrowserWindow({
      width: 560,
      height: 460,
      resizable: false,
      title: `${APP_NAME} — Setup`,
      backgroundColor: '#16110d',
      webPreferences: { contextIsolation: true, sandbox: true },
    });
    win.setMenuBarVisibility(false);
    const set = (js) => { if (!win.isDestroyed()) win.webContents.executeJavaScript(js).catch(() => {}); };
    const attempt = async () => {
      try {
        await installFlash(FLASH_PLUGIN, (text, p) => {
          set(`setStatus(${JSON.stringify(text)}, ${p === null ? 'null' : p})`);
          if (!win.isDestroyed()) win.setProgressBar(p === null ? 2 : p); // 2 = indeterminate
        });
        log('flash installed');
        resolve(true);
        if (!win.isDestroyed()) win.close();
      } catch (e) {
        log(`flash setup failed: ${e.message}`);
        set(`setError(${JSON.stringify(`Setup failed: ${e.message}`)})`);
        if (!win.isDestroyed()) win.setProgressBar(-1);
      }
    };
    win.webContents.on('did-navigate-in-page', (_, url) => { if (url.endsWith('#retry')) attempt(); });
    win.on('closed', () => resolve(isFlashInstalled(FLASH_PLUGIN)));
    win.loadFile(path.join(__dirname, 'setup.html')).then(attempt);
  });
}

app.setAboutPanelOptions({
  applicationName: APP_NAME,
  applicationVersion: app.getVersion(),
  copyright: 'Unofficial fan-made launcher. Not affiliated with Oasis Games, Tencent, Bandai Namco or Adobe.',
  credits: `Flash Player ${FLASH_VERSION} © Adobe (downloaded on first run).`,
});

app.whenReady().then(async () => {
  logFile = path.join(app.getPath('userData'), 'debug.log');
  trimLog();
  settingsFile = path.join(app.getPath('userData'), 'settings.json');
  loadSettings();
  log(`--- ${APP_NAME} ${app.getVersion()} started (Electron ${process.versions.electron}, flash ${isFlashInstalled(FLASH_PLUGIN) ? 'installed' : 'missing'}) ---`);

  if (!isFlashInstalled(FLASH_PLUGIN)) {
    const ok = await runFlashSetup();
    // Chromium reads the Flash plugin only at startup, so restart once it is installed.
    if (ok) app.relaunch();
    app.exit(0);
    return;
  }

  relay(POLICY_RELAY_PORT, 843);
  prepareSession(session.defaultSession);
  app.on('before-quit', () => {
    settings.openAccounts = [...accountWindows.keys()];
    saveSettings();
    settings.accounts.forEach((a) => sessionFor(a.id).cookies.flushStore().catch(() => {}));
    discord.stop();
  });

  // One-time login hand-over from pre-release builds.
  const legacyImport = path.join(app.getPath('userData'), 'import-cookies.json');
  if (fs.existsSync(legacyImport)) await importCookies(session.defaultSession, legacyImport).catch((e) => log(e.message));

  buildMenu();
  const toOpen = (settings.openAccounts || ['main']).filter((id) => settings.accounts.some((a) => a.id === id));
  (toOpen.length ? toOpen : ['main']).forEach(openAccountWindow);
  updateDiscord();
  setTimeout(() => checkForUpdates(false), 10000);
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) openAccountWindow('main'); });
});

app.on('window-all-closed', () => app.quit());
