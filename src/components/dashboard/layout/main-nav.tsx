// src/components/dashboard/layout/main-nav.tsx
'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import { Bell as BellIcon } from '@phosphor-icons/react';
import { useTheme } from '@mui/material/styles';

import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const [openNav, setOpenNav] = React.useState<boolean>(false);
  const userPopover = usePopover<HTMLDivElement>();
  const theme = useTheme();

  return (
    <>
      <Box
        component="header"
        sx={{
          borderBottom: '1px solid #E0E0E0',
          backgroundColor: '#FFFFFF',
          borderRadius: 4,
          position: 'sticky',
          top: 8,
          marginLeft: { lg: '20px' }, // Ensure MainNav accounts for SideNav width on large screens
          zIndex: theme.zIndex.appBar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          // Ensuring MainNav spans full width
          width: '97%',
          paddingX: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
            xl: 6,
          },
          // Ensure the header scales properly with the viewport width
          maxWidth: '100%',
          overflow: 'hidden',
          minHeight: {
            xs: 56,
            sm: 64,
            md: 72,
            lg: 80,
            xl: 88,
          },
        }}
      >
        {/* Left side: Logo and Menu Icon */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Menu Icon for mobile - shown only on smaller screens */}

          {/* Logo - scales with breakpoints */}
          
        </Stack>

        {/* Right side: Notifications and Avatar */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Notifications">
            <Badge badgeContent={4} color="success" variant="dot">
              <IconButton sx={{ color: 'text.primary' }}>
                <BellIcon size={24} />
              </IconButton>
            </Badge>
          </Tooltip>

          {/* User Avatar - clickable to open UserPopover */}
          <Avatar
            onClick={userPopover.handleOpen}
            ref={userPopover.anchorRef}
            src="/assets/avatar.png"
            sx={{
              cursor: 'pointer',
              width: {
                xs: 32,
                sm: 36,
                md: 40,
                lg: 44,
                xl: 48,
              },
              height: {
                xs: 32,
                sm: 36,
                md: 40,
                lg: 44,
                xl: 48,
              },
              border: '1px solid #E0E0E0',
            }}
          />
        </Stack>
      </Box>

      {/* User popover */}
      <UserPopover
        anchorEl={userPopover.anchorRef.current}
        onClose={userPopover.handleClose}
        open={userPopover.open}
      />

      {/* Mobile navigation drawer */}
    </>
  );
}
