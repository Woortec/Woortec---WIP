'use client';

import React, { ComponentType, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const withAuth = <P extends object>(WrappedComponent: ComponentType<P>) => {
  const AuthComponent = (props: P) => {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
      const campaignDetails = localStorage.getItem('campaignDetails');
      const preparingStartTime = localStorage.getItem('preparingStartTime');
      const isProtectedRoute = pathname?.includes('/dashboard/campaign/preparing') || pathname?.includes('/dashboard/campaign/results');

      if (isProtectedRoute && (!campaignDetails || !preparingStartTime)) {
        router.replace('/dashboard/campaign');
      }
    }, [router, pathname]);

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
