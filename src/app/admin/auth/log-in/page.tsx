// app/admin/auth/log-in/page.tsx
'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export default function AdminLoginPage() {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [username, setUsername]   = useState('');
  const [password, setPassword]   = useState('');
  const [showPassword, setShow]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const fakeEmail = `${username}@admin.local`;
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fakeEmail, password }),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || 'Login failed');
    } else {
      window.location.href = `${window.location.origin}/admin`;
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: isMobile ? 320 : 380,
          bgcolor: '#FFFFFF',
          borderRadius: 3,
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          p: isMobile ? 3 : 5,
          textAlign: 'center',
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 2,
          }}
        >
          <Box
            sx={{
              position: 'relative',
              width: isMobile ? 100 : 140,
              height: isMobile ? 40 : 56,
            }}
          >
            <Image
              src="/assets/woortec1.svg"
              alt="Woortec Logo"
              layout="fill"
              objectFit="contain"
              priority
            />
          </Box>
        </Box>
        <Typography variant="body2" sx={{ color: '#7A7C8C', mb: 3 }}>
          Admin Panel
        </Typography>

        <TextField
          fullWidth
          variant="filled"
          label="Username"
          placeholder="e.g. emilie.smith"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CheckCircleOutlineIcon
                  sx={{ color: username ? 'success.main' : '#C1C2C6' }}
                />
              </InputAdornment>
            ),
          }}
          sx={{
            mb: 2,
            '& .MuiFilledInput-root': { backgroundColor: '#F0F1F5' },
            '& .MuiFilledInput-underline:before': { borderBottomColor: '#D1D3D8' },
            '& .MuiFilledInput-underline:after':  { borderBottomColor: '#00CCA3' },
            '& .MuiInputLabel-filled': { color: '#7A7C8C' },
          }}
        />

        <TextField
          fullWidth
          variant="filled"
          type={showPassword ? 'text' : 'password'}
          label="Password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShow(s => !s)}
                  edge="end"
                  sx={{ color: '#00CCA3' }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          helperText={password.length > 0 ? '' : ' '}
          sx={{
            mb: 3,
            '& .MuiFilledInput-root': { backgroundColor: '#F0F1F5' },
            '& .MuiFilledInput-underline:before': { borderBottomColor: '#D1D3D8' },
            '& .MuiFilledInput-underline:after':  { borderBottomColor: '#00CCA3' },
            '& .MuiInputLabel-filled': { color: '#7A7C8C' },
            '& .MuiFormHelperText-root': {
              margin: 0,
              height: '0.75em',
            },
          }}
        />

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLogin}
          disabled={loading}
          sx={{
            mb: 1,
            bgcolor: '#00CCA3',
            color: '#fff',
            '&:hover': { bgcolor: '#00b28e' },
          }}
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </Button>

        <Typography
          variant="caption"
          display="block"
          sx={{ color: '#7A7C8C', mt: 1 }}
        >
          dev@woortec.com
        </Typography>
      </Box>
    </Box>
  );
}
