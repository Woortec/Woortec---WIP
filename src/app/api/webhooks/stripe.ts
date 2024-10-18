import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { buffer } from 'micro';
import stripe from '../../../lib/stripe'; // Adjust the import path as needed

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, so we can handle the raw request body
  },
};

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const buf = await buffer(req);
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;

    try {
      // Ensure the buffer is converted to string before passing to Stripe
      event = stripe.webhooks.constructEvent(buf.toString(), sig, endpointSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`⚠️  Webhook signature verification failed. Error: ${errorMessage}`, err);
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    // Handle the event based on its type
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`PaymentIntent was successful for ID: ${paymentIntent.id}`);
        // Handle the successful payment intent, like updating your DB or notifying the user
        break;
      }
      // Add more cases to handle other Stripe event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    res.json({ received: true });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
};

export default handler;
