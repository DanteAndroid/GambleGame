import crypto from 'node:crypto';

export interface StoredAdminCredential {
  salt: string;
  hash: string;
  claimedAt: string;
}

const SCRYPT_KEYLEN = 64;
const MIN_PASSCODE_LENGTH = 8;
const MAX_PASSCODE_LENGTH = 128;

export function validateNewPasscode(raw: unknown): { ok: true; value: string } | { ok: false; error: string } {
  if (typeof raw !== 'string') {
    return { ok: false, error: '请输入管理员密码' };
  }
  const value = raw.trim();
  if (value.length < MIN_PASSCODE_LENGTH) {
    return { ok: false, error: `管理员密码至少需要 ${MIN_PASSCODE_LENGTH} 位字符` };
  }
  if (value.length > MAX_PASSCODE_LENGTH) {
    return { ok: false, error: `管理员密码不能超过 ${MAX_PASSCODE_LENGTH} 位字符` };
  }
  return { ok: true, value };
}

export function hashPasscode(passcode: string): StoredAdminCredential {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, SCRYPT_KEYLEN).toString('hex');
  return {
    salt,
    hash: derived,
    claimedAt: new Date().toISOString(),
  };
}

export function verifyPasscodeHash(
  candidate: string,
  credential: StoredAdminCredential | null | undefined
): boolean {
  if (!credential || !credential.salt || !credential.hash) return false;
  try {
    const expected = Buffer.from(credential.hash, 'hex');
    const actual = crypto.scryptSync(candidate, credential.salt, expected.length);
    if (expected.length !== actual.length) return false;
    return crypto.timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
}

/**
 * Constant-time comparison against a server-side process.env passcode
 * using fixed-length SHA-256 digests so password length is not leaked.
 */
export function verifyEnvPasscode(candidate: string, envPasscode: string): boolean {
  if (!envPasscode) return false;
  const a = crypto.createHash('sha256').update(candidate, 'utf8').digest();
  const b = crypto.createHash('sha256').update(envPasscode, 'utf8').digest();
  return crypto.timingSafeEqual(a, b);
}

export function extractBearerToken(authHeader: string | string[] | undefined): string | null {
  if (!authHeader || Array.isArray(authHeader)) return null;
  const match = /^Bearer\s+([A-Za-z0-9._-]{32,128})$/.exec(authHeader.trim());
  return match ? match[1] : null;
}
