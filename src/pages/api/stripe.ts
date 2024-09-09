// pages/api/stripe.ts
import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { email, name } = req.body;

    try {
      // Create a Stripe customer
      const customer = await stripe.customers.create({
        email,
        name,
      });

      console.log("Customer created:", customer); // Log the customer data

      res.status(200).json({ customer });
    } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ error: 'Unable to create customer' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
