// ============================================================================
// FILE: src/components/roadmap/CareerInput.jsx
// PURPOSE: Select a Career -> Call Python API -> Generate Roadmap
// ============================================================================

import React, { useState } from 'react';
import { styles } from '../../styles/styles';
import { useAuth } from '../../context/AuthContext'; // We need user ID for the API

const CareerInput = ({ onCareerSelect }) => {
  const { user } = useAuth();
  const [career, setCareer] = useState('');
  const [loading, setLoading] = useState(false);

  // Hardcoded options are safer for demos than free text
  const careerOptions = [
    "Software Engineer",
    "Data Scientist",
    "Product Manager",
    "UI/UX Designer",
    "DevOps Engineer",
    "Cybersecurity Analyst",
    "Mobile App Developer",
    "Cloud Architect",
    "Game Developer",
    "Blockchain Developer",
    "Artificial Intelligence Engineer",
    "Business Intelligence Analyst"
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!career) return alert("Please select a career path.");
    if (!user) return alert("You must be logged in.");

    setLoading(true);

    try {
      // 1. Call your Python Backend
      const response = await fetch('http://127.0.0.1:5000/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            career_title: career,
            user_id: user.user_id 
        }),
      });

      const data = await response.json();

      if (data.success) {
        // 2. Success! Pass the roadmap ID to the parent to switch views
        onCareerSelect(data.roadmap_id);
      } else {
        alert("Generation failed: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("API Error:", error);
      alert("Failed to connect to the generator. Is the Python backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ marginBottom: '15px', color: '#111827' }}>
        🎯 Choose Your Dream Career
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Select a role below, and our AI agent will generate a personalized roadmap for you based on industry standards.
      </p>

      <form onSubmit={handleGenerate}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            I want to become a...
          </label>
          
          <select
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '16px',
              cursor: 'pointer'
            }}
            disabled={loading}
          >
            <option value="">-- Select a Career --</option>
            {careerOptions.map((option, index) => (
              <option key={index} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          style={{ 
            ...styles.button, 
            opacity: (!career || loading) ? 0.7 : 1,
            cursor: (!career || loading) ? 'not-allowed' : 'pointer'
          }}
          disabled={!career || loading}
        >
          {loading ? 'AI is Generating Roadmap...' : 'Generate Roadmap 🚀'}
        </button>
      </form>
    </div>
  );
};

export default CareerInput;