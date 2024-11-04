'use client';

import React, { useState, useEffect } from 'react';
import { Button, Modal, Spinner, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import { createClient } from '../../../utils/supabase/client';
import './CancelSubscriptionPage.css';

const supabase = createClient();

const CancelSubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [subscriptionId, setSubscriptionId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [hasActiveSubscription, setHasActiveSubscription] = useState(false);

  // Step 1: Fetch int8 userId on component mount
  useEffect(() => {
    const fetchUserId = async () => {
      // Fetch the user from Supabase Auth
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        console.error('Error fetching user data:', error);
        return;
      }

      console.log('Fetched user UUID:', user.id); // This is the UUID from Supabase Auth

      // Fetch the int8 user ID from your 'user' table using the UUID
      const { data: userRecord, error: userFetchError } = await supabase
        .from('user')
        .select('id')
        .eq('uuid', user.id)
        .single();

      if (userFetchError || !userRecord) {
        console.error('Error fetching int8 user ID:', userFetchError);
        return;
      }

      console.log('Fetched int8 user ID:', userRecord.id);
      setUserId(userRecord.id); // Set the int8 userId
    };

    fetchUserId();
  }, []);

  // Step 2: Check for active subscription once we have userId
  useEffect(() => {
    if (userId === null) return; // Wait until userId is fetched

    const fetchSubscriptionDetails = async () => {
      try {
        const { data: subscription, error: subError } = await supabase
          .from('subscriptions_details')
          .select('subscriptionId')
          .eq('userId', userId) // userId is int8 in the database
          .eq('isActive', true)
          .single();

        if (subError) {
          console.error('Error fetching subscription data:', subError);
          setHasActiveSubscription(false);
        } else if (!subscription) {
          console.warn('No active subscription found for this user.');
          setHasActiveSubscription(false);
        } else {
          console.log('Fetched subscription data:', subscription);
          setSubscriptionId(subscription.subscriptionId); // subscriptionId is text in the database
          setHasActiveSubscription(true);
        }
      } catch (error) {
        console.error('Unexpected error fetching subscription data:', error);
        setHasActiveSubscription(false);
      }
    };

    fetchSubscriptionDetails();
  }, [userId]);

  const handleCancelSubscription = async () => {
    if (!subscriptionId) {
      alert('No active subscription found.');
      return;
    }

    setLoading(true);
    try {
      // Adjust the API endpoint as per your application routing
      const response = await axios.post('/pages/api/subscription', {
        subscriptionId,
      });

      if (response.data.success) {
        alert('Subscription cancelled successfully!');
        setHasActiveSubscription(false);
      } else {
        alert('Error cancelling subscription.');
      }
    } catch (error) {
      console.error('Error cancelling subscription', error);
      alert('There was an issue cancelling your subscription.');
    } finally {
      setLoading(false);
      setShowModal(false);
    }
  };

  return (
    <Container className="cancel-subscription-page">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="subscription-card shadow-lg">
            <Card.Body>
              {/* Sad Face Image */}
              <div className="sad-image-container">
                <img src="/assets/sad.svg" alt="Sad face" className="sad-image" />
              </div>

              {/* Title and Text */}
              <Card.Title className="mb-4">Manage Your Subscription</Card.Title>
              <Card.Text>
                {hasActiveSubscription ? (
                  "If you cancel your subscription, you'll lose access to all premium features and services."
                ) : (
                  "You do not have an active subscription."
                )}
              </Card.Text>

              {/* Cancel Button */}
              {hasActiveSubscription && (
                <Button
                  variant="outline-danger"
                  size="lg"
                  onClick={() => setShowModal(true)}
                  className="cancel-btn"
                  disabled={!subscriptionId}
                >
                  Cancel Subscription
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal confirmation */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to cancel your subscription? This action cannot be undone, and you will lose access immediately.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button variant="danger" onClick={handleCancelSubscription} disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : 'Confirm Cancellation'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CancelSubscriptionPage;
