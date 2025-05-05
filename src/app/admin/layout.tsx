// app/admin/layout.tsx
'use client';
import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Container from '@mui/material/Container';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';

const drawerWidth = 280;

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));
  const pathname = usePathname() || '';

  // Determine if we’re on an auth page (log-in, sign-up, reset, etc.)
  const isAuthRoute = pathname.startsWith('/admin/auth/');

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Only render sidebar on non-auth routes */}
      {!isAuthRoute && <Sidebar />}

      {/* Main content area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: '100%',
          // if not an auth route and on desktop, leave space for sidebar
          ml: !isAuthRoute && isDesktop ? `${drawerWidth}px` : 0,
        }}
      >
        {/* on auth pages you might not need the Toolbar spacer */}
        {!isAuthRoute && <Box sx={{ height: theme.mixins.toolbar.minHeight }} />}
        <Container maxWidth="lg" disableGutters>
          {children}
        </Container>
      </Box>
    </Box>
  );
}
