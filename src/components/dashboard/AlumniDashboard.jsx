// ============================================================================
// FILE: src/components/dashboard/AlumniDashboard.jsx
// PURPOSE: Dedicated Landing Page for Alumni (Sprint 4 Placeholder)
// ============================================================================

import React from 'react';
import { styles } from '../../styles/styles';

const AlumniDashboard = ({ user, onLogout }) => {
  return (
    <div style={styles.appContainer}>
      {/* --- ALUMNI HEADER --- */}
      <div style={{
          ...styles.header,
          backgroundColor: '#059669', // Green theme for Alumni
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <span style={{ fontSize: '24px' }}>🎓</span>
           <h1 style={{ margin: 0, fontSize: '18px' }}>FuturePath Alumni</h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontWeight: '500' }}>
                {user.name} (Alumni)
            </span>
            <button 
                onClick={onLogout}
                style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    border: '1px solid rgba(255,255,255,0.5)', 
                    color: 'white', 
                    borderRadius: '6px', 
                    padding: '6px 15px', 
                    cursor: 'pointer' 
                }}
            >
                Logout
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div style={{ maxWidth: '800px', margin: '80px auto', textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '36px', marginBottom: '10px', color: '#111827' }}>
            Welcome, {user.name}!
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '40px' }}>
            Thank you for joining the Faculty Alumni Network.
        </p>
        
        {/* --- PLACEHOLDER CARD --- */}
        <div style={{ 
            backgroundColor: 'white', 
            padding: '50px', 
            borderRadius: '16px', 
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e5e7eb'
        }}>
            <div style={{ fontSize: '60px', marginBottom: '20px' }}>🚧</div>
            
            <h2 style={{ color: '#059669', marginBottom: '15px', fontSize: '28px' }}>
                Alumni Sharing & Mentorship Hub
            </h2>
            
            <p style={{ fontSize: '16px', color: '#4b5563', lineHeight: '1.6', maxWidth: '600px', margin: '0 auto 30px' }}>
                We are currently building the platform for you to <strong>post job opportunities</strong> and <strong>mentor students</strong>. 
                These features are part of our upcoming development phase.
            </p>

            <div style={{ 
                padding: '12px 24px', 
                backgroundColor: '#ecfdf5', 
                color: '#047857', 
                borderRadius: '30px',
                fontWeight: '600',
                display: 'inline-block',
                border: '1px solid #6ee7b7'
            }}>
                Development Scheduled: Sprint 4
            </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;