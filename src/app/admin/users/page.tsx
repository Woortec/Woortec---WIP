'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Breadcrumbs,
  Link as MuiLink,
  TextField,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  IconButton,
  Typography,
  CircularProgress,
  Grid,
  Chip,
  InputAdornment,
  Avatar,
  useTheme,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import NextLink from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// Provider icons
import GoogleIcon from '@mui/icons-material/Google';
import FacebookIcon from '@mui/icons-material/Facebook';
import EmailIcon from '@mui/icons-material/Email';

interface UserRow {
  id: string;
  email: string;
  name: string;
  avatar_url: string;
  providers: string[];
  subscription: boolean;
  suspended: boolean;
  created_at: string;
  last_sign_in_at: string;
}

interface SubRow {
  userId: string;
  isActive: boolean;
}

export default function UsersPage() {
  const theme = useTheme();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // fetch users & subscriptions, then merge subscription flag
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        fetch(`/api/admin/users?search=${encodeURIComponent(search)}`),
        fetch('/api/admin/subscriptions'),
      ]);
      if (!uRes.ok || !sRes.ok) {
        throw new Error(`Fetch error: users ${uRes.status}, subs ${sRes.status}`);
      }
      const [usersData, subsData] = await Promise.all([
        uRes.json() as Promise<UserRow[]>,
        sRes.json() as Promise<SubRow[]>,
      ]);

      const activeSet = new Set(subsData.filter(s => s.isActive).map(s => s.userId));
      const merged = usersData.map(u => ({
        ...u,
        subscription: activeSet.has(u.id),
      }));
      setUsers(merged);
      setError(null);
    } catch {
      setError('Failed to load users or subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const toggleSuspend = async (u: UserRow) => {
    setUsers(prev =>
      prev.map(x => (x.id === u.id ? { ...x, suspended: !u.suspended } : x))
    );
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, suspended: !u.suspended }),
    });
    if (!res.ok) {
      // rollback on failure
      setUsers(prev => prev.map(x => (x.id === u.id ? u : x)));
    }
  };

  const renderProviderIcon = (p: string) => {
    if (p === 'google') return <GoogleIcon fontSize="small" />;
    if (p === 'facebook') return <FacebookIcon fontSize="small" />;
    return <EmailIcon fontSize="small" />;
  };

  return (
    <Box sx={{ width: '100%', px: { xs: 2, sm: 3, md: 4 }, py: 4 }}>
      {/* Breadcrumb */}
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <NextLink href="/admin" passHref>
          <MuiLink
            sx={{ display: 'flex', alignItems: 'center' }}
            underline="hover"
            color="inherit"
          >
            <HomeIcon fontSize="small" sx={{ mr: 0.5 }} /> Dashboard
          </MuiLink>
        </NextLink>
        <Typography color="text.primary">Users</Typography>
      </Breadcrumbs>

      {/* Header */}
      <Grid container justifyContent="space-between" alignItems="center" mb={3}>
        <TextField
          size="small"
          placeholder="Search by email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ width: { xs: '100%', sm: 300 } }}
        />
      </Grid>

      {/* Loading / Error */}
      {loading ? (
        <Box textAlign="center" py={8}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer
          component={Paper}
          elevation={2}
          sx={{ borderRadius: 2, overflowX: 'auto', width: '100%' }}
        >
          <Table sx={{ minWidth: 1000 }}>
            <TableHead>
              <TableRow>
                <TableCell width={48} />
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Providers</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell>Last Sign-In</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map(u => (
                <TableRow
                  key={u.id}
                  hover
                  selected={u.suspended}
                  sx={{
                    '&.Mui-selected, &.Mui-selected:hover': {
                      backgroundColor: theme.palette.action.selected,
                    },
                  }}
                >
                  <TableCell>
                    <IconButton size="small">
                      <KeyboardArrowDownIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar
                        src={u.avatar_url}
                        sx={{ mr: 2, width: 32, height: 32 }}
                      />
                      <Typography fontWeight={600}>{u.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.providers.map((p, i) => (
                      <IconButton key={i} size="small">
                        {renderProviderIcon(p)}
                      </IconButton>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.subscription ? 'Active' : 'Inactive'}
                      size="small"
                      color={u.subscription ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    {u.last_sign_in_at
                      ? new Date(u.last_sign_in_at).toLocaleDateString('en-US', {
                          month: '2-digit',
                          day: '2-digit',
                          year: '2-digit',
                        })
                      : '—'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => toggleSuspend(u)}>
                      {u.suspended ? (
                        <ToggleOffIcon fontSize="small" color="warning" />
                      ) : (
                        <ToggleOnIcon fontSize="small" color="primary" />
                      )}
                    </IconButton>
                    <IconButton size="small">
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small">
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
