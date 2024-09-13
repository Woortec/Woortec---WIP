'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import Joyride, { Step } from 'react-joyride'; // Import Joyride

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname() ?? ''; // Provide a default empty string if pathname is null
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [runTour, setRunTour] = React.useState(false); // State for running the tour
  const [isMounted, setIsMounted] = React.useState(false); // State to track when the component is mounted

  // Automatically start the tour when the component is mounted
  React.useEffect(() => {
    setIsMounted(true); // Mark component as mounted
    setRunTour(true);
  }, []);

  // Define steps for the Joyride tour
  const steps: Step[] = [
    {
      target: '.overview-step',
      content: 'Here is the overview section.',
    },
    {
      target: '.ads-performance-step',
      content: 'Here you can view the ads performance.',
    },
    {
      target: '.ads-strategies-step',
      content: 'This section contains the ads strategies.',
    },
    {
      target: '.campaign-setup-step',
      content: 'Set up your campaign from here.',
    },
    {
      target: '.social-connections-step',
      content: 'Manage your social connections here.',
    },
  ];

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
      <Stack spacing={2} sx={{ p: 2, alignItems: 'center' }}>
        <Box
          component={RouterLink}
          href={paths.home}
          className="logo-step"
          sx={{ display: 'inline-flex', justifyContent: 'center' }}
        >
          <Logo color="light" height={60} width={110} />
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
            <Typography color="var(--mui-palette-neutral-400)" variant="body2" sx={{ textAlign: 'center' }}>
              Woortec
            </Typography>
          </Box>
          <CaretUpDownIcon />
        </Box>
      </Stack>
      <Divider sx={{ borderColor: '#E0E0E0', my: 1 }} />

      <Box component="nav" sx={{ flex: '1 1 auto', p: 1 }}>
        {renderNavItems({ pathname, items: navItems })}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Joyride component for the tour */}
      {isMounted && (
        <Joyride
          steps={steps}
          run={runTour}
          continuous={true}
          scrollToFirstStep={true}
          showProgress={true}
          showSkipButton={true}
          styles={{
            options: {
              zIndex: 10000,
            },
          }}
          callback={(data) => {
            if (data.status === 'finished' || data.status === 'skipped') {
              setRunTour(false); // Reset tour when finished or skipped
            }
          }}
        />
      )}

      <IconButton
        aria-label="open drawer"
        onClick={handleDrawerToggle}
        edge="start"
        sx={{
          display: { lg: 'none', xs: 'inline-flex' },
          position: 'fixed',
          top: 16,
          left: 15,
          zIndex: 1300,
        }}
      >
        <MenuIcon />
      </IconButton>

      {/* Desktop side nav */}
      <Box
        sx={{
          '--SideNav-background': '#FFFFFF',
          '--SideNav-color': '#333333',
          bgcolor: 'var(--SideNav-background)',
          color: 'var(--SideNav-color)',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          height: '98%',
          left: 19,
          maxWidth: '100%',
          borderRadius: '12px',
          position: 'fixed',
          top: 8,
          width: '357px',
          zIndex: 'var(--SideNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
          borderRight: '1px solid #E0E0E0',
          p: 2,
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

  // Define nav item classes for Joyride steps
  const navItemClasses: { [key: string]: string } = {
    Overview: 'overview-step',
    'Ads Performance': 'ads-performance-step',
    'Ads Strategies': 'ads-strategies-step',
    'Campaign Setup': 'campaign-setup-step',
    'Social Connections': 'social-connections-step',
  };

  // Make sure title is a valid string before using it as a key
  const className = typeof title === 'string' ? navItemClasses[title] || '' : '';

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
        className={className}
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
            sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '40px' }}
          >
            {title}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
