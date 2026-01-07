// ============================================================================
// FILE: src/components/auth/Register.jsx
// PURPOSE: Registration form with Student/Alumni logic
// ============================================================================

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/styles';

const Register = ({ onSwitchToLogin, onRegisterSuccess }) => {
  // --- STATE MANAGEMENT ---
  const [role, setRole] = useState('student'); // Default to student
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [programme, setProgramme] = useState('Software Engineering');
  
  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();

  // --- UM PROGRAMMES LIST ---
  const umProgrammes = [
    "Software Engineering",
    "Data Science",
    "Information Systems",
    "Computer System and Networking",
    "Artificial Intelligence",
    "Multimedia Computing"
  ];

  // --- VALIDATION & SUBMIT ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Check Mandatory Fields
      if (!name || !email || !password || !confirmPassword) {
        throw new Error('Please fill in all mandatory fields.');
      }

      // 2. Password Match Check
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      // 3. Password Length Check
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long.');
      }

      // 4. Role-Based Email Validation
      if (role === 'student') {
        if (!email.endsWith('@siswa.um.edu.my')) {
          throw new Error('Student email must end with @siswa.um.edu.my');
        }
      } else {
        // Basic regex for Alumni email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          throw new Error('Please enter a valid email address.');
        }
      }

      // 5. Attempt Registration
      // We pass 'programme' only if student, otherwise it is ignored in AuthContext
      await register(email, password, name, role, programme);
      
      // Success
      if (onRegisterSuccess) onRegisterSuccess();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <h2 style={{ marginBottom: '10px', color: '#111827' }}>Create Account</h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Join FuturePath as a Student or Alumni
      </p>

      {/* Error Message Box */}
      {error && (
        <div style={{
          padding: '12px',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          borderRadius: '6px',
          marginBottom: '15px',
          fontSize: '14px'
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* 1. ROLE SELECTION */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px', fontWeight: '500' }}>
            I am a...
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            style={{ ...styles.input, backgroundColor: '#f9fafb' }}
          >
            <option value="student">Student (Current)</option>
            <option value="alumni">Alumni (Graduated)</option>
          </select>
        </div>

        {/* 2. FULL NAME */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Full Name
          </label>
          <input
            type="text"
            placeholder="e.g. Ali Bin Abu"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* 3. EMAIL ADDRESS */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Email Address
          </label>
          <input
            type="email"
            placeholder={role === 'student' ? "student@siswa.um.edu.my" : "name@example.com"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          {/* Helper Text for Students */}
          {role === 'student' && (
            <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
              * Must use <strong>@siswa.um.edu.my</strong> email.
            </p>
          )}
        </div>

        {/* 4. PROGRAMME (CONDITIONAL: ONLY FOR STUDENTS) */}
        {role === 'student' && (
          <div style={{ marginTop: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
              Programme (FCSIT)
            </label>
            <select
              value={programme}
              onChange={(e) => setProgramme(e.target.value)}
              style={styles.input}
            >
              {umProgrammes.map((prog) => (
                <option key={prog} value={prog}>{prog}</option>
              ))}
            </select>
          </div>
        )}

        {/* 5. PASSWORD */}
        <div style={{ marginTop: '15px', position: 'relative' }}>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Password
          </label>
          <input
            type={showPassword ? "text" : "password"}
            placeholder="At least 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          {/* View/Unview Toggle */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '10px',
              top: '32px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {showPassword ? '🙈' : '👁️'}
          </button>
        </div>

        {/* 6. CONFIRM PASSWORD */}
        <div>
          <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
            Confirm Password
          </label>
          <input
            type="password"
            placeholder="Re-enter password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={styles.input}
          />
        </div>

        {/* SUBMIT BUTTON */}
        <button 
          type="submit" 
          style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>

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