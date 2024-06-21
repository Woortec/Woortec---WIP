'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

const Page = () => {
  const router = useRouter();

  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.slice(1));
    const accessToken = hashParams.get('access_token');

    if (accessToken) {
      Cookies.set('accessToken', accessToken, { expires: 3 });
      router.push('/');
      router.refresh();
      // Redirect to the API route to store the token and set the cookie
    } else {
      console.error('Access token not found in URL');
    }
  }, [router]);

  return <div>Loading...</div>;
};

export default Page;
