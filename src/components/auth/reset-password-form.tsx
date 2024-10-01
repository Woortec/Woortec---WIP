'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Controller, useForm } from 'react-hook-form';
import { z as zod } from 'zod';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const schema = zod.object({
  password: zod.string().min(6, { message: 'Password must be at least 6 characters long' }),
  confirmPassword: zod.string().min(6, { message: 'Confirm Password must be at least 6 characters long' }),
}).superRefine((data, ctx) => {
  if (data.password !== data.confirmPassword) {
    ctx.addIssue({
      code: zod.ZodIssueCode.custom,
      message: "Passwords don't match",
      path: ['confirmPassword'], // specify which field has the issue
    });
  }
});

type Values = zod.infer<typeof schema>;

const defaultValues = { password: '', confirmPassword: '' } satisfies Values;

// Initialize the Supabase client 
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

export function ResetPasswordForm(): React.JSX.Element {
  const [isPending, setIsPending] = React.useState<boolean>(false);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  const router = useRouter();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ defaultValues, resolver: zodResolver(schema) });

  const onSubmit = React.useCallback(
    async (values: Values): Promise<void> => {
      setIsPending(true);

      try {
        const { error } = await supabase.auth.updateUser({
          password: values.password,
        });

        if (error) {
          setErrorMessage(error.message);
        } else {
          setSuccessMessage('Your password has been successfully reset.');
          setTimeout(() => {
            router.push('/auth/log-in'); // Redirect to sign-in page after a short delay
          }, 3000);
        }
      } catch (error) {
        setErrorMessage('An unexpected error occurred. Please try again.');
      } finally {
        setIsPending(false);
      }
    },
    [router]
  );

  return (
    <Stack spacing={4} maxWidth={400} margin="auto" mt={8}>
      <Typography variant="h5">Reset Password</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <FormControl error={Boolean(errors.password)} fullWidth>
                <InputLabel>New Password</InputLabel>
                <OutlinedInput {...field} label="New Password" type="password" />
                {errors.password ? <FormHelperText>{errors.password.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            render={({ field }) => (
              <FormControl error={Boolean(errors.confirmPassword)} fullWidth>
                <InputLabel>Confirm Password</InputLabel>
                <OutlinedInput {...field} label="Confirm Password" type="password" />
                {errors.confirmPassword ? <FormHelperText>{errors.confirmPassword.message}</FormHelperText> : null}
              </FormControl>
            )}
          />
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}
          <Button disabled={isPending} type="submit" variant="contained" fullWidth>
            {isPending ? 'Resetting Password...' : 'Reset Password'}
          </Button>
        </Stack>
      </form>
    </Stack>
  );
}
