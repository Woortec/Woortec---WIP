import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '../../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { priceId } = req.body;

    // Check if priceId is provided
    if (!priceId) {
      return res.status(400).json({ error: 'Price ID is required' });
    }

    try {
      // Initialize Supabase client
      const supabase = createClient();

      // Retrieve the user's session from Supabase authentication
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error('Error fetching user session:', sessionError);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = session.user.id;
      const userEmail = session.user.email;

      // Retrieve the customerId from Supabase for the logged-in user
      const { data: userData, error: userError } = await supabase
        .from('user')
        .select('customerId')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error('Error fetching user data:', userError);
        return res.status(500).json({ error: 'Error fetching user data' });
      }

      let customerId = userData?.customerId;

      // If customerId does not exist in Supabase, create a new customer in Stripe and update Supabase
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: userEmail,
          name: session.user.user_metadata?.full_name || userEmail, // Adjust based on your user data
        });

        customerId = customer.id;

        // Update the user record in Supabase with the new customerId
        const { error: updateError } = await supabase
          .from('user')
          .update({ customerId })
          .eq('id', userId);

        if (updateError) {
          console.error('Error updating customerId in Supabase:', updateError);
          return res.status(500).json({ error: 'Error updating customerId' });
        }
      }

      // Create a checkout session for subscription
      const stripeSession = await stripe.checkout.sessions.create({
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        customer: customerId, // Use the customerId retrieved from Supabase
        success_url: `${req.headers.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${req.headers.origin}/cancel`,
      });

      // Respond with the session URL for the client to redirect to
      return res.status(200).json({ url: stripeSession.url });
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
