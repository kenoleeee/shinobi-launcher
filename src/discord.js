// Minimal Discord Rich Presence client over Discord's local IPC socket (no dependencies).
// Frame format: int32 LE opcode, int32 LE length, JSON payload. Op 0 = handshake, 1 = frame.
const net = require('net');
const os = require('os');
const path = require('path');

let sock = null;
let ready = false;
let clientId = null;
let pending = null; // last activity to send once connected
let retryTimer = null;
let connecting = false;
let log = () => {};

function socketPaths() {
  const base = process.env.XDG_RUNTIME_DIR || process.env.TMPDIR || process.env.TMP || os.tmpdir();
  return Array.from({ length: 10 }, (_, i) => path.join(base, `discord-ipc-${i}`));
}

function encode(op, data) {
  const json = Buffer.from(JSON.stringify(data));
  const header = Buffer.alloc(8);
  header.writeInt32LE(op, 0);
  header.writeInt32LE(json.length, 4);
  return Buffer.concat([header, json]);
}

function send() {
  if (!ready || !sock) return;
  sock.write(encode(1, {
    cmd: 'SET_ACTIVITY',
    args: { pid: process.pid, activity: pending },
    nonce: `${Date.now()}-${Math.random()}`,
  }));
}

function connect(i = 0) {
  const paths = socketPaths();
  if (i >= paths.length) { connecting = false; scheduleRetry(); return; }
  connecting = true;
  const s = net.createConnection(paths[i]);
  s.once('error', () => { s.destroy(); connect(i + 1); });
  s.once('connect', () => {
    connecting = false;
    sock = s;
    s.removeAllListeners('error');
    s.on('error', () => {});
    s.on('close', () => { sock = null; ready = false; scheduleRetry(); });
    s.on('data', (buf) => {
      // First reply after the handshake is the READY dispatch.
      if (!ready && buf.length >= 8) { ready = true; log('discord: connected'); send(); }
    });
    s.write(encode(0, { v: 1, client_id: clientId }));
  });
}

function scheduleRetry() {
  if (!clientId || retryTimer) return;
  retryTimer = setTimeout(() => { retryTimer = null; if (clientId && !sock) connect(); }, 30000);
}

function start(id, logger) {
  if (logger) log = logger;
  if (clientId === id && (sock || retryTimer || connecting)) return;
  stop();
  clientId = id;
  connect();
}

function setActivity(activity) {
  pending = activity;
  send();
}

function stop() {
  clientId = null;
  ready = false;
  clearTimeout(retryTimer);
  retryTimer = null;
  if (sock) { sock.destroy(); sock = null; }
}

module.exports = { start, setActivity, stop };
