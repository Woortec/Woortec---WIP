import { headers } from "next/headers";
import Stripe from "stripe";

import { createSubscription, renewSubscription } from "../../../lib/webhook";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-06-20",
});

const relevantEvents = new Set([
  "customer.subscription.created",
  "payment_intent.succeeded",
  "invoice.payment_succeeded",
  "invoice.paid",
  "checkout.session.completed",
]);

export const config = {
  api: {
    bodyParser: false, // ✅ Disable Next.js automatic JSON parsing
  },
};

export async function POST(req: Request) {
  const rawBody = await req.text(); // ✅ Use raw request body
  const sig = headers().get("Stripe-Signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

  if (!sig || !webhookSecret) {
    return new Response("Missing signature or webhook secret", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (relevantEvents.has(event.type)) {
    try {
      switch (event.type) {
        case "invoice.payment_succeeded":
          await renewSubscription(event.data.object);
          break;
        case "checkout.session.completed":
          await createSubscription(event.data.object);
          break;
      }
    } catch (error) {
      console.error("❌ Webhook processing error:", error);
      return new Response("Webhook handler failed. View logs.", { status: 400 });
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
