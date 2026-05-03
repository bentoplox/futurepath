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
import AlumniDashboard from './components/dashboard/AlumniDashboard';
import AdminDashboard from './components/dashboard/AdminDashboard'; 
import StudentJobBoard from './components/dashboard/StudentJobBoard';
import EmployabilityDashboard from './components/dashboard/EmployabilityDashboard';
import { styles } from './styles/styles';
import SkillGapInput from './components/dashboard/SkillGapInput';

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

  const handleNavClick = (viewName) => {
      if (viewName === 'alumni_hub') {
          setCurrentView('student_alumni');
      } else if (viewName === 'employability') {
          setCurrentView('employability');
      } else if (viewName === 'feedback') {
          setCurrentView('feedback'); 
      }
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
  // --- STUDENT DASHBOARD ---
  return (
    <div style={styles.appContainer}>
      
      {/* HEADER WITH UPDATED UI - SEAMLESS PURPLE */}
      <div style={{ 
          ...styles.header, 
          background: '#4c2882',
          backgroundImage: 'linear-gradient(135deg, #4c2882 0%, #6b4c9a 100%)',
          borderBottom: 'none',
          color: 'white'
      }}>
        {/* LEFT: Logo & Title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setCurrentView('dashboard')}>
           <span style={{ fontSize: '24px' }}>🚀</span>
           <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>FuturePath</h1>
        </div>
        
        {/* CENTER: Modern "Pill" Navigation */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', background: 'rgba(255,255,255,0.1)', padding: '5px', borderRadius: '30px' }}>
            
            {/* Home Pill */}
            <span 
                onClick={() => setCurrentView('dashboard')}
                style={{ 
                    cursor: 'pointer', fontSize: '14px', fontWeight: currentView === 'dashboard' ? '700' : '500',
                    color: currentView === 'dashboard' ? '#4c2882' : 'white', 
                    backgroundColor: currentView === 'dashboard' ? 'white' : 'transparent', 
                    padding: '8px 18px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: currentView === 'dashboard' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                Home
            </span>

            {/* Employability Pill */}
            <span 
                onClick={() => handleNavClick('employability')}
                style={{ 
                    cursor: 'pointer', fontSize: '14px', fontWeight: currentView === 'employability' ? '700' : '500',
                    color: currentView === 'employability' ? '#4c2882' : 'white',
                    backgroundColor: currentView === 'employability' ? 'white' : 'transparent',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: currentView === 'employability' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                Employability
            </span>

            {/* Alumni Hub Pill */}
            <span 
                onClick={() => handleNavClick('alumni_hub')}
                style={{ 
                    cursor: 'pointer', fontSize: '14px', fontWeight: currentView === 'student_alumni' ? '700' : '500',
                    color: currentView === 'student_alumni' ? '#4c2882' : 'white',
                    backgroundColor: currentView === 'student_alumni' ? 'white' : 'transparent',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: currentView === 'student_alumni' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                Alumni Hub
            </span>

            {/* Feedback Pill */}
            <span 
                onClick={() => handleNavClick('feedback')}
                style={{ 
                    cursor: 'pointer', fontSize: '14px', fontWeight: currentView === 'feedback' ? '700' : '500',
                    color: currentView === 'feedback' ? '#4c2882' : 'white',
                    backgroundColor: currentView === 'feedback' ? 'white' : 'transparent',
                    padding: '8px 18px',
                    borderRadius: '20px',
                    transition: 'all 0.2s ease',
                    boxShadow: currentView === 'feedback' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none'
                }}
            >
                Feedback
            </span>
        </div>

        {/* RIGHT: Profile Button */}
        <button onClick={() => setShowProfile(true)} style={{ 
            background: 'rgba(255,255,255,0.15)', 
            border: '1px solid rgba(255,255,255,0.3)', 
            color: 'white', 
            borderRadius: '20px', 
            padding: '8px 16px', 
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'background 0.2s'
        }}>
            <div style={{width:'24px', height:'24px', background:'white', borderRadius:'50%', color:'#4c2882', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:'bold', fontSize:'12px'}}>
                {user.name.charAt(0)}
            </div>
            {user.name.split(' ')[0]} 
        </button>
      </div>

      {/* DYNAMIC PADDING: Removes the white gap ONLY on the Employability page so the header and banner touch seamlessly */}
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
            <div style={{ maxWidth: '800px', margin: '0 auto 20px auto' }}>
              <button onClick={() => setCurrentView('dashboard')} style={styles.secondaryButton}>← Back to Dashboard</button>
            </div>
            <RoadmapDisplay careerId={selectedCareerId} />
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

        {/* VIEW 6: SKILL FEEDBACK (NEW) */}
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