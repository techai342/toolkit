import { NextResponse } from 'next/server';
import { supabase } from '@/src/lib/supabase';
import { hashPassword, verifyPassword, verifySessionToken, signSessionToken } from '@/src/lib/server-crypto';

export async function POST(req: Request) {
  try {
    // 1. Authenticate caller's session cookie
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/mradmin_session=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized. Active session required.' }, { status: 401 });
    }

    const session = verifySessionToken(token);
    if (!session.valid) {
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, newUsername, newPassword } = body;

    if (!currentPassword || !newUsername || !newPassword) {
      return NextResponse.json({ error: 'Current password, new username, and new password are required.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long.' }, { status: 400 });
    }

    // 2. Fetch existing credentials from database
    const { data, error } = await supabase
      .from('super_admin_auth')
      .select('*')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Database record not found.' }, { status: 500 });
    }

    // 3. Verify current password
    let isCurrentValid = false;
    if (data.password_hash && data.salt) {
      isCurrentValid = verifyPassword(currentPassword, data.password_hash, data.salt, data.iterations || 100000);
    } else {
      isCurrentValid = currentPassword === (data.password || 'saqibadmin');
    }

    if (!isCurrentValid) {
      return NextResponse.json({ error: 'Current password verification failed. Access denied.' }, { status: 403 });
    }

    // 4. Cryptographically Hash New Password (PBKDF2 + SHA-256 + 32-Byte Salt + 100,000 Iterations)
    const { hash: newHash, salt: newSalt, iterations } = hashPassword(newPassword);

    const { error: updateError } = await supabase
      .from('super_admin_auth')
      .update({
        username: newUsername.trim(),
        password: newPassword, // Kept for backward compatibility if needed
        password_hash: newHash,
        salt: newSalt,
        iterations: iterations,
        last_password_change: new Date().toISOString()
      })
      .eq('id', 1);

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update credentials in database: ' + updateError.message }, { status: 500 });
    }

    // 5. Issue new session token
    const newSessionToken = signSessionToken(newUsername.trim());
    const response = NextResponse.json({
      success: true,
      message: 'Super Admin credentials cryptographically updated with PBKDF2 salt & hash!',
      newUsername: newUsername.trim()
    });

    response.cookies.set('mradmin_session', newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60
    });

    return response;
  } catch (err: any) {
    console.error("Update credentials error:", err);
    return NextResponse.json({ error: 'Failed to update credentials.' }, { status: 500 });
  }
}
