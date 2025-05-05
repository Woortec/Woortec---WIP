import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../../utils/supabase/admin';

export async function GET(req: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(req.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('username', username)
    .single();

  if (profileError || !profile?.id) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const { data: admin, error: adminError } = await supabase
    .from('admins')
    .select('email')
    .eq('id', profile.id)
    .single();

  if (adminError || !admin?.email) {
    return NextResponse.json({ error: 'Admin not found' }, { status: 403 });
  }

  return NextResponse.json({ email: admin.email });
}
