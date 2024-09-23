import { NextResponse } from 'next/server';

import { createClient } from '../../../../utils/supabase/server';

export async function GET() {
  const supabase = createClient();
  const updateuser = await supabase.from('user').update({
    isQuery: false,
  });

  return NextResponse.json({ data: updateuser });
}
