'use client';

import React, { useState } from 'react';

const SubscriptionForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleNextStep = () => {
    setStep((prevStep) => prevStep + 1);
  };

  const handlePreviousStep = () => {
    setStep((prevStep) => (prevStep > 1 ? prevStep - 1 : prevStep));
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial',
      color: '#333'
    }}>
      <div style={{
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #ddd',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff'
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '20px' }}>
          <img src="/assets/woortec1.svg" alt="WoorTec Logo" style={{ width: '100px', margin: '0 auto' }} />
        </div>

        {/* Step Indicator */}
        <div style={{ marginBottom: '20px', fontWeight: 'bold', fontSize: '1.2em' }}>
          Step {step} of 4
        </div>

        {/* Form Step Content */}
        {step === 1 && (
          <div>
            <h2>New Subscription</h2>
            <div style={{ textAlign: 'left' }}>
              <label>Email*</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '5px',
                  border: '1px solid #ddd',
                  marginTop: '5px'
                }}
              />
            </div>
            <button onClick={handleNextStep} style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
            }}>
              Next
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2>Confirmation Page</h2>
            <p>Please confirm your email address to proceed.</p>
            <button onClick={handleNextStep} style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
            }}>
              Confirm
            </button>
            <button onClick={handlePreviousStep} style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px',
            }}>
              Back
            </button>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2>Opt-In Email</h2>
            <p>Check your inbox and opt in to complete the subscription.</p>
            <button onClick={handleNextStep} style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
            }}>
              I have opted in
            </button>
            <button onClick={handlePreviousStep} style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#ccc',
              color: '#333',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '10px',
            }}>
              Back
            </button>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2>Success!</h2>
            <p>Thank you for subscribing to WoorTec.</p>
            <p>You’ll start receiving updates soon.</p>
            <button onClick={() => setStep(1)} style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px',
            }}>
              Go to Start
            </button>
          </div>
        )}

        {/* Privacy Note */}
        {step === 1 && (
          <p style={{
            fontSize: '0.85em',
            color: '#666',
            marginTop: '20px',
          }}>
            Your privacy is important to us. Your information is stored securely and used in accordance with our privacy policy.
          </p>
        )}
      </div>
    </div>
  );
};

export default SubscriptionForm;
