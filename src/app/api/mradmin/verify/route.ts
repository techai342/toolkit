import { NextResponse } from 'next/server';
import { verifySessionToken } from '@/src/lib/server-crypto';

export async function GET(req: Request) {
  try {
    const cookieHeader = req.headers.get('cookie') || '';
    const match = cookieHeader.match(/mradmin_session=([^;]+)/);
    const token = match ? match[1] : null;

    if (!token) {
      return NextResponse.json({ authenticated: false, error: 'No active session token' }, { status: 401 });
    }

    const { valid, username } = verifySessionToken(token);

    if (!valid || !username) {
      return NextResponse.json({ authenticated: false, error: 'Session expired or signature invalid' }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      username
    });
  } catch (err: any) {
    return NextResponse.json({ authenticated: false, error: 'Session validation error' }, { status: 500 });
  }
}
