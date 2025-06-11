// src/components/SideNav.tsx
'use client';

import * as React from 'react';
import { useLocale } from '@/contexts/LocaleContext';
import RouterLink from 'next/link';
import { usePathname } from 'next/navigation';
import MenuIcon from '@mui/icons-material/Menu';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { CaretUpDown as CaretUpDownIcon } from '@phosphor-icons/react/dist/ssr/CaretUpDown';
import Joyride, { CallBackProps } from 'react-joyride';

import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';
import { isNavItemActive } from '@/lib/is-nav-item-active';
import { useTour } from '@/contexts/TourContext';

import { Logo } from '@/components/core/logo';

import { navItems } from './config';
import { navIcons } from './nav-icons';

export function SideNav(): React.JSX.Element {
  const pathname = usePathname() ?? '';
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const { runTour, startTour, stopTour, steps } = useTour();
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if (status === 'finished' || status === 'skipped') {
      stopTour();
    }
  };

  const drawerContent = (
    <Box
      className="custom-sidebar"
      sx={{
        bgcolor: 'var(--SideNav-background)',
        color: 'var(--SideNav-color)',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 2,
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

        <Button
          variant="contained"
          color="primary"
          onClick={startTour}
          sx={{ mt: 2, width: '100%' }}
        >
          {/* Translated via LocaleContext */}
          {useLocale().t('Navbar.startTour')}
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      {isMounted && (
        <Joyride
          steps={steps}
          run={runTour}
          continuous
          scrollToFirstStep
          showProgress
          showSkipButton={false}
          styles={{ options: { zIndex: 10000 } }}
          callback={handleJoyrideCallback}
          locale={{ back: 'Back', next: 'Next', close: 'Close Tour' }}
          floaterProps={{ disableAnimation: true, hideArrow: true }}
        />
      )}

      <Box
        sx={{
          '--SideNav-background': '#FFFFFF',
          '--SideNav-color': '#333333',
          bgcolor: 'var(--SideNav-background)',
          color: 'var(--SideNav-color)',
          display: { xs: 'none', lg: 'flex' },
          flexDirection: 'column',
          height: '98vh',
          left: 19,
          maxWidth: '100%',
          borderRadius: '12px',
          position: 'fixed',
          top: 8,
          width: '357px',
          zIndex: 'var(--SideNav-zIndex)',
          '&::-webkit-scrollbar': { display: 'none' },
          borderRight: '1px solid #E0E0E0',
          p: 4,
        }}
      >
        {drawerContent}
      </Box>

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', lg: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 256 },
        }}
      >
        {drawerContent}
      </Drawer>
    </>
  );
}

function renderNavItems({
  items = [],
  pathname,
}: {
  items?: NavItemConfig[];
  pathname: string;
}): React.JSX.Element {
  const children = items.reduce((acc: React.ReactNode[], curr: NavItemConfig) => {
    const { key: navKey, ...item } = curr;
    acc.push(<NavItem key={navKey} navKey={navKey} pathname={pathname} {...item} />);
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
  navKey: string;
}

function NavItem({
  disabled,
  external,
  href,
  icon,
  matcher,
  pathname,
  titleKey,
  navKey,
}: NavItemProps): React.JSX.Element {
  const { t } = useLocale();
  const active = isNavItemActive({ disabled, external, href, matcher, pathname });
  const Icon = icon ? navIcons[icon] : null;

  const navItemClasses: Record<string, string> = {
    overview: 'overview-step',
    performance: 'ads-performance-step',
    strategy: 'ads-strategies-step',
    setupcampaign: 'campaign-setup-step',
    connection: 'social-connections-step',
  };
  const className = navItemClasses[navKey] || '';

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
          gap: 2,
          p: '6px 16px',
          position: 'relative',
          textDecoration: 'none',
          whiteSpace: 'nowrap',
          ...(disabled && {
            bgcolor: '#F4F5F7',
            color: 'var(--NavItem-disabled-color)',
            cursor: 'not-allowed',
          }),
          ...(active && {
            bgcolor: 'var(--NavItem-active-background)',
            color: 'var(--NavItem-active-color)',
          }),
        }}
      >
        <Box sx={{ alignItems: 'center', display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
          {Icon && (
            <Icon
              fill={active ? 'var(--NavItem-icon-active-color)' : 'var(--NavItem-icon-color)'}
              fontSize="var(--icon-fontSize-md)"
              weight={active ? 'fill' : undefined}
            />
          )}
        </Box>
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography component="span" sx={{ color: 'inherit', fontSize: '0.875rem', fontWeight: 500, lineHeight: '40px' }}>
            {t(titleKey)}
          </Typography>
        </Box>
      </Box>
    </li>
  );
}
