'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useUser } from '@/hooks/use-user'; // Import the custom useUser hook
import Grid from '@mui/material/Unstable_Grid2';

export function AccountInfo(): React.JSX.Element {
  const { user, isLoading } = useUser(); // Fetch the currently logged-in user and loading status

  if (isLoading) {
    return <Typography>Loading...</Typography>; // Display a loading state while fetching user data
  }

  // Fallback values if user or user metadata is undefined
  const userName = user?.user_metadata?.full_name || user?.email || 'Guest User';
  const userAvatar = user?.user_metadata?.avatar_url || '/assets/avatar.png';

  return (
    <Card sx={{display:'flex'}}>
      <CardContent>
        <Stack sx={{alignItems: 'center', display:'flex' }}>
          <div>
            <Avatar src={userAvatar} sx={{ height: '150px', width: '150px' }}/>
            <Divider sx={{pt:'10px'}} />
            <Button fullWidth variant='text'>
              Upload picture
            </Button>
          </div>
        </Stack>
      </CardContent>
      <Grid xs={12}>
        <CardContent sx={{width:'100%'}}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography variant="h3">{userName}</Typography>
          </Box>
          <Divider sx={{pt:'10px'}}/>
          <Box sx={{ pt:'10px', textAlign: 'left' }}>
            <Typography sx={{ padding:'5px 0px' }}>Phone:</Typography>
            <Typography sx={{ padding:'5px 0px' }}>Email:</Typography>
            <Typography sx={{ padding:'5px 0px' }}>Location:</Typography>
          </Box>
        </CardContent>
      </Grid>
    </Card>
  );
}
