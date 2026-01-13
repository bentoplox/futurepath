// ============================================================================
// FILE: src/components/auth/Register.jsx
// PURPOSE: Dynamic Registration (Fixed Layout)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';

const Register = ({ onSwitchToLogin, onRegisterSuccess, initialRole = 'student' }) => {
  // Common Fields
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Student Specific
  const [programme, setProgramme] = useState('Software Engineering');
  const [academicYear, setAcademicYear] = useState('Year 1');
  
  // Alumni Specific
  const [graduationYear, setGraduationYear] = useState('2025');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const umProgrammes = [
    "Software Engineering",
    "Data Science",
    "Information Systems",
    "Computer System and Networking",
    "Artificial Intelligence",
    "Multimedia Computing"
  ];

  useEffect(() => {
    setRole(initialRole);
  }, [initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!name || !email || !password || !confirmPassword) throw new Error('Please fill in all mandatory fields.');
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

      if (role === 'student') {
        if (!email.endsWith('@siswa.um.edu.my')) {
          throw new Error('Student email must end with @siswa.um.edu.my');
        }
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) throw new Error('Please enter a valid email address.');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      const userProfile = {
        user_id: authData.user.id,
        name,
        email,
        role,
        programme: role === 'student' ? programme : null,
      };

      if (role === 'student') {
        userProfile.academic_year = academicYear;
        userProfile.graduation_year = null; 
      } else if (role === 'alumni') {
        userProfile.graduation_year = graduationYear;
        userProfile.academic_year = 'Graduated'; 
      }

      const { error: dbError } = await supabase.from('users').insert([userProfile]);

      if (dbError) throw dbError;

      // ==========================================================
      // ✅ FIX START: Force Logout & Redirect to Login
      // ==========================================================
      
      // 1. Alert the user
      alert("Registration successful! Please log in to continue.");

      // 2. Force Sign Out immediately (kills the auto-session Supabase creates)
      await supabase.auth.signOut();

      // 3. Switch to Login View instead of triggering success
      if (onSwitchToLogin) {
        onSwitchToLogin();
      }
      
      // Note: We removed 'onRegisterSuccess()' because that was likely 
      // telling your main app "User is logged in, show Dashboard".
      // ==========================================================
      // ✅ FIX END
      // ==========================================================

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={{ textAlign: 'center', marginBottom: '25px' }}>
        <h2 style={{color: role === 'alumni' ? '#059669' : '#4F46E5', marginBottom: '10px', fontSize: '24px'}}>
            Join as {role === 'alumni' ? 'Alumni' : 'Student'}
        </h2>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
            Create your FuturePath account
        </p>
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '15px', fontSize: '14px' }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        
        {/* Role Toggle */}
        <div style={{display: 'flex', gap: '10px', marginBottom: '5px'}}>
            <button type="button" onClick={() => setRole('student')} 
                style={{
                    flex:1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer',
                    backgroundColor: role === 'student' ? '#EEF2FF' : 'white',
                    borderColor: role === 'student' ? '#4F46E5' : '#ddd',
                    color: role === 'student' ? '#4F46E5' : '#666', fontWeight: '500'
                }}>
                Student
            </button>
            <button type="button" onClick={() => setRole('alumni')} 
                style={{
                    flex:1, padding: '10px', borderRadius: '6px', border: '1px solid #ddd', cursor: 'pointer',
                    backgroundColor: role === 'alumni' ? '#ECFDF5' : 'white',
                    borderColor: role === 'alumni' ? '#059669' : '#ddd',
                    color: role === 'alumni' ? '#059669' : '#666', fontWeight: '500'
                }}>
                Alumni
            </button>
        </div>

        {/* Full Name */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Full Name</label>
          <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali Bin Abu" />
        </div>

        {/* Email */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Email Address</label>
          <input style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === 'student' ? "student@siswa.um.edu.my" : "name@example.com"} />
          {role === 'student' && <p style={{ fontSize: '12px', color: '#6b7280', margin: '2px 0 0 0' }}>* Must use <strong>@siswa.um.edu.my</strong></p>}
        </div>

        {/* Conditional Fields */}
        {role === 'student' && (
            <>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Programme</label>
                    <select style={styles.input} value={programme} onChange={(e) => setProgramme(e.target.value)}>
                        {umProgrammes.map((prog) => <option key={prog} value={prog}>{prog}</option>)}
                    </select>
                </div>
                <div style={styles.inputGroup}>
                    <label style={styles.label}>Academic Year</label>
                    <select style={styles.input} value={academicYear} onChange={(e) => setAcademicYear(e.target.value)}>
                        <option value="Year 1">Year 1</option>
                        <option value="Year 2">Year 2</option>
                        <option value="Year 3">Year 3</option>
                        <option value="Year 4">Year 4</option>
                    </select>
                </div>
            </>
        )}

        {role === 'alumni' && (
            <div style={styles.inputGroup}>
                <label style={styles.label}>Graduation Year</label>
                <input style={styles.input} type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g. 2024" />
            </div>
        )}

        {/* Password */}
        <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <div style={{ position: 'relative' }}>
                <input style={{...styles.input, paddingRight: '40px'}} type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
                    {showPassword ? '🙈' : '👁️'}
                </button>
            </div>
        </div>

        <div style={styles.inputGroup}>
          <label style={styles.label}>Confirm Password</label>
          <input style={styles.input} type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" />
        </div>

        <button 
            type="submit" 
            style={{
                ...styles.button, 
                backgroundColor: role === 'alumni' ? '#059669' : '#4F46E5',
                marginTop: '10px'
            }} 
            disabled={loading}
        >
          {loading ? 'Creating Account...' : `Register as ${role === 'alumni' ? 'Alumni' : 'Student'}`}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
        Already have an account?{' '}
        <span style={styles.link} onClick={onSwitchToLogin}>
          Log in here
        </span>
      </p>
    </div>
  );
};

export default Register;