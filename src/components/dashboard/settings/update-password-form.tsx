'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';

import { createClient } from '../../../../utils/supabase/client';
import { useLocale } from '@/contexts/LocaleContext';

export function UpdatePasswordForm(): React.JSX.Element {
  const { t } = useLocale();
  const supabase = createClient();
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const updatePaswword = async () => {
    if (password === confirmPassword) {
      const { data, error } = await supabase.auth.updateUser({ password: password });
      console.log('data', data);
      console.log(error);

      alert(t('UpdatePassword.passwordUpdated'));
    } else {
      alert(t('UpdatePassword.passwordMismatch'));
    }
  };
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <Card>
        <CardHeader subheader={t('UpdatePassword.updatePassword')} title={t('UpdatePassword.password')} />
        <Divider />
        <CardContent>
          <Stack spacing={3} sx={{ maxWidth: 'sm' }}>
            <FormControl fullWidth>
              <InputLabel>{t('UpdatePassword.password')}</InputLabel>
              <OutlinedInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                label={t('UpdatePassword.password')}
                name="password"
                type="password"
              />
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>{t('UpdatePassword.confirmPassword')}</InputLabel>
              <OutlinedInput
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                label={t('UpdatePassword.confirmPassword')}
                name="confirmPassword"
                type="password"
              />
            </FormControl>
          </Stack>
        </CardContent>
        <Divider />
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Button
            onClick={() => {
              updatePaswword();
            }}
            variant="contained"
          >
            {t('UpdatePassword.update')}
          </Button>
        </CardActions>
      </Card>
    </form>
  );
}
