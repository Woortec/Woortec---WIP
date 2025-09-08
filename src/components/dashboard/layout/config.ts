import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems: NavItemConfig[] = [
  { key: 'overview', titleKey: 'Overview', href: paths.dashboard.overview, icon: 'chart-bar' },
  {
    key: 'performance',
    titleKey: 'Ads Performance',
    href: paths.dashboard.performance,
    icon: 'trendup',
  },
  { key: 'strategy', titleKey: 'Ads Strategy', href: paths.dashboard.objective, icon: 'strategy',
    items: [
      { key: 'buyerpersona', titleKey: 'Buyer Persona', href: paths.dashboard.buyerpersona, icon: 'strategy' },
    ],
   },
  { key: 'setupcampaign', titleKey: 'Campaign Setup', href: paths.dashboard.setupcampaign, icon: 'usergear' },
  { key: 'connection', titleKey: 'Social Connections', href: paths.dashboard.connection, icon: 'broadcast' },
];
