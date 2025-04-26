'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import { useRouter } from 'next/navigation';
import { useUser } from '@/hooks/use-user';
import { createClient } from '../../../../utils/supabase/client';
import axios from 'axios';

const supabase = createClient();

export function InvoiceHistory(): React.JSX.Element {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = React.useState(false);
  const [subscriptionId, setSubscriptionId] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = React.useState<any>(null);
  const [invoices, setInvoices] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchUserSubscription = async () => {
      const { data: { user: sbUser }, error } = await supabase.auth.getUser();
      if (error || !sbUser) return;

      const { data: userRecord, error: userError } = await supabase
        .from('user')
        .select('id')
        .eq('uuid', sbUser.id)
        .single();
      if (userError || !userRecord) return;
      setUserId(userRecord.id);

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions_details')
        .select('*, planid:Plan (plan_name)')
        .eq('userId', userRecord.id)
        .eq('isActive', true)
        .single();
      if (!subError && subscription) {
        setSubscriptionId(subscription.subscriptionId);
        setHasActiveSubscription(true);
        setSubscriptionDetails(subscription);

        if (subscription.customerId) {
          try {
            const { data } = await axios.post('/api/route', {
              customerId: subscription.customerId,
            });
            if (data?.invoices) {
              setInvoices(data.invoices);
            }
          } catch (err) {
            console.error('Error fetching invoices:', err);
          }
        }
      }
    };
    fetchUserSubscription();
  }, []);

  const handleCancelSubscription = async () => {
    if (!subscriptionId) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/subscription', { subscriptionId });
      if (res.data.success) {
        alert('Subscription cancelled successfully!');
        setHasActiveSubscription(false);
      } else {
        alert('Error cancelling subscription.');
      }
    } catch {
      alert('There was an issue cancelling your subscription.');
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  if (isLoading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Card>
      <CardHeader title="Invoice History" />
      <Divider />
      {hasActiveSubscription && subscriptionDetails && invoices.length > 0 && (
        <CardContent>
          <Stack spacing={2} sx={{ mt: 2, mb: 2 }}>
            {invoices.map((invoice) => (
              <Stack
                key={invoice.id}
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                spacing={2}
                sx={{
                  '@media (max-width:770px)': {
                    flexDirection: 'column',
                    textAlign: 'left',
                  },
                }}
              >
                <Stack>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Invoice #
                  </Typography>
                  <Typography sx={{ fontSize: '12px' }}>
                    {invoice.number || 'N/A'}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Date
                  </Typography>
                  <Typography sx={{ fontSize: '12px' }}>
                    {new Date(invoice.date * 1000).toLocaleDateString()}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Amount
                  </Typography>
                  <Typography sx={{ fontSize: '12px' }}>
                    ${invoice.amount_paid / 100}
                  </Typography>
                </Stack>
                <Stack>
                  <Typography sx={{ fontSize: '12px', fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Typography sx={{ fontSize: '12px' }}>
                    {invoice.status.toUpperCase()}
                  </Typography>
                </Stack>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    if (!invoice.invoice_pdf) {
                      alert('Invoice PDF not available.');
                      return;
                    }
                    const link = document.createElement('a');
                    link.href = invoice.invoice_pdf;
                    link.download = `invoice-${invoice.number || invoice.id}.pdf`;
                    link.target = '_blank';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  Download Invoice
                </Button>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      )}
      {/* Dialog for cancellation (imported but not triggered in this snippet) */}
      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Cancel Subscription</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your subscription?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} disabled={loading}>
            No
          </Button>
          <Button onClick={handleCancelSubscription} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Yes, Cancel'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
