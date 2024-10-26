import Stripe from 'stripe';
import { createClient } from '../../utils/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function createSubscription(object: any) {
  const supabase = createClient();
  try {
    // Attempt to find the user by customerId
    let { data: userData, error: customerError } = await supabase
      .from('user')
      .select('*')
      .eq('customerId', object.customer)
      .single();

    if (!userData) {
      // If user not found, retrieve customer email from Stripe
      const customer = await stripe.customers.retrieve(object.customer);
      const customerEmail = (customer as Stripe.Customer).email;

      if (customerEmail) {
        // Attempt to find the user by email
        const { data: userByEmail, error: emailError } = await supabase
          .from('user')
          .select('*')
          .eq('email', customerEmail)
          .single();

        if (userByEmail) {
          // Update the user's customerId in Supabase
          await supabase
            .from('user')
            .update({ customerId: object.customer })
            .eq('id', userByEmail.id);
          userData = userByEmail;
        } else {
          console.error(`User not found in Supabase for email: ${customerEmail}`);
          return;
        }
      } else {
        console.error(`Email not found for customer: ${object.customer}`);
        return;
      }
    }

    // Proceed with the existing logic
    await supabase.from('payment_details').insert([
      {
        payment_status: object.status,
        subscriptionId: object.subscription,
        userId: userData.id,
      },
    ]);

    const subscription: any = await stripe.subscriptions.retrieve(object.subscription);

    const { data: planData, error: planError } = await supabase
      .from('Plan')
      .select('*')
      .eq('price_id', subscription?.plan?.id)
      .single();

    if (planError || !planData) {
      console.error('Plan not found in Supabase for price_id:', subscription?.plan?.id);
      return;
    }

    await supabase
      .from('user')
      .update({ planId: planData.id })
      .eq('id', userData.id)
      .single();

    await supabase.from('subscriptions_details').insert([
      {
        subscriptionId: object.subscription,
        customerId: object.customer,
        userId: userData.id,
        planId: planData.id,
        isActive: true,
      },
    ]);
  } catch (error) {
    console.error('Error in createSubscription:', error);
  }
}

export async function renewSubscription(data: any) {
  try {
    const supabase = createClient();

    // Attempt to find the user by customerId
    let { data: userData, error: customerError } = await supabase
      .from('user')
      .select('*')
      .eq('customerId', data.customer)
      .single();

    if (!userData) {
      // If user not found, retrieve customer email from Stripe
      const customer = await stripe.customers.retrieve(data.customer);
      const customerEmail = (customer as Stripe.Customer).email;

      if (customerEmail) {
        // Attempt to find the user by email
        const { data: userByEmail, error: emailError } = await supabase
          .from('user')
          .select('*')
          .eq('email', customerEmail)
          .single();

        if (userByEmail) {
          // Update the user's customerId in Supabase
          await supabase
            .from('user')
            .update({ customerId: data.customer })
            .eq('id', userByEmail.id);
          userData = userByEmail;
        } else {
          console.error(`User not found in Supabase for email: ${customerEmail}`);
          return;
        }
      } else {
        console.error(`Email not found for customer: ${data.customer}`);
        return;
      }
    }

    if (data.billing_reason === 'subscription_cycle') {
      await supabase.from('payment_details').insert([
        {
          payment_status: data.status,
          subscriptionId: data.subscription,
          userId: userData.id,
        },
      ]);
    }
  } catch (error) {
    console.error('Error in renewSubscription:', error);
  }
}
