// ============================================================================
// FILE: src/components/auth/Register.jsx
// PURPOSE: Premium Dynamic Registration Form
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const Register = ({ onSwitchToLogin, initialRole = 'student' }) => {
  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [programme, setProgramme] = useState('Software Engineering');
  const [academicYear, setAcademicYear] = useState('Year 1');
  const [graduationYear, setGraduationYear] = useState('2025');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const umProgrammes = [
    "Software Engineering", "Data Science", "Information Systems",
    "Computer System and Networking", "Artificial Intelligence", "Multimedia Computing"
  ];

  useEffect(() => { setRole(initialRole); }, [initialRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!name || !email || !password || !confirmPassword) throw new Error('Please fill in all mandatory fields.');
      if (password !== confirmPassword) throw new Error('Passwords do not match.');
      if (password.length < 6) throw new Error('Password must be at least 6 characters long.');

      if (role === 'student' && !email.endsWith('@siswa.um.edu.my')) {
        throw new Error('Student email must end with @siswa.um.edu.my');
      } else if (role === 'alumni') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) throw new Error('Please enter a valid email address.');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;

      const userProfile = {
        user_id: authData.user.id,
        name, email, role,
        programme: role === 'student' ? programme : null,
      };

      if (role === 'student') {
        userProfile.academic_year = academicYear;
        userProfile.graduation_year = null; 
      } else {
        userProfile.graduation_year = graduationYear;
        userProfile.academic_year = 'Graduated'; 
      }

      const { error: dbError } = await supabase.from('users').insert([userProfile]);
      if (dbError) throw dbError;

      alert("Registration successful! Please log in to continue.");
      await supabase.auth.signOut();
      if (onSwitchToLogin) onSwitchToLogin();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Brand Colors
  const umBlue = '#1e3a8a';
  const fpPurple = '#4c2882';
  const fpGreen = '#059669'; // Alumni color

  const themeColor = role === 'alumni' ? fpGreen : fpPurple;

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: `linear-gradient(135deg, ${umBlue} 0%, ${fpPurple} 100%)`,
      fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", padding: '40px 20px', margin: '-20px'
    }}>
      
      <div style={{
        backgroundColor: 'white', width: '100%', maxWidth: '500px', borderRadius: '20px', padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)', borderTop: `6px solid ${themeColor}`, transition: 'border-color 0.3s'
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{color: themeColor, margin: '0 0 10px 0', fontSize: '28px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", fontWeight: 'bold', transition: 'color 0.3s'}}>
            Join as {role === 'alumni' ? 'Alumni' : 'Student'}
          </h2>
          <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>Create your FuturePath account</p>
        </div>

        {error && (
          <div style={{ padding: '12px 15px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* Sleek Segmented Role Toggle */}
          <div style={{ display: 'flex', background: '#f3f4f6', padding: '4px', borderRadius: '10px', marginBottom: '10px' }}>
            <button type="button" onClick={() => setRole('student')} 
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
                backgroundColor: role === 'student' ? 'white' : 'transparent',
                color: role === 'student' ? fpPurple : '#6b7280',
                boxShadow: role === 'student' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}>
              🎓 Student
            </button>
            <button type="button" onClick={() => setRole('alumni')} 
              style={{
                flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
                backgroundColor: role === 'alumni' ? 'white' : 'transparent',
                color: role === 'alumni' ? fpGreen : '#6b7280',
                boxShadow: role === 'alumni' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
              }}>
              💼 Alumni
            </button>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' }}>Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali Bin Abu" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' }}>Email Address</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === 'student' ? "student@siswa.um.edu.my" : "name@example.com"} 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }} />
            {role === 'student' && <p style={{ fontSize: '12px', color: '#6b7280', margin: '4px 0 0 0' }}>* Must use <strong>@siswa.um.edu.my</strong></p>}
          </div>

          {/* Conditional Fields Layout */}
          {role === 'student' ? (
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' }}>Programme</label>
                <select value={programme} onChange={(e) => setProgramme(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: 'white', outline: 'none' }}>
                  {umProgrammes.map((prog) => <option key={prog} value={prog}>{prog}</option>)}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' }}>Year</label>
                <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: 'white', outline: 'none' }}>
                  {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' }}>Graduation Year</label>
              <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g. 2024" 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }} />
            </div>
          )}

          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" 
                style={{ width: '100%', padding: '12px', paddingRight: '40px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', opacity: 0.6 }}>
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' }}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" 
              style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '14px', outline: 'none' }} />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '14px', backgroundColor: themeColor, color: 'white', border: 'none', borderRadius: '8px', 
              fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'all 0.3s', opacity: loading ? 0.7 : 1
            }} 
          >
            {loading ? 'Creating Account...' : `Register as ${role === 'alumni' ? 'Alumni' : 'Student'}`}
          </button>
        </form>

        <p style={{ marginTop: '25px', textAlign: 'center', color: '#6b7280', fontSize: '14px' }}>
          Already have an account?{' '}
          <span 
            onClick={onSwitchToLogin} 
            style={{ color: themeColor, fontWeight: 'bold', cursor: 'pointer' }}
          >
            Log in here
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;