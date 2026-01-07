// ============================================================================
// FILE: src/components/dashboard/Dashboard.jsx
// PURPOSE: Dashboard with Auto-Completion Check
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
        // 1. Fetch Roadmaps with their Step Counts
        const { data: roadmaps, error } = await supabase
          .from('roadmap')
          .select(`
            roadmap_id, status, career_id, created_at,
            career:career_id ( career_id, career_name, description )
          `)
          .eq('user_id', user.user_id);

        if (error) throw error;

        // 2. Fetch Completion Stats for each roadmap
        // We need to know: (A) Total Steps vs (B) Completed Steps
        const processedMaps = await Promise.all(roadmaps.map(async (map) => {
            
            // A. Get Total Steps for this Career
            const { count: totalSteps } = await supabase
                .from('roadmap_step')
                .select('*', { count: 'exact', head: true })
                .eq('career_id', map.career_id);

            // B. Get User's Completed Steps for this Career
            // We join progress_record -> roadmap_step -> filter by career_id
            const { data: progress } = await supabase
                .from('progress_record')
                .select('step_id, roadmap_step!inner(career_id)')
                .eq('user_id', user.user_id)
                .eq('roadmap_step.career_id', map.career_id)
                .eq('completion_status', 'completed');

            const completedCount = progress?.length || 0;
            const isFullyDone = totalSteps > 0 && completedCount === totalSteps;

            // 3. AUTO-FIX: If steps are done but status is 'active', fix it!
            if (isFullyDone && map.status === 'active') {
                console.log(`Auto-completing roadmap: ${map.career.career_name}`);
                await supabase
                    .from('roadmap')
                    .update({ status: 'completed' })
                    .eq('roadmap_id', map.roadmap_id);
                map.status = 'completed'; // Update local object
            }

            return map;
        }));

        // 4. Separate into lists
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
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
            <h1 style={{ color: '#111827', margin: 0 }}>👋 Welcome back, {user.name}!</h1>
            <p style={{ color: '#6b7280', marginTop: '5px' }}>Track your progress and keep learning.</p>
        </div>
        <button onClick={onStartNew} style={styles.button}>+ Start New Path</button>
      </div>

      {/* --- SECTION 1: ONGOING --- */}
      <h3 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '20px' }}>
        🚀 Ongoing Roadmaps
      </h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {activeRoadmaps.length > 0 ? activeRoadmaps.map((map) => (
          <div key={map.roadmap_id} style={styles.card}>
            <h3 style={{ color: '#4f46e5', marginTop: 0 }}>{map.career.career_name}</h3>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
                {map.career.description ? map.career.description.substring(0, 80) + "..." : "No description available."}
            </p>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                <span style={{background:'#eff6ff', color:'#1d4ed8', padding:'4px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold'}}>
                    ACTIVE
                </span>
                <button onClick={() => onContinueRoadmap(map.career.career_id)} style={styles.primaryButton}>
                    Continue Learning →
                </button>
            </div>
          </div>
        )) : (
          <p style={{ color: '#6b7280', fontStyle: 'italic' }}>
             You have no active roadmaps. Start a new one!
          </p>
        )}
      </div>

      {/* --- SECTION 2: COMPLETED --- */}
      {completedRoadmaps.length > 0 && (
          <div style={{ marginTop: '40px' }}>
            <h3 style={{ borderBottom: '2px solid #10b981', paddingBottom: '10px', marginBottom: '20px', color: '#065f46' }}>
                🏆 Completed Roadmaps
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {completedRoadmaps.map((map) => (
                <div key={map.roadmap_id} style={{
                    ...styles.card, 
                    border: '1px solid #10b981', 
                    background: 'linear-gradient(to bottom right, #ffffff, #f0fdf4)'
                }}>
                    <h3 style={{ color: '#065f46', marginTop: 0 }}>{map.career.career_name}</h3>
                    
                    <div style={{ marginTop: '10px', marginBottom:'15px', display:'flex', gap:'10px' }}>
                        <span style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight:'bold' }}>
                            ✅ COMPLETED
                        </span>
                    </div>

                    <button 
                        onClick={() => onContinueRoadmap(map.career.career_id)} 
                        style={{...styles.secondaryButton, width:'100%', borderColor:'#10b981', color:'#065f46'}}
                    >
                        Review Path
                    </button>
                </div>
                ))}
            </div>
          </div>
      )}
    </div>
  );
};

export default Dashboard;