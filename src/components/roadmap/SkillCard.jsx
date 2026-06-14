// ============================================================================
// FILE: src/components/roadmap/SkillCard.jsx
// PURPOSE: Matches new Gamified Card Design (Cleaned up Meta & Clickable Header)
// ============================================================================

import React, { useState } from 'react';
import ResourceList from './ResourceList';
import { useAuth } from '../../context/AuthContext';

const SkillCard = ({ 
  stepNumber, 
  skill, 
  status, 
  onUpdateProgress 
}) => {
  const { user } = useAuth();
  
  // Auto-expand resources if the module is currently active
  const [showResources, setShowResources] = useState(status === 'in-progress');
  const resources = skill.learning_resource || [];

  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState('outdated_content');
  const [reportText, setReportText] = useState('');

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
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
  };

  // Determine styles based on status
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  let badgeProps = { bg: '#f3f4f6', color: '#6b7280', text: 'LOCKED' };
  if (status === 'completed') badgeProps = { bg: '#d1fae5', color: '#059669', text: 'COMPLETED' };
  if (status === 'in-progress') badgeProps = { bg: '#e0e7ff', color: '#4338ca', text: 'IN PROGRESS' };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '16px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.03)',
      border: '1px solid #f3f4f6',
      transition: 'all 0.3s',
      flex: 1,
      opacity: isLocked ? 0.6 : 1, // Dim if locked
      overflow: 'hidden'
    }}>
      
      {/* CARD BODY */}
      <div style={{ padding: '25px' }}>
          {/* Header Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
              <span style={{ fontSize: '13px', fontWeight: '800', color: isCompleted ? '#10b981' : '#4f46e5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  STEP {stepNumber}
              </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
              <h3 style={{ margin: 0, color: '#111827', fontSize: '22px', fontWeight: '800' }}>
                 {skill.skill_name}
              </h3>
              
              <span style={{ 
                  fontSize: '11px', padding: '4px 12px', borderRadius: '20px',
                  backgroundColor: badgeProps.bg, color: badgeProps.color,
                  fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px'
              }}>
                  {badgeProps.text}
              </span>
              
              {!isLocked && (
                <button onClick={() => setShowReport(!showReport)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#ef4444', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef2f2', marginLeft: 'auto' }} title="Report Issue">⚠️ Report</button>
              )}
          </div>

          <p style={{ color: '#4b5563', fontSize: '15px', marginBottom: '20px', lineHeight: '1.6' }}>
            {skill.description || "Master the core concepts and techniques required for this module."}
          </p>

          {/* META INFO PILLS (Cleaned up) */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6366f1', backgroundColor: '#f5f3ff', padding: '6px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: '700' }}>
                  📚 {resources.length} {resources.length === 1 ? 'Resource' : 'Resources'}
              </div>
          </div>

          {showReport && (
            <form onSubmit={handleReportSubmit} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '13px' }}>Report an Issue with this Skill</h4>
                <select value={reportReason} onChange={(e) => setReportReason(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '12px' }}>
                    <option value="outdated_content">This skill is outdated / irrelevant</option>
                    <option value="better_alternative">There is a better alternative</option>
                </select>
                <textarea required value={reportText} onChange={(e) => setReportText(e.target.value)} placeholder="Provide brief details..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '12px', marginBottom: '10px', fontFamily: 'inherit', resize: 'vertical' }} />
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" style={{ background: '#dc2626', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Report</button>
                    <button type="button" onClick={() => setShowReport(false)} style={{ background: 'transparent', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', border: '1px solid #dc2626', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                </div>
            </form>
          )}
      </div>

      {/* EXPANDED ACTION & RESOURCES (Only for active or completed) */}
      {!isLocked && (
        <div style={{ backgroundColor: '#fafafa', borderTop: '1px solid #f3f4f6', padding: '25px' }}>
            
            {/* Action Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showResources ? '20px' : '0' }}>
                
                {/* ⚡ CLICKABLE HEADER FOR ACCORDION */}
                <button 
                    onClick={() => setShowResources(!showResources)}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        background: 'none', border: 'none', cursor: 'pointer', 
                        padding: 0, margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#111827'
                    }}
                >
                    <span style={{ color: '#4f46e5' }}>▶</span> 
                    {isCompleted ? 'Review Materials' : 'Continue Learning'}
                    <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '4px' }}>
                        {showResources ? '▲' : '▼'}
                    </span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                        onClick={onUpdateProgress}
                        style={{ 
                            backgroundColor: isCompleted ? '#f3f4f6' : '#10b981', 
                            color: isCompleted ? '#4b5563' : 'white', 
                            border: '1px solid', borderColor: isCompleted ? '#d1d5db' : '#10b981',
                            padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' 
                        }}
                    >
                        {isCompleted ? 'Mark as Incomplete ↺' : 'Mark as Done ✓'}
                    </button>
                </div>
            </div>

            {showResources && (
              <ResourceList resources={resources} />
            )}
        </div>
      )}

    </div>
  );
};

export default SkillCard;   