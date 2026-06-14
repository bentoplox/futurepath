// ============================================================================
// FILE: src/components/dashboard/Dashboard.jsx
// PURPOSE: Vector Mountain Hero + Stacked KPIs + Flawless Timeline Math
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

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
            const active = allRoadmaps.filter(r => r.status !== 'completed');
            
            const activeWithDetails = await Promise.all(active.map(async (r) => {
                try {
                    const detailRes = await fetch(`http://127.0.0.1:5000/api/roadmap/${r.career_id}?user_id=${user.user_id}`);
                    const detailData = await detailRes.json();
                    
                    if (detailData.success) {
                        return {
                            ...r,
                            detailed_steps: detailData.steps || [],
                            completed_steps: detailData.completed_steps || [],
                            is_eligible: detailData.is_eligible_for_quiz
                        };
                    }
                } catch (e) {
                    console.error("Failed to fetch roadmap details", e);
                }
                return r; 
            }));

            activeWithDetails.sort((a, b) => (b.progress_percent || 0) - (a.progress_percent || 0));

            setActiveRoadmaps(activeWithDetails);
            setCompletedRoadmaps(allRoadmaps.filter(r => r.status === 'completed'));
            setStats(data.stats || { total_skills: 0, total_paths: 0 });
        }
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [user?.user_id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>Loading your personalized dashboard...</div>;

  // --- 🏔️ HERO BANNER LOGIC ---
  const primaryRoadmap = activeRoadmaps[0]; 
  let nextMilestone = "Select a Career Path";
  
  if (primaryRoadmap && primaryRoadmap.detailed_steps) {
      const completedSet = new Set(primaryRoadmap.completed_steps || []);
      const nextStep = primaryRoadmap.detailed_steps.find(s => !completedSet.has(s.step_id));
      if (nextStep) {
          nextMilestone = nextStep.skill?.skill_name || `Module ${nextStep.step_order}`;
      } else if (primaryRoadmap.is_eligible) {
          nextMilestone = "Take Capstone Certification Exam 🚀";
      }
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. GLOBAL HEADER & ACTION BUTTONS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#111827' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'} 👋
        </h2>
        
        {/* ⚡ RESTORED NAVIGATION BUTTONS */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={onStartNew}
            style={{ backgroundColor: 'white', color: '#4f46e5', border: '1px solid #d1d5db', padding: '12px 24px', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'white'}
          >
            🔍 Browse All Roadmaps
          </button>
        </div>
      </div>

      {/* 2. TOP ROW: MOUNTAIN HERO BANNER & STACKED KPIS */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginBottom: '40px', alignItems: 'stretch' }}>
        
        {/* LEFT: MOUNTAIN HERO BANNER */}
        <div style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
          borderRadius: '24px',
          padding: '40px',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 10px 25px -5px rgba(59, 130, 246, 0.4)'
        }}>
          
          {/* 🏔️ ADVANCED VECTOR SVG MOUNTAIN ART */}
          <svg style={{ position: 'absolute', right: 0, bottom: 0, width: '450px', height: '100%', zIndex: 0, pointerEvents: 'none' }} viewBox="0 0 400 300" preserveAspectRatio="xMaxYMax meet">
            {/* Distant Peak */}
            <polygon points="150,300 280,100 450,300" fill="rgba(255,255,255,0.04)" />
            {/* Mid Peak */}
            <polygon points="-20,300 120,130 250,300" fill="rgba(255,255,255,0.08)" />
            {/* Main Foreground Peak */}
            <polygon points="50,300 220,40 390,300" fill="rgba(255,255,255,0.15)" />
            
            {/* Snowcap on Main Peak */}
            <polygon points="220,40 180,110 200,125 220,110 245,130 260,105" fill="rgba(255,255,255,0.35)" />

            {/* Winding Path (Dashed) */}
            <path d="M 120 270 Q 180 250 160 210 T 210 160 T 205 110" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="3" strokeDasharray="6,6" />
            
            {/* Path Waypoint Checkpoints */}
            <circle cx="120" cy="270" r="5" fill="rgba(255,255,255,0.9)" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="160" cy="210" r="5" fill="rgba(255,255,255,0.9)" stroke="#4f46e5" strokeWidth="2" />
            <circle cx="210" cy="160" r="5" fill="rgba(255,255,255,0.9)" stroke="#4f46e5" strokeWidth="2" />

            {/* Glowing Golden Flag */}
            <line x1="220" y1="40" x2="220" y2="5" stroke="#fcd34d" strokeWidth="4" />
            <polygon points="220,5 265,15 220,25" fill="#fcd34d" />
          </svg>

          <div style={{ position: 'relative', zIndex: 1 }}>
            <p style={{ margin: '0 0 5px 0', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1.5px', opacity: 0.8, fontWeight: '800' }}>
              Target Career
            </p>
            <h1 style={{ margin: 0, fontSize: '38px', fontWeight: '800', maxWidth: '75%', lineHeight: '1.1' }}>
              {primaryRoadmap ? primaryRoadmap.career?.career_name : 'Ready for a new journey?'}
            </h1>
          </div>

          <div style={{ marginTop: '50px', position: 'relative', zIndex: 1, maxWidth: '80%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: '700' }}>
              <span>Overall Progress</span>
              <span>{primaryRoadmap ? primaryRoadmap.progress_percent : 0}%</span>
            </div>
            <div style={{ width: '100%', height: '10px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', overflow: 'hidden' }}>
              <div style={{ width: `${primaryRoadmap ? primaryRoadmap.progress_percent : 0}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '10px' }}></div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px' }}>
              <div>
                <p style={{ margin: '0 0 6px 0', fontSize: '12px', opacity: 0.8, textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.5px' }}>Next Milestone</p>
                <p style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>{nextMilestone}</p>
              </div>
              <button 
                onClick={() => primaryRoadmap ? onContinueRoadmap(primaryRoadmap.career_id) : onStartNew()}
                style={{ backgroundColor: 'white', color: '#4f46e5', border: 'none', padding: '12px 24px', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', transition: 'transform 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
              >
                {primaryRoadmap ? 'View Roadmap →' : 'Find a Roadmap ↗'}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT: STACKED KPI CARDS */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* ⚡ UPDATED KPI 1: Roadmaps Completed (Orange Trophy SVG) */}
            <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: '#ffedd5', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '15px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 4h10v5.5c0 2.5-2 5.5-5 5.5s-5-3-5-5.5Z" />
                    <path d="M7 6H4.5a1.5 1.5 0 0 0 0 3H7" />
                    <path d="M17 6h2.5a1.5 1.5 0 0 1 0 3H17" />
                    <path d="M12 15l-3 6h6l-3-6" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '38px', color: '#111827', fontWeight: '800' }}>{stats.total_paths}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#6b7280', fontWeight: '700' }}>Roadmaps Completed</p>
            </div>
            
            {/* ⚡ UPDATED KPI 2: Skills Collected (Purple Brain SVG) */}
            <div style={{ flex: 1, backgroundColor: 'white', padding: '30px', borderRadius: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ backgroundColor: '#f3e8ff', width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', marginBottom: '15px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
                    <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
                    <path d="M15 13a4.5 4.5 0 0 1-3-4" />
                    <path d="M17.599 6.5A3 3 0 0 0 14 6" />
                    <path d="M9 13a4.5 4.5 0 0 0 3-4" />
                    <path d="M6.401 6.5A3 3 0 0 1 10 6" />
                  </svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '38px', color: '#111827', fontWeight: '800' }}>{stats.total_skills}</h3>
                <p style={{ margin: '5px 0 0 0', fontSize: '15px', color: '#6b7280', fontWeight: '700' }}>Skills Collected</p>
            </div>
        </div>

      </div>

      {/* 3. ACTIVE PATHS (DATA-DRIVEN TIMELINE) */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
            {activeRoadmaps.map((item) => {
              
              const steps = item.detailed_steps || [];
              const completedSet = new Set(item.completed_steps || []);
              
              const nodes = steps.map((s, idx) => ({
                  id: s.step_id,
                  label: s.skill?.skill_name || `Module ${idx + 1}`,
                  isCompleted: completedSet.has(s.step_id),
                  order: s.step_order || idx + 1
              }));

              // Append Capstone
              nodes.push({
                  id: 'capstone',
                  label: 'Certification',
                  isCapstone: true,
                  isCompleted: false, 
                  isEligible: item.is_eligible
              });

              const firstIncompleteIdx = nodes.findIndex(n => !n.isCompleted && !n.isCapstone);

              nodes.forEach((n, idx) => {
                  if (n.isCapstone) {
                      n.status = n.isEligible ? 'in-progress' : 'upcoming';
                  } else {
                      if (n.isCompleted) n.status = 'completed';
                      else if (idx === firstIncompleteIdx) n.status = 'in-progress';
                      else n.status = 'upcoming';
                  }
              });

              const totalSpaces = nodes.length > 1 ? nodes.length - 1 : 1;
              const fillPercentage = (completedSet.size / totalSpaces) * 100;

              return (
                <div key={item.roadmap_id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', border: '1px solid #f3f4f6', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h3 style={{ margin: 0, fontSize: '20px', color: '#111827', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '800' }}>
                      <span style={{ width: '5px', height: '22px', backgroundColor: '#4f46e5', borderRadius: '4px' }}></span>
                      Your Roadmap: {item.career?.career_name}
                    </h3>
                    <button onClick={() => onContinueRoadmap(item.career_id)} style={{ color: '#4f46e5', background: 'none', border: 'none', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
                      View Full Roadmap →
                    </button>
                  </div>

                  {/* Horizontal Timeline Graphic */}
                  <div style={{ overflowX: 'auto', paddingBottom: '20px' }}>
                    <div style={{ position: 'relative', minWidth: `${Math.max(100, nodes.length * 130)}px`, marginTop: '10px' }}>
                      
                      <div style={{ position: 'absolute', top: '15px', left: '50px', right: '50px', height: '4px', backgroundColor: '#e5e7eb', zIndex: 0 }}>
                          <div style={{ position: 'absolute', top: 0, left: 0, width: `${fillPercentage}%`, height: '100%', backgroundColor: '#10b981', transition: 'width 1s ease-out' }}></div>
                      </div>

                      {/* Nodes Container */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
                          {nodes.map((node) => (
                              <div key={node.id} style={{ width: '100px', display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                                  <div style={{
                                      width: '34px', height: '34px', borderRadius: '50%',
                                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                                      backgroundColor: node.status === 'completed' ? '#10b981' : 'white',
                                      border: node.status === 'completed' ? '2px solid #10b981' : (node.status === 'in-progress' ? '3px solid #6366f1' : '2px solid #e5e7eb'),
                                      color: node.status === 'completed' ? 'white' : (node.status === 'in-progress' ? '#6366f1' : '#9ca3af'),
                                      fontWeight: 'bold', fontSize: '14px', marginBottom: '10px',
                                      boxShadow: node.status === 'in-progress' ? '0 0 0 5px #e0e7ff' : 'none',
                                      transition: 'all 0.3s'
                                  }}>
                                      {node.status === 'completed' ? '✓' : (node.isCapstone ? '🏆' : node.order)}
                                  </div>
                                  <span style={{ fontSize: '12px', fontWeight: '600', color: node.status === 'upcoming' ? '#9ca3af' : '#374151', textAlign: 'center', lineHeight: '1.4', padding: '0 5px' }}>
                                      {node.label}
                                  </span>
                              </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Legend */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px', paddingLeft: '10px', flexWrap: 'wrap', gap: '20px' }}>
                    
                    <div style={{ display: 'flex', gap: '20px' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}><div style={{ width:'12px', height:'12px', borderRadius:'50%', backgroundColor:'#10b981' }}></div> Completed</div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}><div style={{ width:'12px', height:'12px', borderRadius:'50%', border:'2px solid #6366f1' }}></div> In Progress</div>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}><div style={{ width:'12px', height:'12px', borderRadius:'50%', border:'2px solid #e5e7eb' }}></div> Upcoming</div>
                    </div>
                    
                    <button 
                      onClick={() => onContinueRoadmap(item.career_id)}
                      style={{ 
                        backgroundColor: item.is_eligible ? '#f59e0b' : '#4f46e5', 
                        color: 'white', border: 'none', padding: '12px 28px', borderRadius: '8px', 
                        fontSize: '14px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', 
                        boxShadow: item.is_eligible ? '0 4px 10px rgba(245, 158, 11, 0.3)' : '0 4px 6px rgba(79, 70, 229, 0.2)' 
                      }}
                    >
                      {item.is_eligible ? 'Take Capstone Quiz 🚀' : 'Continue Learning →'}
                    </button>
                  </div>
                </div>
              );
            })}
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