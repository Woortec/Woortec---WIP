// /api/subscription.ts

import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../utils/supabase/server';

export async function cancelSubscription(subscriptionId: string) {
  const supabase = createClient();

  // Initialize Stripe inside the function to avoid issues during build time
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-06-20',
  });

  try {
    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update the subscription details in Supabase
    const { data: userData, error: updateError } = await supabase
      .from('subscriptions_details')
      .update({
        isActive: false,
        end_date: new Date().toISOString(),
      })
      .eq('subscriptionId', subscriptionId)
      .select('*');

    if (updateError) {
      console.error('Error updating subscription details:', updateError);
      throw updateError;
    }

    if (userData && userData.length > 0) {
      let userId = userData[0]?.userId;

      // If userId is not a number, fetch the int8 user ID using the UUID
      if (typeof userId !== 'number') {
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

      // Update the user's planId to null
      const { error: userUpdateError } = await supabase
        .from('user')
        .update({ planId: null })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('Error updating user plan:', userUpdateError);
        throw userUpdateError;
      }
    } else {
      console.log('No user data found for the subscription.');
    }

    return subscription;
  } catch (error) {
    console.error('Error in cancelSubscription:', error);
    throw error; // Rethrow the error to be handled by the API route
  }
}

// Default export handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  try {
    const subscription = await cancelSubscription(subscriptionId);
    return res.status(200).json({ success: true, subscription });
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return res.status(500).json({ error: 'There was an issue cancelling your subscription.' });
  }
}
