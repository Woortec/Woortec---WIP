// src/app/admin/components/Sidebar.tsx
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
  Toolbar,
  Typography,
  Divider,
  Collapse,
  useTheme,
  useMediaQuery,
  Button,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import MailIcon from '@mui/icons-material/Mail';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

const drawerWidth = 280;
const DarkDrawer = styled(Drawer)(() => ({
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    backgroundColor: '#2f3136',
    color: '#e1e1e6',
    borderRight: '1px solid #393c42',
  },
}));

export default function Sidebar() {
  const pathname   = usePathname() || '/admin';
  const theme      = useTheme();
  const isDesktop  = useMediaQuery(theme.breakpoints.up('sm'));

  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [openSupport, setOpenSupport] = useState(false);
  const [loggingOut,  setLoggingOut]  = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/auth/log-in';
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Toolbar sx={{ justifyContent: 'center', py: 2 }}>
        <Typography variant="h6" sx={{ color: '#fff', letterSpacing: 1 }} noWrap>
          Woortec Admin
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: '#393c42' }} />

      {/* MAIN MENU */}
      <List sx={{ flexGrow: 1 }}>
        {[
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
          { text: 'Users',     icon: <PeopleIcon />,   path: '/admin/users' },
        ].map(({ text, icon, path }) => (
          <Link key={text} href={path} passHref>
            <ListItemButton
              selected={pathname === path}
              onClick={() => setMobileOpen(false)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <ListItemIcon sx={{ color: pathname === path ? '#fff' : '#e1e1e6' }}>
                {icon}
              </ListItemIcon>
              <ListItemText
                primary={text}
                primaryTypographyProps={{
                  fontWeight: pathname === path ? 700 : 400,
                }}
              />
            </ListItemButton>
          </Link>
        ))}
      </List>

      <Divider sx={{ mt: 2, borderColor: '#393c42' }} />

      {/* SUPPORT */}
      <List>
        <ListItemButton
          onClick={() => setOpenSupport(o => !o)}
          sx={{ '&:hover': { backgroundColor: theme.palette.action.hover } }}
        >
          <ListItemIcon sx={{ color: '#e1e1e6' }}>
            <MailIcon />
          </ListItemIcon>
          <ListItemText primary="Messages" />
          {openSupport ? <ExpandLess /> : <ExpandMore />}
        </ListItemButton>

        <Collapse in={openSupport} timeout="auto" unmountOnExit>
          <List component="div" disablePadding>
            {[
              { text: 'Inbox',         icon: <InboxIcon />,   path: '/admin/messages/inbox' },
              { text: 'Notifications', icon: <ReceiptIcon />, path: '/admin/messages/notifications' },
            ].map(({ text, icon, path }) => (
              <Link key={text} href={path} passHref>
                <ListItemButton
                  sx={{ pl: 4 }}
                  onClick={() => setMobileOpen(false)}
                >
                  <ListItemIcon sx={{ color: '#e1e1e6' }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText primary={text} />
                </ListItemButton>
              </Link>
            ))}
          </List>
        </Collapse>
      </List>

      <Divider sx={{ borderColor: '#393c42', my: 1 }} />

      {/* LOGOUT */}
      <Box sx={{ p: 1 }}>
        <Button
          fullWidth
          startIcon={<ExitToAppIcon />}
          onClick={handleLogout}
          disabled={loggingOut}
          variant="outlined"
          sx={{
            color: '#e1e1e6',
            borderColor: '#555',
            '&:hover': { borderColor: '#888' },
          }}
        >
          {loggingOut 
            ? <CircularProgress size={20} color="inherit" />
            : 'Log Out'
          }
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Hamburger for mobile */}
      {!isDesktop && (
        <Box
          sx={{
            position: 'fixed',
            top: theme.spacing(1),
            left: theme.spacing(1),
            zIndex: theme.zIndex.drawer + 1,
          }}
        >
          <IconButton
            onClick={() => setMobileOpen(true)}
            sx={{ color: '#1abc9c' }}
          >
            <MenuIcon />
          </IconButton>
        </Box>
      )}

      {/* Drawer */}
      <DarkDrawer
        variant={isDesktop ? 'permanent' : 'temporary'}
        open={isDesktop ? true : mobileOpen}
        onClose={() => setMobileOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: isDesktop
            ? { xs: 'none', sm: 'block' }
            : { xs: 'block', sm: 'none' },
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0,0,0,0.6)',
          },
        }}
      >
        {drawerContent}
      </DarkDrawer>
    </>
  );
}
