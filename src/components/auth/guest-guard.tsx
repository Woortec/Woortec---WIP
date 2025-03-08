'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';

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
        // Check for `userid` in localStorage
        const localUserId = localStorage.getItem('userid');
        if (localUserId) {
          logger.debug('[GuestGuard]: userid found in localStorage, removing it and redirecting...');
          localStorage.removeItem('userid'); // Ensure it's deleted
          router.replace(paths.dashboard.overview);
          return;
        }

        if (error) {
          setIsChecking(false);
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
  }, [user, error, isLoading, router]);

  if (isChecking) return null;

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return <>{children}</>;
}
