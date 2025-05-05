// src/app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../../utils/supabase/admin';

export async function GET(request: Request) {
  const supabase = createAdminClient();
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search')?.toLowerCase() || '';

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    page:    1,
    perPage: 1000,
  });
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  const allUsers = authData.users;
  const filtered = search
    ? allUsers.filter((u) => u.email?.toLowerCase().includes(search))
    : allUsers;

  const payload = filtered.map((u) => ({
    id:         u.id,
    email:      u.email!,
    suspended:  u.user_metadata?.suspended === true,
    created_at: u.created_at!,
  }));

  return NextResponse.json(payload);
}

export async function PATCH(request: Request) {
  const { id, suspended } = await request.json();
  if (!id || suspended === undefined) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { suspended },
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
