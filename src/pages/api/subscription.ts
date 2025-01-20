// /api/subscription.ts

import Stripe from 'stripe';
import { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '../../../utils/supabase/client'; // Adjust the path as needed

export async function cancelSubscription(subscriptionId: string) {
  const supabase = createClient();

  // Check if STRIPE_SECRET_KEY is set
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set in environment variables');
    throw new Error('STRIPE_SECRET_KEY is not set');
  } else {
    console.log('STRIPE_SECRET_KEY is set.');
  }

  // Initialize Stripe inside the function
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20',
  });

  try {
    console.log('Attempting to cancel subscription in Stripe:', subscriptionId);

    // Attempt to cancel the subscription in Stripe
    let subscription;
    try {
      subscription = await stripe.subscriptions.cancel(subscriptionId);
      console.log('Subscription cancelled in Stripe:', subscription.id);
    } catch (stripeError: any) {
      console.error('Error cancelling subscription in Stripe:', stripeError);
      throw new Error(`Stripe error: ${stripeError.message}`);
    }

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
      console.error('Error updating subscription details in Supabase:', updateError);
      throw new Error(`Supabase error: ${updateError.message}`);
    }

    console.log('Updated subscription details in Supabase:', userData);

    if (userData && userData.length > 0) {
      let userId = userData[0]?.userId;
      console.log('User ID from subscription details:', userId);

      // If userId is not a number (int8), fetch the int8 user ID using the UUID
      if (typeof userId !== 'number') {
        console.log('User ID is not a number, fetching int8 ID using UUID...');
        const { data: userRecord, error: userFetchError } = await supabase
          .from('user')
          .select('id')
          .eq('uuid', userId)
          .single();

        if (userFetchError || !userRecord) {
          console.error('Error fetching user ID from Supabase:', userFetchError);
          throw new Error('Failed to fetch user ID from Supabase');
        }

        userId = userRecord.id;
        console.log('Fetched int8 user ID:', userId);
      }

      // Update the user's planId to null
      console.log('Updating user planId to null...');
      const { error: userUpdateError } = await supabase
        .from('user')
        .update({ planId: null })
        .eq('id', userId);

      if (userUpdateError) {
        console.error('Error updating user plan in Supabase:', userUpdateError);
        throw new Error(`Supabase error: ${userUpdateError.message}`);
      }

      console.log('User planId updated to null for user ID:', userId);
    } else {
      console.warn('No user data found for the subscription.');
    }

    return subscription;
  } catch (error: any) {
    console.error('Error in cancelSubscription:', error);
    // Include error message in the thrown error
    throw new Error(error.message || 'An unknown error occurred in cancelSubscription');
  }
}

// Default export handler function
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    console.warn('Method Not Allowed:', req.method);
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { subscriptionId } = req.body;

  if (!subscriptionId) {
    console.warn('Subscription ID is required but not provided.');
    return res.status(400).json({ error: 'Subscription ID is required' });
  }

  try {
    console.log('Received request to cancel subscription:', subscriptionId);
    const subscription = await cancelSubscription(subscriptionId);
    return res.status(200).json({ success: true, subscription });
  } catch (error: any) {
    console.error('Error cancelling subscription:', error);

    // Include error message in the response for debugging
    return res.status(500).json({
      error: 'There was an issue cancelling your subscription.',
      message: error.message,
    });
  }
}
