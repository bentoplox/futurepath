import { API_BASE_URL } from '../../apiConfig';
// ============================================================================
// FILE: src/components/dashboard/UserProfile.jsx
// PURPOSE: Gamified User Profile with Centered Metrics & Clean Skills UI
// ============================================================================

import React, { useState, useEffect } from 'react';
import { styles } from '../../styles/styles';
import { supabase } from '../../supabaseClient';

const UserProfile = ({ user, onClose, logout }) => {
  const [loading, setLoading] = useState(true);
  const [acquiredSkills, setAcquiredSkills] = useState([]);
  const [completedRoadmaps, setCompletedRoadmaps] = useState([]);

  useEffect(() => {
    const fetchProfileStats = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const uid = user.user_id || user.id;
        const res = await fetch(`${API_BASE_URL}/api/user/profile/${uid}`);
        const data = await res.json();

        if (data.success) {
          setCompletedRoadmaps(data.completed_roadmaps || []);
          setAcquiredSkills(data.acquired_skills || []);
        } else {
          console.error("Profile API error:", data.error);
        }
      } catch (err) {
        console.error("Error fetching profile stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, [user]);

  // Group skills by their category
  const groupedSkills = acquiredSkills.reduce((acc, skill) => {
      // Defaulting to "Technical" to match the UI, or use the DB category
      const cat = skill.skill_category || 'Technical';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(skill.skill_name);
      return acc;
  }, {});

  return (
    <div style={styles.modalOverlay}>
      <div style={{ 
        backgroundColor: '#f8fafc',
        borderRadius: '24px',
        maxWidth: '800px', 
        width: '95%',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"
      }}>
        
        {/* Close Button */}
        <button 
            onClick={onClose} 
            style={{ position: 'absolute', top: '20px', right: '20px', zIndex: 10, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', width: '36px', height: '36px', borderRadius: '50%', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s' }}
            onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.4)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        >
            ✕
        </button>

        {/* --- 1. HERO BANNER (Night Sky Theme) --- */}
        <div style={{ 
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            padding: '50px 20px 80px 20px',
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Decorative Stars & Mountains */}
            <div style={{ position: 'absolute', top: '20px', left: '15%', color: 'white', opacity: 0.4, fontSize: '12px' }}>✨</div>
            <div style={{ position: 'absolute', top: '40px', right: '20%', color: 'white', opacity: 0.6, fontSize: '18px' }}>☄️</div>
            <div style={{ position: 'absolute', bottom: '-20px', left: 0, right: 0, display: 'flex', justifyContent: 'center', opacity: 0.1, pointerEvents: 'none' }}>
                <svg width="100%" height="100px" viewBox="0 0 800 100" preserveAspectRatio="none">
                    <polygon points="0,100 200,30 400,100" fill="white" />
                    <polygon points="300,100 500,10 800,100" fill="white" />
                </svg>
            </div>

            {/* Avatar (Removed Level Badge) */}
            <div style={{ position: 'relative', width: '90px', height: '90px', margin: '0 auto 15px auto', zIndex: 1 }}>
                <div style={{ 
                    width: '100%', height: '100%', backgroundColor: 'transparent', border: '2px solid white',
                    color: 'white', borderRadius: '50%', fontSize: '40px', fontWeight: '600',
                    display: 'flex', alignItems: 'center', justifyContent: 'center' 
                }}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
            </div>

            <h2 style={{ margin: '0 0 5px 0', color: 'white', fontSize: '28px', fontWeight: '800', position: 'relative', zIndex: 1 }}>{user.name}</h2>
            <p style={{ color: '#e0e7ff', margin: '0 0 15px 0', fontSize: '14px', position: 'relative', zIndex: 1 }}>{user.email}</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', position: 'relative', zIndex: 1 }}>
                <span style={{ backgroundColor: 'white', color: '#4f46e5', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px' }}>
                    {user.role ? user.role.toUpperCase() : 'STUDENT'}
                </span>
                {user.programme && (
                    <span style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.4)', padding: '6px 16px', borderRadius: '20px', fontSize: '11px', fontWeight: '700' }}>
                        {user.programme}
                    </span>
                )}
            </div>
        </div>

        {/* --- 2. FLOATING STAT CARDS (Centered 2-Grid) --- */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', maxWidth: '500px', margin: '-40px auto 0 auto', position: 'relative', zIndex: 2 }}>
            <div style={{ backgroundColor: 'white', padding: '25px 10px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    {/* Premium Pink Brain SVG */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="#f472b6" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4.5C9.5 4.5 7.5 6.5 7.5 9c0 .5.1.9.2 1.3C6.2 10.8 5 12.3 5 14c0 2 1.4 3.7 3.3 4.2.4 1 1.4 1.8 2.7 1.8h2c1.3 0 2.3-.8 2.7-1.8 1.9-.5 3.3-2.2 3.3-4.2 0-1.7-1.2-3.2-2.7-3.7.1-.4.2-.8.2-1.3 0-2.5-2-4.5-4.5-4.5z"/>
                    </svg>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '32px', color: '#0f172a', fontWeight: '800' }}>{loading ? '-' : acquiredSkills.length}</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Skills Acquired</span>
            </div>
            <div style={{ backgroundColor: 'white', padding: '25px 10px', borderRadius: '16px', textAlign: 'center', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', border: '1px solid #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                    {/* Premium Blue/Green Map SVG */}
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" fill="#e0f2fe"/>
                        <line x1="9" y1="3" x2="9" y2="18" stroke="#0284c7" />
                        <line x1="15" y1="6" x2="15" y2="21" stroke="#0284c7" />
                        <path d="M12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z" fill="#10b981" stroke="#10b981"/>
                    </svg>
                </div>
                <h3 style={{ margin: '0 0 5px 0', fontSize: '32px', color: '#0f172a', fontWeight: '800' }}>{loading ? '-' : completedRoadmaps.length}</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Journeys Finished</span>
            </div>
        </div>

        {/* --- 3. MAIN CONTENT AREA --- */}
        <div style={{ padding: '40px 40px 20px 40px' }}>

            {/* COMPLETED ROADMAPS */}
            {completedRoadmaps.length > 0 && (
                <div style={{ marginBottom: '40px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '18px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <span style={{ color: '#f59e0b', fontSize: '20px' }}>🏆</span> Completed Roadmaps
                        </h3>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
                        {completedRoadmaps.map((map) => (
                            <div key={map.roadmap_id} style={{ 
                                padding: '15px 25px', backgroundColor: 'white', 
                                border: '1px solid #f59e0b', borderRadius: '12px', color: '#b45309', fontWeight: '800', fontSize: '14px',
                                display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.1)'
                            }}>
                                🎖️ {map.career.career_name}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* SKILLS ACQUIRED SECTION */}
            <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3 style={{ fontSize: '20px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px', margin: 0, fontWeight: '800' }}>
                        <span style={{ color: '#10b981', fontSize: '22px' }}>🧩</span> Skills Acquired
                    </h3>
                    <span style={{ fontSize: '14px', color: '#4f46e5', fontWeight: '700', cursor: 'pointer' }}>View All</span>
                </div>

                {loading ? <p style={{ color: '#64748b' }}>Loading skills...</p> : (
                    Object.keys(groupedSkills).length > 0 ? (
                        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '25px' }}>
                            {Object.entries(groupedSkills).map(([category, skills]) => (
                                <div key={category} style={{ marginBottom: '15px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontWeight: '800', fontSize: '15px', marginBottom: '15px' }}>
                                        <span style={{ color: '#10b981', fontSize: '18px' }}>🧩</span> {category}
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                                        {skills.map((skillName, idx) => (
                                            <span key={idx} style={{ 
                                                backgroundColor: 'white', 
                                                color: '#334155', 
                                                padding: '10px 16px', 
                                                borderRadius: '8px', 
                                                fontSize: '13px', 
                                                fontWeight: '600',
                                                border: '1px solid #e2e8f0',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.02)'
                                            }}>
                                                {skillName}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div style={{ textAlign: 'center', padding: '40px', backgroundColor: '#f1f5f9', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
                            <p style={{ color: '#64748b', fontWeight: '500', margin: 0 }}>Complete modules in your roadmap to unlock and collect skills here!</p>
                        </div>
                    )
                )}
            </div>

        </div>

        {/* --- 4. FOOTER --- */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px 40px 40px 40px', display: 'flex', gap: '15px', borderBottomLeftRadius: '24px', borderBottomRightRadius: '24px' }}>
          <button onClick={logout} style={{ flex: 1, padding: '16px', backgroundColor: 'white', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Logout
          </button>
          <button onClick={onClose} style={{ flex: 1, padding: '16px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>
            Close Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default UserProfile;