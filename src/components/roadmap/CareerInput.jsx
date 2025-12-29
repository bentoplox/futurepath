// ============================================================================
// FILE: src/components/roadmap/CareerInput.jsx
// PURPOSE: Career selection interface
// DESCRIPTION: Displays available careers and generates personalized roadmap
// ============================================================================

import React, { useState } from 'react';
import { MOCK_CAREERS, MOCK_SKILLS } from '../../data/mockData';
import { styles } from '../../styles/styles';

const CareerInput = ({ onCareerSelected }) => {
  // State to track which career card is selected
  const [selectedCareer, setSelectedCareer] = useState(null);
  
  // State to show loading animation when generating roadmap
  const [isLoading, setIsLoading] = useState(false);

  // Handle career card click
  const handleCareerSelect = (career) => {
    setSelectedCareer(career);
  };

  // Generate roadmap when user clicks the button
  const handleGenerateRoadmap = () => {
    // Validation: Make sure a career is selected
    if (!selectedCareer) {
      alert('Please select a career first');
      return;
    }

    // Show loading state
    setIsLoading(true);
    
    // Simulate API call delay (in production, this would call Supabase)
    setTimeout(() => {
      // Get skills for the selected career from mock data
      const skills = MOCK_SKILLS[selectedCareer.career_id] || [];
      
      // Create roadmap object
      const roadmap = {
        roadmap_id: Math.floor(Math.random() * 100000), // Generate random ID
        career: selectedCareer,
        steps: skills,
        created_date: new Date().toISOString()
      };

      // Hide loading state
      setIsLoading(false);
      
      // Pass roadmap to parent component
      onCareerSelected(roadmap);
    }, 1500); // 1.5 second delay to simulate network request
  };

  return (
    <div style={styles.careerInputContainer}>
      {/* Header section */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', marginBottom: '10px', color: '#111827' }}>
          🎯 What's Your Dream Career?
        </h2>
        <p style={styles.subtitle}>
          Select a career path below and we'll create a personalized, 
          step-by-step learning roadmap tailored just for you
        </p>
      </div>

      {/* Career cards grid */}
      <div style={styles.careerGrid}>
        {MOCK_CAREERS.map((career) => (
          <div
            key={career.career_id}
            onClick={() => handleCareerSelect(career)}
            style={{
              ...styles.careerCard,
              // Add selected styles if this career is selected
              ...(selectedCareer?.career_id === career.career_id 
                ? styles.careerCardSelected 
                : {})
            }}
          >
            <h3 style={{ marginBottom: '10px', color: '#111827' }}>
              {career.career_name}
            </h3>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.5' }}>
              {career.description}
            </p>
            
            {/* Show checkmark if selected */}
            {selectedCareer?.career_id === career.career_id && (
              <div style={{ 
                marginTop: '15px', 
                color: '#6366f1', 
                fontWeight: '600',
                fontSize: '14px'
              }}>
                ✓ Selected
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Generate button - only show if a career is selected */}
      {selectedCareer && (
        <button
          onClick={handleGenerateRoadmap}
          disabled={isLoading}
          style={{
            ...styles.button,
            ...styles.generateButton,
            opacity: isLoading ? 0.7 : 1
          }}
        >
          {isLoading ? (
            <>⏳ Generating Your Roadmap...</>
          ) : (
            <>✨ Generate My Personalized Roadmap</>
          )}
        </button>
      )}

      {/* Helpful tip */}
      {!selectedCareer && (
        <div style={{
          marginTop: '40px',
          padding: '20px',
          backgroundColor: '#eff6ff',
          borderRadius: '8px',
          borderLeft: '4px solid #3b82f6',
          color: '#1e40af'
        }}>
          <strong>💡 Tip:</strong> Not sure which career to choose? 
          Think about what you enjoy doing and what problems you'd like to solve. 
          You can always change your path later!
        </div>
      )}
    </div>
  );
};

export default CareerInput;