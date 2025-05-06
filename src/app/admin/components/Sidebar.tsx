// app/admin/components/Sidebar.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import FilterListIcon from '@mui/icons-material/FilterList';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const drawerWidth = 280;

export default function Sidebar() {
  const pathname = usePathname() || '/admin';
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMessages, setOpenMessages] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/auth/log-in';
  };

  const groups = [
    {
      title: 'NAVIGATION',
      items: [
        { text: 'Dashboard', icon: <DashboardIcon />,    path: '/admin' },
        { text: 'Users',     icon: <PeopleIcon />,      path: '/admin/users' },
        { text: 'Helpdesk',  icon: <SupportAgentIcon />, path: '/admin/helpdesk' },
      ],
    },
  ];

  const messagesSub = [
    { text: 'Inbox',         icon: <InboxIcon />,   path: '/admin/messages/inbox' },
    { text: 'Notifications', icon: <ReceiptIcon />, path: '/admin/messages/notifications' },
  ];

  const drawer = (
    <Box display="flex" flexDirection="column" height="100%" px={2} py={3}>
      {/* LOGO */}
      <Box textAlign="center" mb={2}>
        <Box
          component="img"
          src="/assets/woortec1.svg"
          alt="Woortec Logo"
          sx={{ height: 40, width: 'auto', mx: 'auto' }}
        />
      </Box>

      {/* BRAND / PROFILE */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h5" color="primary" fontWeight={700}>
          Woortec <Box component="span" fontWeight={400}>Admin</Box>
        </Typography>
        <Typography variant="caption" color="text.secondary">
          v1
        </Typography>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 2,
          borderRadius: 2,
          mb: 3,
        }}
      >
        <Avatar
          src="/avatar.png"
          alt="Miguel"
          sx={{ width: 48, height: 48, mr: 2 }}
        />
        <Box flexGrow={1}>
          <Typography fontWeight={600}>Miguel</Typography>
          <Typography variant="body2" color="text.secondary">
            Administrator
          </Typography>
        </Box>
        <IconButton size="small">
          <FilterListIcon />
        </IconButton>
      </Box>

      {/* MENU GROUPS */}
      {groups.map(({ title, items }) => (
        <Box key={title} mb={2}>
          <Typography
            variant="overline"
            display="block"
            color="text.secondary"
            mb={1}
            sx={{ letterSpacing: 1 }}
          >
            {title}
          </Typography>
          <List disablePadding>
            {items.map(({ text, icon, path }) => {
              const selected = pathname === path;
              return (
                <Link key={text} href={path} passHref>
                  <ListItemButton
                    selected={selected}
                    onClick={() => setMobileOpen(false)}
                    sx={{
                      borderRadius: 1,
                      mb: 0.5,
                      '&.Mui-selected': {
                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                      },
                    }}
                  >
                    <ListItemIcon sx={{ color: selected ? 'primary.main' : 'text.secondary' }}>
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={text}
                      sx={{ ml: 1 }}
                      primaryTypographyProps={{
                        fontWeight: selected ? 600 : 400,
                        color: selected ? 'primary.main' : 'text.primary',
                      }}
                    />
                  </ListItemButton>
                </Link>
              );
            })}
          </List>
        </Box>
      ))}

      {/* SPACER */}
      <Box flexGrow={1} />

      {/* MESSAGES COLLAPSE */}
      <Divider />
      <List disablePadding sx={{ mt: 2 }}>
        <ListItemButton onClick={() => setOpenMessages(o => !o)} sx={{ borderRadius: 1 }}>
          <ListItemIcon sx={{ color: 'text.secondary' }}><MailIcon /></ListItemIcon>
          <ListItemText primary="Messages" primaryTypographyProps={{ fontWeight: 500 }} />
          {openMessages ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>
        <Collapse in={openMessages} timeout="auto" unmountOnExit>
          <List disablePadding sx={{ pl: 4 }}>
            {messagesSub.map(({ text, icon, path }) => (
              <Link key={text} href={path} passHref>
                <ListItemButton onClick={() => setMobileOpen(false)} sx={{ borderRadius: 1, mb: 0.5 }}>
                  <ListItemIcon sx={{ color: 'text.secondary' }}>{icon}</ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Collapse>
      </List>

      {/* LOGOUT */}
      <Box mt={2} pb={2}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? <CircularProgress size={20} /> : 'Log Out'}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {!isDesktop && (
        <IconButton
          onClick={() => setMobileOpen(true)}
          sx={{
            position: 'fixed',
            top: theme.spacing(1),
            left: theme.spacing(1),
            zIndex: theme.zIndex.drawer + 1,
            bgcolor: 'background.paper',
          }}
        >
          <MenuIcon />
        </IconButton>
      )}
      <Drawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop || mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
