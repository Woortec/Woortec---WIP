// src/app/api/admin/stats/route.ts
import { NextResponse } from 'next/server'
import { createAdminClient } from '../../../../../utils/supabase/admin'

// Build an array for the last 12 months
function getLast12Months() {
  const now = new Date()
  return Array.from({ length: 12 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1)
    return {
      label: d.toLocaleString('default', { month: 'short' }),
      year:  d.getFullYear(),
      month: d.getMonth() + 1,
    }
  })
}

export async function GET() {
  try {
    const supabase = createAdminClient()

    // 1) Active subscriptions
    const { data: subs, error: subsError } = await supabase
      .from('subscriptions_details')
      .select('id, planId, isActive, start_date')
      .eq('isActive', true)

    if (subsError) {
      console.error('Subscriptions fetch error:', subsError)
      return NextResponse.json({ error: 'Could not load subscriptions' }, { status: 500 })
    }

    // 2) Load those plans
    const planIds = Array.from(new Set(subs!.map(s => s.planId))) as number[]
    const { data: plans, error: plansError } = await supabase
      .from('Plan')
      .select('id, plan_name, price, duration')
      .in('id', planIds)

    if (plansError) {
      console.error('Plans fetch error:', plansError)
      return NextResponse.json({ error: 'Could not load plans' }, { status: 500 })
    }

    // 3) Map planId → plan record
    const planMap = new Map<number, { plan_name: string; price: string; duration: string }>()
    plans!.forEach((p) => {
      planMap.set(p.id, {
        plan_name: p.plan_name,
        price:      p.price,
        duration:   p.duration,
      })
    })

    // 4) Attach plan data to each subscription
    const subsWithPlan = (subs || []).map((s) => ({
      ...s,
      plan: planMap.get(s.planId) || null,
    }))

    // 5) Monthly MRR by start-month
    const months      = getLast12Months()
    const mrrByMonth  = months.map(({ label, year, month }) => {
      const sum = subsWithPlan
        .filter((s) => s.plan?.duration === 'Monthly')
        .filter((s) => {
          const d = new Date(s.start_date)
          return d.getFullYear() === year && d.getMonth() + 1 === month
        })
        .reduce((acc, s) => {
          const n = parseFloat(s.plan!.price.replace(/[^0-9.]/g, '')) || 0
          return acc + n
        }, 0)
      return { month: label, revenue: sum }
    })

    // 6) Current active monthly revenue (MRR)
    const monthlySubs     = subsWithPlan.filter((s) => s.plan?.duration === 'Monthly')
    const monthlyEarnings = monthlySubs.reduce((acc, s) => {
      return acc + (parseFloat(s.plan!.price.replace(/[^0-9.]/g, '')) || 0)
    }, 0)

    // 7) Current active annual revenue (ARR)
    const annualSubs      = subsWithPlan.filter((s) => s.plan?.duration === 'Yearly')
    const annualEarnings  = annualSubs.reduce((acc, s) => {
      return acc + (parseFloat(s.plan!.price.replace(/[^0-9.]/g, '')) || 0)
    }, 0)

    // 8) Breakdowns
    const buildBreakdown = (list: typeof subsWithPlan) => {
      const map: Record<string, { planName: string; count: number; total: number }> = {}
      list.forEach((s) => {
        const key    = s.planId.toString()
        const name   = s.plan!.plan_name
        const amount = parseFloat(s.plan!.price.replace(/[^0-9.]/g, '')) || 0
        if (!map[key]) map[key] = { planName: name, count: 0, total: 0 }
        map[key].count += 1
        map[key].total += amount
      })
      return Object.values(map)
    }
    const monthlyBreakdown = buildBreakdown(monthlySubs)
    const annualBreakdown  = buildBreakdown(annualSubs)

    // 9) User stats — now using the real auth.users table
    const {
      data: { users },
      error: authErr,
    } = await supabase.auth.admin.listUsers({
      page:    1,
      perPage: 1000,
    })

    if (authErr) {
      console.error('Failed to list auth users:', authErr)
    }

    const totalUsers   = users?.length || 0
    const nowMs        = Date.now()
    const activeUsers = users?.filter((u: any) =>
      u.last_sign_in_at &&
      new Date(u.last_sign_in_at).getTime() > nowMs - 24 * 60 * 60 * 1000
    ).length || 0

    // 10) Return everything
    return NextResponse.json({
      totalUsers,
      activeUsers,
      monthlyEarnings,
      annualEarnings,
      mrrByMonth,
      monthlyBreakdown,
      annualBreakdown,
    })
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
