// ============================================================================
// FILE: src/components/auth/Register.jsx
// PURPOSE: Registration form component
// DESCRIPTION: Allows new users to create an account
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/styles';

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [programme, setProgramme] = useState('Computer Science');
  const [error, setError] = useState('');
  
  // Get register function from AuthContext
  const { register } = useAuth();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (!email || !password || !confirmPassword || !name) {
      setError('Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Password validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    // Check if passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Attempt registration
    try {
      const user = register(email, password, name, programme);
      
      // Call success callback if provided
      if (onRegisterSuccess) {
        onRegisterSuccess(user);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div style={styles.authContainer}>
      <h2 style={{ marginBottom: '10px', color: '#111827' }}>
        Create Your Account
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Join FuturePath and start your personalized learning journey
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

      {/* Registration form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="Ahmad bin Abdullah"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </div>

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
            Programme
          </label>
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value)}
            style={styles.input}
          >
            <option>Computer Science</option>
            <option>Information Systems</option>
            <option>Software Engineering</option>
            <option>Data Science</option>
            <option>Artificial Intelligence</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Password
          </label>
          <input
            type="password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        <button type="submit" style={styles.button}>
          Create Account
        </button>
      </form>

      {/* Link to login */}
      <p style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280' }}>
        Already have an account?{' '}
        <span onClick={onSwitchToLogin} style={styles.link}>
          Log in here
        </span>
      </p>
    </div>
  );
};

export default Register;