'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowSquareUpRight as ArrowSquareUpRightIcon } from '@phosphor-icons/react/dist/ssr/ArrowSquareUpRight';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname() ?? ''; // Provide a default empty string if pathname is null
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box
      sx={{
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: 340, // Adjust width for mobile drawer
        p: 2, // Adjust padding to reduce space
      }}
    >
      <Stack spacing={2} sx={{ p: 2, alignItems: 'center' }}> {/* Reduced padding and center-aligned items */}
        <Box component={RouterLink} href={paths.home} sx={{ display: 'inline-flex', justifyContent: 'center' }}>
          <Logo color="light" height={60} width={110} /> {/* Reduced logo size */}
        </Box>
        <Box
          sx={{
            alignItems: 'center',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            p: '4px 12px',
          }}
        >
          <Box sx={{ flex: '1 1 auto' }}>
            <Typography color="var(--mui-palette-neutral-400)" variant="body2" sx={{ textAlign: 'center' }}> {/* Centered text */}
              Woortec
            </Typography>
          </Box>
          <CaretUpDownIcon />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: '#E0E0E0', my: 1 }} /> {/* Adjusted margin */}
      <Box component="nav" sx={{ flex: '1 1 auto', p: 1 }}> {/* Reduced padding */}
        {renderNavItems({ pathname, items: navItems })}
      </Box>
      <Stack spacing={1} sx={{ p: 1 }}>
        <div>
          {/* Add any additional items or actions here */}
        </div>
      </Stack>
    </Box>
  );

  return (
    <>
      {/* Mobile hamburger icon */}
      <IconButton
        aria-label="open drawer"
        onClick={handleDrawerToggle}
        edge="start"
        sx={{
          display: { lg: 'none', xs: 'inline-flex' },
          position: 'fixed',
          top: 16,
          left: 15,
          zIndex: 1300, // Ensure it stays on top
        }}
      >
        <MenuIcon />
      </IconButton>
      
      {/* Desktop side nav */}
      <Box
        sx={{
          '--SideNav-background': '#FFFFFF',
          '--SideNav-color': '#333333',
          '--NavItem-color': '#333333',
          '--NavItem-hover-background': '#F0F0F0',
          '--NavItem-active-background': '#E0E0E0',
          '--NavItem-active-color': '#333333',
          '--NavItem-disabled-color': '#A0A4A8',
          '--NavItem-icon-color': '#333333',
          '--NavItem-icon-active-color': '#333333',
          '--NavItem-icon-disabled-color': '#A0A4A8',
          bgcolor: 'var(--SideNav-background)',
          color: 'var(--SideNav-color)',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          height: '98%',
          left: 19,
          maxWidth: '100%',
          borderRadius: '12px',
          position: 'fixed',
          scrollbarWidth: 'none',
          top: 8,
          width: '357px', // Reduced width for the sidebar
          zIndex: 'var(--SideNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
          borderRight: '1px solid #E0E0E0',
          p: 2, // Reduced padding to compact the sidebar
        }}
      >
        {drawer}
      </Box>

      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 256,
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

function renderNavItems({ items = [], pathname }: { items?: NavItemConfig[]; pathname: string }): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig): React.ReactNode[] => {
    const { key, ...item } = curr;

    acc.push(<NavItem key={key} pathname={pathname} {...item} />);

    return acc;
  }, []);

  return (
    <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {children}
    </Stack>
  );
}

interface NavItemProps extends Omit<NavItemConfig, 'items'> {
  pathname: string;
}

function NavItem({ disabled, external, href, icon, matcher, pathname, title }: NavItemProps): React.JSX.Element {
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  return (
    <li>
      <Box
        {...(href
          ? {
              component: external ? 'a' : RouterLink,
              href,
              target: external ? '_blank' : undefined,
              rel: external ? 'noreferrer' : undefined,
            }
          : { role: 'button' })}
        sx={{
          alignItems: 'center',
          borderRadius: '4px',
          color: 'var(--NavItem-color)',
          cursor: 'pointer',
          display: 'flex',
          flex: '0 0 auto',
          gap: 1,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: '#F4F5F7',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && { bgcolor: 'var(--NavItem-active-background)', color: 'var(--NavItem-active-color)' }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon ? (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          ) : null}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography
            component="span"
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '40px' }} // Adjusted line-height
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
