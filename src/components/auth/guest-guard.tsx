'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Button from '@mui/material/Button';

import { paths } from '@/paths';
import { logger } from '@/lib/default-logger';
import { useUser } from '@/hooks/use-user';

export interface GuestGuardProps {
  children: React.ReactNode;
}

export function GuestGuard({ children }: GuestGuardProps): React.JSX.Element | null {
  const router = useRouter();
  const { user, error, isLoading } = useUser();
  const [isChecking, setIsChecking] = React.useState<boolean>(true);

  React.useEffect(() => {
    const checkPermissions = async (): Promise<void> => {
      if (isLoading) return;

      try {
        // Check for sb-uvhvgcrczfdfvoujarga-auth-token in localStorage
        const authToken = localStorage.getItem('sb-uvhvgcrczfdfvoujarga-auth-token');

        if (authToken) {
          const parsedToken = JSON.parse(authToken); // Assuming it's stored as a JSON string

          if (parsedToken?.expires_at) {
            const expiryTime = parsedToken.expires_at * 1000; // Convert to milliseconds
            const currentTime = Date.now();

            if (currentTime >= expiryTime) {
              logger.debug('[GuestGuard]: Auth token expired, removing it...');
              window.location.reload();
              localStorage.removeItem('sb-uvhvgcrczfdfvoujarga-auth-token');
            }
          }
        }

        // Check for userid in localStorage
        const localUserId = localStorage.getItem('userid');
        if (localUserId) {
          logger.debug('[GuestGuard]: userid found in localStorage, removing it and redirecting...');
          localStorage.removeItem('userid'); // Ensure it's deleted
          window.location.reload();
          setTimeout(() => {
            router.replace(paths.dashboard.overview);
          }, 0);

          return;
        }

        if (user) {
          logger.debug('[GuestGuard]: User is logged in, redirecting to dashboard');
          router.replace(paths.dashboard.overview);
          return;
        }

        setIsChecking(false);
      } catch (err) {
        logger.error('[GuestGuard]: Error checking permissions', err);
        setIsChecking(false);
      }
    };

    checkPermissions();

    // Add storage event listener to re-run checkPermissions if the auth token changes
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'sb-uvhvgcrczfdfvoujarga-auth-token') {
        setIsChecking(true); // Show loading while re-checking
        checkPermissions();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, error, isLoading, router]);

  if (isChecking) return <div>Loading...</div>;

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return <>{children}</>;
}