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
import { Google as GoogleIcon, Facebook as FacebookIcon } from '@mui/icons-material'; // Import Facebook icon
import Cookies from 'js-cookie';

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
  const [facebookAuthError, setFacebookAuthError] = React.useState<string | null>(null); // State for Facebook auth error

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

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (data.user) {
      Cookies.set('accessToken', data.session.access_token, { expires: 3 }); // Cookie expires in 3 days
      router.push('/');
    }

    if (error) {
      setErrors((prev) => ({ ...prev, root: error.message }));
      setIsPending(false);
      return;
    }
  };

  const handleGoogleSignIn = React.useCallback(async (): Promise<void> => {
    setIsPending(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `/`,
      },
    });

    if (data?.session) {
      // Store the session token in cookies
      document.cookie = `sb-access-token=${data.session.access_token}; path=/;`;
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/;`;
    }

    if (error) {
      console.log('Google auth error', error);
      setGoogleAuthError(error.message);
      setIsPending(false);
      return;
    }

    await checkSession?.();
    router.refresh();
  }, [checkSession, router, supabase]);

  // Handler for Facebook sign-in
  const handleFacebookSignIn = React.useCallback(async (): Promise<void> => {
    setIsPending(true);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `/`,
      },
    });

    if (data?.session) {
      // Store the session token in cookies
      document.cookie = `sb-access-token=${data.session.access_token}; path=/;`;
      document.cookie = `sb-refresh-token=${data.session.refresh_token}; path=/;`;
    }

    if (error) {
      console.log('Facebook auth error', error);
      setFacebookAuthError(error.message);
      setIsPending(false);
      return;
    }

    await checkSession?.();
    router.refresh();
  }, [checkSession, router, supabase]);

  return (
    <Stack spacing={4}>
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
        onClick={handleFacebookSignIn} // Facebook sign-in handler
        disabled={isPending}
        type="button"
        variant="contained"
        startIcon={<FacebookIcon />} // Facebook icon
      >
        Sign in with Facebook
      </Button>
      {facebookAuthError && <Alert color="error">{facebookAuthError}</Alert>} // Display Facebook auth error
      <Alert color="warning">
        Text Here <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit"></Typography>{' '}
        <Typography component="span" sx={{ fontWeight: 700 }} variant="inherit"></Typography>
      </Alert>
    </Stack>
  );
}
