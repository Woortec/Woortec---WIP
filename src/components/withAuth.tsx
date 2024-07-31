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
      const protectedRoutes = [
        '/dashboard/adsstrategies/preparing',
        '/dashboard/adsstrategies/expresslaunching',
        '/dashboard/adsstrategies/analysis',
        '/dashboard/adsstrategies/optimization',
        // add more protected routes here
      ];
      const isProtectedRoute = protectedRoutes.some(route => pathname?.includes(route));

      if (isProtectedRoute && (!campaignDetails || !preparingStartTime)) {
        router.replace('/dashboard/adsstrategies');
      }
    }, [router, pathname]);

    return <WrappedComponent {...props} />;
  };

  return AuthComponent;
};

export default withAuth;
