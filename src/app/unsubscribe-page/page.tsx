'use client';

import React, { useState } from 'react';

const UnsubscribeForm: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleUnsubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your unsubscribe logic here
    console.log("User unsubscribed", { email });
  };

  return (
    <div style={{
      maxWidth: '400px',
      margin: '0 auto',
      padding: '20px',
      textAlign: 'center',
      fontFamily: 'Arial, sans-serif',
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

        {/* Title */}
        <h2 style={{ marginBottom: '20px', fontSize: '1.5em', fontWeight: 'bold' }}>Unsubscribe</h2>

        {/* Unsubscribe Form */}
        <form onSubmit={handleUnsubscribe}>
          <div style={{ textAlign: 'left', marginBottom: '15px' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9em' }}>Email*</label>
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
                marginTop: '5px',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1em',
            }}
          >
            Unsubscribe
          </button>
        </form>

        {/* Update Preferences Link */}
        <a href="#" style={{
          display: 'block',
          marginTop: '20px',
          color: '#007bff',
          textDecoration: 'none',
          fontSize: '0.9em'
        }}>
          Update your preferences
        </a>
      </div>
    </div>
  );
};

export default UnsubscribeForm;
