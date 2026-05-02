// ============================================================================
// FILE: src/components/dashboard/Dashboard.jsx
// PURPOSE: Dashboard with AI Roadmap Support (Compatible with your App.jsx)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/styles';

// PROPS:
// onContinueRoadmap -> Passed from App.jsx (handles view switching)
// onStartNew -> Passed from App.jsx (handles view switching)
const Dashboard = ({ onContinueRoadmap, onStartNew }) => {
  const { user } = useAuth();
  const [activeRoadmaps, setActiveRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        
        // ⚡ QUERY THE NEW AI TABLES
        const { data: roadmaps, error } = await supabase
          .from('user_ai_roadmaps')
          .select(`
            id,
            status,
            roadmap_id,
            created_at,
            ai_roadmaps (
              id,
              title,
              description,
              version
            )
          `)
          .eq('user_id', user.user_id);

        if (error) throw error;

        setActiveRoadmaps(roadmaps || []);

      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user]);

  if (loading) return <div style={{textAlign:'center', padding:'40px'}}>Loading Dashboard...</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      
      {/* HEADER SECTION */}
      <div style={{ 
          marginBottom: '30px', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-end' 
      }}>
        <div>
            <h1 style={{ color: '#111827', margin: '0 0 5px 0', fontSize: '42px', fontWeight: '800' }}>
                👋 Welcome back, {user.name ? user.name.split(' ')[0] : 'Student'}!
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                Track your progress and keep learning.
            </p>
        </div>

        <button 
            onClick={onStartNew} 
            style={{
                ...styles.primaryButton,
                padding: '10px 20px',     
                fontSize: '14px',        
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                height: '42px', 
                boxShadow: '0 4px 6px -1px rgba(79, 70, 229, 0.2)'
            }}
        >
            <span style={{ fontSize: '18px', lineHeight: '1' }}>+</span> Start New Path
        </button>
      </div>

      {/* --- SECTION 1: ONGOING ROADMAPS --- */}
      <div style={{ 
          backgroundColor: 'white', 
          padding: '20px', 
          borderRadius: '12px', 
          border: '1px solid #e5e7eb', 
          boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)',
          marginBottom: '30px'
      }}>
          <h3 style={{ 
              marginTop: 0, 
              borderBottom: '2px solid #4f46e5', 
              paddingBottom: '10px', 
              marginBottom: '20px',
              fontSize: '18px',
              color: '#111827'
          }}>
            🚀 Ongoing Roadmaps
          </h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
            {activeRoadmaps.length > 0 ? activeRoadmaps.map((item) => (
              <div key={item.id} style={{
                  ...styles.card,
                  padding: '20px', 
                  backgroundColor: '#eef2ff', 
                  border: '1px solid #c7d2fe', 
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%' 
              }}>
                <div>
                    <h3 style={{ color: '#4338ca', marginTop: 0, fontSize: '18px', marginBottom: '10px' }}>
                        {item.ai_roadmaps?.title || "Unknown Title"}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.5' }}>
                        {item.ai_roadmaps?.description 
                            ? item.ai_roadmaps.description.substring(0, 90) + "..." 
                            : "No description available."}
                    </p>
                </div>
                
                <div style={{
                    display:'flex', 
                    justifyContent:'space-between', 
                    alignItems:'center', 
                    marginTop: '20px' 
                }}>
                    <span style={{
                        background:'white', color:'#4f46e5', 
                        padding:'4px 8px', borderRadius:'6px', 
                        fontSize:'11px', fontWeight:'bold',
                        border: '1px solid #c7d2fe'
                    }}>
                        {item.status ? item.status.toUpperCase() : 'ACTIVE'}
                    </span>
                    <button 
                        // ⚡ FIX: Use the prop passed from App.jsx instead of navigate()
                        onClick={() => onContinueRoadmap(item.ai_roadmaps.id)} 
                        style={{
                            ...styles.primaryButton,
                            padding: '6px 12px',
                            fontSize: '13px'
                        }}
                    >
                        Continue Learning →
                    </button>
                </div>
              </div>
            )) : (
              <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '14px' }}>
                 You have no active roadmaps. Click "Start New Path" above!
              </p>
            )}
          </div>
      </div>

    </div>
  );
};

export default Dashboard;