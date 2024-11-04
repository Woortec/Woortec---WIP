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

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error) {
        console.error('Error fetching user data:', error);
        return;
      }
  
      console.log('Fetched user data:', user); // Log user data
  
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions_details')
        .select('subscriptionId')
        .eq('userId', user.id)
        .eq('isActive', true)
        .single();
  
      if (subError) {
        console.error('Error fetching subscription data:', subError);
      } else {
        console.log('Fetched subscription data:', subscription); // Log subscription data
        setSubscriptionId(subscription?.subscriptionId); // Ensure subscriptionId is defined
      }
    };
  
    fetchSubscriptionDetails();
  }, []);
  

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/pages/api/subscription', {
        subscriptionId,
      });

      if (response.data.success) {
        alert('Subscription cancelled successfully!');
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
                If you cancel your subscription, you'll lose access to all premium features and services.
              </Card.Text>

              {/* Cancel Button */}
              <Button variant="outline-danger" size="lg" onClick={() => setShowModal(true)} className="cancel-btn" disabled={!subscriptionId}>
                Cancel Subscription
              </Button>
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
