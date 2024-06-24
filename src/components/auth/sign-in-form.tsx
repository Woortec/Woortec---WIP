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
import Cookies from 'js-cookie';

import { paths } from '@/paths';
import { createClient } from '../../../utils/supabase/client';
import { useUser } from '@/hooks/use-user';

import GoogleIcon from '../core/GoogleIcon';
import FacebookIcon from '../core/FacebookIcon';

export function SignInForm(): React.JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const { checkSession } = useUser();

  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [errors, setErrors] = React.useState<{ email?: string; password?: string; root?: string }>({});
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');

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

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (data?.session) {
      Cookies.set('accessToken', data.session.access_token, { expires: 3 });
      router.push('/');
    } else if (error) {
      setErrors((prev) => ({ ...prev, root: error.message }));
      setIsPending(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsPending(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
    if (error) {
      setErrors((prev) => ({ ...prev, root: error.message }));
      setIsPending(false);
      return;
    }
    // You can now rely on the OAuth flow to handle the redirect
  };

  const handleFacebookSignIn = async () => {
    setIsPending(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'facebook' });
    if (error) {
      setErrors((prev) => ({ ...prev, root: error.message }));
      setIsPending(false);
      return;
    }
    // You can now rely on the OAuth flow to handle the redirect
  };

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
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button onClick={handleGoogleSignIn} disabled={isPending} variant="outlined" style={{ borderRadius: '50%' }}>
              <GoogleIcon />
            </Button>
            <Button onClick={handleFacebookSignIn} disabled={isPending} variant="outlined" style={{ borderRadius: '50%' }}>
              <FacebookIcon />
            </Button>
          </Stack>
        </Stack>
      </form>
      <Alert color="warning">
        Ensure your credentials are correct before logging in.
      </Alert>
    </Stack>
  );
}
