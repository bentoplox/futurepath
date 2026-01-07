// ============================================================================
// FILE: src/App.jsx
// PURPOSE: Main application component with Dashboard & Profile support
// ============================================================================

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient'; // Needed for saving roadmaps
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import CareerInput from './components/roadmap/CareerInput';
import RoadmapDisplay from './components/roadmap/RoadmapDisplay';
import Dashboard from './components/dashboard/Dashboard';     // <--- NEW COMPONENT
import UserProfile from './components/dashboard/UserProfile'; // <--- NEW COMPONENT
import { styles } from './styles/styles';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  
  // Navigation State: Controls which "Screen" is visible
  // Options: 'dashboard', 'select_career', 'roadmap'
  const [currentView, setCurrentView] = useState('dashboard');
  
  // Data State
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [showProfile, setShowProfile] = useState(false); // Controls Profile Modal

  // --- LOGIC: Handle Career Selection ---
  // When user picks a career, save it to DB so it shows on Dashboard later
  const handleCareerSelect = async (careerId) => {
    setSelectedCareerId(careerId);
    setCurrentView('roadmap');

    if (user) {
      try {
        // 1. Check if we already have this roadmap started
        const { data } = await supabase.from('roadmap')
          .select('*')
          .eq('user_id', user.user_id)
          .eq('career_id', careerId);
        
        // 2. If not, create a new entry in 'roadmap' table
        if (!data || data.length === 0) {
          await supabase.from('roadmap').insert([{
            user_id: user.user_id,
            career_id: careerId,
            status: 'active'
          }]);
        }
      } catch (err) { 
        console.error("Error saving roadmap to dashboard:", err); 
      }
    }
  };

  // --- LOGIC: Handle "Continue" from Dashboard ---
  const handleContinueRoadmap = (careerId) => {
    setSelectedCareerId(careerId);
    setCurrentView('roadmap');
  };

  // --- RENDER: Loading Screen ---
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

  // --- RENDER: Auth Screens (Login/Register) ---
  if (!user) {
    // We use a local state just for switching between Login/Register
    // This wrapper allows us to keep the main App cleaner
    return <AuthWrapper />;
  }

  // --- RENDER: Main App (Logged In) ---
  return (
    <div style={styles.appContainer}>
      
      {/* 1. HEADER (Now includes Home & Profile Buttons) */}
      <div style={styles.header}>
        {/* Click Logo to go to Dashboard */}
        <div 
          style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
          onClick={() => setCurrentView('dashboard')}
        >
           <span style={{ fontSize: '24px' }}>🚀</span>
           <h1 style={{ margin: 0, fontSize: '20px' }}>FuturePath </h1>
        </div>

        {/* User Profile Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button 
            onClick={() => setShowProfile(true)} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: '1px solid rgba(255,255,255,0.5)', 
              color: 'white', 
              borderRadius: '20px', 
              padding: '6px 15px', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: '500'
            }}
          >
            👤 {user.name}
          </button>
        </div>
      </div>

      {/* 2. BODY CONTENT (Switches based on currentView) */}
      <div style={{ padding: '20px' }}>
        
        {/* VIEW A: DASHBOARD (Home) */}
        {currentView === 'dashboard' && (
          <Dashboard 
            onContinueRoadmap={handleContinueRoadmap}
            onStartNew={() => setCurrentView('select_career')}
          />
        )}

        {/* VIEW B: SELECT CAREER */}
        {currentView === 'select_career' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button 
              onClick={() => setCurrentView('dashboard')} 
              style={{ ...styles.secondaryButton, marginBottom: '20px' }}
            >
              ← Back to Dashboard
            </button>
            <CareerInput onCareerSelect={handleCareerSelect} />
          </div>
        )}

        {/* VIEW C: ROADMAP DISPLAY */}
        {currentView === 'roadmap' && selectedCareerId && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
              <button 
                onClick={() => setCurrentView('dashboard')} 
                style={styles.secondaryButton}
              >
                ← Back to Dashboard
              </button>
            </div>
            <RoadmapDisplay 
              careerId={selectedCareerId} 
              careerName="Your Career Path" 
            />
          </div>
        )}
      </div>

      {/* 3. MODALS */}
      {showProfile && (
        <UserProfile 
          user={user} 
          onClose={() => setShowProfile(false)} 
          logout={logout} 
        />
      )}
    </div>
  );
};

// Helper component to toggle Login/Register
const AuthWrapper = () => {
  const [isRegister, setIsRegister] = useState(false);
  return (
    <div style={styles.appContainer}>
      {isRegister ? (
        <Register 
          onSwitchToLogin={() => setIsRegister(false)} 
          onRegisterSuccess={() => setIsRegister(false)}
        />
      ) : (
        <Login 
          onSwitchToRegister={() => setIsRegister(true)} 
          onLoginSuccess={() => {}} 
        />
      )}
    </div>
  );
};

// Root App
const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;