// ============================================================================
// FILE: src/components/dashboard/Dashboard.jsx
// PURPOSE: Dashboard with Right-Aligned Action Button
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/styles';

const Dashboard = ({ onContinueRoadmap, onStartNew }) => {
  const { user } = useAuth();
  const [activeRoadmaps, setActiveRoadmaps] = useState([]);
  const [completedRoadmaps, setCompletedRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        const { data: roadmaps, error } = await supabase
          .from('roadmap')
          .select(`
            roadmap_id, status, career_id, created_at,
            career:career_id ( career_id, career_name, description )
          `)
          .eq('user_id', user.user_id);

        if (error) throw error;

        const processedMaps = await Promise.all(roadmaps.map(async (map) => {
            const { count: totalSteps } = await supabase
                .from('roadmap_step')
                .select('*', { count: 'exact', head: true })
                .eq('career_id', map.career_id);

            const { data: progress } = await supabase
                .from('progress_record')
                .select('step_id, roadmap_step!inner(career_id)')
                .eq('user_id', user.user_id)
                .eq('roadmap_step.career_id', map.career_id)
                .eq('completion_status', 'completed');

            const completedCount = progress?.length || 0;
            const isFullyDone = totalSteps > 0 && completedCount === totalSteps;

            if (isFullyDone && map.status === 'active') {
                await supabase.from('roadmap').update({ status: 'completed' }).eq('roadmap_id', map.roadmap_id);
                map.status = 'completed'; 
            }
            return map;
        }));

        setActiveRoadmaps(processedMaps.filter(m => m.status === 'active'));
        setCompletedRoadmaps(processedMaps.filter(m => m.status === 'completed'));

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
      
      {/* HEADER SECTION - NEW LAYOUT */}
      <div style={{ 
          marginBottom: '30px', 
          display: 'flex', 
          justifyContent: 'space-between', // Pushes items to edges
          alignItems: 'flex-end'           // Aligns bottom of text with button
      }}>
        
        {/* Left Side: Text */}
        <div>
            <h1 style={{ color: '#111827', margin: '0 0 5px 0', fontSize: '42px', fontWeight: '800' }}>
                👋 Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '16px' }}>
                Track your progress and keep learning.
            </p>
        </div>

        {/* Right Side: Button */}
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
                height: '42px', // Taller to match the bold header feel
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
            {activeRoadmaps.length > 0 ? activeRoadmaps.map((map) => (
              <div key={map.roadmap_id} style={{
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
                        {map.career.career_name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#4b5563', margin: 0, lineHeight: '1.5' }}>
                        {map.career.description ? map.career.description.substring(0, 90) + "..." : "No description available."}
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
                        ACTIVE
                    </span>
                    <button onClick={() => onContinueRoadmap(map.career.career_id)} style={{
                        ...styles.primaryButton,
                        padding: '6px 12px',
                        fontSize: '13px'
                    }}>
                        Continue Learning →
                    </button>
                </div>
              </div>
            )) : (
              <p style={{ color: '#6b7280', fontStyle: 'italic', fontSize: '14px' }}>
                 You have no active roadmaps.
              </p>
            )}
          </div>
      </div>

      {/* --- SECTION 2: COMPLETED ROADMAPS --- */}
      {completedRoadmaps.length > 0 && (
          <div style={{ 
              backgroundColor: 'white', 
              padding: '20px', 
              borderRadius: '12px', 
              border: '1px solid #e5e7eb', 
              boxShadow: '0 2px 4px -1px rgba(0, 0, 0, 0.05)'
          }}>
            <h3 style={{ 
                marginTop: 0, 
                borderBottom: '2px solid #10b981', 
                paddingBottom: '10px', 
                marginBottom: '20px', 
                color: '#065f46',
                fontSize: '18px'
            }}>
                🏆 Completed Roadmaps
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                {completedRoadmaps.map((map) => (
                <div key={map.roadmap_id} style={{
                    ...styles.card,
                    padding: '20px',
                    border: '1px solid #86efac', 
                    backgroundColor: '#f0fdf4',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    height: '100%'
                }}>
                    <div>
                        <h3 style={{ color: '#065f46', marginTop: 0, fontSize: '18px', marginBottom: '10px' }}>
                            {map.career.career_name}
                        </h3>
                        <p style={{ fontSize: '13px', color: '#374151', margin: 0, lineHeight: '1.5' }}>
                            {map.career.description ? map.career.description.substring(0, 90) + "..." : "Mastered skills for this career path."}
                        </p>
                    </div>

                    <div style={{
                        display:'flex', 
                        justifyContent:'space-between', 
                        alignItems:'center', 
                        marginTop: '20px'
                    }}>
                        <span style={{ 
                            backgroundColor: 'white', color: '#166534', 
                            padding: '4px 8px', borderRadius: '6px', 
                            fontSize: '11px', fontWeight:'bold',
                            border: '1px solid #86efac'
                        }}>
                            ✅ COMPLETED
                        </span>
                        <button 
                            onClick={() => onContinueRoadmap(map.career.career_id)} 
                            style={{
                                padding: '6px 12px',
                                backgroundColor: '#059669',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '500',
                                fontSize: '13px'
                            }}
                        >
                            Review Path →
                        </button>
                    </div>
                </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;