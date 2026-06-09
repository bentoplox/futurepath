// ============================================================================
// FILE: src/components/roadmap/SkillCard.jsx
// PURPOSE: Cleaned up for the "Capstone Exam" Flow
// ============================================================================

import React, { useState } from 'react';
import ResourceList from './ResourceList';
import { styles } from '../../styles/styles';
import { useAuth } from '../../context/AuthContext';

const SkillCard = ({ 
  stepNumber, 
  skill, 
  isCompleted, 
  onUpdateProgress 
}) => {
  const { user } = useAuth();
  const [showResources, setShowResources] = useState(false);
  const resources = skill.learning_resource || [];

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('outdated_content');
  const [reportText, setReportText] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSubmittingReport(true);
    try {
        await fetch('http://127.0.0.1:5000/api/quality/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.user_id || user.id,
                user_role: 'student',
                target_type: 'skill',
                target_id: skill.skill_id,
                target_name: skill.skill_name,
                feedback_type: reportReason,
                suggested_alternative_text: reportText
            })
        });
        alert('Report submitted to admins. Thank you!');
        setShowReport(false);
        setReportText('');
    } catch(err) {
        console.error(err);
        alert('Failed to submit report');
    }
    setSubmittingReport(false);
  };

  return (
    <div style={{
      ...styles.skillCard, 
      borderLeft: `5px solid ${isCompleted ? '#10b981' : '#6366f1'}`,
      padding: '20px',
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s',
      flex: 1
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        
        <div style={{ maxWidth: '70%' }}>
          <p style={{ margin: '0 0 5px 0', fontSize: '12px', fontWeight: '800', color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Step {stepNumber}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px', fontWeight: '700' }}>
               {skill.skill_name}
            </h3>
            <button onClick={() => setShowReport(!showReport)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#ef4444', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef2f2' }} title="Report Issue">⚠️ Report</button>
          </div>
          
          <span style={{ 
            fontSize: '11px', padding: '3px 8px', borderRadius: '12px',
            backgroundColor: isCompleted ? '#d1fae5' : '#e0e7ff',
            color: isCompleted ? '#065f46' : '#4338ca',
            fontWeight: '700',
            textTransform: 'uppercase'
          }}>
            {isCompleted ? 'Module Completed ✓' : 'Ready to Learn'}
          </span>
        </div>

        {/* CHECKBOX */}
        <label style={{ 
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
            backgroundColor: isCompleted ? '#ecfdf5' : '#f9fafb'
        }}>
            <input
                type="checkbox"
                checked={isCompleted}
                onChange={onUpdateProgress} 
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '14px', fontWeight: '600', color: isCompleted ? '#065f46' : '#374151' }}>
                {isCompleted ? 'Done' : 'Mark as Done'}
            </span>
        </label>
      </div>

      {showReport && (
        <form onSubmit={handleReportSubmit} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '13px' }}>Report an Issue with this Skill</h4>
            <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '12px' }}>
                <option value="outdated_content">This skill is outdated / irrelevant</option>
                <option value="better_alternative">There is a better alternative</option>
            </select>
            <textarea required value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Provide brief details..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '12px', marginBottom: '10px', fontFamily: 'inherit', resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" disabled={submittingReport} style={{ background: '#dc2626', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: submittingReport ? 'not-allowed' : 'pointer' }}>{submittingReport ? 'Submitting...' : 'Submit Report'}</button>
                <button type="button" onClick={() => setShowReport(false)} style={{ background: 'transparent', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', border: '1px solid #dc2626', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
            </div>
        </form>
      )}

      <p style={{ color: '#4b5563', fontSize: '14px', marginBottom: '15px', lineHeight: '1.6' }}>
        {skill.description}
      </p>

      {/* RESOURCES TOGGLE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            onClick={() => setShowResources(!showResources)}
            style={{
              background: '#f3f4f6', border: '1px solid #e5e7eb', color: '#4f46e5',
              cursor: 'pointer', fontSize: '13px', fontWeight: '700', padding: '6px 12px',
              borderRadius: '6px', transition: 'all 0.2s'
            }}
          >
            {showResources ? 'Hide Resources ▲' : 'Show Learning Resources ▼'}
          </button>
          
          {resources.length > 0 && !showResources && (
              <span style={{ fontSize: '12px', color: '#6b7280' }}>
                  📦 {resources.length} resources available
              </span>
          )}
      </div>

      {showResources && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
          <ResourceList resources={resources} />
        </div>
      )}
    </div>
  );
};

export default SkillCard;