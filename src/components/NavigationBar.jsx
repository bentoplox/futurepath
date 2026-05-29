// ============================================================================
// FILE: src/components/NavigationBar.jsx
// PURPOSE: Premium Glassmorphism Navigation Bar
// ============================================================================

import React from 'react';
// Import your newly traced custom logo here
import futurePathLogo from '../assets/futurepath_logo_traced.svg';

const NavigationBar = ({ currentView, setCurrentView, user, onProfileClick }) => {
  
  // Notice these IDs now perfectly match the currentView states in App.jsx!
  const navItems = [
    { id: 'dashboard', label: 'Home' },
    { id: 'employability', label: 'Employability' },
    { id: 'student_alumni', label: 'Alumni Hub' },
    { id: 'feedback', label: 'Feedback' }
  ];

  return (
    <div style={{ 
      backgroundColor: '#4c2882', 
      padding: '15px 40px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"
    }}>
      
      {/* 1. BRAND & CUSTOM LOGO (Left) */}
      <div 
        onClick={() => setCurrentView('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        {/* Your uploaded SVG logo is now implemented here */}
        <img 
          src={futurePathLogo} 
          alt="FuturePath Logo" 
          style={{ width: '32px', height: '32px' }} 
        />

        {/* Brand Text */}
        <span style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '0.5px' }}>
          <span style={{ color: 'white' }}>Future</span>
          <span style={{ color: '#fcd34d' }}>Path</span>
        </span>
      </div>

      {/* 2. GLASSMORPHISM NAV PILL (Center) */}
      <div style={{ 
        display: 'flex', 
        backgroundColor: 'rgba(255, 255, 255, 0.1)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '30px', 
        padding: '5px',
        border: '1px solid rgba(255, 255, 255, 0.15)'
      }}>
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              style={{
                backgroundColor: isActive ? 'white' : 'transparent',
                color: isActive ? '#4c2882' : 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '25px',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                opacity: isActive ? 1 : 0.85,
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: isActive ? '0 2px 8px rgba(0,0,0,0.1)' : 'none'
              }}
              onMouseOver={(e) => {
                if (!isActive) e.currentTarget.style.opacity = '1';
              }}
              onMouseOut={(e) => {
                if (!isActive) e.currentTarget.style.opacity = '0.85';
              }}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* 3. USER PROFILE (Right) */}
      <div 
        onClick={onProfileClick}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          padding: '4px 16px 4px 4px',
          borderRadius: '30px',
          transition: 'background 0.2s',
          cursor: 'pointer'
        }}
        onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
      >
        {/* User Avatar Circle */}
        <div style={{ 
          width: '28px', 
          height: '28px', 
          backgroundColor: 'white', 
          color: '#4c2882', 
          borderRadius: '50%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '14px'
        }}>
          {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
        </div>
        
        {/* User Name */}
        <span style={{ color: 'white', fontSize: '14px', fontWeight: '600' }}>
          {user?.name ? user.name.split(' ')[0] : 'Student'}
        </span>
      </div>

    </div>
  );
};

export default NavigationBar;