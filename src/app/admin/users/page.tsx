'use client';
import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
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
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';

interface UserRow {
  id:           string;
  email:        string;
  suspended:    boolean;
  subscription: boolean;
  created_at:   string;
}

interface SubRow {
  userId:   string;      // now a string UUID matching Auth user IDs
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers]     = useState<UserRow[]>([]);
  const [search, setSearch]   = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      // Fetch users and subscriptions in parallel
      const [uRes, sRes] = await Promise.all([
        fetch(`/api/admin/users?search=${encodeURIComponent(search)}`),
        fetch('/api/admin/subscriptions'),
      ]);
      if (!uRes.ok || !sRes.ok) {
        throw new Error(`Fetch error: users ${uRes.status}, subs ${sRes.status}`);
      }

      // Decode JSON
      const [usersData, subsData] = await Promise.all([
        uRes.json() as Promise<Omit<UserRow,'subscription'>[]>,
        sRes.json() as Promise<SubRow[]>,
      ]);

      // Build a Set of UUIDs with active subscriptions
      const subMap = new Set(subsData.filter(s => s.isActive).map(s => s.userId));

      // Merge subscription flag into each user
      const merged: UserRow[] = usersData.map((u) => ({
        ...u,
        subscription: subMap.has(u.id),
      }));

      setUsers(merged);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError('Failed to load users or subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [search]);

  const toggleSuspend = async (u: UserRow) => {
    // optimistic update
    setUsers(prev =>
      prev.map(x => x.id === u.id ? { ...x, suspended: !u.suspended } : x)
    );
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: u.id, suspended: !u.suspended }),
    });
    if (!res.ok) {
      // rollback on error
      setUsers(prev =>
        prev.map(x => x.id === u.id ? { ...x, suspended: u.suspended } : x)
      );
      console.error(await res.json());
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Grid container justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h4">Users</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: '100%', sm: 'auto' } }}>
          <TextField
            size="small"
            placeholder="Search by email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ endAdornment: <SearchIcon /> }}
            sx={{ width: { xs: '100%', sm: 240 } }}
          />
        </Box>
      </Grid>

      {loading ? (
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow>
                <TableCell>Email</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Subscription</TableCell>
                <TableCell align="center">Status</TableCell>
                <TableCell align="center">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} hover>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {new Date(u.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={u.subscription ? 'Active' : 'Inactive'}
                      size="small"
                      color={u.subscription ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Typography
                      variant="body2"
                      sx={{
                        color: u.suspended ? 'error.main' : 'success.main',
                        fontWeight: 600,
                      }}
                    >
                      {u.suspended ? 'Suspended' : 'Active'}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      onClick={() => toggleSuspend(u)}
                      color={u.suspended ? 'warning' : 'primary'}
                    >
                      {u.suspended ? <ToggleOffIcon /> : <ToggleOnIcon />}
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Container>
  );
}
