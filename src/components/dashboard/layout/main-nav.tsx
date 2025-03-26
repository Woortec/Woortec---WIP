// src/components/dashboard/layout/main-nav.tsx
'use client';
import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import InputBase from '@mui/material/InputBase';
import Tooltip from '@mui/material/Tooltip';
import MenuIcon from '@mui/icons-material/Menu';
import { Bell as BellIcon } from '@phosphor-icons/react';
import { Users as UsersIcon } from '@phosphor-icons/react';
import { CaretDown as DownMenuIcon } from '@phosphor-icons/react';
import { MagnifyingGlass as SearchIcon } from '@phosphor-icons/react';
import { useTheme } from '@mui/material/styles';

import { usePopover } from '@/hooks/use-popover';
import { MobileNav } from './mobile-nav';
import { UserPopover } from './user-popover';

export function MainNav(): React.JSX.Element {
  const userPopover = usePopover<HTMLDivElement>();
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          padding: '0 1.3rem',
          zIndex: theme.zIndex.appBar,
          gap: '0.5rem',
        }}
      >

        {/* Left side: Search */}
        <Box
          sx={{
            width: '100%',
            backgroundColor: '#FFFFFF',
            borderRadius: '1rem',
            display: 'flex',
            padding: '2rem 0.5rem',
            height: '2rem',
            alignItems: 'center', 
          }}
        >

          {/* Menu Button for Mobile */}
        <IconButton
          sx={{ display: { xs: 'flex', sm: 'flex', md:'none'},
          '@media (max-width: 1200px)': {
            display: 'flex', // Show when screen width is 1280px or smaller
          },
          alignItems: 'center',
           // Only show on mobile
        }}
          onClick={() => setMobileOpen(true)}
        >
          <MenuIcon />
        </IconButton>
        
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{ display: { xs: 'none', sm: 'flex', md: 'flex', lg: 'flex' } }}
          >
            <Tooltip title="Notif">
              <IconButton sx={{ color: 'text.primary' }}>
                <SearchIcon size="1.7rem" />
              </IconButton>
            </Tooltip>

            <InputBase placeholder="Search" sx={{ flex: 1 }} />
          </Stack>
        </Box>

        {/* Right side: Notifications and Avatar */}
        <Box
          sx={{
            backgroundColor: '#FFFFFF',
            borderRadius: '1rem',
            display: 'flex',
            alignItems: 'center',
            width: '15rem',
            padding: '2rem',
            height: '2rem',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Tooltip title="Notifications">
              <Badge badgeContent={4} color="success" variant="dot">
                <IconButton sx={{ color: 'text.primary' }}>
                  <BellIcon size="1.7rem" />
                </IconButton>
              </Badge>
            </Tooltip>

            <Tooltip title="Users">
              <IconButton sx={{ color: 'text.primary' }}>
                <UsersIcon size="1.7rem" />
              </IconButton>
            </Tooltip>

            {/* Group Avatar & DownMenuIcon closer together */}
            <Box display="flex" alignItems="center" gap={0.2}>
              <Avatar
                ref={userPopover.anchorRef}
                src="/assets/avatar.png"
                sx={{
                  cursor: 'pointer',
                  width: '2.5rem',
                  height: '2.5rem',
                  border: '1px solid #E0E0E0',
                }}
              />

              <Tooltip title="Menu">
                <IconButton sx={{ color: 'text.primary' }} onClick={userPopover.handleOpen}>
                  <DownMenuIcon size="1rem" />
                </IconButton>
              </Tooltip>
            </Box>
          </Stack>
        </Box>
      </Box>

      {/* User popover */}
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />

      {/* Mobile navigation drawer */}
      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}

