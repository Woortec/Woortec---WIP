'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { createClient } from '../../../../utils/supabase/client';

const Page = () => {
  const supabase = createClient();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const hashParams = new URLSearchParams(window.location.hash.slice(1));
        const accessToken = hashParams.get('access_token');

        if (accessToken) {
          Cookies.set('accessToken', accessToken, { expires: 3 });
          await supabase.auth.setSession(accessToken);

          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session?.user) {
            const user = sessionData.session.user;
            const { email, full_name: fullName, sub: uuid } = user.user_metadata;
            const provider = user.app_metadata.provider;

            const { data: existingUser, error: checkError } = await supabase
              .from('user')
              .select('*')
              .eq('email', email);

            if (!checkError && existingUser.length === 0) {
              const { data, error: insertError } = await supabase.from('user').insert([
                {
                  email,
                  provider,
                  uuid,
                  firstName: fullName,
                  lastName: fullName,
                },
              ]);

              if (!insertError) {
                console.log('User inserted successfully', data);
              } else {
                console.log('Insert error', insertError);
              }
            }

            router.push('/');
          } else {
            console.log('No session user found');
            router.push('/');
          }
        } else {
          console.log('No access token found');
          router.push('/');
        }
      } catch (error) {
        console.log('Error handling authentication', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, []);

  return isLoading ? <div>Loading...</div> : null;
};

export default Page;
