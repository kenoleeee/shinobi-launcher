// First-run installer for Adobe Flash Player (PPAPI) 32.0.0.330.
//
// Flash Player may not be redistributed, so it is NOT shipped with the launcher. Instead, on first
// launch we download Adobe's own macOS installer from the Internet Archive mirror of Adobe's
// official "Flash Player archive", verify it, and unpack only the browser plugin into the user's
// Application Support folder. Nothing is installed system-wide.
//
// Verification, in order:
//   1. SHA-256 of the downloaded disk image must match the known Adobe release.
//   2. The installer package inside must be signed by Adobe (Developer ID, team JQ525L2MZD).
//   3. The unpacked plugin's code signature must be valid and from the same Adobe team.
const { net } = require('electron');
const { execFile } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');
const LZMA = require('lzma/src/lzma_worker.js').LZMA;

const FLASH_VERSION = '32.0.0.330';
// SHINOBI_FLASH_URL may point at a mirror (or a local copy for testing); the SHA-256 check still applies.
const DMG_URL = process.env.SHINOBI_FLASH_URL
  || 'https://archive.org/download/fp_32.0.0.330_archive/fp_32.0.0.330_archive.zip/32_0_r0_330%2Fflashplayer32_0r0_330_macpep.dmg';
const DMG_SHA256 = '69f57b321389de0b2bcc18c3bdf93fc8981a39a3ef5e4e9a073105d6bd2db02b';
const ADOBE_TEAM_ID = 'JQ525L2MZD';

// Electron 11 ships Node 12, which has no fs.rmSync yet.
function rmrf(p) {
  if (fs.existsSync(p)) fs.rmdirSync(p, { recursive: true });
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    execFile(cmd, args, { maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) reject(new Error(`${path.basename(cmd)} failed: ${stderr || err.message}`));
      else resolve(`${stdout}${stderr}`);
    });
  });
}

