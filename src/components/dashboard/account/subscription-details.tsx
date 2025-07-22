'use client';

import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
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
import { useLocale } from '@/contexts/LocaleContext';
import { createClient } from '../../../../utils/supabase/client';
import axios from 'axios';

const supabase = createClient();

export function CancelSubscription(): React.JSX.Element {
  const { t } = useLocale();
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
        alert(t('SubscriptionDetails.subscriptionCancelled'));
        setHasActiveSubscription(false);
      } else {
        alert(t('SubscriptionDetails.errorCancelling'));
      }
    } catch (error) {
      alert(t('SubscriptionDetails.issueCancelling'));
    } finally {
      setLoading(false);
      setShowDialog(false);
    }
  };

  if (isLoading) {
    return <Typography>{t('SubscriptionDetails.loading')}</Typography>;
  }

  return (
    <Card>
      <CardContent sx={{display:'flex', alignItems: 'center', justifyContent:'center'}}>
        <Stack spacing={2} sx={{alignItems: 'center' }}>
          <Avatar src="/assets/sad.svg" sx={{ height: '80px', width: '80px'}}/>
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">{t('SubscriptionDetails.manageSubscription')}</Typography>
            <Typography variant="body2">
              {hasActiveSubscription
                ? t('SubscriptionDetails.cancelWarning')
                : t('SubscriptionDetails.noActiveSubscription')}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>

      {hasActiveSubscription && subscriptionDetails && (
        <>
          <CardContent>
            <Typography variant="h6" sx={{ textAlign: 'left', marginBottom:'20px' }}>{t('SubscriptionDetails.subscriptionDetails')}</Typography>
            <Stack spacing={1}>
              <Typography variant="body2"><strong>{t('SubscriptionDetails.plan')}:</strong> {subscriptionDetails.planid?.plan_name || t('SubscriptionDetails.unknownPlan')}</Typography>
              <Typography variant="body2"><strong>{t('SubscriptionDetails.startDate')}:</strong> {new Date(subscriptionDetails.start_date).toLocaleDateString()}</Typography>
              <Typography variant="body2"><strong>{t('SubscriptionDetails.expirationDate')}:</strong> {subscriptionDetails.end_date ? new Date(subscriptionDetails.end_date).toLocaleDateString() : t('SubscriptionDetails.ongoing')}</Typography>
              <Typography variant="body2"><strong>{t('SubscriptionDetails.nextPaymentDate')}:</strong> {new Date(new Date(subscriptionDetails.start_date).setMonth(new Date(subscriptionDetails.start_date).getMonth() + 1)).toLocaleDateString()}</Typography>
            </Stack>
          </CardContent>
        </>
      )}

      <Divider />
      <CardActions>
        {hasActiveSubscription ? (
          <Button
            fullWidth
            variant="outlined"
            color="error"
            onClick={() => setShowDialog(true)}
            disabled={!subscriptionId || loading}
          >
            {t('SubscriptionDetails.cancelSubscription')}
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => router.push('/dashboard/subscription')}
          >
            {t('SubscriptionDetails.subscribeHere')}
          </Button>
        )}
      </CardActions>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>{t('SubscriptionDetails.confirmCancellation')}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('SubscriptionDetails.confirmCancellationText')}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="secondary">
            {t('SubscriptionDetails.close')}
          </Button>
          <Button onClick={handleCancelSubscription} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : t('SubscriptionDetails.confirmCancellation')}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
