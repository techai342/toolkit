import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { hashPassword, verifyPassword, signSessionToken } from '@/src/lib/server-crypto';
import { checkRateLimit, recordFailedAttempt, resetRateLimit } from '@/src/lib/rate-limiter';

function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    
    // 1. Check Rate Limit & Lockout Status
    const limitCheck = checkRateLimit(ip);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        { 
          error: `Account temporarily locked due to repeated failed attempts. Please retry in ${limitCheck.lockoutRemainingMinutes || 15} minutes.`,
          lockedOut: true,
          lockoutRemainingMinutes: limitCheck.lockoutRemainingMinutes 
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { username, password } = body;

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
    }

    // 2. Fetch Super Admin Auth Credentials
    const { data, error } = await supabase
      .from('super_admin_auth')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'System configuration error. Please run database setup.' }, { status: 500 });
    }

    const targetUsername = data.username || 'saqib';
    let isPasswordValid = false;

    // 3. Cryptographic Verification (PBKDF2 with SHA-256 and constant-time check)
    if (data.password_hash && data.salt) {
      isPasswordValid = verifyPassword(password, data.password_hash, data.salt, data.iterations || 100000);
    } else {
      // Automatic upgrade transition for legacy plaintext password
      const fallbackPass = data.password || 'saqibadmin';
      if (password === fallbackPass) {
        isPasswordValid = true;
        // Upgrade database to PBKDF2 hash immediately
        try {
          const { hash, salt, iterations } = hashPassword(password);
          await supabase.from('super_admin_auth').update({
            password_hash: hash,
            salt: salt,
            iterations: iterations,
            last_password_change: new Date().toISOString()
          }).eq('id', 1);
        } catch (upgradeErr) {
          console.error("Auto-upgrade error:", upgradeErr);
        }
      }
    }

    const isUsernameValid = username.trim().toLowerCase() === targetUsername.trim().toLowerCase();

    // 4. Handle Mismatch / Failed Attempt
    if (!isUsernameValid || !isPasswordValid) {
      const failStatus = recordFailedAttempt(ip);
      if (failStatus.lockedOut) {
        return NextResponse.json(
          {
            error: `Too many failed attempts! Security system locked out this IP for 15 minutes.`,
            lockedOut: true,
            remainingAttempts: 0
          },
          { status: 429 }
        );
      }
      return NextResponse.json(
        {
          error: `Invalid credentials. Clearance denied. (${failStatus.remainingAttempts} attempts remaining before lockout)`,
          lockedOut: false,
          remainingAttempts: failStatus.remainingAttempts
        },
        { status: 401 }
      );
    }

    // 5. Successful Authentication
    resetRateLimit(ip);
    const sessionToken = signSessionToken(targetUsername);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful. Level 10 Clearance granted.',
      username: targetUsername
    });

    // Set secure, httpOnly, sameSite=strict cookie
    response.cookies.set('mradmin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (err: any) {
    console.error("Login route error:", err);
    return NextResponse.json({ error: 'Server authentication error.' }, { status: 500 });
  }
}
