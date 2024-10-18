import Stripe from 'stripe';



import { createClient } from '../../utils/supabase/client';


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function createSubscription(object: any) {
  const supabase = createClient();
  try {
    const { data: userData, error: customerError } = await supabase
      .from('user')
      .select('*')
      .eq('customerId', object.customer)
      .single();
    if (userData) {
      await supabase.from('payment_details').insert([
        {
          payment_status: object.status,
          subscriptionId: object.subscription,
          userId: userData.id,
        },
      ]);
      const subscription: any = await stripe.subscriptions.retrieve(object.subscription);
      const plan = await supabase.from('Plan').select('*').eq('price_id', subscription?.plan?.id).single();
      await supabase.from('user').update({ planId: plan.data.id }).eq('customerId', object.customer).single();
      await supabase.from('subscriptions_details').insert([
        {
          subscriptionId: object.subscription,
          customerId: object.customer,
          userId: userData.id,
          planId: plan.data.id,
          isActive: true,
        },
      ]);
    }
  } catch (error) {
    console.log('error', error);
  }
}

export async function renewSubscription(data: any) {
  try {
    const supabase = createClient();
    const { data: userData, error: customerError } = await supabase
      .from('user')
      .select('*')
      .eq('customerId', data.customer)
      .single();
    if (userData) {
      if (data.billing_reason === 'subscription_cycle') {
        await supabase.from('payment_details').insert([
          {
            payment_status: data.status,
            subscriptionId: data.subscription,
            userId: userData.id,
          },
        ]);
      }
    }
  } catch (error) {
    console.log('error in renew subscription');
  }
}