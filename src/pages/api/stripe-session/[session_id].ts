import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== 'string') {
    res.status(400).json({ error: 'Invalid session ID' });
    return;
  }

  try {
    // Fetch the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.status(200).json(session);
  } catch (error) {
    console.error('Error fetching Stripe session:', error);
    res.status(500).json({ error: 'Unable to fetch session from Stripe' });
  }
}