function download(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const req = net.request({ url, redirect: 'follow' });
    req.on('response', (res) => {
      if (res.statusCode !== 200) { reject(new Error(`Download failed: HTTP ${res.statusCode}`)); return; }
      const total = Number(res.headers['content-length']) || 0;
      let got = 0;
      const out = fs.createWriteStream(file);
      res.on('data', (chunk) => {
        got += chunk.length;
        out.write(chunk);
        if (total) onProgress(got / total);
      });
      res.on('end', () => out.end(resolve));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

function sha256(file) {
  return new Promise((resolve, reject) => {
    const h = crypto.createHash('sha256');
    fs.createReadStream(file).on('data', (d) => h.update(d)).on('end', () => resolve(h.digest('hex'))).on('error', reject);
  });
}

// Adobe packs the plugin as: 11-byte header (byte 7..10 = unpacked size, big endian),
// LZMA properties (5 bytes), then a raw LZMA stream.
function unpackAdobeLzma(buf) {
  const size = buf.readUInt32BE(7);
  const header = Buffer.alloc(13);
  buf.copy(header, 0, 11, 16);
  header.writeUInt32LE(size, 5); // .lzma "alone" header: props + 64-bit size
  const out = LZMA.decompress(Buffer.concat([header, buf.subarray(16)]));
  const result = Buffer.from(Int8Array.from(out).buffer);
  if (result.length !== size) throw new Error('Unexpected Flash plugin size after unpacking');
  return result;
}

// The unpacked data is a simple tree: entries of
//   0x02, flags (0x80 = directory, 0x40 = symlink), name length, name, u32 BE size, content.
function extractAdobeArchive(buf, dest) {
  function walk(pos, end, dir) {
    while (pos < end) {
      if (buf[pos] !== 2) throw new Error('Unexpected Flash plugin archive format');
      const flags = buf[pos + 1];
      const nameLen = buf[pos + 2];
      const name = buf.toString('utf8', pos + 3, pos + 3 + nameLen);
      if (name.includes('/') || name === '..') throw new Error('Unsafe path in Flash plugin archive');
      const size = buf.readUInt32BE(pos + 3 + nameLen);
      const body = pos + 7 + nameLen;
      const target = name ? path.join(dir, name) : dir;
      if (flags & 0x80) {
        fs.mkdirSync(target, { recursive: true });
        walk(body, body + size, target);
      } else if (flags & 0x40) {
        fs.symlinkSync(buf.toString('utf8', body, body + size), target);
      } else {
        fs.writeFileSync(target, buf.subarray(body, body + size));
        if (target.includes(`${path.sep}MacOS${path.sep}`)) fs.chmodSync(target, 0o755);
      }
      pos = body + size;
    }
  }
  walk(0, buf.length, dest);
}

async function verifyAdobeSignature(target) {
  await run('/usr/bin/codesign', ['--verify', '--deep', '--strict', target]);
  const info = await run('/usr/bin/codesign', ['-dv', '--verbose=2', target]);
  if (!info.includes(`TeamIdentifier=${ADOBE_TEAM_ID}`)) throw new Error('Flash plugin is not signed by Adobe');
}

/**
 * Downloads, verifies and installs the plugin to `pluginPath`.
 * onStatus(text, progress 0..1 or null) is called along the way.
 */
async function installFlash(pluginPath, onStatus) {
  const work = fs.mkdtempSync(path.join(os.tmpdir(), 'shinobi-flash-'));
  const dmg = path.join(work, 'flash.dmg');
  const mount = path.join(work, 'mnt');
  const expanded = path.join(work, 'pkg');
  const staging = path.join(work, 'PepperFlashPlayer.plugin');
  let mounted = false;
  try {
    onStatus('Downloading Adobe Flash Player…', 0);
    await download(DMG_URL, dmg, (p) => onStatus('Downloading Adobe Flash Player…', p));

    onStatus('Verifying download…', null);
    if (await sha256(dmg) !== DMG_SHA256) throw new Error('Downloaded file does not match the official Adobe release');

    onStatus('Checking Adobe signature…', null);
    fs.mkdirSync(mount);
    await run('/usr/bin/hdiutil', ['attach', '-nobrowse', '-readonly', '-noautoopen', '-mountpoint', mount, dmg]);
    mounted = true;
    const pkg = path.join(mount, 'Install Adobe Pepper Flash Player.app', 'Contents', 'Resources', 'Adobe Flash Player.pkg');
    const sig = await run('/usr/sbin/pkgutil', ['--check-signature', pkg]);
    if (!sig.includes(`Adobe Systems, Inc. (${ADOBE_TEAM_ID})`)) throw new Error('Installer is not signed by Adobe');
    await run('/usr/sbin/pkgutil', ['--expand-full', pkg, expanded]);

    onStatus('Unpacking Flash plugin (takes up to a minute)…', null);
    const packed = path.join(expanded, 'AdobeFlashPlayerComponent.pkg', 'Payload', 'Library', 'Internet Plug-Ins',
      'PepperFlashPlayer', 'PepperFlashPlayer.plugin.lzma');
    extractAdobeArchive(unpackAdobeLzma(fs.readFileSync(packed)), staging);

    onStatus('Verifying Flash plugin…', null);
    await verifyAdobeSignature(staging);

    rmrf(pluginPath);
    fs.mkdirSync(path.dirname(pluginPath), { recursive: true });
    fs.renameSync(staging, pluginPath);
    onStatus('Done', 1);
  } finally {
    if (mounted) await run('/usr/bin/hdiutil', ['detach', '-force', mount]).catch(() => {});
    rmrf(work);
  }
}

function isFlashInstalled(pluginPath) {
  return fs.existsSync(path.join(pluginPath, 'Contents', 'MacOS', 'PepperFlashPlayer'));
}

module.exports = { installFlash, isFlashInstalled, FLASH_VERSION };
