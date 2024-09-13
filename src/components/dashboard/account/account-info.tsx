'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useUser } from '@/hooks/use-user'; // Import the custom useUser hook

export function AccountInfo(): React.JSX.Element {
  const { user, isLoading } = useUser(); // Fetch the currently logged-in user and loading status

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Display a loading state while fetching user data
  }

  // Fallback values if user or user metadata is undefined
  const userName = user?.user_metadata?.full_name || user?.email || 'Guest User';
  const userAvatar = user?.user_metadata?.avatar_url || '/assets/avatar.png';

  return (
    <Card>
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <div>
            <Avatar src={userAvatar} sx={{ height: '80px', width: '80px' }} />
          </div>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{userName}</Typography>
          </Stack>
        </Stack>
      </CardContent>
      <Divider />
      <CardActions>
        <Button fullWidth variant="text">
          Upload picture
        </Button>
      </CardActions>
    </Card>
  );
}
