// src/components/Layout.tsx

import * as React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import GlobalStyles from '@mui/material/GlobalStyles';

import { MainNav } from '@/components/dashboard/layout/main-nav';
import { SideNav } from '@/components/dashboard/layout/side-nav';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps): React.JSX.Element {
  return (
    <>
      <GlobalStyles
        styles={{
          body: {
            '--MainNav-height': '56px',
            '--SideNav-width': '370px',
            '--SideNav-zIndex': 1000,
            '--MobileNav-width': '320px',
            '--MobileNav-zIndex': 1100,
          },
        }}
      />
      <Box
        sx={{
          bgcolor: 'var(--mui-palette-background-default)', // Default background
          display: 'flex', // Flexbox for layout
          minHeight: '100vh', // Full page height
        }}
      >
        {/* Sidebar (SideNav) */}
        <SideNav />

        {/* Main Content */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column', // Stack elements in a column
            flex: '1 1 auto', // Fill available space
            ml: { lg: 'var(--SideNav-width)' }, // Leave space for SideNav
            width: '100vw', // Full width
            maxWidth: '100%', // Ensure full width across screen
            height: '100vh',
            px: 0, // Remove horizontal padding
          }}
        >
          <MainNav />

          {/* Main Content Area */}
          <main>
            <Container
              maxWidth={false} // Full width container
              sx={{
                pt: 4, // Padding on top
                pb: 4, // Padding on bottom
                width: '100%', // Take up full width
                px: 0, // Remove padding
              }}
            >
              {children}
            </Container>
          </main>
        </Box>
      </Box>
    </>
  );
}
