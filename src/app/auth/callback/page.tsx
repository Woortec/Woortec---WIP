'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { createClient } from '../../../../utils/supabase/client';

const Page = () => {
  const supabase = createClient();
  const router = useRouter();
  const [insert, setInsert] = useState(true);

  const handleKlaviyoSubscription = async (email: string) => {
    console.log(`Subscribing email: ${email} to Klaviyo`);
    try {
      const response = await fetch('/api/klaviyo-subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error('Failed to subscribe profile in Klaviyo:', result.error);
      } else {
        console.log(`Profile subscribed in Klaviyo for email: ${email}`);
      }
    } catch (error) {
      console.error('Error during Klaviyo subscription:', error);
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
                console.log('Calling');
                setInsert(false);
                await handleKlaviyoSubscription(email);
              }
            }
            router.push('/');
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.log('error', error);
        router.push('/');
      }
    };
    handleAuth();
  }, []);

  return <div>Loading...</div>;
};

export default Page;
