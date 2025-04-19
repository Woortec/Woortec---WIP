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
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const { data: userRecord, error: userError } = await supabase
        .from('user')
        .select('id')
        .eq('uuid', user.id)
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

        // Fetch invoices
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
      const response = await axios.post('/api/subscription', { subscriptionId });
      if (response.data.success) {
        alert('Subscription cancelled successfully!');
        setHasActiveSubscription(false);
      } else {
        alert('Error cancelling subscription.');
      }
    } catch (error) {
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
      <Divider></Divider>
      {hasActiveSubscription && subscriptionDetails && (
        <>
          {invoices.length > 0 && (
            <CardContent>
              <Stack spacing={2} sx={{ mt: 2, mb: 2 }}>
                {invoices.map((invoice) => (
                  <Stack
                    key={invoice.id}
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack>
                      <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                        Invoice #
                      </Typography>
                      <Typography sx={{ fontSize: '12px' }}>
                        {invoice.number || 'N/A'} {/* Display the invoice number correctly */}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                        Date
                      </Typography>
                      <Typography sx={{ fontSize: '12px' }}>
  {new Date(invoice.date * 1000).toLocaleDateString()}
</Typography>
                    </Stack>
                    <Stack>
                      <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                        Amount
                      </Typography>
                      <Typography sx={{ fontSize: '12px' }}>
                        ${invoice.amount_paid / 100} {/* Display amount paid */}
                      </Typography>
                    </Stack>
                    <Stack>
                      <Typography sx={{ fontSize: '12px', fontWeight: '600' }}>
                        Status
                      </Typography>
<Typography sx={{ fontSize: '12px' }}>
  {invoice.status.toUpperCase()} {/* Display invoice status in uppercase */}
</Typography>
                    </Stack>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                    >
                      View Invoice
                    </Button>
                  </Stack>
                ))}
              </Stack>
            </CardContent>
          )}
        </>
      )}
    </Card>
  );
}
