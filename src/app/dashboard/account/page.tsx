import * as React from 'react';
import type { Metadata } from 'next';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';


import { config } from '@/config';
import { AccountDetailsForm } from '@/components/dashboard/account/account-details-form';
import { AccountInfo } from '@/components/dashboard/account/account-info';
import { CancelSubscription } from '@/components/dashboard/account/subscription-details';
import { InvoiceHistory } from '@/components/dashboard/account/invoice';

export const metadata = { title: `Account | Dashboard | ${config.site.name}` } satisfies Metadata;

export default function Page(): React.JSX.Element {
  return (
    <Stack sx={{padding:'2rem', bgcolor:'white', borderRadius:'10px', height:'100%', minHeight:'92.5vh'}}>
      <Grid container sx={{width:'100%'}}>
        <Typography sx={{fontSize:'1.25rem', fontWeight:'600'}}>Profile</Typography>
      </Grid>

      <Grid container spacing={2} sx={{ width: '100%', pt: '20px', alignItems: 'stretch' }}>
  {/* Left Column */}
  <Grid xs={12} md={6} lg={6} sx={{ width:'100%', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
    <AccountInfo />
    <AccountDetailsForm />
  </Grid>

  {/* Right Column */}
  <Grid xs={12} md={6} lg={6} sx={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
    <CancelSubscription />
    <InvoiceHistory />
  </Grid>
</Grid>
    </Stack>
  );
}
