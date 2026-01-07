// ============================================================================
// FILE: src/components/roadmap/CareerInput.jsx
// PURPOSE: Allows users to select a career path from the Database
// ============================================================================

import React, { useState, useEffect } from 'react';
import { styles } from '../../styles/styles';
import { supabase } from '../../supabaseClient'; // Import Supabase

const CareerInput = ({ onCareerSelect }) => {
  const [selectedCareer, setSelectedCareer] = useState('');
  const [careers, setCareers] = useState([]); // State to hold DB data
  const [loading, setLoading] = useState(true);

  // Fetch careers from Supabase on mount
  useEffect(() => {
    const fetchCareers = async () => {
      try {
        const { data, error } = await supabase
          .from('career') // Matches your ERD table 'career'
          .select('*');
        
        if (error) throw error;
        setCareers(data || []);
      } catch (error) {
        console.error('Error fetching careers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCareers();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCareer) {
      onCareerSelect(selectedCareer);
    }
  };

  return (
    <div style={styles.card}>
      <h2 style={{ marginBottom: '15px', color: '#111827' }}>
        🎯 Choose Your Dream Career
      </h2>
      <p style={{ color: '#6b7280', marginBottom: '20px' }}>
        Select a career path to generate your personalized roadmap.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
            I want to become a...
          </label>
          
          <select
            value={selectedCareer}
            onChange={(e) => setSelectedCareer(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: 'white',
              fontSize: '16px'
            }}
            disabled={loading}
          >
            <option value="">-- Select a Career --</option>
            {/* Map over the Supabase data instead of mockData */}
            {careers.map((career) => (
              <option key={career.career_id} value={career.career_id}>
                {career.career_name}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          style={{ ...styles.button, opacity: !selectedCareer ? 0.7 : 1 }}
          disabled={!selectedCareer || loading}
        >
          {loading ? 'Loading...' : 'Generate Roadmap 🚀'}
        </button>
      </form>
    </div>
  );
};

export default CareerInput;