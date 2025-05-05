import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../../utils/supabase/admin';

export async function POST(req: Request) {
  const supabase = createAdminClient();
  const { username, password } = await req.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Missing username or password' }, { status: 400 });
  }

  const fakeEmail = `${username}@admin.local`;
  const { data, error } = await supabase.auth.signUp({ email: fakeEmail, password });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message || 'Signup failed' }, { status: 400 });
  }

  const userId = data.user.id;

  // Upsert into related tables
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({ id: userId, username });

  const { error: adminError } = await supabase
    .from('admins')
    .upsert({ id: userId, email: fakeEmail });

  if (profileError || adminError) {
    return NextResponse.json({ error: 'Signup succeeded, but DB insert failed' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
