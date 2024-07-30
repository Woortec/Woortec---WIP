'use client';

import * as React from 'react';
import InputBase from '@mui/material/InputBase';
import Box from '@mui/material/Box';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';

export function SearchBar(): React.JSX.Element {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        top: 8,
        px: 2,
        py: 1,
        width: '100%',
        maxWidth: '600px',
      }}
    >
      <MagnifyingGlassIcon style={{ marginRight: '8px', color: '#9E9E9E' }} />
      <InputBase
        placeholder="Search"
        sx={{
          width: '100%',
          color: '#9E9E9E',
        }}
      />
    </Box>
  );
}
