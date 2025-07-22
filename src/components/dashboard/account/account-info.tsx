'use client';

import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Unstable_Grid2';
import { useUser } from '@/hooks/use-user';
import { createClient } from '../../../../utils/supabase/client';
import { useLocale } from '@/contexts/LocaleContext';

export function AccountInfo(): React.JSX.Element {
  const { t } = useLocale();
  const { user, isLoading } = useUser();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  if (isLoading) {
    return <Typography>{t('AccountInfo.loading')}</Typography>;
  }

  const userName = user?.user_metadata?.full_name || user?.email;
  const userAvatar = user?.user_metadata?.avatar_url;

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log('supabase session user.id:', user?.id);
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    setUploading(true);
    setError(null);

    try {
      // 1) upload to Storage under the auth UID folder
      const filePath = `${user.id}/${file.name}`;
      const { error: uploadError } = await supabase
        .storage
        .from('avatars')
        .upload(filePath, file, { cacheControl: '3600', upsert: true });
      if (uploadError) throw uploadError;

      // 2) get the public URL
      const { data } = supabase
        .storage
        .from('avatars')
        .getPublicUrl(filePath);
      const publicUrl = data.publicUrl;

      // 3) update the built-in auth profile (optional)
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl }
      });
      if (authError) throw authError;

      // 4) update your custom "user" table
      const { error: dbError } = await supabase
        .from('user')
        .update({ avatar_url: publicUrl })
        .eq('uuid', user.id);
      if (dbError) throw dbError;

      alert(t('AccountInfo.profilePictureUpdated'));
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (


    <Stack>
      <Typography variant="h3" sx={{textAlign:'left', fontSize:'1.5rem', fontWeight:'600', marginBottom:'1rem'}}  >{t('AccountInfo.accountInfo')}</Typography>
      <Card
      sx={{
        display: 'flex',
        '@media (max-width:770px)': { flexDirection: 'column' },
      }}
    >
      <CardContent>
        <Stack sx={{ alignItems: 'center', display: 'flex' }}>
          <div>
            <Avatar src={userAvatar} sx={{ height: '150px', width: '150px' }} />
            <Divider sx={{ pt: '10px' }} />
            <Button
              fullWidth
              variant="text"
              component="label"
              disabled={uploading}
            >
              {uploading ? <CircularProgress size={24} /> : t('AccountInfo.uploadPicture')}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            {error && (
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            )}
          </div>
        </Stack>
      </CardContent>
      <Grid xs={12}>
        <CardContent sx={{ width: '100%' }}>
          <Box sx={{ textAlign: 'left' }}>
            <Typography
              variant="h3"
              sx={{
                '@media (max-width:770px)': {
                  textAlign: 'center',
                  pt: '0px',
                },
              }}
            >
              {userName}
            </Typography>
          </Box>
          <Divider sx={{ pt: '10px' }} />
          <Box sx={{ pt: '10px', textAlign: 'left' }}>
            <Typography sx={{ padding: '5px 0px' }}>{t('AccountInfo.phone')}:</Typography>
            <Typography sx={{ padding: '5px 0px' }}>{t('AccountInfo.email')}:</Typography>
            <Typography sx={{ padding: '5px 0px' }}>{t('AccountInfo.location')}:</Typography>
          </Box>
        </CardContent>
      </Grid>
    </Card>
    </Stack>
  );
}
