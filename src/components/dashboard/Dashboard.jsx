// ============================================================================
// FILE: src/components/dashboard/Dashboard.jsx
// PURPOSE: Dashboard with AI Roadmap Support (Premium UI)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/styles';

const Dashboard = ({ onContinueRoadmap, onStartNew }) => {
  const { user } = useAuth();
  const [activeRoadmaps, setActiveRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        
        // ⚡ QUERY THE NEW NORMALIZED TABLES (roadmap + career)
        const { data: roadmaps, error } = await supabase
          .from('roadmap')
          .select(`
            roadmap_id,
            status,
            career_id,
            created_at,
            career (
              career_id,
              career_name,
              description
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

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Loading your dashboard...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#111827', fontFamily: 'Georgia, serif' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h2>
        <button 
          onClick={onStartNew}
          style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)' }}
        >
          + Generate New AI Roadmap
        </button>
      </div>

      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '30px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>
          Your Active Learning Paths
        </h3>

        {activeRoadmaps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '8px', border: '1px dashed #d1d5db' }}>
            <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🗺️</span>
            <h4 style={{ margin: '0 0 10px 0', color: '#4b5563' }}>No active roadmaps yet</h4>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Select a career goal to let our AI generate your personalized learning path.</p>
            <button onClick={onStartNew} style={{ ...styles.primaryButton }}>Explore Careers</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {activeRoadmaps.map((item) => (
              <div key={item.roadmap_id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '20px', transition: 'all 0.2s', backgroundColor: 'white' }}>
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ flexGrow: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '18px' }}>
                      {item.career?.career_name || "Unknown Career"}
                    </h3>
                    <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                      {item.career?.description 
                          ? item.career.description.substring(0, 90) + "..." 
                          : "No description available."}
                    </p>
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#4c2882', backgroundColor: '#f3f4f6', padding: '4px 8px', borderRadius: '4px' }}>
                      {item.status ? item.status.toUpperCase() : 'ACTIVE'}
                    </span>
                    <button 
                      onClick={() => onContinueRoadmap(item.career_id)}
                      style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                    >
                      Continue →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;