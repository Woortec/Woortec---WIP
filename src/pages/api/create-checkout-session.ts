import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '../../../utils/supabase/client';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { priceId, uuid } = req.body; // Receive uuid from the frontend

  if (!priceId || !uuid) {
    return res.status(400).json({ error: 'Price ID and UUID are required' });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient();

    // Retrieve the user's `id` and customerId from Supabase using `uuid`
    const { data: userData, error: userError } = await supabase
      .from('user')
      .select('id, customerId, email')
      .eq('uuid', uuid)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return res.status(500).json({ error: 'Error fetching user data' });
    }

    const { id: userId, customerId, email: userEmail } = userData;

    let finalCustomerId = customerId;

    // Ensure customerId matches the correct mode (Test vs Live)
    try {
      if (finalCustomerId) {
        await stripe.customers.retrieve(finalCustomerId);
      }
    } catch (err: any) {
      if (err.type === 'StripeInvalidRequestError') {
        console.warn(`Invalid customer ID (${finalCustomerId}). Creating a new one.`);
        finalCustomerId = null; // Force new customer creation
      }
    }

    // If customerId does not exist or is invalid, create a new customer in Stripe and update Supabase
    if (!finalCustomerId) {
      const customer = await stripe.customers.create({
        email: userEmail,
      });

      finalCustomerId = customer.id;

      // Update the user record in Supabase with the new customerId
      const { error: updateError } = await supabase
        .from('user')
        .update({ customerId: finalCustomerId })
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
      customer: finalCustomerId, // Use the customerId retrieved from Supabase
      success_url: `${req.headers.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/cancel`,
    });

    return res.status(200).json({ sessionId: stripeSession.id, url: stripeSession.url });
  } catch (error) {
    console.error('Stripe Checkout Session Error:', error);
    return res.status(500).json({ error: 'An error occurred while creating the checkout session' });
  }
};
