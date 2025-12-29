// ============================================================================
// FILE: src/components/roadmap/SkillCard.jsx
// PURPOSE: Display individual skill with progress tracking
// DESCRIPTION: Shows skill details, resources, and action buttons
// ============================================================================

import React, { useState } from 'react';
import ResourceList from './ResourceList';
import { styles } from '../../styles/styles';

const SkillCard = ({ skill, resources, progress, onUpdateProgress, onTakeQuiz }) => {
  // State to toggle resource visibility
  const [showResources, setShowResources] = useState(false);

  // Determine current status: not_started, in_progress, or completed
  const status = progress?.completion_status || 'not_started';

  // Get color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'completed': 
        return '#10b981'; // Green
      case 'in_progress': 
        return '#f59e0b'; // Orange/Yellow
      default: 
        return '#6b7280'; // Gray
    }
  };

  // Get status text with icon
  const getStatusText = () => {
    switch (status) {
      case 'completed': 
        return '✓ Completed';
      case 'in_progress': 
        return '⏳ In Progress';
      default: 
        return '○ Not Started';
    }
  };

  // Get status icon for visual feedback
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': 
        return '✅';
      case 'in_progress': 
        return '🔄';
      default: 
        return '⭕';
    }
  };

  return (
    <div style={{
      ...styles.skillCard,
      borderLeft: `4px solid ${getStatusColor()}` // Color-coded left border
    }}>
      {/* Skill header with name and badges */}
      <div style={styles.skillHeader}>
        <div>
          {/* Skill name with order number */}
          <h3 style={styles.skillName}>
            {getStatusIcon()} {skill.order}. {skill.skill_name}
          </h3>
          
          {/* Status badge */}
          <span style={{
            ...styles.badge, 
            backgroundColor: getStatusColor()
          }}>
            {getStatusText()}
          </span>
          
          {/* Category badge */}
          <span style={{
            ...styles.badge,
            backgroundColor: '#6b7280'
          }}>
            {skill.skill_category}
          </span>
        </div>
      </div>

      {/* Skill description if available */}
      {skill.description && (
        <p style={{ 
          color: '#6b7280', 
          fontSize: '14px', 
          marginBottom: '15px',
          lineHeight: '1.6'
        }}>
          {skill.description}
        </p>
      )}

      {/* Action buttons */}
      <div style={styles.skillActions}>
        {/* Always show: Toggle resources button */}
        <button
          onClick={() => setShowResources(!showResources)}
          style={styles.secondaryButton}
        >
          {showResources ? '📚 Hide Resources' : '📚 View Resources'}
        </button>

        {/* NOT STARTED: Show start button */}
        {status === 'not_started' && (
          <button
            onClick={() => onUpdateProgress(skill, 'in_progress')}
            style={styles.primaryButton}
          >
            🚀 Start Learning
          </button>
        )}

        {/* IN PROGRESS: Show quiz and complete buttons */}
        {status === 'in_progress' && (
          <>
            <button
              onClick={() => onTakeQuiz(skill)}
              style={styles.primaryButton}
            >
              📝 Take Verification Quiz
            </button>
            <button
              onClick={() => onUpdateProgress(skill, 'completed')}
              style={styles.successButton}
            >
              ✓ Mark as Complete
            </button>
          </>
        )}

        {/* COMPLETED: Show retake quiz button */}
        {status === 'completed' && (
          <button
            onClick={() => onTakeQuiz(skill)}
            style={styles.secondaryButton}
          >
            🔄 Retake Quiz
          </button>
        )}
      </div>

      {/* Conditionally render resources */}
      {showResources && (
        <ResourceList resources={resources} />
      )}

      {/* Show completion date if completed */}
      {status === 'completed' && progress?.completion_date && (
        <div style={{
          marginTop: '15px',
          padding: '10px',
          backgroundColor: '#f0fdf4',
          borderRadius: '6px',
          fontSize: '13px',
          color: '#166534'
        }}>
          ✅ Completed on {new Date(progress.completion_date).toLocaleDateString()}
        </div>
      )}
    </div>
  );
};

export default SkillCard;