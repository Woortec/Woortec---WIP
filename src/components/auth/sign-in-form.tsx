// sign-in-form.tsx

'use client';

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
import Box from '@mui/material/Box';
import { User } from '@supabase/supabase-js';

import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';
import { createClient } from '../../../utils/supabase/client';

// Initialize Supabase client
const supabase = createClient();

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; root?: string }>({});
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [googleAuthError, setGoogleAuthError] = React.useState<string | null>(null);
  const [facebookAuthError, setFacebookAuthError] = React.useState<string | null>(null);
  const [resetPasswordError, setResetPasswordError] = React.useState<string | null>(null);
  const [resetPasswordSuccess, setResetPasswordSuccess] = React.useState<string | null>(null);

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

      if (data.session) {
        await checkSession?.();
        router.push('/');
      }
    } catch (error) {
      console.error('Error during sign-in:', error);
      setErrors((prev) => ({ ...prev, root: 'An unexpected error occurred. Please try again.' }));
      setIsPending(false);
    }
  };

  const handleOAuthSignIn = React.useCallback(
    async (provider: 'google' | 'facebook'): Promise<void> => {
      setIsPending(true);

      try {
        let options: any = {
          redirectTo: `${window.location.origin}/auth/callback`,
        };

        if (provider === 'facebook') {
          options = {
            ...options,
            scopes: 'email,public_profile', // Add scopes as needed
            queryParams: {
              config_id: '937709384919732', // Include your actual config_id here
            },
          };
        }

        const { error } = await supabase.auth.signInWithOAuth({
          provider,
          options,
        });

        if (error) {
          if (provider === 'google') {
            setGoogleAuthError(error.message);
          } else {
            setFacebookAuthError(error.message);
          }
          setIsPending(false);
        }
      } catch (error) {
        if (provider === 'google') {
          setGoogleAuthError('An unexpected error occurred. Please try again.');
        } else {
          setFacebookAuthError('An unexpected error occurred. Please try again.');
        }
        setIsPending(false);
      }
    },
    []
  );

  React.useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });

      if (error) {
        setErrors((prev) => ({ ...prev, root: 'Failed to get session data after OAuth sign-in.' }));
        setIsPending(false);
        return;
      }

      if (data.session) {
        await checkSession?.();
        router.push('/');
      }
    };

    if (window.location.pathname === '/auth/callback') {
      handleAuthCallback();
    }
  }, [checkSession, router]);

  const handleForgotPassword = async () => {
    setResetPasswordError(null);
    setResetPasswordSuccess(null);
    if (!email) {
      setErrors((prev) => ({ ...prev, email: 'Email is required to reset password' }));
      return;
    }
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `https://app.woortec.com/auth/reset-password`,
      });

      if (error) {
        setResetPasswordError(error.message);
      } else {
        setResetPasswordSuccess('Password reset email sent. Please check your inbox.');
      }
    } catch (error) {
      setResetPasswordError('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ marginTop: '20px' }}>
          Welcome back!
        </Typography>
        <Typography color="text.secondary" variant="body2">
          Don&apos;t have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signUp} underline="hover" variant="subtitle2">
            Sign Up
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
              sx={{
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid #15b79e' },
              }}
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
              sx={{
                borderRadius: '8px',
                backgroundColor: '#FFFFFF',
                '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid #15b79e' },
              }}
            />
            {errors.password && <FormHelperText>{errors.password}</FormHelperText>}
          </FormControl>
          <div>
            <Box sx={{ textAlign: 'right' }}>
              <Link component="button" onClick={handleForgotPassword} variant="subtitle2">
                Forgot password?
              </Link>
            </Box>
            {resetPasswordError && <Alert color="error">{resetPasswordError}</Alert>}
            {resetPasswordSuccess && <Alert color="success">{resetPasswordSuccess}</Alert>}
          </div>

          {errors.root && <Alert color="error">{errors.root}</Alert>}
          <Button
            disabled={isPending}
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: '#15b79e',
              borderRadius: '8px',
              marginTop: '40px',
            }}
          >
            Log In
          </Button>
        </Stack>
      </form>
      <Stack spacing={2} justifyContent="center" alignItems="center">
        {/* Horizontal line with "or continue with" text */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            marginTop: '20px',
          }}
        >
          <Box sx={{ flexGrow: 1, borderBottom: '1px solid #ccd4d8' }}></Box>
          <Typography
            variant="body2"
            sx={{
              color: '#90a4ae',
              paddingX: 2,
              fontSize: '14px',
            }}
          >
            or continue with
          </Typography>
          <Box sx={{ flexGrow: 1, borderBottom: '1px solid #ccd4d8' }}></Box>
        </Box>

        {/* Google and Facebook circular buttons */}
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Button
            onClick={() => handleOAuthSignIn('google')}
            disabled={isPending}
            type="button"
            variant="outlined"
            sx={{
              width: '50px',
              height: '50px',
              minWidth: '50px',
              borderRadius: '50%',
              borderColor: '#486A75',
              color: '#486A75',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: '#486A75',
                borderColor: '#486A75',
                color: '#ffffff',
              },
            }}
          >
            <GoogleIcon />
          </Button>
          <Button
            onClick={() => handleOAuthSignIn('facebook')}
            disabled={isPending}
            type="button"
            variant="outlined"
            sx={{
              width: '50px',
              height: '50px',
              minWidth: '50px',
              borderRadius: '50%',
              borderColor: '#486A75',
              color: '#486A75',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              '&:hover': {
                backgroundColor: '#486A75',
                borderColor: '#486A75',
                color: '#ffffff',
              },
            }}
          >
            <FacebookIcon />
          </Button>
        </Stack>
        {googleAuthError && <Alert color="error">{googleAuthError}</Alert>}
        {facebookAuthError && <Alert color="error">{facebookAuthError}</Alert>}
      </Stack>
    </Stack>
  );
}
