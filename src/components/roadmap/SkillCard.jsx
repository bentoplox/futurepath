// ============================================================================
// FILE: src/components/roadmap/SkillCard.jsx
// PURPOSE: Display individual skill with Quiz Gating (>80%) logic
// ============================================================================

import React, { useState } from 'react';
import ResourceList from './ResourceList';
import { styles } from '../../styles/styles';

const SkillCard = ({ 
  stepNumber, 
  skill, 
  resources, 
  isCompleted, 
  onUpdateProgress, 
  onTakeQuiz, 
  quizScore 
}) => {
  const [showResources, setShowResources] = useState(false);

  // --- LOGIC: THE 80% RULE ---
  // A skill is "Locked" if it's NOT done yet AND the score is less than 80%
  const isLocked = !isCompleted && quizScore < 80;

  // Determine border color based on status
  const getStatusColor = () => {
    if (isCompleted) return '#10b981'; // Green (Done)
    if (isLocked) return '#9ca3af';    // Gray (Locked)
    return '#f59e0b';                  // Orange (Ready to mark)
  };

  return (
    <div style={{
      ...styles.skillCard, 
      // Fallback styling if styles.skillCard is undefined
      ...(styles.skillCard ? {} : styles.card), 
      borderLeft: `5px solid ${getStatusColor()}`,
      padding: '20px',
      marginBottom: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        
        {/* LEFT SIDE: Title & Badges */}
        <div style={{ maxWidth: '65%' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px' }}>
            {isCompleted ? '✅' : (isLocked ? '🔒' : '⭕')} Step {stepNumber}: {skill.skill_name}
          </h3>
          
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* STATUS BADGE */}
            <span style={{ 
              fontSize: '12px', padding: '4px 10px', borderRadius: '12px',
              backgroundColor: isCompleted ? '#d1fae5' : (isLocked ? '#f3f4f6' : '#fff7ed'),
              color: isCompleted ? '#065f46' : (isLocked ? '#6b7280' : '#c2410c'),
              fontWeight: '600'
            }}>
              {isCompleted ? 'Completed' : (isLocked ? `Locked (Score: ${quizScore}%)` : 'Ready to Mark')}
            </span>

            {/* CATEGORY BADGE */}
            <span style={{ 
              fontSize: '12px', padding: '4px 10px', borderRadius: '12px',
              backgroundColor: '#e0e7ff', color: '#4338ca' 
            }}>
              {skill.skill_category}
            </span>
          </div>
        </div>

        {/* RIGHT SIDE: Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            
            {/* 1. QUIZ BUTTON (Only show if not completed) */}
            {!isCompleted && (
                <button 
                    onClick={onTakeQuiz}
                    style={{
                        padding: '6px 12px', 
                        fontSize: '12px', 
                        cursor: 'pointer',
                        backgroundColor: quizScore >= 80 ? '#d1fae5' : '#e0e7ff',
                        color: quizScore >= 80 ? '#065f46' : '#4338ca',
                        border: 'none', 
                        borderRadius: '4px', 
                        fontWeight: 'bold',
                        transition: '0.2s'
                    }}
                >
                    {quizScore >= 80 ? `✅ Quiz Passed (${quizScore}%)` : `📝 Take Quiz (${quizScore}%)`}
                </button>
            )}

            {/* 2. CHECKBOX (Disabled if Locked) */}
            <label style={{ 
              cursor: isLocked ? 'not-allowed' : 'pointer', 
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '6px', border: '1px solid #e5e7eb',
              backgroundColor: isLocked ? '#f9fafb' : 'white',
              opacity: isLocked ? 0.6 : 1
            }}>
              <input
                type="checkbox"
                checked={isCompleted}
                onChange={onUpdateProgress} // Parent handles the alert logic
                disabled={isLocked}         // Physically disable the box
                style={{ width: '18px', height: '18px', cursor: isLocked ? 'not-allowed' : 'pointer' }}
              />
              <span style={{ fontSize: '14px', fontWeight: '500', color: '#374151' }}>
                {isCompleted ? 'Done' : 'Mark Done'}
              </span>
            </label>
        </div>
      </div>

      {/* DESCRIPTION */}
      {skill.description && (
        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
          {skill.description}
        </p>
      )}

      {/* RESOURCES TOGGLE */}
      <button
        onClick={() => setShowResources(!showResources)}
        style={{
          background: 'none', border: 'none', color: '#4f46e5',
          cursor: 'pointer', fontSize: '14px', fontWeight: '600',
          padding: '0', display: 'flex', alignItems: 'center', gap: '5px'
        }}
      >
        {showResources ? 'Hide Learning Resources ▲' : 'Show Learning Resources ▼'}
      </button>

      {/* RESOURCES LIST */}
      {showResources && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
          <ResourceList resources={resources} />
        </div>
      )}
    </div>
  );
};

export default SkillCard;