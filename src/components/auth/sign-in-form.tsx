'use client'

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Eye as EyeIcon } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash as EyeSlashIcon } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Google as GoogleIcon, Facebook as FacebookIcon } from '@mui/icons-material';
import Cookies from 'js-cookie';
import { subscribeProfile } from '@/lib/klaviyo/subscribeProfile';

import GTM from '../GTM';
import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';
import { createClient } from '../../../utils/supabase/client';

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; root?: string }>({});
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [googleAuthError, setGoogleAuthError] = React.useState<string | null>(null);
  const [facebookAuthError, setFacebookAuthError] = React.useState<string | null>(null);

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubscription = async (email: string) => {
    try {
      await subscribeProfile(email);
      console.log('Profile subscribed in Klaviyo for email:', email);
    } catch (error) {
      console.error('Failed to subscribe profile in Klaviyo:', error);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsPending(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrors((prev) => ({ ...prev, root: error.message }));
        setIsPending(false);
        return;
      }

      if (data.user) {
        Cookies.set('accessToken', data.session.access_token, { expires: 3 });
        await handleProfileSubscription(data.user.email); // Subscribe profile in Klaviyo
        router.push('/');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      setErrors((prev) => ({ ...prev, root: 'An unexpected error occurred. Please try again.' }));
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = React.useCallback(async (): Promise<void> => {
    setIsPending(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `http://app.woortec.com/auth/callback`,
        },
      });

      if (error) {
        console.log('Google auth error', error);
        setGoogleAuthError(error.message);
        setIsPending(false);
        return;
      }

      if (data?.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/;`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/;`;
        await handleProfileSubscription(data.session.user.email); // Subscribe profile in Klaviyo
      }

      await checkSession?.();
      router.refresh();
    } catch (error) {
      console.error('Error during Google sign-in:', error);
      setGoogleAuthError('An unexpected error occurred. Please try again.');
      setIsPending(false);
    }
  }, [checkSession, router, supabase]);

  const handleFacebookSignIn = React.useCallback(async (): Promise<void> => {
    setIsPending(true);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `http://app.woortec.com/auth/callback`,
        },
      });

      if (error) {
        console.log('Facebook auth error', error);
        setFacebookAuthError(error.message);
        setIsPending(false);
        return;
      }

      if (data?.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/;`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/;`;
        await handleProfileSubscription(data.session.user.email); // Subscribe profile in Klaviyo
      }

      await checkSession?.();
      router.refresh();
    } catch (error) {
      console.error('Error during Facebook sign-in:', error);
      setFacebookAuthError('An unexpected error occurred. Please try again.');
      setIsPending(false);
    }
  }, [checkSession, router, supabase]);

  return (
    <Stack spacing={4}>
      <GTM gtmId="GTM-NXB5KPF3" /> {/* Add GTM component here */}
      <Stack spacing={1}>
        <Typography variant="h4">Sign in</Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign up
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit}>
        <Stack spacing={2}>
          <FormControl error={Boolean(errors.email)}>
            <InputLabel>Email address</InputLabel>
            <OutlinedInput
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              label="Email address"
              type="email"
            />
            {errors.email && <FormHelperText>{errors.email}</FormHelperText>}
          </FormControl>
          <FormControl error={Boolean(errors.password)}>
            <InputLabel>Password</InputLabel>
            <OutlinedInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              endAdornment={
                showPassword ? (
                  <EyeIcon cursor="pointer" fontSize="var(--icon-fontSize-md)" onClick={() => setShowPassword(false)} />
                ) : (
                  <EyeSlashIcon
                    cursor="pointer"
                    fontSize="var(--icon-fontSize-md)"
                    onClick={() => setShowPassword(true)}
                  />
                )
              }
              label="Password"
              type={showPassword ? 'text' : 'password'}
            />
            {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
          </FormControl>
          <div>
            <Link component={RouterLink} href={paths.auth.resetPassword} variant="subtitle2">
              Forgot password?
            </Link>
          </div>
          {errors.root && <Alert color="error">{errors.root}</Alert>}
          <Button disabled={isPending} type="submit" variant="contained">
            Sign in
          </Button>
        </Stack>
      </form>
      <Button
        onClick={handleGoogleSignIn}
        disabled={isPending}
        type="button"
        variant="contained"
        startIcon={<GoogleIcon />}
      >
        Sign in with Google
      </Button>
      {googleAuthError && <Alert color="error">{googleAuthError}</Alert>}
      <Button
        onClick={handleFacebookSignIn}
        disabled={isPending}
        type="button"
        variant="contained"
        startIcon={<FacebookIcon />}
      >
        Sign in with Facebook
      </Button>
      {facebookAuthError && <Alert color="error">{facebookAuthError}</Alert>}
    </Stack>
  );
}
