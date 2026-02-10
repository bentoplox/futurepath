// ============================================================================
// FILE: src/components/dashboard/AdminDashboard.jsx
// PURPOSE: Admin Command Center (Analytics + Moderation)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); // overview, employability, skills, moderation
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({ students: 0, alumni: 0, pendingPosts: 0 });
  const [loading, setLoading] = useState(true);

  // --- MOCK DATA FOR CHARTS (Since we don't have thousands of real records yet) ---
  const employmentData = [
    { name: 'Employed (Field)', value: 65 },
    { name: 'Employed (Non-Field)', value: 15 },
    { name: 'Further Study', value: 10 },
    { name: 'Unemployed', value: 10 },
  ];
  const COLORS = ['#10b981', '#f59e0b', '#3b82f6', '#ef4444']; // Green, Yellow, Blue, Red

  const topEmployersData = [
    { name: 'Shopee', count: 45 },
    { name: 'Grab', count: 38 },
    { name: 'Maybank', count: 30 },
    { name: 'Petronas', count: 25 },
    { name: 'Intel', count: 20 },
  ];

  const skillHeatmapData = [
    { skill: 'Python', y1: 85, y2: 90, y3: 92, y4: 95 },
    { skill: 'Cloud (AWS)', y1: 20, y2: 35, y3: 50, y4: 60 }, // Low scores!
    { skill: 'Data Analytics', y1: 40, y2: 55, y3: 70, y4: 80 },
    { skill: 'Cybersecurity', y1: 15, y2: 25, y3: 30, y4: 45 }, // Critical gap
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // 1. Get User Stats
    const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
    const { count: alumniCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
    
    // 2. Get Posts for Moderation
    const { data: postData } = await supabase
      .from('alumni_posts')
      .select('*, users(name, role)')
      .order('created_at', { ascending: false });

    // 3. Count Pending
    const pendingCount = postData ? postData.filter(p => p.status === 'pending').length : 0;

    setStats({ students: studentCount || 0, alumni: alumniCount || 0, pendingPosts: pendingCount });
    setPosts(postData || []);
    setLoading(false);
  };

  const updateStatus = async (postId, newStatus) => {
    if (!window.confirm(`Mark post as ${newStatus}?`)) return;
    const { error } = await supabase.from('alumni_posts').update({ status: newStatus }).eq('id', postId);
    if (!error) fetchData(); // Refresh
  };

  // Helper for Heatmap Colors
  const getHeatmapColor = (score) => {
    if (score < 40) return '#ef4444'; // Red (Critical Gap)
    if (score < 70) return '#f59e0b'; // Yellow (Moderate)
    return '#10b981'; // Green (Good)
  };

  return (
    <div style={styles.appContainer}>
      
      {/* HEADER */}
      <div style={styles.adminHeader}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <span style={{ fontSize: '24px' }}>🛡️</span>
           <h1 style={{ margin: 0, fontSize: '18px' }}>Faculty Admin Console</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontWeight: '500' }}>{user.name}</span>
            <button onClick={onLogout} style={{ ...styles.logoutButton, background: 'rgba(255,255,255,0.2)', color:'white', border:'1px solid rgba(255,255,255,0.5)' }}>Logout</button>
        </div>
      </div>

      <div style={styles.dashboardContainer}>
        
        {/* STATS ROW */}
        <div style={styles.statsGrid}>
            <div style={styles.statCard}>
                <div style={{...styles.statNumber, color: '#3b82f6'}}>{stats.students}</div>
                <div style={styles.statLabel}>Active Students</div>
            </div>
            <div style={styles.statCard}>
                <div style={{...styles.statNumber, color: '#10b981'}}>{stats.alumni}</div>
                <div style={styles.statLabel}>Alumni Network</div>
            </div>
            <div style={styles.statCard}>
                <div style={{...styles.statNumber, color: stats.pendingPosts > 0 ? '#ef4444' : '#6b7280'}}>
                    {stats.pendingPosts}
                </div>
                <div style={styles.statLabel}>Pending Reviews</div>
            </div>
        </div>

        {/* TAB NAVIGATION */}
        <div style={styles.tabContainer}>
            {['overview', 'employability', 'skills', 'moderation'].map((tab) => (
                <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                        ...styles.tabButton,
                        ...(activeTab === tab ? { color: '#dc2626', borderBottom: '3px solid #dc2626' } : {})
                    }}
                >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
            ))}
        </div>

        {/* === TAB 1: OVERVIEW / FEEDBACK === */}
        {activeTab === 'overview' && (
            <div style={styles.chartContainer}>
                <h3 style={styles.chartTitle}>Student Feedback & Reported Missing Skills</h3>
                <div style={{padding: '20px', textAlign: 'center', color: '#6b7280'}}>
                    <p>No new student feedback submitted this week.</p>
                    {/* Placeholder for Data Collection Section */}
                </div>
            </div>
        )}

        {/* === TAB 2: EMPLOYABILITY DASHBOARD === */}
        {activeTab === 'employability' && (
            <div style={styles.chartsGrid}>
                {/* Chart 1: Employment Status */}
                <div style={styles.chartContainer}>
                    <h3 style={styles.chartTitle}>Graduate Employment Status (2024 Cohort)</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={employmentData} cx="50%" cy="50%" outerRadius={100} fill="#8884d8" dataKey="value" label>
                                {employmentData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Chart 2: Top Employers */}
                <div style={styles.chartContainer}>
                    <h3 style={styles.chartTitle}>Top Recruiting Partners</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={topEmployersData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis dataKey="name" type="category" width={100} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" name="Graduates Hired" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        )}

        {/* === TAB 3: SKILLS GAP ANALYZER === */}
        {activeTab === 'skills' && (
            <div>
                <div style={styles.chartContainer}>
                    <h3 style={styles.chartTitle}>Cohort Skills Gap Heatmap</h3>
                    <p style={{marginBottom: '20px', color: '#6b7280'}}>
                        Scores represent average competency based on quizzes. 
                        <span style={{color: '#ef4444', fontWeight: 'bold', marginLeft: '10px'}}>Red = Critical Gap</span>
                    </p>
                    
                    {/* CUSTOM HEATMAP GRID */}
                    <div style={styles.heatmapGrid}>
                        {/* Header Row */}
                        <div style={styles.heatmapHeader}>Technical Skill</div>
                        <div style={styles.heatmapHeader}>Year 1</div>
                        <div style={styles.heatmapHeader}>Year 2</div>
                        <div style={styles.heatmapHeader}>Year 3</div>
                        <div style={styles.heatmapHeader}>Year 4</div>

                        {/* Data Rows */}
                        {skillHeatmapData.map((row, index) => (
                            <React.Fragment key={index}>
                                <div style={{padding: '12px', borderBottom: '1px solid #eee', fontWeight: '600'}}>{row.skill}</div>
                                <div style={{...styles.heatmapCell, backgroundColor: getHeatmapColor(row.y1)}}>{row.y1}%</div>
                                <div style={{...styles.heatmapCell, backgroundColor: getHeatmapColor(row.y2)}}>{row.y2}%</div>
                                <div style={{...styles.heatmapCell, backgroundColor: getHeatmapColor(row.y3)}}>{row.y3}%</div>
                                <div style={{...styles.heatmapCell, backgroundColor: getHeatmapColor(row.y4)}}>{row.y4}%</div>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Recommendations */}
                <div style={{marginTop: '30px', display: 'grid', gap: '20px', gridTemplateColumns: '1fr 1fr'}}>
                    <div style={{...styles.chartContainer, borderLeft: '5px solid #ef4444'}}>
                        <h4 style={{fontSize: '16px', fontWeight: '700', color: '#ef4444'}}>🚨 Critical Gap Detected</h4>
                        <p style={{marginTop: '10px'}}><strong>Cybersecurity</strong> proficiency is below 30% for Year 1-3 students.</p>
                        <button style={{marginTop: '15px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                            Schedule "Cybersec 101" Workshop
                        </button>
                    </div>
                    <div style={{...styles.chartContainer, borderLeft: '5px solid #f59e0b'}}>
                         <h4 style={{fontSize: '16px', fontWeight: '700', color: '#f59e0b'}}>⚠️ Moderate Gap Detected</h4>
                        <p style={{marginTop: '10px'}}><strong>Cloud Computing (AWS)</strong> is lagging in Year 2 cohorts.</p>
                        <button style={{marginTop: '15px', padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer'}}>
                            Contact AWS Academy Partner
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* === TAB 4: MODERATION === */}
        {activeTab === 'moderation' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{fontSize: '20px', marginBottom: '20px'}}>Pending Posts Review</h2>
                {posts.filter(p => p.status === 'pending').length === 0 ? (
                    <div style={{...styles.statCard, padding: '50px', color: '#10b981'}}>
                        <h3>All Caught Up!</h3>
                        <p>No pending posts to review.</p>
                    </div>
                ) : (
                    posts.filter(p => p.status === 'pending').map((post) => (
                        <div key={post.id} style={styles.postCard}>
                             <div style={{display: 'flex', justifyContent: 'space-between'}}>
                                <span style={{fontWeight: 'bold', color: '#374151'}}>{post.title}</span>
                                <span style={{fontSize: '12px', color: '#6b7280'}}>{post.post_type}</span>
                            </div>
                            <p style={{fontSize: '14px', color: '#6b7280', margin: '10px 0'}}>By: {post.users?.name}</p>
                            <p style={{background: '#f9fafb', padding: '10px', fontSize: '14px'}}>{post.content}</p>
                            <div style={{display: 'flex', gap: '10px', marginTop: '15px'}}>
                                <button onClick={() => updateStatus(post.id, 'approved')} style={styles.approveButton}>Approve</button>
                                <button onClick={() => updateStatus(post.id, 'rejected')} style={styles.rejectButton}>Reject</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;