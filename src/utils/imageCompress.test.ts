import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateResizedDimensions,
  estimateDataUrlBytes,
  formatByteSize,
} from './imageCompress';

test('calculateResizedDimensions preserves aspect ratio and never upscales', () => {
  // Already within bounds -> unchanged
  assert.deepEqual(calculateResizedDimensions(800, 1138, 1200, 1800), {
    width: 800,
    height: 1138,
  });

  // Width exceeds limit -> scaled proportionally
  assert.deepEqual(calculateResizedDimensions(2400, 3200, 1200, 1800), {
    width: 1200,
    height: 1600,
  });

  // Height exceeds limit more strictly than width -> clamped by height
  assert.deepEqual(calculateResizedDimensions(1000, 3600, 1200, 1800), {
    width: 500,
    height: 1800,
  });
});

test('estimateDataUrlBytes and formatByteSize produce accurate estimates', () => {
  // "hello" in base64 is "aGVsbG8=" (5 bytes)
  assert.equal(estimateDataUrlBytes('data:image/webp;base64,aGVsbG8='), 5);
  assert.equal(formatByteSize(512), '512 B');
  assert.equal(formatByteSize(245 * 1024), '245 KB');
  assert.equal(formatByteSize(1.5 * 1024 * 1024), '1.50 MB');
});
