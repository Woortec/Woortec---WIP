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
          borderRadius: '12px', // Slightly less rounded corners
          position: 'sticky',
          top: 8,
          zIndex: 'var(--mui-zIndex-appBar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '72px', // Increase header height slightly for better spacing
          width: '100%',
          margin: '0 auto',
          paddingX: 3, // Adjust padding for consistent spacing
          maxWidth: '1500px', // Limit width for larger screens
        }}
      >
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Tooltip title="Notifications">
            <Badge badgeContent={4} color="success" variant="dot">
              <IconButton sx={{ color: 'var(--mui-palette-text-primary)' }}>
                <BellIcon size={24} /> {/* Set a fixed size for consistent appearance */}
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
              width: 36, // Set avatar width to align with layout scale
              height: 36,
              border: '1px solid #E0E0E0', // Add subtle border for definition
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
