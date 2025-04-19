'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Grid from '@mui/material/Unstable_Grid2';

import { userData } from '@/contexts/user-context';
import { useUser } from '@/hooks/use-user';

import { createClient } from '../../../../utils/supabase/client';

interface UserMetadata {
  full_name?: string;
  avatar_url?: string;
}

export function AccountDetailsForm(): React.JSX.Element {
  const supabase = createClient();
  const { userInfo, fetchApiData, updateUser } = userData();
  const { user } = useUser(); // Fetch the currently logged-in user from Supabase Auth
  console.log(userInfo);
  const userMetadata: UserMetadata = user?.user_metadata || {};
  const [firstName, setFirstName] = useState(userInfo?.firstName || '');
  const [lastName, setLastName] = useState(userInfo?.lastName || '');
  const [avatarUrl, setAvatarUrl] = useState(userMetadata.avatar_url || '');
  const [image, setImage] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchApiData(user.id);
    }
  }, [user]);
  // Load user profile data when the component mounts
  useEffect(() => {
    if (userInfo) {
      setFirstName(userInfo?.firstName);
      setLastName(userInfo?.lastName);
    }
  }, [userInfo]);

  // Handle profile image change
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from reloading the page
    setIsSubmitting(true);
    if (user) {
      updateUser(firstName, lastName, user?.id);
    }
    if (!user) {
      console.error('User is not logged in.');
      setIsSubmitting(false);
      return;
    }

    try {
      // Update profile details in Supabase (name)
      const { error: profileError } = await supabase.auth.updateUser({
        data: { full_name: firstName + ' ' + lastName },
      });

      if (profileError) {
        console.error('Profile update failed:', profileError.message);
        setIsSubmitting(false);
        return;
      }

      // Upload and update profile picture if image is selected
      if (image) {
        const filePath = `${user.id}/profile-picture.png`;
        const { error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(filePath, image, { upsert: true });

        if (uploadError) {
          console.error('Image upload failed:', uploadError.message);
          setIsSubmitting(false);
          return;
        }

        const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/profile-pictures/${filePath}`;

        // Update profile picture URL in user metadata
        const { error: dbError } = await supabase.from('user').update({ avatar_url: imageUrl }).eq('id', user.id);

        if (dbError) {
          console.error('Failed to update profile picture URL:', dbError.message);
          setIsSubmitting(false);
          return;
        }

        setAvatarUrl(imageUrl); // Update state to reflect the new profile picture URL
      }

      // Optionally handle password update if provided
      if (password) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password,
        });

        if (passwordError) {
          console.error('Password update failed:', passwordError.message);
          setIsSubmitting(false);
          return;
        }
      }

      setIsSubmitting(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error during form submission:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
  <CardHeader subheader="The information can be edited" title="Profile" />
  <Divider />
  <CardContent sx={{ flexGrow: 1 }}>
    <Grid container spacing={3}>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Full Name</InputLabel>
          <OutlinedInput
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            label="Full Name"
            name="fullName"
          />
        </FormControl>
      </Grid>
      <Grid md={6} xs={12}>
        <FormControl fullWidth required>
          <InputLabel>Last Name</InputLabel>
          <OutlinedInput
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            label="Last Name"
            name="lastName"
          />
        </FormControl>
      </Grid>
    </Grid>
  </CardContent>
  <Divider />
  <CardActions sx={{ justifyContent: 'flex-end' }}>
    <Button disabled={isSubmitting} type="submit" variant="contained">
      Save details
    </Button>
  </CardActions>
</Card>
    </form>
  );
}
