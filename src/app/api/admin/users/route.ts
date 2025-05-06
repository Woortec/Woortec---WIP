import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../../utils/supabase/admin'

export async function GET(request: Request) {
  const supabase = createAdminClient()
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.toLowerCase() || ''

  const { data: authData, error: authError } = await supabase.auth.admin.listUsers({
    page:    1,
    perPage: 1000,
  })
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 })
  }

  const filtered = search
    ? authData.users.filter(u => u.email?.toLowerCase().includes(search))
    : authData.users

  const payload = filtered.map(u => {
    const meta = u.user_metadata as any
    const providers = (u.app_metadata as any)?.providers || (u as any).providers || []
    return {
      id:               u.id,
      email:            u.email!,
      name:             meta?.full_name || meta?.name || '',
      avatar_url:       meta?.avatar_url || meta?.picture || '',
      providers:        providers as string[],
      subscription:     false,  // merge in front-end
      suspended:        u.user_metadata?.suspended === true,
      created_at:       u.created_at!,
      last_sign_in_at:  u.last_sign_in_at!,
    }
  })

  return NextResponse.json(payload)
}

export async function PATCH(request: Request) {
  const { id, suspended } = await request.json()
  if (!id || suspended === undefined) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { error } = await supabase.auth.admin.updateUserById(id, {
    user_metadata: { suspended },
  })
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
