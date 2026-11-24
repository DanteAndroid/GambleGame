import assert from 'node:assert/strict';
import test from 'node:test';
import { GAMBLE_RECORDS, MANGA_SERIES, UPCOMING_MANGA_SHELF } from '../data/gambles';
import {
  applyOverridesToGambles,
  applyOverridesToSeries,
  detectImageFormat,
  EMPTY_OVERRIDES,
  isSafeLocalImagePath,
  isStrictLocalhostRequest,
  sanitizeCopyPatch,
} from './submissions';

test('isStrictLocalhostRequest allows genuine direct loopback requests only', () => {
  assert.equal(
    isStrictLocalhostRequest({
      remoteAddress: '127.0.0.1',
      host: 'localhost:3000',
      method: 'GET',
    }),
    true
  );
  assert.equal(
    isStrictLocalhostRequest({
      remoteAddress: '::1',
      host: '[::1]:3000',
      origin: 'http://[::1]:3000',
      method: 'POST',
    }),
    true
  );
  assert.equal(
    isStrictLocalhostRequest({
      remoteAddress: '::ffff:127.0.0.1',
      host: '127.0.0.1:3000',
      origin: 'http://127.0.0.1:3000',
      method: 'POST',
    }),
    true
  );
});

test('isStrictLocalhostRequest blocks remote IPs, proxied requests, non-local hosts, and cross-origin POSTs', () => {
  // Remote socket IP
  assert.equal(
    isStrictLocalhostRequest({
      remoteAddress: '203.0.113.10',
      host: 'localhost:3000',
      method: 'GET',
    }),
    false
  );

  // Reverse-proxied request even when socket is local loopback
  assert.equal(
    isStrictLocalhostRequest({
      remoteAddress: '127.0.0.1',
      host: 'localhost:3000',
      forwardedFor: '198.51.100.24',
      method: 'GET',
    }),
    false
  );

  // Public preview domain host
  assert.equal(
    isStrictLocalhostRequest({
      remoteAddress: '127.0.0.1',
      host: 'ais-pre-example.run.app',
      method: 'GET',
    }),
    false
  );

  // Cross-origin CSRF attempt from a remote site to localhost POST endpoint
  assert.equal(
    isStrictLocalhostRequest({
      remoteAddress: '127.0.0.1',
      host: 'localhost:3000',
      origin: 'https://evil.example.com',
      method: 'POST',
    }),
    false
  );
});

test('detectImageFormat accepts PNG/JPEG/WebP/GIF magic bytes and rejects SVG/HTML', () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  const jpg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 0, 0, 0, 0, 0, 0, 0, 0]);
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>');

  assert.deepEqual(detectImageFormat(png), { ext: 'png', mime: 'image/png' });
  assert.deepEqual(detectImageFormat(jpg), { ext: 'jpg', mime: 'image/jpeg' });
  assert.equal(detectImageFormat(svg), null);
});

test('sanitizeCopyPatch keeps whitelisted fields and drops unknown or invalid values', () => {
  const clean = sanitizeCopyPatch({
    title: '  空气扑克（修订）  ',
    basicRules: ['步骤一', '   ', '步骤二'],
    injectedField: 'should-ignore',
  });
  assert.deepEqual(clean, {
    title: '空气扑克（修订）',
    basicRules: ['步骤一', '步骤二'],
  });

  assert.equal(sanitizeCopyPatch({ title: '' }), null);
  assert.equal(sanitizeCopyPatch({ basicRules: [] }), null);
});

test('applyOverridesToGambles and applyOverridesToSeries merge approved overrides safely', () => {
  const safeUpload = '/api/uploads/11111111-2222-4333-8444-555555555555.png';
  const safeGallery = '/api/uploads/aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee.jpg';

  assert.equal(isSafeLocalImagePath(safeUpload), true);
  assert.equal(isSafeLocalImagePath('javascript:alert(1)'), false);
  assert.equal(isSafeLocalImagePath('/api/uploads/../secret.png'), false);

  const mergedGambles = applyOverridesToGambles(GAMBLE_RECORDS, {
    ...EMPTY_OVERRIDES,
    gambleArtworks: { 'air-poker': safeUpload },
    gambleGalleries: { 'air-poker': [safeGallery] },
    gambleCopies: { 'air-poker': { oneLineRule: '自定义修订规则' } },
  });

  const airPoker = mergedGambles.find((g) => g.id === 'air-poker');
  assert.ok(airPoker);
  assert.equal(airPoker.artworkUrl, safeUpload);
  assert.equal(airPoker.galleryUrls?.[0], safeUpload);
  assert.ok(airPoker.galleryUrls?.includes(safeGallery));
  assert.equal(airPoker.oneLineRule, '自定义修订规则');

  const { liveSeries, liveLookup } = applyOverridesToSeries(
    MANGA_SERIES,
    UPCOMING_MANGA_SHELF,
    {
      ...EMPTY_OVERRIDES,
      seriesCovers: { usogui: safeUpload, akagi: safeGallery },
    }
  );
  assert.equal(liveSeries[0].coverUrl, safeUpload);
  assert.equal(liveLookup.akagi.coverUrl, safeGallery);
});
