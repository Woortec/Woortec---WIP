'use client';
import React from 'react';
import Container from '@mui/material/Container';

interface Props {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: Props) {
  return (
    <Container
      maxWidth="lg"
      sx={{
        py: 4,          // vertical padding
        bgcolor: 'background.default',
        minHeight: '100vh',
      }}
    >
      {children}
    </Container>
  );
}
