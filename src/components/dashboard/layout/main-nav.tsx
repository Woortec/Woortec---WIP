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
import { SearchBar } from './SearchBar';

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
          borderRadius: '30px', // Adjusted border radius
          position: 'sticky',
          top: 8,
          zIndex: 'var(--mui-zIndex-appBar)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '64px',
          width: '85%', // Adjust the width
          margin: '0 auto', // Center align the nav bar
          px: 2,
        }}
      >
         <SearchBar />
       {/* Include the new SearchBar component */}
        <Stack sx={{ alignItems: 'center' }} direction="row" spacing={2}>
          <Tooltip title="Notifications">
            <Badge badgeContent={4} color="success" variant="dot">
              <IconButton sx={{ color: 'var(--mui-palette-text-primary)' }}>
                <BellIcon />
              </IconButton>
            </Badge>
          </Tooltip>
          <Avatar
            onClick={userPopover.handleOpen}
            ref={userPopover.anchorRef}
            src="/assets/avatar.png"
            sx={{ cursor: 'pointer' }}
          />
        </Stack>
      </Box>
      <UserPopover anchorEl={userPopover.anchorRef.current} onClose={userPopover.handleClose} open={userPopover.open} />
      <MobileNav
        onClose={() => {
          setOpenNav(false);
        }}
        open={openNav}
      />
    </React.Fragment>
  );
}
