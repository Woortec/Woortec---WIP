'use client'

import React, { useState } from 'react';
import { Button, Modal, Spinner, Container, Row, Col, Card } from 'react-bootstrap';
import axios from 'axios';
import './CancelSubscriptionPage.css'; // Separate CSS file for custom styles

const CancelSubscriptionPage = () => {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/cancel-subscription', {
        subscriptionId: 'sub_id_here',
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
    }
  };

  return (
    <Container className="cancel-subscription-page">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="text-center shadow-sm">
            <Card.Body>
              <Card.Title className="mb-4">Manage Your Subscription</Card.Title>
              <Card.Text>
                If you cancel your subscription, you'll lose access to all premium features and services.
              </Card.Text>
              <Button variant="danger" size="lg" onClick={() => setShowModal(true)}>
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
          <Button variant="secondary" onClick={() => setShowModal(false)}>
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
