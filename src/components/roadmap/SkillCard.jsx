// ============================================================================
// FILE: src/components/roadmap/SkillCard.jsx
// PURPOSE: Cleaned up for the "Capstone Exam" Flow
// ============================================================================

import React, { useState } from 'react';
import ResourceList from './ResourceList';
import { styles } from '../../styles/styles';

const SkillCard = ({ 
  stepNumber, 
  skill, 
  resources, 
  isCompleted, 
  onUpdateProgress 
}) => {
  const [showResources, setShowResources] = useState(false);

  return (
    <div style={{
      ...styles.skillCard, 
      borderLeft: `5px solid ${isCompleted ? '#10b981' : '#6366f1'}`,
      padding: '20px',
      marginBottom: '15px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      
      {/* HEADER SECTION */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
        
        <div style={{ maxWidth: '65%' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#111827', fontSize: '18px' }}>
            {isCompleted ? '✅' : '⭕'} Step {stepNumber}: {skill.title}
          </h3>
          
          <span style={{ 
            fontSize: '12px', padding: '4px 10px', borderRadius: '12px',
            backgroundColor: isCompleted ? '#d1fae5' : '#e0e7ff',
            color: isCompleted ? '#065f46' : '#4338ca',
            fontWeight: '600'
          }}>
            {isCompleted ? 'Completed' : 'Ready to Learn'}
          </span>
        </div>

        {/* JUST A SIMPLE CHECKBOX NOW */}
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
            <span style={{ fontSize: '14px', fontWeight: '500', color: isCompleted ? '#065f46' : '#374151' }}>
                {isCompleted ? 'Done' : 'Mark as Read'}
            </span>
        </label>
      </div>

      <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '15px' }}>
        {skill.description}
      </p>

      {/* RESOURCES TOGGLE */}
      <button
        onClick={() => setShowResources(!showResources)}
        style={{
          background: 'none', border: 'none', color: '#4f46e5',
          cursor: 'pointer', fontSize: '14px', fontWeight: '600', padding: '0'
        }}
      >
        {showResources ? 'Hide Learning Resources ▲' : 'Show Learning Resources ▼'}
      </button>

      {showResources && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '15px' }}>
          <ResourceList resources={resources} />
        </div>
      )}
    </div>
  );
};

export default SkillCard;