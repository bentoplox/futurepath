// ============================================================================
// FILE: src/components/auth/Login.jsx
// PURPOSE: Premium Login Form with Colored Background
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import futurePathLogo from '../../assets/futurepath_logo_traced.svg';

const Login = ({ onSwitchToRegister, onLoginSuccess, onBack }) => { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  
  // Brand Colors
  const fpPurple = '#4c2882';
  const umBlue = '#1e3a8a';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      localStorage.setItem('activeTab', 'dashboard'); // ⚡ Force routing hard reset
      await login(email, password);
      if (onLoginSuccess) onLoginSuccess();
    } catch (err) {
      if (err.message.includes("Invalid login credentials")) {
        setError("User not found or incorrect password. Please register if you are new.");
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', 
      minHeight: '100vh', 
      background: `linear-gradient(135deg, ${umBlue} 0%, ${fpPurple} 100%)`, // ⚡ RESTORED COLORED BACKGROUND
      padding: '20px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" 
    }}>
      
      <div style={{ width: '100%', maxWidth: '400px' }}>
        
        {/* MAIN LOGIN CARD */}
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)' }}>
          
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ 
                width: '60px', height: '60px', backgroundColor: '#f3e8ff', borderRadius: '16px', 
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px auto' 
            }}>
              <img src={futurePathLogo} alt="FuturePath Logo" style={{ height: '35px', width: 'auto' }} />
            </div>
            <h2 style={{ margin: 0, color: '#0f172a', fontSize: '26px', fontWeight: '800' }}>Welcome Back</h2>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '5px 0 0 0' }}>Enter your credentials to access your account.</p>
          </div>

          {error && (
            <div style={{ backgroundColor: '#fef2f2', color: '#b91c1c', padding: '12px 15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca', fontWeight: '500' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>University Email</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="e.g., wif220000@siswa.um.edu.my" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = fpPurple; e.target.style.backgroundColor = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
              />
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', marginBottom: '8px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Enter your password" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s', backgroundColor: '#f8fafc', boxSizing: 'border-box' }}
                onFocus={(e) => { e.target.style.borderColor = fpPurple; e.target.style.backgroundColor = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
              />
            </div>

            <button 
              type="submit" 
              style={{ 
                width: '100%', padding: '16px', backgroundColor: fpPurple, color: 'white', border: 'none', borderRadius: '12px', 
                fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', transition: 'transform 0.2s, background-color 0.2s',
                boxShadow: '0 4px 6px rgba(76, 40, 130, 0.2)', boxSizing: 'border-box'
              }}
              onMouseOver={(e) => { e.currentTarget.style.backgroundColor = '#3b1f63'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { e.currentTarget.style.backgroundColor = fpPurple; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Log In to FuturePath
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Don't have an account?{' '}
            <span 
              onClick={onSwitchToRegister} 
              style={{ color: fpPurple, fontWeight: '800', cursor: 'pointer', textDecoration: 'none' }}
            >
              Sign up here
            </span>
          </div>
        </div>

        {/* ⚡ THE BACK BUTTON (White Text for Dark Background) */}
        {onBack && (
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button 
              onClick={onBack} 
              style={{ 
                background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.7)', 
                fontSize: '14px', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px',
                transition: 'color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'white'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
            >
              ← Back to Landing Page
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Login;