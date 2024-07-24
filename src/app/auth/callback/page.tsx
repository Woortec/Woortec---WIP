'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { createClient } from '../../../../utils/supabase/client';
import { subscribeProfile } from '../../../lib/klaviyo/subscribeProfile';

const Page = () => {
  const supabase = createClient();
  const router = useRouter();
  const [insert, setInsert] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          Cookies.set('accessToken', accessToken, { expires: 3 });

          // Get session data from Supabase
          const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

          if (sessionError) {
            console.error('Error getting session:', sessionError);
            router.push('/');
            return;
          }

          if (sessionData?.session?.user) {
            const user = sessionData.session.user;
            const { email, full_name: fullName, sub: uuid } = user.user_metadata;
            const provider = user.app_metadata.provider;

            // Insert user data if not exists
            const { data: existingUser, error: checkError } = await supabase
              .from('user')
              .select('*')
              .eq('email', email);

            if (checkError) {
              console.error('Error checking user existence:', checkError);
              router.push('/');
              return;
            }

            if (existingUser?.length === 0 && insert) {
              const { data: insertData, error: insertError } = await supabase.from('user').insert([
                {
                  email,
                  provider,
                  uuid,
                  firstName: fullName,
                  lastName: fullName,
                },
              ]);

              if (insertError) {
                console.error('Error inserting user:', insertError);
                router.push('/');
                return;
              }

              console.log('User inserted:', insertData);
              setInsert(false);
            }

            // Subscribe user to Klaviyo
            await subscribeProfile(email);

            // Redirect to home page after processing
            router.push('/');
          } else {
            router.push('/');
          }
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error during authentication handling:', error);
        router.push('/');
      }
    };

    handleAuth();
  }, [supabase, router]);

  useEffect(() => {
    if (!insert) {
      router.push('/');
    }
  }, [insert, router]);

  return <div>Loading...</div>;
};

export default Page;
