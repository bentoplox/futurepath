
// ============================================================================
// FILE: src/components/auth/Login.jsx
// PURPOSE: Login form component
// DESCRIPTION: Allows users to log in with email and password
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/styles';

const Login = ({ onSwitchToRegister, onLoginSuccess }) => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // Get login function from AuthContext
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = (e) => {
    // Prevent page refresh (default form behavior)
    e.preventDefault();
    
    // Reset any previous errors
    setError('');
    
    // Validation: Check if fields are filled
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Attempt login
    try {
      const user = login(email, password);
      
      // Call success callback if provided
      if (onLoginSuccess) {
        onLoginSuccess(user);
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    }
  };

  return (
    <div style={styles.authContainer}>
      <h2 style={{ marginBottom: '10px', color: '#111827' }}>
        Welcome to FuturePath
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Log in to continue your learning journey
      </p>

      {/* Show error message if any */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      {/* Login form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder="student@university.edu.my"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>
          Log In
        </button>
      </form>

      {/* Link to registration */}
      <p style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280' }}>
        Don't have an account?{' '}
        <span onClick={onSwitchToRegister} style={styles.link}>
          Register here
        </span>
      </p>
    </div>
  );
};

export default Login;
