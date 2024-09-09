'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Stripe from 'stripe';

import { createClient } from '../../../../utils/supabase/client';

// Initialize Stripe
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const Page = () => {
  const supabase = createClient();
  const router = useRouter();
  const [insert, setInsert] = useState(true);

  // Function to check or create Stripe Customer
  const handleStripeCustomer = async (email: string) => {
    const { data: userRecord, error: fetchError } = await supabase
      .from('user')
      .select('customerId')
      .eq('email', email)
      .single();

    if (fetchError || !userRecord?.customerId) {
      const customer = await stripe.customers.create({
        email,
      });

      await supabase
        .from('user')
        .update({ customerId: customer.id })
        .eq('email', email);

      console.log(`Stripe customer created with ID: ${customer.id}`);
    }
  };

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          Cookies.set('accessToken', accessToken, { expires: 3 });
          const { data: sessionData } = await supabase.auth.getSession();

          if (sessionData?.session?.user) {
            const user = sessionData.session.user;
            const { email, full_name: fullName, sub: uuid } = user.user_metadata;
            const provider = user.app_metadata.provider;
            const { data: existingUser, error: checkError } = await supabase
              .from('user')
              .select('*')
              .eq('email', email);

            console.log('Data length', existingUser?.length);

            if (existingUser?.length == 0) {
              if (insert) {
                const { data, error: insertError } = await supabase.from('user').insert([
                  {
                    email,
                    provider,
                    uuid,
                    firstName: fullName,
                    lastName: fullName,
                  },
                ]);

                console.log('Inserting user into database...');
                if (!insertError) {
                  // After inserting the new user, create a Stripe customer for them
                  await handleStripeCustomer(email);
                }
                setInsert(false);
              }
            } else {
              // If the user exists, check if they have a Stripe customer ID
              await handleStripeCustomer(email);
              router.push('/');
            }
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.log('error', error);
      }
    };
    handleAuth();
  }, [insert]);

  useEffect(() => {
    if (!insert) {
      router.push('/');
    }
  }, [insert, router]);

  return <div>Loading...</div>;
};

export default Page;
