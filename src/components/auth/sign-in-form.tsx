// src/components/auth/sign-in-form.tsx

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
import Cookies from 'js-cookie';
import Stripe from 'stripe';
import Box from '@mui/material/Box';
import NextLink from 'next/link';
import MuiLink from '@mui/material/Link';

import GTM from '../GTM';
import { paths } from '@/paths';
import { useUser } from '@/hooks/use-user';
import { createClient } from '../../../utils/supabase/client';
import { event } from '@/lib/gtag'; // ← Added GA event helper

// Initialize Stripe
const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

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

  // Function to handle Klaviyo subscription
  const handleKlaviyoSubscription = async (email: string, password?: string) => {
    try {
      const response = await fetch('/api/sign-in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        console.error('Failed to subscribe profile in Klaviyo:', result.error);
      } else {
        console.log(`Profile subscribed in Klaviyo for email: ${email}`);
      }
    } catch (error) {
      console.error('Error during Klaviyo subscription:', error);
    }
  };

  // Function to check or create Stripe Customer
  const handleStripeCustomer = async (email: string) => {
    const { data: userRecord, error: fetchError } = await supabase
      .from('user')
      .select('customerId')
      .eq('email', email)
      .single();

    if (fetchError || !userRecord?.customerId) {
      const customer = await stripe.customers.create({ email });
      await supabase.from('user').update({ customerId: customer.id }).eq('email', email);
      console.log(`Stripe customer created with ID: ${customer.id}`);
    }
  };

  const handleSubmit = async (eventSubmit: React.FormEvent<HTMLFormElement>): Promise<void> => {
    eventSubmit.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsPending(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      if (data.user) {
        Cookies.set('accessToken', data.session.access_token, { expires: 3 });
        await handleStripeCustomer(data.user.email);
        await handleKlaviyoSubscription(data.user.email, password);

        // Track successful login
        event('login_success', { method: 'email' });

        await checkSession?.();
        router.push('/');
      }
    } catch (err: any) {
      console.error('Error during sign-in:', err);
      setErrors((prev) => ({ ...prev, root: 'An unexpected error occurred. Please try again.' }));
      // Track failed login
      event('login_failure', { method: 'email', error: err.message });
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = React.useCallback(async (): Promise<void> => {
    setIsPending(true);
    // Track login click
    event('login_click', { method: 'google' });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` },
      });
      if (error) {
        setGoogleAuthError(error.message);
        setIsPending(false);
      }
    } catch (error) {
      setGoogleAuthError('An unexpected error occurred. Please try again.');
      setIsPending(false);
    }
  }, [supabase]);

  React.useEffect(() => {
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (error) {
        setGoogleAuthError('Failed to get session data after Google sign-in.');
        setIsPending(false);
        return;
      }
      if (data?.session) {
        document.cookie = `sb-access-token=${data.session.access_token}; path=/;`;
        document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/;`;
        await handleStripeCustomer(data.session.user.email);
        await handleKlaviyoSubscription(data.session.user.email);
        await checkSession?.();
        router.push('/');
      }
    };
    if (window.location.pathname === '/auth/callback') {
      handleAuthCallback();
    }
  }, [supabase, checkSession, router]);

  const handleFacebookSignIn = React.useCallback(async (): Promise<void> => {
    setIsPending(true);
    // Track login click
    event('login_click', { method: 'facebook' });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'email',
          queryParams: {
            response_type: 'code',
            config_id: '937709384919732',
          },
        },
      });
      if (error) {
        setFacebookAuthError(error.message);
        setIsPending(false);
      }
    } catch (error) {
      setFacebookAuthError('An unexpected error occurred. Please try again.');
      setIsPending(false);
    }
  }, [supabase]);

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
          <NextLink href={paths.auth.signUp} passHref>
            <MuiLink underline="hover" variant="subtitle2">
              Sign Up
            </MuiLink>
          </NextLink>
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

          <Box sx={{ textAlign: 'right' }}>
            <Button onClick={handleForgotPassword} variant="text" type="button" sx={{ padding: 0, minWidth: 0, fontSize: '0.875rem' }}>
              Forgot password?
            </Button>
          </Box>
          {resetPasswordError && <Alert color="error">{resetPasswordError}</Alert>}
          {resetPasswordSuccess && <Alert color="success">{resetPasswordSuccess}</Alert>}

          {errors.root && <Alert color="error">{errors.root}</Alert>}

          <Button
            disabled={isPending}
            type="submit"
            variant="contained"
            sx={{ backgroundColor: '#15b79e', borderRadius: '8px', marginTop: '40px' }}
          >
            Log In
          </Button>
        </Stack>
      </form>

      <Stack spacing={2} justifyContent="center" alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', marginTop: '20px' }}>
          <Box sx={{ flexGrow: 1, borderBottom: '1px solid #ccd4d8' }} />
          <Typography variant="body2" sx={{ color: '#90a4ae', paddingX: 2, fontSize: '14px' }}>
            or continue with
          </Typography>
          <Box sx={{ flexGrow: 1, borderBottom: '1px solid #ccd4d8' }} />
        </Box>

        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Button
            onClick={handleGoogleSignIn}
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
            onClick={handleFacebookSignIn}
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
      </Stack>
    </Stack>
  );
}
