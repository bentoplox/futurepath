// ============================================================================
// FILE: src/App.jsx
// PURPOSE: Main Routing - Handles Student vs Alumni Redirection
// ============================================================================

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { supabase } from './supabaseClient';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import LandingPage from './components/LandingPage';
import CareerInput from './components/roadmap/CareerInput';
import RoadmapDisplay from './components/roadmap/RoadmapDisplay';
import Dashboard from './components/dashboard/Dashboard';
import UserProfile from './components/dashboard/UserProfile';
import AlumniDashboard from './components/dashboard/AlumniDashboard'; // <--- IMPORT THIS
import { styles } from './styles/styles';

const AppContent = () => {
  const { user, loading, logout } = useAuth();
  
  // Navigation State
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCareerId, setSelectedCareerId] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  // Auth View State
  const [showLoginScreen, setShowLoginScreen] = useState(false);
  const [showRegisterScreen, setShowRegisterScreen] = useState(false);
  const [registerRole, setRegisterRole] = useState('student');

  // --- HANDLERS ---
  const handleCareerSelect = async (careerId) => {
    setSelectedCareerId(careerId);
    setCurrentView('roadmap');
    if (user) {
      try {
        const { data } = await supabase.from('roadmap').select('*').eq('user_id', user.user_id).eq('career_id', careerId);
        if (!data || data.length === 0) {
          await supabase.from('roadmap').insert([{ user_id: user.user_id, career_id: careerId, status: 'active' }]);
        }
      } catch (err) { console.error(err); }
    }
  };

  const handleContinueRoadmap = (careerId) => {
    setSelectedCareerId(careerId);
    setCurrentView('roadmap');
  };

  const handleLandingRegisterClick = (role) => {
      setRegisterRole(role); 
      setShowRegisterScreen(true);
  };

  const handleFeatureClick = (featureName, sprintName) => {
      alert(`🚧 UPCOMING FEATURE\n\nThe "${featureName}" module is scheduled for development in ${sprintName}.`);
  };

  // --- RENDER 1: LOADING ---
  if (loading) return <div style={styles.loadingContainer}>Loading...</div>;

  // --- RENDER 2: UNAUTHENTICATED (Landing/Auth) ---
  if (!user) {
    if (showRegisterScreen) {
      return (
        <div style={styles.appContainer}>
            <Register 
                initialRole={registerRole} 
                onSwitchToLogin={() => {
                    setShowRegisterScreen(false);
                    setShowLoginScreen(true);
                }} 
                onRegisterSuccess={() => setShowRegisterScreen(false)}
            />
            <button onClick={() => setShowRegisterScreen(false)} style={{display:'block', margin:'20px auto', background:'none', border:'none', color:'#666', cursor:'pointer'}}>← Back</button>
        </div>
      );
    }
    
    if (showLoginScreen) {
      return (
        <div style={styles.appContainer}>
            <Login 
                onSwitchToRegister={() => {
                    setShowLoginScreen(false);
                    setShowRegisterScreen(true);
                }} 
                onLoginSuccess={() => {}} 
            />
            <button onClick={() => setShowLoginScreen(false)} style={{display:'block', margin:'20px auto', background:'none', border:'none', color:'#666', cursor:'pointer'}}>← Back</button>
        </div>
      );
    }

    return (
      <LandingPage 
        onLoginClick={() => setShowLoginScreen(true)}
        onRegisterClick={handleLandingRegisterClick} 
      />
    );
  }

  // --- RENDER 3: AUTHENTICATED (CHECK ROLE) ---
  
  // 🎓 IF USER IS ALUMNI -> SHOW ALUMNI DASHBOARD
  if (user.role === 'alumni') {
      return <AlumniDashboard user={user} onLogout={logout} />;
  }

  // 🎒 IF USER IS STUDENT (OR ADMIN/OTHER) -> SHOW STUDENT DASHBOARD
  return (
    <div style={styles.appContainer}>
      {/* HEADER */}
      <div style={styles.header}>
        {/* LEFT: Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
           <span style={{ fontSize: '24px' }}>🚀</span>
           <h1 style={{ margin: 0, fontSize: '18px' }}>FuturePath</h1>
        </div>
        
        {/* CENTER: Navigation Links */}
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
            <span 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                    cursor: 'pointer', fontSize: '14px', fontWeight: '600', color: 'white',
                    borderBottom: currentView === 'dashboard' ? '2px solid white' : 'none',
                    paddingBottom: '2px'
                }}
            >
                Home
            </span>
            <span 
                onClick={() => handleFeatureClick("Graduate Employability Dashboard", "Sprint 2")}
                style={{ 
                    cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)',
                    borderBottom: '1px dashed rgba(255,255,255,0.4)', paddingBottom: '2px'
                }}
            >
                Employability Dashboard
            </span>
            <span 
                onClick={() => handleFeatureClick("Alumni Sharing & Mentorship Hub", "Sprint 4")}
                style={{ 
                    cursor: 'pointer', fontSize: '14px', fontWeight: '500', color: 'rgba(255,255,255,0.8)',
                    borderBottom: '1px dashed rgba(255,255,255,0.4)', paddingBottom: '2px'
                }}
            >
                Alumni Hub
            </span>
        </div>

        {/* RIGHT: Profile Button */}
        <button 
            onClick={() => setShowProfile(true)} 
            style={{ 
                background: 'rgba(255,255,255,0.2)', 
                border: '1px solid rgba(255,255,255,0.5)', 
                color: 'white', 
                borderRadius: '20px', 
                padding: '6px 15px', 
                cursor: 'pointer' 
            }}
        >
            👤 {user.name} <span style={{ opacity: 0.8, fontSize: '12px', marginLeft: '5px', textTransform: 'capitalize' }}>
                ({user.role || 'user'})
            </span>
        </button>
      </div>

      <div style={{ padding: '20px' }}>
        {currentView === 'dashboard' && <Dashboard onContinueRoadmap={handleContinueRoadmap} onStartNew={() => setCurrentView('select_career')} />}
        
        {currentView === 'select_career' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...styles.secondaryButton, marginBottom: '20px' }}>← Back to Dashboard</button>
            <CareerInput onCareerSelect={handleCareerSelect} />
          </div>
        )}

        {currentView === 'roadmap' && selectedCareerId && (
          <div>
            <div style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
              <button onClick={() => setCurrentView('dashboard')} style={styles.secondaryButton}>← Back to Dashboard</button>
            </div>
            <RoadmapDisplay careerId={selectedCareerId} />
          </div>
        )}
      </div>

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

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;