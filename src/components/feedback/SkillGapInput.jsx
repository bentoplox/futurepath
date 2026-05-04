// ============================================================================
// FILE: src/components/dashboard/SkillGapInput.jsx
// PURPOSE: Allow students to self-report missing skills (Premium UI)
// ============================================================================

import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';

const SkillGapInput = ({ user, onBack }) => {
  const [formData, setFormData] = useState({
    skill_name: '',
    category: 'Technical',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('student_skill_gaps').insert([
      {
        user_id: user.user_id, // Links to the student
        skill_name: formData.skill_name,
        category: formData.category,
        reason: formData.reason
      }
    ]);

    setLoading(false);

    if (error) {
      alert("Error submitting feedback: " + error.message);
    } else {
      setSuccess(true);
      setFormData({ skill_name: '', category: 'Technical', reason: '' });
      // Auto-hide success message after 4 seconds
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif', margin: '-20px', paddingBottom: '50px' }}>
      
      {/* 1. PREMIUM HERO BANNER */}
      <div style={{ 
        backgroundColor: '#4c2882',
        backgroundImage: 'linear-gradient(135deg, #4c2882 0%, #6b4c9a 100%)',
        color: 'white',
        padding: '40px 40px 100px 40px',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Circle Background */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <button 
            onClick={onBack} 
            style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', color: 'white', cursor: 'pointer', padding: '6px 16px', borderRadius: '20px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontWeight: '500', transition: 'background 0.2s' }} 
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.25)'} 
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.15)'}
          >
            ← Back to Home
          </button>

          <h1 style={{ fontSize: '36px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
            Curriculum Feedback
          </h1>
          <p style={{ opacity: 0.9, fontSize: '16px', margin: 0, maxWidth: '600px' }}>
            Help the faculty understand what skills you need.
          </p>
        </div>
      </div>

      {/* 2. SPLIT LAYOUT FLOATING OVER BANNER */}
      <div style={{ maxWidth: '1000px', margin: '-50px auto 0 auto', position: 'relative', zIndex: 10, padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
        
        {/* Left Side: Form */}
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', flex: 2, minWidth: '60%' }}>
          <h2 style={{ fontSize: '20px', color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Georgia, serif' }}>
            ✍️ Report a Missing Skill
          </h2>
          
          {/* SUCCESS BANNER */}
          {success && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              ✅ <strong>Received!</strong> Your feedback helps shape future workshops.
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>What skill do you feel is missing?</label>
              <input 
                type="text" 
                placeholder="e.g. Flutter, Advanced SQL, Public Speaking" 
                required
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px' }}
                value={formData.skill_name}
                onChange={(e) => setFormData({...formData, skill_name: e.target.value})}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Category</label>
              <select 
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', backgroundColor: 'white' }}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Technical">Technical (Coding, Tools)</option>
                <option value="Soft Skill">Soft Skill (Communication, Leadership)</option>
                <option value="Tool/Software">Software/Tool (e.g. Jira, Figma)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Why is this important? (Optional)</label>
              <textarea 
                placeholder="e.g. I see this in many job descriptions but we didn't cover it in class." 
                rows="4"
                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '15px', fontFamily: 'inherit', resize: 'vertical' }}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{ 
                backgroundColor: loading ? '#9ca3af' : '#6366f1', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', 
                fontWeight: 'bold', fontSize: '16px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginTop: '10px'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </form>
        </div>

        {/* Right Side: Info Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, minWidth: '300px' }}>
          
          <div style={{ backgroundColor: '#eff6ff', borderRadius: '12px', padding: '25px', border: '1px solid #bfdbfe' }}>
            <h3 style={{ fontSize: '16px', color: '#1e3a8a', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ color: '#3b82f6', fontSize: '20px' }}>🛡️</span> Privacy Notice
            </h3>
            <p style={{ color: '#1e40af', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
              Your feedback is <strong>anonymized</strong> before being shown to the Faculty Admin. We use your ID only to prevent spam, but your name will not appear on the Admin's "Missing Skills" dashboard.
            </p>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            <h3 style={{ fontSize: '16px', color: '#374151', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              💡 How this helps
            </h3>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#4b5563', fontSize: '14px', lineHeight: '1.7' }}>
              <li style={{ marginBottom: '8px' }}>Identifies gaps in the current syllabus.</li>
              <li style={{ marginBottom: '8px' }}>Suggests topics for upcoming weekend workshops.</li>
              <li>Helps the faculty buy licenses for new software tools.</li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};

export default SkillGapInput;