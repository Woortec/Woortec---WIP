import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Overwrite the cookie with an immediate expiry
  res.cookies.set('accessToken', '', {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
    expires:  new Date(0),
    sameSite: 'lax',
  });
  return res;
}
