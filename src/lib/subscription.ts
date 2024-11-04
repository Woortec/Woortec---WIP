import Stripe from 'stripe';

import { createClient } from '../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function cancelSubscription(subscriptionId: any) {
  const supabase = createClient();
  try {
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    const { data: userData } = await supabase
      .from('subscriptions_details')
      .update({ isActive: false, end_date: new Date().toISOString() })
      .eq('subscriptionId', subscriptionId)
      // .eq('isActive', true)
      .select('*');
    if (userData) {
      await supabase.from('user').update({ planId: null }).eq('id', userData[0]?.userId);
    }
    return subscription;
  } catch (error) {
    console.log('error', error);
  }
}
