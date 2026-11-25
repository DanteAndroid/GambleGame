import assert from 'node:assert/strict';
import test from 'node:test';
import {
  extractBearerToken,
  hashPasscode,
  validateNewPasscode,
  verifyEnvPasscode,
  verifyPasscodeHash,
} from './adminAuth';

test('validateNewPasscode enforces minimum and maximum length', () => {
  assert.equal(validateNewPasscode('1234567').ok, false);
  assert.equal(validateNewPasscode('   ').ok, false);
  assert.equal(validateNewPasscode('a'.repeat(129)).ok, false);

  const valid = validateNewPasscode('  usogui-admin-2026  ');
  assert.equal(valid.ok, true);
  if (valid.ok) {
    assert.equal(valid.value, 'usogui-admin-2026');
  }
});

test('hashPasscode and verifyPasscodeHash verify matching passcodes and reject wrong ones', () => {
  const cred = hashPasscode('my-strong-passcode');
  assert.equal(verifyPasscodeHash('my-strong-passcode', cred), true);
  assert.equal(verifyPasscodeHash('wrong-passcode', cred), false);
  assert.equal(verifyPasscodeHash('my-strong-passcode', null), false);
});

test('verifyEnvPasscode performs constant-time verification cleanly', () => {
  assert.equal(verifyEnvPasscode('secret-999', 'secret-999'), true);
  assert.equal(verifyEnvPasscode('secret-99', 'secret-999'), false);
  assert.equal(verifyEnvPasscode('', ''), false);
});

test('extractBearerToken parses valid Bearer headers and rejects malformed ones', () => {
  const token = 'a'.repeat(64);
  assert.equal(extractBearerToken(`Bearer ${token}`), token);
  assert.equal(extractBearerToken(`Bearer   ${token}  `), token);
  assert.equal(extractBearerToken('Bearer short'), null);
  assert.equal(extractBearerToken('Basic abc123'), null);
  assert.equal(extractBearerToken(undefined), null);
});
