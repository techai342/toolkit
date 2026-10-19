import crypto from 'crypto';

const PBKDF2_ITERATIONS = 100000;
const KEY_LEN = 64; // 512 bits
const DIGEST = 'sha256';

// Cryptographic Master Secret for HMAC session token signing
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'mr-saqib-enterprise-cryptographic-master-key-2026-secure';

/**
 * Hash a password using PBKDF2 with SHA-256 and a cryptographically secure 32-byte salt
 */
export function hashPassword(password: string): { hash: string; salt: string; iterations: number } {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, PBKDF2_ITERATIONS, KEY_LEN, DIGEST).toString('hex');
  return { hash, salt, iterations: PBKDF2_ITERATIONS };
}

/**
 * Verify a password using timing-safe constant-time buffer comparison to prevent side-channel attacks
 */
export function verifyPassword(password: string, storedHash: string, salt: string, iterations: number = PBKDF2_ITERATIONS): boolean {
  try {
    const computedHash = crypto.pbkdf2Sync(password, salt, iterations, KEY_LEN, DIGEST).toString('hex');
    const bufA = Buffer.from(computedHash, 'hex');
    const bufB = Buffer.from(storedHash, 'hex');
    
    if (bufA.length !== bufB.length) {
      return false;
    }
    
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

/**
 * Sign a session payload with HMAC-SHA256 for tamper-proof session cookies
 */
export function signSessionToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      username,
      iat: Date.now(),
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })
  ).toString('base64url');

  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

/**
 * Verify HMAC-SHA256 signature and validate session expiry in constant time
 */
export function verifySessionToken(token: string): { valid: boolean; username?: string } {
  try {
    if (!token || typeof token !== 'string') return { valid: false };
    
    const parts = token.split('.');
    if (parts.length !== 2) return { valid: false };
    
    const [payloadB64, signature] = parts;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(payloadB64).digest('base64url');
    
    const sigA = Buffer.from(signature);
    const sigB = Buffer.from(expectedSig);
    
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return { valid: false };
    }
    
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (Date.now() > payload.exp) {
      return { valid: false };
    }
    
    return { valid: true, username: payload.username };
  } catch {
    return { valid: false };
  }
}
