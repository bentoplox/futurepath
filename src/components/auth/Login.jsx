// ============================================================================
// FILE: src/components/auth/Login.jsx
// PURPOSE: Premium Login Form
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import futurePathLogo from '../../assets/futurepath_logo_traced.svg';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login } = useAuth();

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

  // Brand Colors
  const umBlue = '#1e3a8a';
  const fpPurple = '#4c2882';
  const umGold = '#fbbf24';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: `linear-gradient(135deg, ${umBlue} 0%, ${fpPurple} 100%)`,
      fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif",
      padding: '20px',
      margin: '-20px' // Offsets AppContainer padding if present
    }}>
      
      {/* Auth Card */}
      <div style={{
        backgroundColor: 'white',
        width: '100%',
        maxWidth: '450px',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)',
        borderTop: `6px solid ${umGold}`
      }}>
        
        {/* Logo & Header */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
            <div style={{ backgroundColor: '#f3e8ff', padding: '12px', borderRadius: '16px' }}>
              <img 
                src={futurePathLogo} 
                alt="FuturePath Logo" 
                style={{ width: '40px', height: '40px' }} 
              />
            </div>
          </div>
          <h2 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '28px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", fontWeight: 'bold' }}>
            Welcome Back
          </h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '15px' }}>
            Log in to continue your learning journey
          </p>
        </div>

        {error && (
          <div style={{ padding: '12px 15px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="student@siswa.um.edu.my"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = fpPurple}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }}
              onFocus={(e) => e.target.style.borderColor = fpPurple}
              onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', padding: '14px', backgroundColor: fpPurple, color: 'white', border: 'none', borderRadius: '8px', 
              fontSize: '16px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px', transition: 'background-color 0.2s' 
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b1f63'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = fpPurple}
          >
            Log In
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', color: '#6b7280', fontSize: '15px' }}>
          Don't have an account?{' '}
          <span 
            onClick={onSwitchToRegister} 
            style={{ color: fpPurple, fontWeight: 'bold', cursor: 'pointer', textDecoration: 'none' }}
            onMouseOver={(e) => e.currentTarget.style.textDecoration = 'underline'}
            onMouseOut={(e) => e.currentTarget.style.textDecoration = 'none'}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;