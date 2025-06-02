import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import ListItemIcon from '@mui/material/ListItemIcon';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { SignOut as SignOutIcon } from '@phosphor-icons/react/dist/ssr/SignOut';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { ChatCenteredText as FeedbackIcon } from '@phosphor-icons/react/dist/ssr/ChatCenteredText';
import Cookies from 'js-cookie';
import * as Sentry from '@sentry/nextjs';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { logger } from '@/lib/default-logger';
import { userData } from '@/contexts/user-context';
import { useUser } from '@/hooks/use-user';

export interface UserPopoverProps {
  anchorEl: Element | null;
  onClose: () => void;
  open: boolean;
}

export function UserPopover({ anchorEl, onClose, open }: UserPopoverProps): React.JSX.Element {
  const { checkSession } = useUser();
  const { userInfo } = userData();
  const router = useRouter();

  const handleSignOut = React.useCallback(async (): Promise<void> => {
    try {
      await authClient.signOut();
      localStorage.clear();
      const cookies = document.cookie.split('; ');
      cookies.forEach((cookie) => {
        const cookieName = cookie.split('=')[0];
        Cookies.remove(cookieName);
      });
      router.push('/auth/log-in');
      window.location.reload();
    } catch (err) {
      logger.error('Sign out error', err);
    }
  }, [router]);

  const handleFeedback = () => {
    Sentry.showReportDialog({
      title: "We’d love your feedback",
      subtitle: "Tell us what went wrong or how we can improve.",
      labelComments: "Describe the issue or your thoughts",
      labelEmail: "Email (optional)",
    });
  };

  return (
    <Popover
      anchorEl={anchorEl}
      anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
      onClose={onClose}
      open={open}
      slotProps={{ paper: { sx: { width: '240px' } } }}
    >
      <Box sx={{ p: '16px 20px ' }}>
        <Typography variant="subtitle1">{userInfo?.firstName + ' ' + userInfo?.lastName}</Typography>
        <Typography color="text.secondary" variant="body2">
          {userInfo?.email || 'dev@woortec.com'}
        </Typography>
      </Box>
      <Divider />
      <MenuList disablePadding sx={{ p: '8px', '& .MuiMenuItem-root': { borderRadius: 1 } }}>
        <MenuItem component={RouterLink} href={paths.dashboard.settings} onClick={onClose}>
          <ListItemIcon>
            <GearSixIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem component={RouterLink} href={paths.dashboard.account} onClick={onClose}>
          <ListItemIcon>
            <UserIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Profile
        </MenuItem>
        <MenuItem onClick={handleFeedback}>
          <ListItemIcon>
            <FeedbackIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Give Feedback
        </MenuItem>
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <SignOutIcon fontSize="var(--icon-fontSize-md)" />
          </ListItemIcon>
          Sign out
        </MenuItem>
      </MenuList>
    </Popover>
  );
}
