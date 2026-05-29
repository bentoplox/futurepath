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
  const [completedRoadmaps, setCompletedRoadmaps] = useState([]);
  const [stats, setStats] = useState({ total_skills: 0, total_paths: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.user_id) return;

    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://127.0.0.1:5000/api/user/dashboard/${user.user_id}`);
        const data = await response.json();

        if (data.success) {
            const allRoadmaps = data.roadmaps || [];
            // SPLIT INTO TWO SECTIONS
            setActiveRoadmaps(allRoadmaps.filter(r => r.status !== 'completed'));
            setCompletedRoadmaps(allRoadmaps.filter(r => r.status === 'completed'));
            setStats(data.stats || { total_skills: 0, total_paths: 0 });
        } else {
            console.error("Dashboard API error:", data.error);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.user_id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Aeonik', sans-serif" }}>Loading your personalized dashboard...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. WELCOME HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#111827' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h2>
        <button 
          onClick={onStartNew}
          style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 6px rgba(79, 70, 229, 0.2)', transition: 'all 0.2s' }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          + Generate New AI Roadmap
        </button>
      </div>

      {/* 2. KPI CARDS */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
          <div style={{ flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '6px solid #4f46e5' }}>
              <div style={{ fontSize: '32px', backgroundColor: '#eef2ff', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🧠</div>
              <div>
                  <h3 style={{ margin: 0, fontSize: '28px', color: '#111827' }}>{stats.total_skills}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Skills Acquired</p>
              </div>
          </div>
          <div style={{ flex: 1, backgroundColor: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: '6px solid #f59e0b' }}>
              <div style={{ fontSize: '32px', backgroundColor: '#fffbeb', width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🏆</div>
              <div>
                  <h3 style={{ margin: 0, fontSize: '28px', color: '#111827' }}>{stats.total_paths}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#6b7280', fontWeight: '600' }}>Journeys Completed</p>
              </div>
          </div>
      </div>

      {/* 3. ACTIVE PATHS SECTION */}
      <div style={{ marginBottom: '50px' }}>
        <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ backgroundColor: '#4f46e5', width: '8px', height: '24px', borderRadius: '4px' }}></span>
          Your Active Learning Paths
        </h3>

        {activeRoadmaps.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
            <p style={{ color: '#6b7280' }}>No active roadmaps. Start a new one to begin learning!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
            {activeRoadmaps.map((item) => (
              <div key={item.roadmap_id} style={{ border: '1px solid #e5e7eb', borderRadius: '16px', padding: '25px', backgroundColor: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', transition: 'transform 0.2s' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#111827', fontSize: '19px', fontWeight: '700' }}>
                  {item.career?.career_name}
                </h3>
                <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px', lineHeight: '1.5' }}>
                  {item.career?.description?.substring(0, 85)}...
                </p>
                
                {/* PROGRESS */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4b5563' }}>Progress</span>
                        <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#4f46e5' }}>{item.progress_percent}%</span>
                    </div>
                    <div style={{ width: '100%', height: '8px', backgroundColor: '#f3f4f6', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${item.progress_percent}%`, height: '100%', backgroundColor: '#6366f1', borderRadius: '10px', transition: 'width 0.5s ease' }}></div>
                    </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                      fontSize: '11px', fontWeight: '800', backgroundColor: item.ready_for_exam ? '#fef3c7' : '#e0e7ff', color: item.ready_for_exam ? '#92400e' : '#4338ca', padding: '4px 10px', borderRadius: '6px', textTransform: 'uppercase' 
                  }}>
                    {item.ready_for_exam ? '⚡ Exam Ready' : 'In Progress'}
                  </span>
                  <button 
                    onClick={() => onContinueRoadmap(item.career_id)}
                    style={{ backgroundColor: item.ready_for_exam ? '#f59e0b' : '#4f46e5', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                  >
                    {item.ready_for_exam ? 'Take Capstone Quiz 🚀' : 'Continue →'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4. COMPLETED CERTIFICATIONS SECTION */}
      {completedRoadmaps.length > 0 && (
        <div>
            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#374151', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ backgroundColor: '#10b981', width: '8px', height: '24px', borderRadius: '4px' }}></span>
                Completed Certifications
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '25px' }}>
                {completedRoadmaps.map((item) => (
                <div key={item.roadmap_id} style={{ border: '2px solid #10b981', borderRadius: '16px', padding: '25px', backgroundColor: '#f0fdf4', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', right: '-15px', top: '-15px', fontSize: '80px', opacity: 0.1, transform: 'rotate(15deg)' }}>🏆</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                        <h3 style={{ margin: 0, color: '#065f46', fontSize: '19px', fontWeight: '800' }}>{item.career?.career_name}</h3>
                        <span style={{ fontSize: '24px' }}>🏆</span>
                    </div>
                    <p style={{ fontSize: '14px', color: '#065f46', marginBottom: '20px', opacity: 0.8 }}>
                        Certification earned upon successful completion of all modules and the capstone competency exam.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#10b981', color: 'white', padding: '6px 12px', borderRadius: '20px', letterSpacing: '0.5px' }}>
                            ✓ VERIFIED
                        </span>
                        <button 
                            onClick={() => onContinueRoadmap(item.career_id)}
                            style={{ backgroundColor: 'white', color: '#10b981', border: '1px solid #10b981', padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
                        >
                            Review Roadmap
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