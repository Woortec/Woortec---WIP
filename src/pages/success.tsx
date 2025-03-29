'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogActions, Button, CircularProgress, Typography } from '@mui/material';

interface SuccessModalProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal = ({ sessionId, isOpen, onClose }: SuccessModalProps) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [session_id, setSessionId] = useState<string | null>(sessionId);

  useEffect(() => {
    if (!sessionId && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlSessionId = urlParams.get('session_id');
      if (urlSessionId) setSessionId(urlSessionId);
    }
  }, [sessionId]);

  useEffect(() => {
    if (session_id) {
      fetchSessionDetails(session_id);
    }
  }, [session_id]);

  const fetchSessionDetails = async (sessionId: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/stripe-session/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session details');
      const sessionData = await response.json();
      setSession(sessionData);
    } catch (error) {
      setError('Error fetching session details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={Boolean(isOpen)} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogContent sx={{ textAlign: 'center', p: 3 }}>
        {loading ? (
          <CircularProgress />
        ) : error ? (
          <Typography color="error">{error}</Typography>
        ) : (
          session && (
            <>
              <Typography variant="h6" gutterBottom>
                Payment Successful! 🎉
              </Typography>
              <Typography variant="body1">Thank you for your payment!</Typography>
              <Typography variant="body2">
                <strong>Session ID:</strong> {session_id}
              </Typography>
              <Typography variant="body2">
                <strong>Amount Paid:</strong> ${(session.amount_total / 100).toFixed(2)} {session.currency.toUpperCase()}
              </Typography>
            </>
          )
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SuccessModal;
