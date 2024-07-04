import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { priceId, customerId } = body;
    console.log(customerId);
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      customer: customerId,
      success_url: `https://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://localhost:3000/cancel`,
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error) {
    console.log(error);
    throw NextResponse.json({ error }, { status: 500 });
  }
}
