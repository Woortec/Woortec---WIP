import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  { key: 'overview', titleKey: 'Navbar.overview', href: paths.dashboard.overview, icon: 'chart-bar' },
  {
    key: 'performance',
    titleKey: 'Navbar.adsPerformance',
    href: paths.dashboard.performance,
    icon: 'trendup',
  },
  { key: 'strategy', titleKey: 'Navbar.adsStrategy', href: paths.dashboard.objective, icon: 'strategy',
    items: [
      { key: 'buyerpersona', titleKey: 'Navbar.buyerPersona', href: paths.dashboard.buyerpersona, icon: 'strategy' },
    ],
   },
  { key: 'setupcampaign', titleKey: 'Navbar.campaignSetup', href: paths.dashboard.setupcampaign, icon: 'usergear' },
  { key: 'connection', titleKey: 'Navbar.socialConnections', href: paths.dashboard.connection, icon: 'broadcast' },
];
