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

  if (loading) return <div style={{textAlign:'center', padding:'40px', color: '#6b7280'}}>Loading Dashboard...</div>;

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif', margin: '-20px', paddingBottom: '50px' }}>
      
      {/* 1. PREMIUM HERO BANNER */}
      <div style={{ 
        backgroundColor: '#4c2882',
        backgroundImage: 'linear-gradient(135deg, #4c2882 0%, #6b4c9a 100%)',
        color: 'white',
        padding: '60px 40px 100px 40px',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Circle Background */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
              👋 Welcome back, <span style={{ color: '#fcd34d' }}>{user?.name ? user.name.split(' ')[0] : 'Student'}!</span>
            </h1>
            <p style={{ opacity: 0.9, fontSize: '16px', margin: 0 }}>
              Track your progress and keep learning.
            </p>
          </div>
          
          <button 
            onClick={onStartNew} 
            style={{ 
              backgroundColor: '#6366f1', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', 
              fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s, background 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4f46e5'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6366f1'}
          >
            <span style={{fontSize: '18px', lineHeight: '1'}}>+</span> Start New Path
          </button>
        </div>
      </div>

      {/* 2. FLOATING CONTENT AREA */}
      <div style={{ maxWidth: '1000px', margin: '-50px auto 0 auto', position: 'relative', zIndex: 10, padding: '0 20px' }}>
        
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
          <h2 style={{ fontSize: '20px', color: '#111827', margin: '0 0 20px 0', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'Georgia, serif', borderBottom: '2px solid #e5e7eb', paddingBottom: '15px' }}>
            🚀 Ongoing Roadmaps
          </h2>

          {activeRoadmaps.length === 0 ? (
            <p style={{ color: '#6b7280', textAlign: 'center', padding: '20px', fontStyle: 'italic' }}>
              You have no active roadmaps. Click "Start New Path" above!
            </p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {activeRoadmaps.map((item) => (
                <div key={item.id} style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f9fafb', transition: 'box-shadow 0.2s' }}>
                  <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
                    
                    <div>
                      <h3 style={{ fontSize: '18px', color: '#4c2882', margin: '0 0 10px 0', fontWeight: 'bold' }}>
                        {item.ai_roadmaps?.title || "Unknown Title"}
                      </h3>
                      <p style={{ fontSize: '14px', color: '#4b5563', margin: '0 0 20px 0', lineHeight: '1.5' }}>
                        {item.ai_roadmaps?.description 
                            ? item.ai_roadmaps.description.substring(0, 90) + "..." 
                            : "No description available."}
                      </p>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', color: '#4c2882', backgroundColor: 'white', border: '1px solid #d1d5db', padding: '4px 8px', borderRadius: '4px' }}>
                        {item.status ? item.status.toUpperCase() : 'ACTIVE'}
                      </span>
                      <button 
                        onClick={() => onContinueRoadmap(item.ai_roadmaps.id)}
                        style={{ backgroundColor: '#6366f1', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                      >
                        Continue Learning →
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;