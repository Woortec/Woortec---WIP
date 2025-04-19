'use client';

import React, { useState } from 'react';

const UpdatePreferences: React.FC = () => {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    // Add your update logic here
    console.log("Preferences Updated", { email, firstName, lastName });
  };

  return (
    <div style={{
      maxWidth: '450px',
      margin: '40px auto',
      fontFamily: 'Poppins',
      textAlign: 'center',
      color: '#333'
    }}>
      <div style={{
        border: '1px solid #e0e0e0',
        padding: '30px',
        borderRadius: '10px',
        position: 'relative',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
      }}>
        {/* Top Icon */}
        <button style={{
          position: 'absolute',
          top: '15px',
          left: '15px',
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#888',
          fontSize: '18px'
        }} aria-label="Delete">
          🗑️
        </button>

        {/* Image Placeholder */}
        <div style={{
          width: '100%',
          height: '200px',
          backgroundColor: '#f8f9fa',
          marginBottom: '20px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        }}>
          <img src="/assets/woortec1.svg" alt="Preference Image" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
        </div>

        {/* Form Title */}
        <h2 style={{ marginBottom: '20px', fontSize: '1.5em', color: '#333' }}>Update Preferences</h2>

        {/* Form */}
        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9em' }}>Email*</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                marginTop: '5px',
                fontSize: '1em',
              }}
            />
          </div>
          <div style={{ marginBottom: '15px', textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9em' }}>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                marginTop: '5px',
                fontSize: '1em',
              }}
            />
          </div>
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontWeight: 'bold', fontSize: '0.9em' }}>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '6px',
                border: '1px solid #ddd',
                marginTop: '5px',
                fontSize: '1em',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#00BFA6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1em',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#007bff'}
          >
            Update Preferences
          </button>
        </form>

        {/* Unsubscribe Link */}
        <a href="#" style={{
          display: 'block',
          marginTop: '20px',
          color: '#00BFA6',
          textDecoration: 'none',
          fontSize: '0.9em'
        }}>Unsubscribe</a>
      </div>
    </div>
  );
};

export default UpdatePreferences;
