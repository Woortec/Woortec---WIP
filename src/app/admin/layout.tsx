// app/admin/layout.tsx
'use client';
import React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, useTheme as useMuiTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { usePathname } from 'next/navigation';
import Sidebar from './components/Sidebar';
import { theme } from '../theme';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const muiTheme = useMuiTheme();
  const isDesktop = useMediaQuery(muiTheme.breakpoints.up('sm'));
  const pathname = usePathname() || '';
  const isAuthRoute = pathname.startsWith('/admin/auth/');

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {!isAuthRoute && <Sidebar />}  {/* persistent drawer */}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3, md: 4 },
            bgcolor: 'white',
          }}
        >
          {!isAuthRoute && (
            <Box sx={{ height: muiTheme.mixins.toolbar.minHeight }} />
          )}
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
