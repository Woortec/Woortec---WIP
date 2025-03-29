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
import { createClient } from '../../../../utils/supabase/client';
import axios from 'axios';

const supabase = createClient();

export function CancelSubscription(): React.JSX.Element {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showDialog, setShowDialog] = React.useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = React.useState(false);
  const [subscriptionId, setSubscriptionId] = React.useState<string | null>(null);
  const [userId, setUserId] = React.useState<number | null>(null);
  const [subscriptionDetails, setSubscriptionDetails] = React.useState<any>(null);

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
      <CardContent>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar src="/assets/sad.svg" sx={{ height: '80px', width: '80px' }} />
          <Stack spacing={1} sx={{ textAlign: 'center' }}>
            <Typography variant="h5">Manage Your Subscription</Typography>
            <Typography variant="body2">
              {hasActiveSubscription
                ? "If you cancel, you'll lose access to all premium features."
                : "You do not have an active subscription."}
            </Typography>
          </Stack>
        </Stack>
      </CardContent>
      {hasActiveSubscription && subscriptionDetails && (
        <CardContent>
          <Typography variant="h6" sx={{ textAlign: 'center' }}>Subscription Details</Typography>
          <Stack spacing={1}>
          <Typography variant="body2"><strong>Plan:</strong> {subscriptionDetails.planid?.plan_name || 'Unknown Plan'}</Typography>
            <Typography variant="body2"><strong>Start Date:</strong> {new Date(subscriptionDetails.start_date).toLocaleDateString()}</Typography>
            <Typography variant="body2"><strong>Expiration Date:</strong> {subscriptionDetails.end_date ? new Date(subscriptionDetails.end_date).toLocaleDateString() : 'Ongoing'}</Typography>
            <Typography variant="body2"><strong>Next Payment Date:</strong> {new Date(new Date(subscriptionDetails.start_date).setMonth(new Date(subscriptionDetails.start_date).getMonth() + 1)).toLocaleDateString()}</Typography>
          </Stack>
        </CardContent>
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
            Cancel Subscription
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={() => router.push('/dashboard/subscription')}
          >
            Subscribe Here
          </Button>
        )}
      </CardActions>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)}>
        <DialogTitle>Confirm Cancellation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel your subscription? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="secondary">
            Close
          </Button>
          <Button onClick={handleCancelSubscription} color="error" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm Cancellation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
