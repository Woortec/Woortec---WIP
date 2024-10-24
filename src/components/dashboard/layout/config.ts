import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-bar' },
  {
    key: 'performance',
    title: 'Ads Performance',
    href: paths.dashboard.performance,
    icon: 'trendup',
    items: [
      { key: 'buyerpersona', title: 'Buyer Persona', href: paths.dashboard.buyerpersona, icon: 'strategy' },
    ],
  },
  { key: 'strategy', title: 'Ads Strategy', href: paths.dashboard.objective, icon: 'strategy' },
  { key: 'setupcampaign', title: 'Campaign Setup', href: paths.dashboard.setupcampaign, icon: 'usergear' },
  { key: 'connection', title: 'Social Connections', href: paths.dashboard.connection, icon: 'broadcast' },
];
