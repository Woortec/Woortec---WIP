'use client'
import * as React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import RouterLink from 'next/link';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ReactGA from 'react-ga4';
import WoortecIllustration from '../../../public/assets/log-in-woortec.svg';

import { paths } from '@/paths';

export interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', lg: 'row' },
        minHeight: '100vh',
        backgroundColor: '#f7f7f7', // Add background color to match design
      }}
    >
      {/* Left Section - Login Form */}
      <Box
        sx={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: { xs: 3, lg: 6 },
          backgroundColor: '#fff', // Background for form
        }}
      >
        <Box sx={{ maxWidth: '450px', width: '100%' }}>
          {children}
        </Box>
      </Box>

      {/* Right Section - Illustration and Text */}
      <Box
        sx={{
          flex: 1,
          backgroundColor: '#486A75', // Update the background color
          color: 'white',
          display: { xs: 'none', lg: 'flex' }, // Hidden on smaller screens
          justifyContent: 'center',
          alignItems: 'center',
          padding: 3,
        }}
      >
        <Stack spacing={3} alignItems="center">
          {/* Heading */}
          <Typography
            sx={{
              fontSize: '24px',
              lineHeight: '32px',
              textAlign: 'center',
            }}
            variant="h1"
          >
            Maximize impact, minimize spend with{' '}
            <Box component="span" sx={{ color: '#15b79e' }}>
              Woortec
            </Box>
          </Typography>

          {/* SVG Image */}
          <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
            <WoortecIllustration style={{ maxWidth: '100%', height: 'auto' }} />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

export default function App({ Component, pageProps }: { Component: any, pageProps: any }) {
  const router = useRouter();

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      ReactGA.send({ hitType: 'pageview', page: url });
    };

    if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_GA_TRACKING_ID) {
      ReactGA.initialize(process.env.NEXT_PUBLIC_GA_TRACKING_ID);
      router.events.on('routeChangeComplete', handleRouteChange);
    }

    return () => {
      if (typeof window !== 'undefined') {
        router.events.off('routeChangeComplete', handleRouteChange);
      }
    };
  }, [router.events]);

  return <Component {...pageProps} />;
}
