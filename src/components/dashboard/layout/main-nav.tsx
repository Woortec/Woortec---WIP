'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { Bell as BellIcon } from '@phosphor-icons/react/dist/ssr/Bell';

import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();

  return (
    <React.Fragment>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          borderRadius: { xs: '4px', md: '8px' }, // Responsive border radius
          position: 'sticky',
          top: 8,
          zIndex: 'var(--mui-zIndex-appBar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: { xs: '56px', md: '72px' }, // Responsive height
          width: '100%',
          margin: '0 auto',
          paddingX: { xs: 2, md: 4 }, // Responsive padding
          maxWidth: { xs: '100%', md: '2300px' }, // Adjust max-width for larger screens
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Tooltip title="Notifications">
            <Badge badgeContent={4} color="success" variant="dot">
              <IconButton sx={{ color: 'var(--mui-palette-text-primary)' }}>
                <BellIcon size={24} />
              </IconButton>
            </Badge>
          </Tooltip>

          {/* User Avatar */}
          <Avatar
            onClick={userPopover.handleOpen}
            ref={userPopover.anchorRef}
            src="/assets/avatar.png"
            sx={{
              cursor: 'pointer',
              width: { xs: 32, md: 40 }, // Responsive avatar size
              height: { xs: 32, md: 40 },
              border: '1px solid #E0E0E0',
            }}
          />
        </Stack>
      </Box>

      {/* User popover */}
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />

      {/* Mobile navigation drawer */}
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
