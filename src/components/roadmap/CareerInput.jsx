// ============================================================================
// FILE: src/components/roadmap/CareerInput.jsx
// PURPOSE: Select a Career -> Call Gemini API -> Generate Roadmap
// ============================================================================

import React, { useState, useEffect } from 'react';
import { styles } from '../../styles/styles';
import { useAuth } from '../../context/AuthContext'; 

const CareerInput = ({ onCareerSelect }) => {
  const { user } = useAuth();
  const [career, setCareer] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);

  // --- DYNAMIC LOADING STATES ---
  const loadingMessages = [
    "Analyzing industry standards...",
    "Curating best free resources...",
    "Building your personalized roadmap...",
    "Generating skill verification quizzes...",
    "Finalizing your path..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingTextIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
      }, 2500); // Change text every 2.5 seconds
    } else {
      setLoadingTextIndex(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const careerOptions = [
    "Software Engineer", "Data Scientist", "Product Manager", "UI/UX Designer",
    "DevOps Engineer", "Cybersecurity Analyst", "Mobile App Developer",
    "Cloud Architect", "Game Developer", "Blockchain Developer",
    "Artificial Intelligence Engineer", "Business Intelligence Analyst"
  ];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!career) return alert("Please select a career path.");
    if (!user) return alert("You must be logged in.");

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:5000/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ career_title: career, user_id: user.user_id }),
      });

      const data = await response.json();

      if (data.success) {
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
    <div style={{...styles.card, padding: '30px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}>
      <h2 style={{ marginBottom: '15px', color: '#111827', fontFamily: 'Georgia, serif' }}>
        🎯 Choose Your Dream Career
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '25px', lineHeight: '1.6' }}>
        Select a role below, and our AI agent will generate a personalized roadmap for you based on current industry standards.
      </p>

      <form onSubmit={handleGenerate}>
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
            I want to become a...
          </label>
          
          <select
            value={career}
            onChange={(e) => setCareer(e.target.value)}
            style={{ width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #d1d5db', backgroundColor: 'white', fontSize: '15px', cursor: 'pointer', outline: 'none' }}
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
            width: '100%', padding: '16px', borderRadius: '8px', border: 'none', color: 'white', fontSize: '16px', fontWeight: 'bold', transition: 'all 0.3s',
            backgroundColor: (!career || loading) ? '#9ca3af' : '#4c2882',
            cursor: (!career || loading) ? 'not-allowed' : 'pointer'
          }}
          disabled={!career || loading}
        >
          {loading ? (
             <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ animation: 'spin 1s linear infinite' }}>⏳</span> 
                {loadingMessages[loadingTextIndex]}
             </span>
          ) : 'Generate Roadmap 🚀'}
        </button>
      </form>
    </div>
  );
};

export default CareerInput;