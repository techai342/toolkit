interface RateLimitEntry {
  failedAttempts: number;
  lockoutUntil: number | null;
  lastAttemptAt: number;
}

// In-memory store for tracking IP failed attempts
const ipLimitStore = new Map<string, RateLimitEntry>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_DURATION_MS = 30 * 60 * 1000;  // 30 minutes window

/**
 * Clean up stale entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [ip, entry] of ipLimitStore.entries()) {
    if (entry.lockoutUntil && entry.lockoutUntil < now) {
      ipLimitStore.delete(ip);
    } else if (now - entry.lastAttemptAt > WINDOW_DURATION_MS) {
      ipLimitStore.delete(ip);
    }
  }
}

/**
 * Check if an IP is currently rate-limited or locked out
 */
export function checkRateLimit(ip: string): { 
  allowed: boolean; 
  remainingAttempts: number; 
  lockoutRemainingMinutes?: number 
} {
  cleanupExpiredEntries();
  const now = Date.now();
  const entry = ipLimitStore.get(ip);

  if (!entry) {
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  // Check active lockout
  if (entry.lockoutUntil && entry.lockoutUntil > now) {
    const remainingMs = entry.lockoutUntil - now;
    const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
    return { 
      allowed: false, 
      remainingAttempts: 0, 
      lockoutRemainingMinutes: remainingMinutes 
    };
  }

  // If lockout expired, reset
  if (entry.lockoutUntil && entry.lockoutUntil <= now) {
    ipLimitStore.delete(ip);
    return { allowed: true, remainingAttempts: MAX_FAILED_ATTEMPTS };
  }

  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - entry.failedAttempts);
  return { allowed: remaining > 0, remainingAttempts: remaining };
}

/**
 * Record a failed login attempt for an IP
 */
export function recordFailedAttempt(ip: string): { 
  lockedOut: boolean; 
  remainingAttempts: number; 
  lockoutRemainingMinutes?: number 
} {
  const now = Date.now();
  const entry = ipLimitStore.get(ip) || { failedAttempts: 0, lockoutUntil: null, lastAttemptAt: now };

  entry.failedAttempts += 1;
  entry.lastAttemptAt = now;

  if (entry.failedAttempts >= MAX_FAILED_ATTEMPTS) {
    entry.lockoutUntil = now + LOCKOUT_DURATION_MS;
    ipLimitStore.set(ip, entry);
    return { 
      lockedOut: true, 
      remainingAttempts: 0, 
      lockoutRemainingMinutes: 15 
    };
  }

  ipLimitStore.set(ip, entry);
  const remaining = Math.max(0, MAX_FAILED_ATTEMPTS - entry.failedAttempts);
  return { 
    lockedOut: false, 
    remainingAttempts: remaining 
  };
}

/**
 * Reset rate limit upon successful authentication
 */
export function resetRateLimit(ip: string) {
  ipLimitStore.delete(ip);
}
