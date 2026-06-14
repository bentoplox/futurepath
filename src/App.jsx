// ============================================================================
// FILE: src/App.jsx
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
import AlumniDashboard from './components/alumnihub/AlumniDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard'; 
import StudentJobBoard from './components/alumnihub/StudentJobBoard';
import EmployabilityDashboard from './components/dashboard/EmployabilityDashboard';
import SkillGapInput from './components/feedback/SkillGapInput';
import NavigationBar from './components/NavigationBar'; // <-- NEW IMPORT!
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

 const handleCareerSelect = (careerId) => {
    // 1. Save the ID of the career they picked
    setSelectedCareerId(careerId);
    
    // 2. Change the screen to show the Roadmap UI
    setCurrentView('roadmap');
  };

  const handleContinueRoadmap = (careerId) => {
    setSelectedCareerId(careerId);
    setCurrentView('roadmap');
  };

  const handleLandingRegisterClick = (role) => {
      setRegisterRole(role); 
      setShowRegisterScreen(true);
  };

  if (loading) return <div style={styles.loadingContainer}>Loading...</div>;

  // --- UNAUTHENTICATED ---
  if (!user) {
    if (showRegisterScreen) {
      return (
        <div style={styles.appContainer}>
            <Register initialRole={registerRole} onSwitchToLogin={() => { setShowRegisterScreen(false); setShowLoginScreen(true); }} onRegisterSuccess={() => setShowRegisterScreen(false)} />
            <button onClick={() => setShowRegisterScreen(false)} style={{display:'block', margin:'20px auto', background:'none', border:'none', color:'#666', cursor:'pointer'}}>← Back</button>
        </div>
      );
    }
    if (showLoginScreen) {
      return (
        <div style={styles.appContainer}>
            <Login onSwitchToRegister={() => { setShowLoginScreen(false); setShowRegisterScreen(true); }} onLoginSuccess={() => {}} />
            <button onClick={() => setShowLoginScreen(false)} style={{display:'block', margin:'20px auto', background:'none', border:'none', color:'#666', cursor:'pointer'}}>← Back</button>
        </div>
      );
    }
    return <LandingPage onLoginClick={() => setShowLoginScreen(true)} onRegisterClick={handleLandingRegisterClick} />;
  }

  // --- AUTHENTICATED ROLES ---
  if (user.role === 'admin') return <AdminDashboard user={user} onLogout={logout} />;
  if (user.role === 'alumni') return <AlumniDashboard user={user} onLogout={logout} />;

  // --- STUDENT DASHBOARD ---
  return (
    <div style={styles.appContainer}>
      
      {/* HEADER IS NOW HANDLED BY OUR NEW COMPONENT */}
      <NavigationBar 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user} 
        onProfileClick={() => setShowProfile(true)} 
      />

      {/* DYNAMIC PADDING */}
      <div style={{ padding: currentView === 'employability' ? '0' : '20px' }}>
        
        {/* VIEW 1: MAIN DASHBOARD */}
        {currentView === 'dashboard' && <Dashboard onContinueRoadmap={handleContinueRoadmap} onStartNew={() => setCurrentView('select_career')} />}
        
        {/* VIEW 2: CAREER SELECTION */}
        {currentView === 'select_career' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
            <button onClick={() => setCurrentView('dashboard')} style={{ ...styles.secondaryButton, marginBottom: '20px' }}>← Back to Dashboard</button>
            <CareerInput onCareerSelect={handleCareerSelect} />
          </div>
        )}

        {/* VIEW 3: ROADMAP DISPLAY */}
        {currentView === 'roadmap' && selectedCareerId && (
          <div style={{ paddingTop: '20px' }}>
            {/* ⚡ FIXED: Removed the duplicate outer back button and passed the action as a prop! */}
            <RoadmapDisplay 
               careerId={selectedCareerId} 
               onBack={() => setCurrentView('dashboard')} 
            />
          </div>
        )}

        {/* VIEW 4: STUDENT ALUMNI HUB */}
        {currentView === 'student_alumni' && (
             <StudentJobBoard onBack={() => setCurrentView('dashboard')} />
        )}

        {/* VIEW 5: EMPLOYABILITY DASHBOARD */}
        {currentView === 'employability' && (
             <EmployabilityDashboard onBack={() => setCurrentView('dashboard')} />
        )}

        {/* VIEW 6: SKILL FEEDBACK */}
        {currentView === 'feedback' && (
             <SkillGapInput user={user} onBack={() => setCurrentView('dashboard')} />
        )}

      </div>

      {showProfile && (
        <UserProfile user={user} onClose={() => setShowProfile(false)} logout={logout} />
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