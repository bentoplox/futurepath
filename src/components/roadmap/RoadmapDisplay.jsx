// ============================================================================
// FILE: src/components/roadmap/RoadmapDisplay.jsx
// PURPOSE: Display complete learning roadmap with progress tracking
// DESCRIPTION: Shows all skills, overall progress, and manages quiz modal
// ============================================================================

import React, { useState } from 'react';
import SkillCard from './SkillCard';
import QuizModal from './QuizModal';
import { MOCK_RESOURCES } from '../../data/mockData';
import { styles } from '../../styles/styles';

const RoadmapDisplay = ({ roadmap, onBackToCareerSelection }) => {
  // Progress tracking: stores completion status for each skill
  // Key: skill_id, Value: { completion_status, completion_date }
  const [progressRecords, setProgressRecords] = useState({});
  
  // State for quiz modal
  const [selectedSkill, setSelectedSkill] = useState(null);

  // Calculate overall progress percentage
  const calculateProgress = () => {
    const totalSkills = roadmap.steps.length;
    
    // Count how many skills are completed
    const completedSkills = Object.values(progressRecords).filter(
      p => p.completion_status === 'completed'
    ).length;
    
    // Return percentage
    return totalSkills > 0 ? Math.round((completedSkills / totalSkills) * 100) : 0;
  };

  // Get progress statistics
  const getProgressStats = () => {
    const total = roadmap.steps.length;
    const completed = Object.values(progressRecords).filter(
      p => p.completion_status === 'completed'
    ).length;
    const inProgress = Object.values(progressRecords).filter(
      p => p.completion_status === 'in_progress'
    ).length;
    const notStarted = total - completed - inProgress;

    return { total, completed, inProgress, notStarted };
  };

  // Update progress for a skill
  const handleUpdateProgress = (skill, newStatus) => {
    setProgressRecords({
      ...progressRecords,
      [skill.skill_id]: {
        completion_status: newStatus,
        completion_date: newStatus === 'completed' ? new Date().toISOString() : null
      }
    });

    // Show encouraging message
    if (newStatus === 'in_progress') {
      console.log(`Started learning: ${skill.skill_name}`);
    } else if (newStatus === 'completed') {
      console.log(`Completed: ${skill.skill_name}! 🎉`);
    }
  };

  // Handle quiz completion
  const handleQuizComplete = (skill, score, passed) => {
    // Close quiz modal
    setSelectedSkill(null);

    // If passed, mark skill as completed
    if (passed) {
      handleUpdateProgress(skill, 'completed');
      
      // Show success message
      alert(
        `🎉 Congratulations!\n\nYou scored ${score}% on ${skill.skill_name}!\n\nThe skill has been marked as completed.`
      );
    } else {
      // Show encouragement message
      alert(
        `📚 Keep Learning!\n\nYou scored ${score}% on ${skill.skill_name}.\n\nReview the learning resources and try again when you're ready.`
      );
    }
  };

  // Get progress stats
  const stats = getProgressStats();

  return (
    <div style={styles.roadmapContainer}>
      {/* Header section */}
      <div style={styles.roadmapHeader}>
        <button onClick={onBackToCareerSelection} style={styles.backButton}>
          ← Change Career Path
        </button>
        
        <div>
          <h1 style={{ marginBottom: '10px', color: '#111827' }}>
            🎓 Your {roadmap.career.career_name} Learning Roadmap
          </h1>
          <p style={{ color: '#6b7280', fontSize: '16px' }}>
            {roadmap.career.description}
          </p>
        </div>
      </div>

      {/* Progress overview section */}
      <div style={styles.progressSection}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ margin: 0, color: '#111827' }}>
            Overall Progress: {calculateProgress()}%
          </h3>
          <div style={{ fontSize: '24px' }}>
            {calculateProgress() === 100 ? '🎉' : '📚'}
          </div>
        </div>

        {/* Progress bar */}
        <div style={styles.progressBarContainer}>
          <div style={{
            ...styles.progressBarFill, 
            width: `${calculateProgress()}%`
          }} />
        </div>

        {/* Progress statistics */}
        <div style={{
          display: 'flex',
          gap: '20px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
              {stats.completed}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Completed
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
              {stats.inProgress}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              In Progress
            </div>
          </div>
          
          <div style={{ flex: 1, minWidth: '150px' }}>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6b7280' }}>
              {stats.notStarted}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>
              Not Started
            </div>
          </div>
        </div>

        {/* Completion message */}
        {calculateProgress() === 100 && (
          <div style={{
            marginTop: '20px',
            padding: '15px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            color: '#166534',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            🎉 Congratulations! You've completed all skills in your roadmap!
          </div>
        )}
      </div>

      {/* Skills list */}
      <div style={styles.skillsList}>
        <h2 style={{ marginBottom: '20px', color: '#111827' }}>
          📚 Your Learning Path ({roadmap.steps.length} Skills)
        </h2>

        {/* Render all skills */}
        {roadmap.steps.map((skill) => (
          <SkillCard
            key={skill.skill_id}
            skill={skill}
            resources={MOCK_RESOURCES[skill.skill_id] || []}
            progress={progressRecords[skill.skill_id]}
            onUpdateProgress={handleUpdateProgress}
            onTakeQuiz={() => setSelectedSkill(skill)}
          />
        ))}
      </div>

      {/* Quiz modal - only shows when selectedSkill is not null */}
      {selectedSkill && (
        <QuizModal
          skill={selectedSkill}
          onClose={() => setSelectedSkill(null)}
          onQuizComplete={handleQuizComplete}
        />
      )}
    </div>
  );
};

export default RoadmapDisplay;