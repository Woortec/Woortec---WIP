'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import Stripe from 'stripe';

import { createClient } from '../../../../utils/supabase/client';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const Page = () => {
  const supabase = createClient();
  const router = useRouter();
  const [insert, setInsert] = useState(true);

  const handleStripeCustomer = async (email: string) => {
    try {
      const { data: userRecord } = await supabase
        .from('user')
        .select('customerId')
        .eq('email', email)
        .single();

      if (userRecord?.customerId) {
        console.log(`User already has Stripe customerId: ${userRecord.customerId}`);
        return;
      }

      const customer = await stripe.customers.create({ email });

      await supabase
        .from('user')
        .update({ customerId: customer.id })
        .eq('email', email);

      console.log(`Stripe customer created with ID: ${customer.id}`);
    } catch (error) {
      console.error('Error handling Stripe customer:', error);
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
          const user = sessionData?.session?.user;

          if (user) {
            const email = user.email;
            const provider = user.app_metadata?.provider;
            const uuid = user.id; // ✅ using Supabase user ID now
            const fullName = user.user_metadata?.full_name;
            const avatarUrl = user.user_metadata?.avatar_url;

            const { data: existingUser } = await supabase
              .from('user')
              .select('*')
              .eq('email', email);

              if (!existingUser || existingUser.length === 0) {
                if (insert) {
                  const { error: insertError } = await supabase.from('user').insert([
                    {
                      email,
                      provider,
                      uuid, // Supabase user ID
                      firstName: fullName,
                      lastName: fullName,
                      avatar_url: avatarUrl,
                    },
                  ]);
              
                  console.log('Inserting new user into database...');
                  if (!insertError) {
                    await handleStripeCustomer(email);
                  }
                  setInsert(false);
                }
              } else {
                // ✅ Update info every login
                await supabase
                  .from('user')
                  .update({
                    firstName: fullName,
                    lastName: fullName,
                    avatar_url: avatarUrl,
                  })
                  .eq('email', email);
              
                await handleStripeCustomer(email);
                router.push('/');
              }
              
          } else {
            router.push('/');
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
