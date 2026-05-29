// ============================================================================
// FILE: src/components/dashboard/AdminDashboard.jsx
// PURPOSE: Admin Command Center (Analytics, Moderation, Content Sync)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import EmployabilityDashboard from '../dashboard/EmployabilityDashboard'; // Adjust path if needed!

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [posts, setPosts] = useState([]);
  const [feedback, setFeedback] = useState([]); // ⚡ NEW: Feedback state
  const [stats, setStats] = useState({ students: 0, alumni: 0, pendingPosts: 0 });
  const [loading, setLoading] = useState(true);

  // ⚡ NEW: States for Content Sync (FR5)
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // --- MOCK DATA FOR SKILLS HEATMAP ---
  const skillHeatmapData = [
    { skill: 'Python', y1: 85, y2: 90, y3: 92, y4: 95 },
    { skill: 'Cloud (AWS)', y1: 20, y2: 35, y3: 50, y4: 60 }, 
    { skill: 'Data Analytics', y1: 40, y2: 55, y3: 70, y4: 80 },
    { skill: 'Cybersecurity', y1: 15, y2: 25, y3: 30, y4: 45 }, 
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Fetch User Stats
        const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: alumniCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
        
        // 2. Fetch Pending Posts
        const { data: postData } = await supabase
          .from('alumni_posts')
          .select('*, users(name, role)')
          .order('created_at', { ascending: false });

        const pendingCount = postData ? postData.filter(p => p.status === 'pending').length : 0;

        // 3. Fetch ANONYMIZED Feedback (FR6.3)
        const feedbackRes = await fetch('http://127.0.0.1:5000/api/admin/feedback');
        const feedbackData = await feedbackRes.json();

        setStats({ students: studentCount || 0, alumni: alumniCount || 0, pendingPosts: pendingCount });
        setPosts(postData || []);
        if (feedbackData.success) setFeedback(feedbackData.reports || []);

    } catch (err) {
        console.error("Error fetching admin data:", err);
    } finally {
        setLoading(false);
    }
  };

  const updateStatus = async (postId, newStatus) => {
    if (!window.confirm(`Mark post as ${newStatus}?`)) return;
    const { error } = await supabase.from('alumni_posts').update({ status: newStatus }).eq('id', postId);
    if (!error) fetchData(); 
  };

  // ⚡ NEW: THE INTERNAL API SYNC TRIGGER (FR5.1)
  const handleContentSync = async () => {
      if (!window.confirm("This will trigger the background AI worker to populate the database. Proceed?")) return;
      
      setSyncing(true);
      setSyncMessage(null);
      
      try {
          const response = await fetch('http://127.0.0.1:5000/api/admin/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          
          if (data.success) {
              setSyncMessage({ type: 'success', text: "✅ Background generation started! Check your python terminal." });
          } else {
              setSyncMessage({ type: 'error', text: `❌ Sync Failed: ${data.error}` });
          }
      } catch (err) {
          setSyncMessage({ type: 'error', text: "❌ Connection to backend failed. Is Flask running?" });
      } finally {
          setSyncing(false);
      }
  };

  const getHeatmapColor = (score) => {
    if (score < 40) return '#ef4444'; 
    if (score < 70) return '#f59e0b'; 
    return '#10b981'; 
  };

  // UM Color Palette
  const umBlue = '#1e3a8a'; // Deep Royal Blue
  const umLightBlue = '#2563eb';
  const umGold = '#fbbf24'; // University Gold

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", margin: '-20px', paddingBottom: '50px' }}>
      
      {/* 1. PREMIUM UM BLUE HERO BANNER */}
      <div style={{ 
        backgroundColor: umBlue,
        backgroundImage: `linear-gradient(135deg, ${umBlue} 0%, ${umLightBlue} 100%)`,
        color: 'white',
        padding: '20px 40px 100px 40px', // Extra bottom padding for floating cards
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative Circle Background */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '350px', height: '350px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        {/* Top Nav Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto 40px auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>Faculty Admin Console</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: 'white', fontWeight: '500' }}>{user.name}</span>
                <button 
                    onClick={onLogout} 
                    style={{ background: 'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                    Logout
                </button>
            </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: umGold, color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            ADMINISTRATOR — FSKTM UM
          </span>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
            System <span style={{ color: umGold }}>Overview</span>
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
            Monitor graduate employability, analyze cohort skill gaps, and moderate community discussions.
          </p>

          {/* IN-BANNER TABS */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'employability', label: '📈 Employability' },
              { id: 'skills', label: '🎯 Skills Gap' },
              { id: 'moderation', label: `🛡️ Moderation ${stats.pendingPosts > 0 ? `(${stats.pendingPosts})` : ''}` },
              { id: 'content', label: '🗄️ Content Engine' } // ⚡ NEW TAB
            ].map((tab) => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                      padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                      backgroundColor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.15)', 
                      color: activeTab === tab.id ? umBlue : 'white',
                      boxShadow: activeTab === tab.id ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                  }}
              >
                  {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. FLOATING STATS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', maxWidth: '1200px', margin: '-50px auto 40px auto', padding: '0 20px', position: 'relative', zIndex: 10 }}>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: `4px solid ${umBlue}` }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: umBlue, marginBottom: '5px' }}>{stats.students}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Students</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: `4px solid #10b981` }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>{stats.alumni}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Alumni Network</div>
          </div>
          <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: `4px solid ${stats.pendingPosts > 0 ? '#ef4444' : '#6b7280'}` }}>
              <div style={{ fontSize: '36px', fontWeight: 'bold', color: stats.pendingPosts > 0 ? '#ef4444' : '#6b7280', marginBottom: '5px' }}>
                  {stats.pendingPosts}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Reviews</div>
          </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* === TAB 1: OVERVIEW / FEEDBACK (FR6.3 ANONYMIZED) === */}
        {activeTab === 'overview' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <h3 style={{ fontSize: '20px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>
                    Student Feedback & Reported Missing Skills
                </h3>
                
                {feedback.length === 0 ? (
                    <div style={{padding: '40px 20px', textAlign: 'center', color: '#6b7280'}}>
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📬</span>
                        <p style={{ fontSize: '16px' }}>No new student feedback submitted yet.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
                            Showing <strong>{feedback.length}</strong> anonymized reports from students. 
                            Use this data to identify gaps in the current curriculum.
                        </p>
                        
                        {feedback.map((report, idx) => (
                            <div key={idx} style={{ 
                                padding: '20px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                borderLeft: `5px solid ${report.category === 'Technical' ? '#4f46e5' : '#10b981'}`
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                    <div>
                                        <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', marginRight: '10px' }}>
                                            {report.category}
                                        </span>
                                        <strong style={{ fontSize: '18px', color: '#1e293b' }}>{report.skill_name}</strong>
                                    </div>
                                    <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                        {new Date(report.created_at).toLocaleDateString()}
                                    </span>

                                </div>
                                <p style={{ margin: 0, color: '#475569', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                    "{report.reason}"
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {/* === TAB 2: EMPLOYABILITY DASHBOARD === */}
        {activeTab === 'employability' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <EmployabilityDashboard />
            </div>
        )}

        {/* === TAB 3: SKILLS GAP ANALYZER === */}
        {activeTab === 'skills' && (
            <div>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ fontSize: '20px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', marginBottom: '10px' }}>Cohort Skills Gap Heatmap</h3>
                    <p style={{marginBottom: '25px', color: '#6b7280', fontSize: '14px'}}>
                        Scores represent average competency based on AI Roadmaps. 
                        <span style={{color: '#ef4444', fontWeight: 'bold', marginLeft: '10px', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px'}}>Red = Critical Gap</span>
                    </p>
                    
                    {/* HEATMAP GRID */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '2px', backgroundColor: '#e5e7eb', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase' }}>Technical Skill</div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 1</div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 2</div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 3</div>
                        <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 4</div>

                        {skillHeatmapData.map((row, index) => (
                            <React.Fragment key={index}>
                                <div style={{ backgroundColor: 'white', padding: '15px 12px', fontWeight: '600', color: '#374151' }}>{row.skill}</div>
                                <div style={{ backgroundColor: getHeatmapColor(row.y1), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y1}%</div>
                                <div style={{ backgroundColor: getHeatmapColor(row.y2), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y2}%</div>
                                <div style={{ backgroundColor: getHeatmapColor(row.y3), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y3}%</div>
                                <div style={{ backgroundColor: getHeatmapColor(row.y4), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y4}%</div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div style={{marginTop: '30px', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'}}>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #ef4444' }}>
                        <h4 style={{fontSize: '16px', fontWeight: '700', color: '#ef4444', margin: '0 0 10px 0'}}>🚨 Critical Gap Detected</h4>
                        <p style={{color: '#4b5563', fontSize: '15px', lineHeight: '1.5'}}><strong>Cybersecurity</strong> proficiency is below 30% for Year 1-3 students. This falls below the industry benchmark.</p>
                        <button style={{marginTop: '15px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'}}>
                            Schedule "Cybersec 101" Workshop
                        </button>
                    </div>
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b' }}>
                         <h4 style={{fontSize: '16px', fontWeight: '700', color: '#f59e0b', margin: '0 0 10px 0'}}>⚠️ Moderate Gap Detected</h4>
                        <p style={{color: '#4b5563', fontSize: '15px', lineHeight: '1.5'}}><strong>Cloud Computing (AWS)</strong> is lagging in Year 2 cohorts. Early intervention recommended.</p>
                        <button style={{marginTop: '15px', padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'}}>
                            Contact AWS Academy Partner
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* === TAB 4: MODERATION === */}
        {activeTab === 'moderation' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '24px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', marginBottom: '20px' }}>Pending Content Review</h2>
                
                {posts.filter(p => p.status === 'pending').length === 0 ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid #10b981' }}>
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>✅</span>
                        <h3 style={{ fontSize: '20px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', margin: '0 0 10px 0' }}>All Caught Up!</h3>
                        <p style={{color: '#6b7280'}}>No pending posts to review at this time.</p>
                    </div>
                ) : (
                    posts.filter(p => p.status === 'pending').map((post) => (
                        <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b', marginBottom: '20px' }}>
                            
                            {/* Header */}
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div>
                                    <span style={{fontSize: '12px', fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '12px'}}>
                                        Requires Approval
                                    </span>
                                    <h3 style={{fontSize: '22px', color: '#111827', margin: '10px 0 5px 0', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"}}>{post.title}</h3>
                                </div>
                                <span style={{fontSize: '12px', background: '#e5e7eb', padding: '6px 12px', borderRadius: '12px', color: '#374151', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                    {post.post_type.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Author Info */}
                            <p style={{fontSize: '14px', color: '#6b7280', margin: '5px 0 15px 0'}}>
                                Posted by: <strong style={{color: '#374151'}}>{post.users?.name}</strong> 
                                {post.company_name && ` • Company: ${post.company_name}`}
                            </p>
                            
                            {/* Main Content */}
                            <div style={{background: '#f9fafb', padding: '20px', fontSize: '15px', color: '#374151', borderRadius: '8px', whiteSpace: 'pre-line', lineHeight: '1.6', border: '1px solid #e5e7eb'}}>
                                {post.content}
                            </div>

                            {/* Attachments (Image & Link) */}
                            <div style={{marginTop: '20px'}}>
                                {post.image_url && (
                                    <div style={{marginBottom: '15px'}}>
                                        <p style={{fontSize: '12px', color: '#6b7280', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase'}}>Attached Image:</p>
                                        <img src={post.image_url} alt="Attached poster" style={{maxHeight: '250px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                                    </div>
                                )}

                                {post.application_link && (
                                    <p style={{fontSize: '14px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', color: '#1d4ed8'}}>
                                        <strong>External Link:</strong> <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', textDecoration: 'none', fontWeight: '500'}}>{post.application_link}</a>
                                    </p>
                                )}
                            </div>

                            {/* Admin Action Buttons */}
                            <div style={{display: 'flex', gap: '15px', marginTop: '25px', borderTop: '1px solid #e5e7eb', paddingTop: '20px'}}>
                                <button 
                                    onClick={() => updateStatus(post.id, 'approved')} 
                                    style={{padding: '12px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '15px', transition: 'background 0.2s'}}
                                >
                                    ✅ Approve Post
                                </button>
                                <button 
                                    onClick={() => updateStatus(post.id, 'rejected')} 
                                    style={{padding: '12px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '15px', transition: 'background 0.2s'}}
                                >
                                    ❌ Reject Post
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* === ⚡ NEW TAB 5: CONTENT ENGINE === */}
        {activeTab === 'content' && (
            <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `4px solid ${umBlue}` }}>
                <h3 style={{ fontSize: '24px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', marginBottom: '10px' }}>AI Database Builder</h3>
                <p style={{ color: '#6b7280', fontSize: '15px', marginBottom: '30px', lineHeight: '1.6' }}>
                    This tool automatically populates the platform with learning content. By clicking the button below, a background worker will use AI to generate complete career roadmaps, including required skills, learning resources, and capstone quizzes. This process runs safely in the background so you can continue using the dashboard.
                </p>
                
                <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '30px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px' }}>🧠</span>
                        <span style={{ fontWeight: '600', color: '#334155', minWidth: '120px' }}>AI Model:</span>
                        <span style={{ color: '#0f172a', fontSize: '14px', fontWeight: '500' }}>Meta Llama 3 (Powered by Groq)</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                        <span style={{ fontSize: '20px' }}>⚙️</span>
                        <span style={{ fontWeight: '600', color: '#334155', minWidth: '120px' }}>Background File:</span>
                        <code style={{ backgroundColor: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', color: '#0f172a' }}>background_generator.py</code>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '20px' }}>🗄️</span>
                        <span style={{ fontWeight: '600', color: '#334155', minWidth: '120px' }}>Target Tables:</span>
                        <span style={{ color: '#0f172a', fontSize: '14px' }}>career, skill, roadmap_step, learning_resource, quiz</span>
                    </div>
                </div>

                <button 
                    onClick={handleContentSync}
                    disabled={syncing}
                    style={{ 
                        width: '100%', padding: '16px', background: umBlue, color: 'white', 
                        border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', 
                        cursor: syncing ? 'not-allowed' : 'pointer', opacity: syncing ? 0.7 : 1,
                        boxShadow: '0 4px 6px rgba(30, 58, 138, 0.2)', transition: 'background 0.2s'
                    }}
                >
                    {syncing ? '⏳ Generating Database Content...' : '🚀 Start AI Data Generation'}
                </button>

                {syncMessage && (
                    <div style={{ 
                        marginTop: '20px', padding: '15px', borderRadius: '8px', 
                        backgroundColor: syncMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
                        color: syncMessage.type === 'success' ? '#166534' : '#991b1b',
                        border: `1px solid ${syncMessage.type === 'success' ? '#bbf7d0' : '#fecaca'}`,
                        fontWeight: '500', textAlign: 'center'
                    }}>
                        {syncMessage.text}
                    </div>
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;