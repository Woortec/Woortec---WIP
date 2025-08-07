'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Unstable_Grid2';
import { useLocale } from '@/contexts/LocaleContext';

export function Notifications(): React.JSX.Element {
  const { t } = useLocale();
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <Typography variant="h4">{t('Notifications.mainTitle')}</Typography>
      </div>
      <Card>
        <CardHeader subheader={t('Notifications.manageNotifications')} title={t('Notifications.title')} />
        <Divider />
        <CardContent>
          <Grid container spacing={6} wrap="wrap">
            <Grid md={4} sm={6} xs={12}>
              <Stack spacing={1}>
                <Typography variant="h6">{t('Notifications.email')}</Typography>
                <FormGroup>
                  <FormControlLabel control={<Checkbox defaultChecked />} label={t('Notifications.productUpdates')} />
                  <FormControlLabel control={<Checkbox />} label={t('Notifications.securityUpdates')} />
                </FormGroup>
              </Stack>
            </Grid>
            <Grid md={4} sm={6} xs={12}>
              <Stack spacing={1}>
                <Typography variant="h6">{t('Notifications.phone')}</Typography>
                <FormGroup>
                  <FormControlLabel control={<Checkbox defaultChecked />} label={t('Notifications.email')} />
                  <FormControlLabel control={<Checkbox />} label={t('Notifications.securityUpdates')} />
                </FormGroup>
              </Stack>
            </Grid>
            <Grid md={4} sm={6} xs={12}>
              <Stack spacing={1}>
                <Typography variant="h6">{t('Notifications.cancellationReporting')}</Typography>
                <FormGroup>
                  <FormControlLabel control={<Checkbox defaultChecked />} label={t('Notifications.sendWeeklyReport')} />
                  <FormControlLabel control={<Checkbox />} label={t('Notifications.notifyOnCancellation')} />
                  <FormControlLabel control={<Checkbox />} label={t('Notifications.monthlySummary')} />
                </FormGroup>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button variant="contained">{t('Notifications.saveChanges')}</Button>
        </CardActions>
      </Card>
    </form>
  );
}
