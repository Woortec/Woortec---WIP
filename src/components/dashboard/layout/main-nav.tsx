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
          zIndex: theme.zIndex.appBar,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: {
            xs: 56,
            sm: 64,
            md: 72,
            lg: 80,
            xl: 88,
          },
          width: '100%',
          margin: '0 auto',
          px: {
            xs: 2,
            sm: 3,
            md: 4,
            lg: 5,
            xl: 6,
          },
          maxWidth: {
            xs: '100%',
            sm: '100%',
            md: '100%',
            lg: '1200px',
            xl: '1500px',
          },
          overflow: 'hidden',
        }}
      >
        {/* Left side: Logo and Menu Icon */}
        <Stack direction="row" spacing={2} alignItems="center">
          {/* Menu Icon for mobile */}
          <IconButton
            onClick={() => setOpenNav(true)}
            sx={{
              display: {
                xs: 'inline-flex',
                md: 'none',
              },
            }}
          >
            <MenuIcon />
          </IconButton>

          {/* Logo */}
          <Box
            component="img"
            src="/assets/logo.png"
            alt="Logo"
            sx={{
              height: {
                xs: 32,
                sm: 36,
                md: 40,
                lg: 44,
                xl: 48,
              },
            }}
          />
        </Stack>

        {/* Center: Navigation Links */}

        {/* Right side: Notifications and Avatar */}
        <Stack direction="row" spacing={2} alignItems="center">
          <Tooltip title="Notifications">
            <Badge badgeContent={4} color="success" variant="dot">
              <IconButton sx={{ color: 'text.primary' }}>
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
      <MobileNav
        onClose={() => setOpenNav(false)}
        open={openNav}
      />
    </>
  );
}
