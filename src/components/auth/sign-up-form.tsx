'use client';

import * as React from 'react';
import RouterLink from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControl from '@mui/material/FormControl';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import Link from '@mui/material/Link';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import Stripe from 'stripe';
import { z as zod } from 'zod';

import { paths } from '@/paths';
import { authClient } from '@/lib/auth/client';
import { useUser } from '@/hooks/use-user';

import { createClient } from '../../../utils/supabase/client';

const stripe = new Stripe(process.env.NEXT_PUBLIC_STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

// Updated schema with confirm password validation
const schema = zod.object({
  firstName: zod.string().min(1, { message: 'First name is required' }),
  lastName: zod.string().min(1, { message: 'Last name is required' }),
  email: zod.string().min(1, { message: 'Email is required' }).email(),
  password: zod
    .string()
    .min(8, { message: 'Password should be at least 8 characters' })
    .regex(/[A-Z]/, { message: 'Password should have at least one uppercase letter' })
    .regex(/\d/, { message: 'Password should have at least one number' }),
  confirmPassword: zod.string().min(1, { message: 'Confirm password is required' }),
  terms: zod.boolean().refine((value) => value, 'You must accept the terms and conditions'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'], // Path to the confirmPassword field
});

type Values = zod.infer<typeof schema>;

const defaultValues = { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', terms: false } satisfies Values;

export function SignUpForm(): React.JSX.Element {
  const router = useRouter();
  const supabase = createClient();
  const { checkSession } = useUser();

  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState<boolean>(false);
  const [isEmailRegistered, setIsEmailRegistered] = React.useState<boolean>(false); // New state

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleClickShowConfirmPassword = () => setShowConfirmPassword((show) => !show);
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const {
    control,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);
  
      // Call the UserCheck API to validate the email
      const emailCheckResponse = await fetch(`https://api.usercheck.com/email/${values.email}?key=YxppwgkhuJuAyYh489KyPALDXOlldowp`, {
        method: 'GET',
      });
  
      const emailCheckData = await emailCheckResponse.json();
  
      // Check if the email is disposable
      if (emailCheckData.disposable) {
        setError('email', { message: 'Temporary/disposable email addresses are not allowed' });
        setIsPending(false);
        return;
      }
  
      // Check if the email is already registered in Supabase
      const { data: userExists, error: userCheckError } = await supabase
        .from('user')
        .select('email')
        .eq('email', values.email);
  
      if (userExists && userExists.length > 0) {
        setIsEmailRegistered(true); // Set flag to display log-in message
        setIsPending(false);
        return;
      }
  
      // Proceed with the sign-up if the email is not disposable or already registered
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            firstName: values.firstName,
            lastName: values.lastName,
          },
        },
      });
  
      if (error) {
        setError('root', { type: 'server', message: error.message });
        setIsPending(false);
        return;
      }
  
      if (data) {
        // Create a Stripe customer
        const customer = await stripe.customers.create({
          email: values.email,
          name: `${values.firstName} ${values.lastName}`,
        });
  
        // Insert the user into the Supabase 'user' table
        await supabase.from('user').insert([
          {
            email: data.user.user_metadata.email,
            provider: data.user.app_metadata.provider,
            uuid: data.user.user_metadata.sub,
            firstName: data.user.user_metadata.firstName,
            lastName: data.user.user_metadata.lastName,
            customerId: customer.id, // Store the Stripe customer ID
          },
        ]);
      }
  
      alert('Please verify your email');
  
      // Refresh the auth state
      await checkSession?.();
      router.refresh();
    },
    [checkSession, router, setError, supabase]
  );
  

  return (
    <Stack spacing={3}>
      <Stack spacing={1}>
        <Typography variant="h4">Sign up</Typography>
        <Typography color="text.secondary" variant="body2">
          Already have an account?{' '}
          <Link component={RouterLink} href={paths.auth.signIn} underline="hover" variant="subtitle2">
            Log In
          </Link>
        </Typography>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="firstName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.firstName)}>
                <InputLabel
                sx={{
                  fontSize: '15px', // Adjust font size
                  top: '-2px'
                }}
                 >First name</InputLabel>
                <OutlinedInput {...field} label="First name" 
                sx={{ borderRadius: '8px', // Add rounded corners
                  backgroundColor: '#FFFFFF', // Change the color
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },  // Remove the grey border
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid #15b79e' },  // Keep the border on focus
                  height: '45px'
                 }}
                 />
                {errors.firstName ? <FormHelperText>{errors.firstName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="lastName"
            render={({ field }) => (
              <FormControl error={Boolean(errors.lastName)}>
                <InputLabel
                 sx={{
                  fontSize: '15px', // Adjust font size
                  top: '-2px'
                }}
                >Last name</InputLabel>
                <OutlinedInput {...field} label="Last name" 
                sx={{
                  backgroundColor: '#FFFFFF', // Change the color
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },  // Remove the grey border
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid #15b79e' },  // Keep the border on focus
                  height: '45px'
                 }}
                 />
                {errors.lastName ? <FormHelperText>{errors.lastName.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="email"
            render={({ field }) => (
              <FormControl error={Boolean(errors.email)}>
                <InputLabel
                sx={{
                  fontSize: '15px', // Adjust the font size here
                  top: '-2px'
                 }}
                >Email address</InputLabel>
                <OutlinedInput {...field} label="Email address" type="email"
                sx={{
                  backgroundColor: '#FFFFFF', // Change the color
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },  // Remove the grey border
                  '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid #15b79e' },  // Keep the border on focus
                  height: '45px'
                 }}
                 />
                {errors.email ? <FormHelperText>{errors.email.message}</FormHelperText> : null}
                {isEmailRegistered && (
                  <FormHelperText error>
                    Email is already registered. Please{' '}
                    <Link href="https://app.woortec.com/auth/log-in" underline="hover" target="_blank">
                      log in here
                    </Link>.
                  </FormHelperText>
                )}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)}>
                <InputLabel
                sx={{
                  fontSize: '15px', // Adjust the font size here
                  top: '-2px'
                 }}
                 >Password</InputLabel>
                <OutlinedInput
                  {...field}
                  
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  sx={{
                    backgroundColor: '#FFFFFF', // Change the color
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },  // Remove the grey border
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid #15b79e' },  // Keep the border on focus
                    height: '45px'
                   }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleClickShowPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl error={Boolean(errors.confirmPassword)}>
                <InputLabel
                sx={{
                  fontSize: '15px', // Adjust the font size here
                  top: '-2px'
                 }}
                 >Confirm Password</InputLabel>
                <OutlinedInput
                  {...field}
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  sx={{
                    backgroundColor: '#FFFFFF', // Change the color
                    '& .MuiOutlinedInput-notchedOutline': { border: 'none' },  // Remove the grey border
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { border: '2px solid #15b79e' },  // Keep the border on focus
                    height: '45px'
                   }}
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={handleClickShowConfirmPassword}
                        onMouseDown={handleMouseDownPassword}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="terms"
            render={({ field }) => (
              <div>
                <FormControlLabel
                  control={<Checkbox {...field} />}
                  label={
                    <React.Fragment>
                      I have read the{' '}
                      <Link
                        href="https://www.woortec.com/terms-and-conditions"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        terms and conditions
                      </Link>
                    </React.Fragment>
                  }
                />
                {errors.terms ? <FormHelperText error>{errors.terms.message}</FormHelperText> : null}
              </div>
            )}
          />
          {errors.root ? <Alert color="error">{errors.root.message}</Alert> : null}
          <Button disabled={isPending} type="submit" variant="contained">
            Sign up
          </Button>
        </Stack>
      </form>
      <Alert color="warning">After you sign-up, please confirm your email to sign-in</Alert>
    </Stack>
  );
}
