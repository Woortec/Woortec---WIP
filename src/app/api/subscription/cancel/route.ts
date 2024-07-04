import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

import { cancelSubscription } from '../../../../lib/subscription';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { subscriptionId } = body;

    await cancelSubscription(subscriptionId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.log(error);
    throw NextResponse.json({ error }, { status: 500 });
  }
}
