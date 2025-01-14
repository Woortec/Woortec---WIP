import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { priceId, customerId } = req.body;

    // Check if both priceId and customerId are provided
    if (!priceId || !customerId) {
      return res.status(400).json({ error: 'Price ID and Customer ID are required' });
    }

    try {
      // Create a checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer: customerId, // Use the customerId passed from the request
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      // Respond with the session URL for the client to redirect to
      return res.status(200).json({ url: session.url });
    } catch (error) {
      console.error('Stripe Checkout Session Error:', error);
      return res.status(500).json({ error: 'An error occurred while creating the checkout session' });
    }
  } else {
    // If it's not a POST request, return method not allowed
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }
}
