// src/app/components/Layout.tsx
import React from 'react';
import { Container, Box } from '@mui/material';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Container component="main" sx={{ flex: 1, py: 2 }}>
        {children}
      </Container>
    </Box>
  );
};

export default Layout;
