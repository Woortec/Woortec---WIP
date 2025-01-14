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
          backgroundColor: '#F5F5F5',
          borderRadius: '12px', // Adjust border radius to be more subtle
          position: 'sticky',
          top: 8,
          zIndex: 'var(--mui-zIndex-appBar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between', // Distribute items evenly across the width
          minHeight: '64px',
          width: '100%', // Make sure it takes full width
          margin: '0 auto', // Center the navbar horizontally
          px: 4, // Adjust padding for left and right to fit better
          maxWidth: '100%', // Ensure full width
        }}
      >
        <Stack direction="row" spacing={3} sx={{ alignItems: 'center' }}>
          <Tooltip title="Notifications">
            <Badge badgeContent={4} color="success" variant="dot">
              <IconButton sx={{ color: 'var(--mui-palette-text-primary)' }}>
                <BellIcon />
              </IconButton>
            </Badge>
          </Tooltip>

          {/* User Avatar */}
          <Avatar
            onClick={userPopover.handleOpen}
            ref={userPopover.anchorRef}
            src="/assets/avatar.png"
            sx={{ cursor: 'pointer', width: 40, height: 40 }}
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
