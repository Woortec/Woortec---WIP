// cancel-subscription.ts

import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient();

export async function cancelSubscription(subscriptionId: string) {
  try {
    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update the subscription details in Supabase
    const { data: subscriptionData, error: subscriptionError } = await supabase
      .from('subscriptions_details')
      .update({ isActive: false, end_date: new Date().toISOString() })
      .eq('subscriptionId', subscriptionId)
      .select('*')
      .single();

    if (subscriptionError) {
      console.error('Error updating subscription in Supabase:', subscriptionError);
      throw new Error('Failed to update subscription in Supabase');
    }

    if (subscriptionData) {
      let userId = subscriptionData.userId;

      // Ensure userId is a number (int8)
      if (typeof userId !== 'number') {
        // Fetch the int8 user ID using the UUID
        const { data: userRecord, error: userFetchError } = await supabase
          .from('user')
          .select('id')
          .eq('uuid', userId)
          .single();

        if (userFetchError || !userRecord) {
          console.error('Error fetching user ID:', userFetchError);
          throw new Error('Failed to fetch user ID');
        }

        userId = userRecord.id;
      }

      // Update the user's planId to null in the user table
      const { error: userUpdateError } = await supabase
        .from('user')
        .update({ planId: null })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('Error updating user plan in Supabase:', userUpdateError);
        throw new Error('Failed to update user plan in Supabase');
      }
    }

    return { success: true, subscription };
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error: 'Failed to cancel subscription' };
  }
}

// API route handler for subscription cancellation
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  try {
    const result = await cancelSubscription(subscriptionId);

    if (result.success) {
      return res.status(200).json({ success: true, subscription: result.subscription });
    } else {
      return res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error handling cancel subscription request:', error);
    return res.status(500).json({ success: false, error: 'Failed to process cancellation' });
  }
}
