// src/app/api/admin/login/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../../utils/supabase/admin';

interface Body {
  email: string;
  password: string;
}

export async function POST(request: Request) {
  const { email, password } = (await request.json()) as Body;
  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error || !data.session) {
    return NextResponse.json(
      { error: error?.message || 'Login failed' },
      { status: 401 }
    );
  }

  // No 'domain' here – defaults to current host (admin.woortec.local)
  const res = NextResponse.json({ ok: true });
  res.cookies.set('accessToken', data.session.access_token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    path:     '/',
    maxAge:   data.session.expires_in,
    sameSite: 'lax'
  });

  return res;
}
