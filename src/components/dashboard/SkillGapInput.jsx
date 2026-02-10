// ============================================================================
// FILE: src/components/dashboard/SkillGapInput.jsx
// PURPOSE: Allow students to self-report missing skills for curriculum improvement
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
      // Auto-hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={onBack} style={styles.secondaryButton}>← Back to Home</button>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Curriculum Feedback</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Help the faculty understand what skills you need.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'start' }}>
        
        {/* LEFT: THE FORM */}
        <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb' }}>
          
          <h2 style={{ fontSize: '20px', marginBottom: '20px', color: '#111827' }}>✍️ Report a Missing Skill</h2>
          
          {success && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#ecfdf5', color: '#065f46', borderRadius: '8px', border: '1px solid #a7f3d0' }}>
              ✅ <strong>Received!</strong> Your feedback helps shape future workshops.
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            
            <div style={styles.inputGroup}>
              <label style={styles.label}>What skill do you feel is missing?</label>
              <input 
                type="text" 
                placeholder="e.g. Flutter, Advanced SQL, Public Speaking" 
                required
                style={styles.input}
                value={formData.skill_name}
                onChange={(e) => setFormData({...formData, skill_name: e.target.value})}
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Category</label>
              <select 
                style={styles.input}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="Technical">Technical (Coding, Tools)</option>
                <option value="Soft Skill">Soft Skill (Communication, Leadership)</option>
                <option value="Tool/Software">Software/Tool (e.g. Jira, Figma)</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Why is this important? (Optional)</label>
              <textarea 
                placeholder="e.g. I see this in many job descriptions but we didn't cover it in class." 
                rows="4"
                style={{...styles.input, fontFamily: 'inherit'}}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
              ></textarea>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              style={{...styles.button, backgroundColor: loading ? '#9ca3af' : '#4F46E5', marginTop: '10px'}}
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>

          </form>
        </div>

        {/* RIGHT: INFO / CONTEXT */}
        <div>
          <div style={{ backgroundColor: '#EEF2FF', padding: '25px', borderRadius: '12px', border: '1px solid #C7D2FE', marginBottom: '20px' }}>
            <h3 style={{ color: '#3730A3', marginTop: 0 }}>🛡️ Privacy Notice</h3>
            <p style={{ color: '#4338CA', lineHeight: '1.6', fontSize: '14px' }}>
              Your feedback is <strong>anonymized</strong> before being shown to the Faculty Admin. 
              We use your ID only to prevent spam, but your name will not appear on the Admin's "Missing Skills" dashboard.
            </p>
          </div>

          <div style={{ backgroundColor: '#F9FAFB', padding: '25px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <h3 style={{ color: '#374151', marginTop: 0 }}>💡 How this helps</h3>
            <ul style={{ paddingLeft: '20px', color: '#4B5563', lineHeight: '1.6', fontSize: '14px' }}>
              <li style={{marginBottom:'10px'}}>Identifies gaps in the current syllabus.</li>
              <li style={{marginBottom:'10px'}}>Suggests topics for upcoming weekend workshops.</li>
              <li>Helps the faculty buy licenses for new software tools.</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SkillGapInput;