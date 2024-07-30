import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { Strategy } from '@phosphor-icons/react';
import { ChartBar } from '@phosphor-icons/react';
import { TrendUp } from '@phosphor-icons/react';
import { Broadcast  } from '@phosphor-icons/react';
import { Lightbulb } from '@phosphor-icons/react';
import { ShoppingBag } from '@phosphor-icons/react';

export const navIcons = {
  'strategy': Strategy,
  'chart-bar': ChartBar,
  'trendup': TrendUp,
  'broadcast': Broadcast,
  'lightbulb': Lightbulb,
  'shoppingbag': ShoppingBag,
  user: UserIcon,
  users: UsersIcon,
} as Record<string, Icon>;
