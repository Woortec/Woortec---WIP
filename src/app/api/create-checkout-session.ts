// payment.js

import Stripe from 'stripe';
import { createClient } from '../../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function createCheckoutSession(userId: string, priceId: string) {
  const supabase = createClient();
  try {
    // Retrieve the customerId from Supabase
    const { data: userData, error } = await supabase
      .from('user')
      .select('customerId')
      .eq('id', userId)
      .single();

    if (error || !userData) {
      console.error('User not found or error fetching user data:', error);
      return;
    }

    const customerId = userData.customerId;

    // Create a Checkout Session with the existing customerId
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://app.woortec.com/success',
      cancel_url: 'https://app.woortec.com/cancel',
    });

    return session;
  } catch (error) {
    console.error('Error creating Checkout Session:', error);
  }
}
