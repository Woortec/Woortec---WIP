'use client';
import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  useTheme,
} from '@mui/material';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

interface Slice { name: string; value: number; delta: number; }

interface Props {
  data: Slice[];   // e.g. [{ name: 'Basic Level', value: 30000, delta: 763 }]
}

export function RevenueSourcesChart({ data }: Props) {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
  ];

  const total = data.reduce((sum, s) => sum + s.value, 0);

  return (
    <Card sx={{ borderRadius: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={600} color="text.secondary" gutterBottom>Revenue Sources</Typography>

        <Box sx={{ width: '100%', height: 260 }}>
          <ResponsiveContainer>
            <PieChart>
              <Pie
                data={data}
                innerRadius="60%"
                outerRadius="80%"
                dataKey="value"
                paddingAngle={3}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
            </PieChart>
          </ResponsiveContainer>
        </Box>

        <Grid container spacing={2} sx={{ mt: 2 }}>
          {data.map((slice, i) => (
            <Grid item xs={12} sm={6} key={slice.name}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 2,
                  bgcolor: theme.palette.grey[100],
                  borderRadius: 1,
                }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: COLORS[i % COLORS.length],
                    mr: 1.5,
                  }}
                />
                <Box flexGrow={1}>
                  <Typography variant="subtitle2">{slice.name}</Typography>
                  <Typography variant="body1" fontWeight={600}>
                    ${slice.value.toLocaleString()}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      +${slice.delta.toLocaleString()}
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );
}
