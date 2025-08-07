'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { Bug as BugIcon, ChatCircle as FeedbackIcon } from '@phosphor-icons/react';
import { useLocale } from '@/contexts/LocaleContext';
import { userData } from '@/contexts/user-context';

export function Notifications(): React.JSX.Element {
  const { t } = useLocale();
  const { userInfo } = userData();
  const [openDialog, setOpenDialog] = React.useState(false);
  const [feedbackType, setFeedbackType] = React.useState('bug');
  const [subject, setSubject] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [userEmail, setUserEmail] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitStatus, setSubmitStatus] = React.useState<'idle' | 'success' | 'error'>('idle');

  // Set user email when component mounts
  React.useEffect(() => {
    if (userInfo?.email) {
      setUserEmail(userInfo.email);
    }
  }, [userInfo]);

  const handleOpenDialog = () => {
    setOpenDialog(true);
    setSubmitStatus('idle');
    setSubject('');
    setMessage('');
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSubmitStatus('idle');
  };

  const handleSubmit = async () => {
    if (!subject.trim() || !message.trim()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: feedbackType,
          subject: subject.trim(),
          message: message.trim(),
          userEmail: userEmail.trim(),
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          handleCloseDialog();
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ marginBottom: '20px', marginTop: '20px' }}>
        <Typography variant="h4">Feedback & Bug Reports</Typography>
      </div>
      
      <Card>
        <CardHeader 
          title="Report a Bug or Send Feedback" 
          subheader="Help us improve Woortec by reporting bugs or sharing your feedback"
        />
        <Divider />
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="body1" color="text.secondary">
              Found a bug or have suggestions for improvement? We'd love to hear from you! 
              Your feedback helps us make Woortec better for everyone.
            </Typography>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                startIcon={<BugIcon />}
                onClick={handleOpenDialog}
                sx={{ minWidth: 200 }}
              >
                Report a Bug
              </Button>
              <Button
                variant="outlined"
                startIcon={<FeedbackIcon />}
                onClick={() => {
                  setFeedbackType('feedback');
                  handleOpenDialog();
                }}
                sx={{ minWidth: 200 }}
              >
                Send Feedback
              </Button>
            </Stack>

            <Alert severity="info">
              <Typography variant="body2">
                <strong>What happens next?</strong> Your report will be sent directly to our development team. 
                We'll review it and get back to you if we need more information.
              </Typography>
            </Alert>
          </Stack>
        </CardContent>
      </Card>

      {/* Feedback Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {feedbackType === 'bug' ? 'Report a Bug' : 'Send Feedback'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {submitStatus === 'success' && (
              <Alert severity="success">
                Thank you! Your {feedbackType === 'bug' ? 'bug report' : 'feedback'} has been sent successfully.
              </Alert>
            )}
            
            {submitStatus === 'error' && (
              <Alert severity="error">
                Sorry, there was an error sending your {feedbackType === 'bug' ? 'bug report' : 'feedback'}. 
                Please try again.
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>Type</InputLabel>
              <Select
                value={feedbackType}
                label="Type"
                onChange={(e) => setFeedbackType(e.target.value)}
              >
                <MenuItem value="bug">Bug Report</MenuItem>
                <MenuItem value="feedback">Feature Request</MenuItem>
                <MenuItem value="general">General Feedback</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={feedbackType === 'bug' ? 'Brief description of the bug' : 'What would you like to share?'}
              required
            />

            <TextField
              fullWidth
              label="Your Email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              type="email"
              required
              helperText="We'll use this to follow up if needed"
            />

            <TextField
              fullWidth
              multiline
              rows={6}
              label="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                feedbackType === 'bug' 
                  ? 'Please describe the bug in detail. Include steps to reproduce, what you expected to happen, and what actually happened.'
                  : 'Tell us what you think! We value your input.'
              }
              required
            />

            {feedbackType === 'bug' && (
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Bug Report Tips:</strong>
                  <br />• Describe what you were doing when the bug occurred
                  <br />• Include any error messages you saw
                  <br />• Mention your browser and operating system
                </Typography>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={isSubmitting || !subject.trim() || !message.trim() || !userEmail.trim()}
            startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
          >
            {isSubmitting ? 'Sending...' : 'Send'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
