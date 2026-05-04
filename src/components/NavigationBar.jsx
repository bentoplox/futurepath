// ============================================================================
// FILE: src/components/NavigationBar.jsx
// PURPOSE: Premium Glassmorphism Navigation Bar
// ============================================================================

import React from 'react';

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
      fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif'
    }}>
      
      {/* 1. BRAND & CUSTOM LOGO (Left) */}
      <div 
        onClick={() => setCurrentView('dashboard')}
        style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
      >
        {/* Sleek Custom Isometric Tech/Path Logo */}
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#fcd34d" stroke="#fcd34d" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M2 12L12 17L22 12" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M2 17L12 22L22 17" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>

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