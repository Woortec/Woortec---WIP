import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'performance', title: 'Ads Performance', href: paths.dashboard.performance, icon: 'chart-pie' },
  { key: 'connection', title: 'Social Connections', href: paths.dashboard.connection, icon: 'chart-pie' },
  { key: 'strategies', title: 'test', href: paths.dashboard.strategies, icon: 'chart-pie' },
  { key: 'subscription', title: 'Subscription', href: paths.dashboard.subscription, icon: 'chart-pie' },
  { key: 'adsstrategies', title: 'Ads Strategies', href: paths.dashboard.adsstrategies, icon: 'chart-pie' },
] satisfies NavItemConfig[];
