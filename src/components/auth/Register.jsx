// ============================================================================
// FILE: src/components/auth/Register.jsx
// PURPOSE: Premium Registration Form with Colored Background & Pro Icons
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';

const Register = ({ onSwitchToLogin, initialRole = 'student', onBack }) => {
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
      if (password.length < 8) throw new Error('Password must be at least 8 characters long.');

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
      fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", padding: '20px'
    }}>
      
      <div style={{ width: '100%', maxWidth: '500px' }}>
          
        <div style={{
          backgroundColor: 'white', width: '100%', borderRadius: '24px', padding: '40px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', borderTop: `6px solid ${themeColor}`, transition: 'border-color 0.3s'
        }}>
          
          <div style={{ textAlign: 'center', marginBottom: '25px' }}>
            <h2 style={{color: themeColor, margin: '0 0 10px 0', fontSize: '28px', fontWeight: 'bold', transition: 'color 0.3s'}}>
              Join as {role === 'alumni' ? 'Alumni' : 'Student'}
            </h2>
            <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Create your FuturePath account</p>
          </div>

          {error && (
            <div style={{ padding: '12px 15px', backgroundColor: '#fef2f2', color: '#b91c1c', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', border: '1px solid #fecaca' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            
            <div style={{ display: 'flex', background: '#f8fafc', padding: '6px', borderRadius: '12px', marginBottom: '10px', border: '1px solid #e2e8f0' }}>
              <button type="button" onClick={() => setRole('student')} 
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
                  backgroundColor: role === 'student' ? 'white' : 'transparent',
                  color: role === 'student' ? fpPurple : '#64748b',
                  boxShadow: role === 'student' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}>
                🎓 Student
              </button>
              <button type="button" onClick={() => setRole('alumni')} 
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s',
                  backgroundColor: role === 'alumni' ? 'white' : 'transparent',
                  color: role === 'alumni' ? fpGreen : '#64748b',
                  boxShadow: role === 'alumni' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}>
                💼 Alumni
              </button>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Full Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ali Bin Abu" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} 
                onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.backgroundColor = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={role === 'student' ? "student@siswa.um.edu.my" : "name@example.com"} 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} 
                onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.backgroundColor = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
              />
              {role === 'student' && <p style={{ fontSize: '12px', color: '#64748b', margin: '6px 0 0 0' }}>* Must use <strong>@siswa.um.edu.my</strong></p>}
            </div>

            {role === 'student' ? (
              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{ flex: 2 }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Programme</label>
                  <select value={programme} onChange={(e) => setProgramme(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}>
                    {umProgrammes.map((prog) => <option key={prog} value={prog}>{prog}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Year</label>
                  <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', backgroundColor: '#f8fafc', outline: 'none', boxSizing: 'border-box' }}>
                    {['Year 1', 'Year 2', 'Year 3', 'Year 4'].map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Graduation Year</label>
                <input type="number" value={graduationYear} onChange={(e) => setGraduationYear(e.target.value)} placeholder="e.g. 2024" 
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} 
                  onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.backgroundColor = 'white'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" 
                  style={{ width: '100%', padding: '14px', paddingRight: '40px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} 
                  onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.backgroundColor = 'white'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
                />
                
                {/* ⚡ PROFESSIONAL SVG ICONS ⚡ */}
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', color: '#334155', fontSize: '13px', fontWeight: '700' }}>Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" 
                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '14px', outline: 'none', backgroundColor: '#f8fafc', boxSizing: 'border-box' }} 
                onFocus={(e) => { e.target.style.borderColor = themeColor; e.target.style.backgroundColor = 'white'; }}
                onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.backgroundColor = '#f8fafc'; }}
              />
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                width: '100%', padding: '16px', backgroundColor: themeColor, color: 'white', border: 'none', borderRadius: '12px', 
                fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px', transition: 'all 0.3s', opacity: loading ? 0.7 : 1,
                boxShadow: `0 4px 6px ${role === 'alumni' ? 'rgba(5, 150, 105, 0.2)' : 'rgba(76, 40, 130, 0.2)'}`, boxSizing: 'border-box'
              }} 
              onMouseOver={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseOut={(e) => { if(!loading) e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? 'Creating Account...' : `Register as ${role === 'alumni' ? 'Alumni' : 'Student'}`}
            </button>
          </form>

          <div style={{ marginTop: '30px', textAlign: 'center', color: '#64748b', fontSize: '14px' }}>
            Already have an account?{' '}
            <span 
              onClick={onSwitchToLogin} 
              style={{ color: themeColor, fontWeight: '800', cursor: 'pointer' }}
            >
              Log in here
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

export default Register;