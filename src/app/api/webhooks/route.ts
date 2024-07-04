import { headers } from 'next/headers';
import Stripe from 'stripe';

import { createSubscription, renewSubscription } from '../../../lib/webhook';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const relevantEvents = new Set([
  'customer.subscription.created',
  'payment_intent.succeeded',
  'invoice.payment_succeeded',
  'invoice.paid',
  'checkout.session.completed',
]);

export async function POST(req: Request) {
  const body = await req.text();
  const sig = headers().get('Stripe-Signature') as string;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
  let event: Stripe.Event;

  try {
    if (!sig || !webhookSecret) return;
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.log(`❌ Error message: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case 'customer.subscription.created':
          // console.log('subscription_created', event.data.object);
          break;
        case 'payment_intent.succeeded':
          // console.log('payment_intent.succeeded', event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await renewSubscription(event.data.object);
          break;
        case 'invoice.paid':
          break;
        case 'checkout.session.completed':
          await createSubscription(event.data.object);
          break;
        default:
          throw new Error('Unhandled relevant event!');
      }
    } catch (error) {
      console.log(error);
      return new Response('Webhook handler failed. View logs.', {
        status: 400,
      });
    }
  }
  return new Response(JSON.stringify({ received: true }));
}
