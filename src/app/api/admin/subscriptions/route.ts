// src/app/api/admin/subscriptions/route.ts
import { NextResponse } from 'next/server';
import { createAdminClient } from '../../../../../utils/supabase/admin';

export async function GET() {
  const supabase = createAdminClient();

  // Select isActive and the related user.uuid
  const { data, error } = await supabase
    .from('subscriptions_details')
    .select(`isActive, user:userId ( uuid )`)  // userId → public.user join
    .eq('isActive', true);

  if (error) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Flatten into { userId: string, isActive: boolean }
  const out = data.map((s: any) => ({
    userId:   s.user.uuid as string,
    isActive: s.isActive as boolean,
  }));

  return NextResponse.json(out);
}
