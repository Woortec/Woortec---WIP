import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { paymentMethod } = req.body;

    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 5000, // Amount in cents
        currency: 'usd',
        payment_method: paymentMethod,
        confirmation_method: 'manual',
        confirm: true,
      });

      res.status(200).json(paymentIntent);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
