// ============================================================================
// FILE: src/App.jsx
// PURPOSE: Main application component - orchestrates the entire app flow
// DESCRIPTION: Manages authentication state and routes between views
// ============================================================================

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CareerInput from './components/roadmap/CareerInput';
import RoadmapDisplay from './components/roadmap/RoadmapDisplay';
import { styles } from './styles/styles';

// Main App Component (wrapped inside AuthProvider)
const AppContent = () => {
  // Get user and logout function from AuthContext
  const { user, loading, logout } = useAuth();
  
  // State to toggle between login and register
  const [showRegister, setShowRegister] = useState(false);
  
  // State to store generated roadmap
  const [roadmap, setRoadmap] = useState(null);

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚀</div>
          <div>Loading FuturePath...</div>
        </div>
      </div>
    );
  }

  // ========== NOT LOGGED IN ==========
  // Show authentication screens (Login or Register)
  if (!user) {
    return (
      <div style={styles.appContainer}>
        {showRegister ? (
          <Register
            onSwitchToLogin={() => setShowRegister(false)}
            onRegisterSuccess={() => setShowRegister(false)}
          />
        ) : (
          <Login
            onSwitchToRegister={() => setShowRegister(true)}
            onLoginSuccess={() => {}}
          />
        )}
      </div>
    );
  }

  // ========== LOGGED IN, NO ROADMAP ==========
  // Show career selection screen
  if (!roadmap) {
    return (
      <div style={styles.appContainer}>
        {/* Header with user info */}
        <div style={styles.header}>
          <h1 style={{ margin: 0, fontSize: '24px' }}>🚀 FuturePath</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={styles.userInfo}>
              Welcome, {user.name}!
            </span>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>

        {/* Career input component */}
        <CareerInput onCareerSelected={setRoadmap} />
      </div>
    );
  }

  // ========== LOGGED IN, HAS ROADMAP ==========
  // Show roadmap display
  return (
    <div style={styles.appContainer}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={{ margin: 0, fontSize: '24px' }}>🚀 FuturePath</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={styles.userInfo}>
            {user.name} • {user.programme}
          </span>
          <button 
            onClick={() => setRoadmap(null)} 
            style={{
              ...styles.logoutButton,
              marginRight: '10px'
            }}
          >
            Change Career
          </button>
          <button onClick={logout} style={styles.logoutButton}>
            Logout
          </button>
        </div>
      </div>

      {/* Roadmap display component */}
      <RoadmapDisplay
        roadmap={roadmap}
        onBackToCareerSelection={() => setRoadmap(null)}
      />
    </div>
  );
};

// Root App component with AuthProvider
const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;