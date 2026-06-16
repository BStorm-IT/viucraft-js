#!/usr/bin/env node
/**
 * URL contract test (VC-QA-01).
 *
 * Proves the SDK's generated delivery URLs are valid against a live VIUCraft tenant: for
 * every operation it builds the URL in BOTH the long (underscore) and short (dash) form,
 * fetches each, and fails on any non-200. The SDK is the source of the URLs (the thing under
 * test); a fixture is uploaded/deleted via raw HTTP purely as setup/teardown.
 *
 * Gated on credentials so it is a no-op in normal CI:
 *   VIUCRAFT_TEST_KEY    a vc_test_* (or vc_live_*) API key
 *   VIUCRAFT_SUBDOMAIN   the tenant subdomain (e.g. "acme")
 *   VIUCRAFT_HOST        optional override of the delivery host
 *                        (default https://<subdomain>.viucraft.com)
 *
 * Run after building the SDK:  npm run build && npm run contract:urls
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ViucraftClient } from '../dist/index.js';

const KEY = process.env.VIUCRAFT_TEST_KEY;
const SUBDOMAIN = process.env.VIUCRAFT_SUBDOMAIN;
const HOST = process.env.VIUCRAFT_HOST || (SUBDOMAIN ? `https://${SUBDOMAIN}.viucraft.com` : null);

if (!KEY || !SUBDOMAIN) {
  console.log('⏭  URL contract test skipped — set VIUCRAFT_TEST_KEY and VIUCRAFT_SUBDOMAIN to run.');
  process.exit(0);
}

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixture = readFileSync(join(__dirname, 'fixtures', 'sample.jpg'));

const client = new ViucraftClient({ apiKey: KEY, subdomain: SUBDOMAIN });

// Each case is a builder recipe. The fixture is downscaled to keep the grammar (short vs long)
// the only variable — never upscale, which the server rejects independently of the grammar.
const cases = [
  ['canonical', (b) => b],
  ['resize', (b) => b.resize(200, 150)],
  ['crop', (b) => b.crop(0, 0, 200, 200)],
  ['rotate', (b) => b.rotate(90)],
  ['grayscale', (b) => b.grayscale()],
  ['invert', (b) => b.invert()],
  ['blur', (b) => b.blur(2)],
  ['sharpen', (b) => b.sharpen(1.2)],
  ['emboss', (b) => b.emboss()],
  ['median', (b) => b.median(3)],
  ['brightness', (b) => b.brightness(1.2)],
  ['contrast', (b) => b.contrast(1.2)],
  ['gamma', (b) => b.gamma(2.2)],
  ['quality', (b) => b.quality(80)],
  ['thumbnail', (b) => b.thumbnail(150, 150)],
  ['thumbnail+crop', (b) => b.thumbnail(150, 150, 'cover')],
  ['smartCrop', (b) => b.smartCrop(200, 200)],
  ['flip', (b) => b.flip('horizontal')],
  ['tint', (b) => b.tint('#FFD700', '#1A1A2E')],
  ['colorize', (b) => b.colorize('#FF0000', 1)],
  ['vignette', (b) => b.vignette(0.3, 0.7)],
  ['pixelate', (b) => b.pixelate(10)],
  ['noise', (b) => b.noise('gaussian', 0.2)],
  ['edge', (b) => b.edge()],
  ['autoEnhance', (b) => b.autoEnhance(0.5)],
  ['border', (b) => b.border({ width: 10, color: '#000000' })],
  ['strip', (b) => b.metadataStrip()],
  ['placeholder', (b) => b.placeholder(32)],
  ['palette', (b) => b.palette(5)],
  ['watermark(text)', (b) => b.watermark({ text: 'Hello', opacity: 0.5 })],
  ['chain', (b) => b.resize(200, 150).sharpen(1.2).quality(80)],
];

async function uploadFixture() {
  const form = new FormData();
  form.append('image', new Blob([fixture], { type: 'image/jpeg' }), 'sample.jpg');
  const res = await fetch(`${HOST}/upload`, { method: 'POST', headers: { 'X-API-Key': KEY }, body: form });
  if (!res.ok) {
    throw new Error(`Fixture upload failed: HTTP ${res.status} ${await res.text()}`);
  }
  return (await res.json()).image_id;
}

async function deleteFixture(id) {
  await fetch(`${HOST}/api/images/${id}`, { method: 'DELETE', headers: { 'X-API-Key': KEY } }).catch(() => {});
}

async function check(label, mode, url) {
  const res = await fetch(url, { method: 'GET' });
  const ok = res.status === 200;
  console.log(`  ${ok ? '✓' : '✗'} ${label.padEnd(16)} ${mode.padEnd(5)} ${res.status}  ${url}`);
  return ok;
}

const imageId = await uploadFixture();
console.log(`Uploaded fixture ${imageId}\nProbing ${cases.length} operations × {long, short}…\n`);

const failures = [];
try {
  for (const [label, recipe] of cases) {
    // setFormat keeps the extension deterministic (.jpg) across forms.
    const long = recipe(client.image(imageId)).setFormat('jpg').toURL();
    const short = recipe(client.image(imageId).useShort()).setFormat('jpg').toURL();
    if (!(await check(label, 'long', long))) failures.push(`${label} (long)`);
    if (!(await check(label, 'short', short))) failures.push(`${label} (short)`);
  }
} finally {
  await deleteFixture(imageId);
  console.log(`\nDeleted fixture ${imageId}`);
}

if (failures.length > 0) {
  console.error(`\n✗ URL contract test FAILED — ${failures.length} non-200:\n   ${failures.join('\n   ')}`);
  process.exit(1);
}
console.log(`\n✓ URL contract test PASSED — all ${cases.length * 2} generated URLs returned 200.`);
