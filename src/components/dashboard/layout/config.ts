import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-bar' },
  { key: 'performance', title: 'Ads Performance', href: paths.dashboard.performance, icon: 'trendup' },
  { key: 'connection', title: 'Social Connections', href: paths.dashboard.connection, icon: 'broadcast' },
  { key: 'campaign', title: 'Campaign Setup', href: paths.dashboard.campaign, icon: 'usergear' },
  { key: 'subscription', title: 'Subscription', href: paths.dashboard.subscription, icon: 'shoppingbag' },
  { key: 'adsstrategies', title: 'Ads Strategies', href: paths.dashboard.adsstrategies, icon: 'strategy' },
] satisfies NavItemConfig[];
