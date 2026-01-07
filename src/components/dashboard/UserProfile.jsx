// ============================================================================
// FILE: src/components/dashboard/UserProfile.jsx
// PURPOSE: Displays User Info, Acquired Skills, and Completed Roadmaps
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

      try {
        // 1. Fetch Completed Roadmaps
        const { data: roadmapData, error: roadmapError } = await supabase
          .from('roadmap')
          .select(`
            roadmap_id, 
            status, 
            career:career_id ( career_name )
          `)
          .eq('user_id', user.user_id)
          .eq('status', 'completed');

        if (roadmapError) throw roadmapError;
        setCompletedRoadmaps(roadmapData || []);

        // 2. Fetch Acquired Skills
        // We go: progress_record -> roadmap_step -> skill
        const { data: skillData, error: skillError } = await supabase
          .from('progress_record')
          .select(`
            roadmap_step!inner (
              skill!inner (
                skill_name,
                skill_category
              )
            )
          `)
          .eq('user_id', user.user_id)
          .eq('completion_status', 'completed');

        if (skillError) throw skillError;

        // Flatten the deep nested structure to a simple array of skill names
        const skills = skillData.map(item => item.roadmap_step.skill);
        setAcquiredSkills(skills || []);

      } catch (err) {
        console.error("Error fetching profile stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileStats();
  }, [user]);

  return (
    <div style={styles.modalOverlay}>
      <div style={{ 
        ...styles.modalContent, 
        maxWidth: '600px', 
        width: '90%',
        maxHeight: '90vh',
        overflowY: 'auto' // Allow scrolling if list is long
      }}>
        
        {/* --- HEADER SECTION --- */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '80px', height: '80px', backgroundColor: '#6366f1', 
            color: 'white', borderRadius: '50%', fontSize: '32px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px' 
          }}>
            {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h2 style={{margin: '0 0 5px 0'}}>{user.name}</h2>
          <p style={{ color: '#6b7280', margin: 0 }}>{user.email}</p>
          
          <div style={{marginTop: '10px'}}>
            <span style={{ 
              backgroundColor: '#e0e7ff', color: '#4338ca', 
              padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: '600'
            }}>
              {user.role ? user.role.toUpperCase() : 'STUDENT'}
            </span>
            {user.programme && (
                <span style={{ 
                backgroundColor: '#f3f4f6', color: '#374151', 
                padding: '4px 12px', borderRadius: '12px', fontSize: '12px', marginLeft: '8px'
                }}>
                {user.programme}
                </span>
            )}
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '20px 0' }} />

        {/* --- STATS SUMMARY --- */}
        <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px', textAlign: 'center' }}>
            <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#10b981' }}>{acquiredSkills.length}</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Skills Acquired</span>
            </div>
            <div>
                <h3 style={{ margin: 0, fontSize: '24px', color: '#4f46e5' }}>{completedRoadmaps.length}</h3>
                <span style={{ fontSize: '12px', color: '#6b7280' }}>Journeys Completed</span>
            </div>
        </div>

        {/* --- SECTION 1: COMPLETED ROADMAPS --- */}
        <div style={{ marginBottom: '25px' }}>
            <h4 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '15px' }}>
                🏆 Completed Roadmaps
            </h4>
            {loading ? <p>Loading...</p> : (
                completedRoadmaps.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {completedRoadmaps.map((map) => (
                            <div key={map.roadmap_id} style={{ 
                                padding: '10px 15px', backgroundColor: '#f0fdf4', 
                                border: '1px solid #10b981', borderRadius: '8px', color: '#065f46', fontWeight: 'bold', fontSize: '14px'
                            }}>
                                🎖️ {map.career.career_name}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>No roadmaps completed yet. Keep going!</p>
                )
            )}
        </div>

        {/* --- SECTION 2: SKILLS ACQUIRED --- */}
        <div style={{ marginBottom: '25px' }}>
            <h4 style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '8px', marginBottom: '15px' }}>
                🧠 Skills Acquired
            </h4>
            {loading ? <p>Loading...</p> : (
                acquiredSkills.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {acquiredSkills.map((skill, index) => (
                            <span key={index} style={{ 
                                padding: '6px 12px', backgroundColor: '#eef2ff', 
                                color: '#4338ca', borderRadius: '20px', fontSize: '13px', border: '1px solid #c7d2fe'
                            }}>
                                ✅ {skill.skill_name}
                            </span>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '14px' }}>Complete steps in your roadmap to earn skills.</p>
                )
            )}
        </div>

        {/* --- FOOTER BUTTONS --- */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
          <button onClick={logout} style={{ ...styles.button, backgroundColor: '#dc2626', width: '100%' }}>
            Logout
          </button>
          <button onClick={onClose} style={{ ...styles.button, backgroundColor: '#9ca3af', width: '100%' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;