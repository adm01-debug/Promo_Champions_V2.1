// E2E real-browser test for PR #175 audioToMp3 logic (lamejs via CDN script tag)
// Reproduces the EXACT sequence of src/utils/audioToMp3.ts:
//   PCM -> Int16 -> lamejs.Mp3Encoder(1ch, 44100, 128kbps) chunks of 1152 -> flush -> Blob
// Runs in REAL Chromium (Playwright). Saves base64 + mp3 for ffprobe validation in WSL.
const path = require('path');
const fs = require('fs');

const OUT_DIR = __dirname;
(async () => {
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // 0) Load lamejs 1.2.1 from CDN via <script> tag exactly like the app does
  await page.goto('about:blank');
  await page.addScriptTag({ url: 'https://cdn.jsdelivr.net/npm/lamejs@1.2.1/lame.min.js' });
  const env = await page.evaluate(() => ({
    lamejs: typeof window.lamejs,
    Mp3Encoder: typeof (window.lamejs && window.lamejs.Mp3Encoder),
    ua: navigator.userAgent,
  }));
  console.log('ENV:', JSON.stringify(env));

  // helpers in page: synthetic PCM sine + encode (mirror of audioToMp3.ts)
  await page.evaluate(() => {
    window.__mkpcm = (dur) => {
      const sr = 44100, n = sr * dur;
      const pcm = new Float32Array(n);
      for (let i = 0; i < n; i++) pcm[i] = 0.5 * Math.sin(2 * Math.PI * 440 * i / sr);
      return pcm;
    };
    window.__enc = (pcm) => {
      const sr = 44100, n = pcm.length;
      const t0 = performance.now();
      const enc = new lamejs.Mp3Encoder(1, sr, 128); // mono, 44100, 128kbps
      const i16 = new Int16Array(n);
      for (let i = 0; i < n; i++) {
        const s = Math.max(-1, Math.min(1, pcm[i]));
        i16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      const chunks = []; const B = 1152;
      for (let i = 0; i < n; i += B) {
        const b = enc.encodeBuffer(i16.subarray(i, Math.min(i + B, n)));
        if (b.length) chunks.push(new Uint8Array(b));
      }
      const f = enc.flush(); if (f.length) chunks.push(new Uint8Array(f));
      const ms = Math.round((performance.now() - t0) * 10) / 10;
      const tot = chunks.reduce((a, c) => a + c.length, 0);
      const out = new Uint8Array(tot); let o = 0;
      for (const c of chunks) { out.set(c, o); o += c.length; }
      let bin = '';
      for (let i = 0; i < out.length; i += 0x8000)
        bin += String.fromCharCode.apply(null, out.subarray(i, i + 0x8000));
      return { ms, bytes: tot, b64: btoa(bin) };
    };
  });

  // 1+2+3) encode 3s synthetic audio
  const r3 = await page.evaluate(() => {
    const r = window.__enc(window.__mkpcm(3));
    return { ms: r.ms, bytes: r.bytes, b64: r.b64 };
  });
  const mp3 = Buffer.from(r3.b64, 'base64');
  const mp3Path = path.join(OUT_DIR, 'browser_test_3s.mp3');
  fs.writeFileSync(mp3Path, mp3);
  fs.writeFileSync(path.join(OUT_DIR, 'browser_test_3s.b64'), r3.b64);
  console.log('ENC_3S:', JSON.stringify({ ms: r3.ms, bytes: r3.bytes, path: mp3Path }));

  // 5) failure case: decodeAudioData on random bytes -> catch -> null fallback
  const fail = await page.evaluate(async () => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const rnd = crypto.getRandomValues(new Uint8Array(4096));
      const buf = await ctx.decodeAudioData(rnd.buffer);
      return { result: 'DECODED_UNEXPECTEDLY', duration: buf.duration };
    } catch (e) {
      return { result: null, err: String(e).slice(0, 160) }; // util returns null in catch
    }
  });
  console.log('FAILTEST:', JSON.stringify(fail));

  // extra: decodeAudioData success path on the generated MP3 (decode->encode roundtrip sanity)
  const roundtrip = await page.evaluate(async (b64) => {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    try {
      const bin = atob(b64);
      const u8 = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      const buf = await ctx.decodeAudioData(u8.buffer);
      return { decoded: true, duration: Math.round(buf.duration * 100) / 100, sr: buf.sampleRate, ch: buf.numberOfChannels };
    } catch (e) { return { decoded: false, err: String(e).slice(0, 160) }; }
  }, r3.b64);
  console.log('ROUNDTRIP_DECODE_MP3:', JSON.stringify(roundtrip));

  // 6) 30s encode timing
  const r30 = await page.evaluate(() => {
    const r = window.__enc(window.__mkpcm(30));
    return { ms: r.ms, bytes: r.bytes };
  });
  console.log('ENC_30S:', JSON.stringify(r30));

  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(1); });
