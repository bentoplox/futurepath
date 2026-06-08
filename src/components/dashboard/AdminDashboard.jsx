import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import EmployabilityDashboard from '../dashboard/EmployabilityDashboard';

// Sub-components
import ResourceManager from './admin/ResourceManager';
import QuizManager from './admin/QuizManager';
import InteractiveGenerator from './admin/InteractiveGenerator';
import PathwayList from './admin/PathwayList';
import CurationManager from './admin/CurationManager';

const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview'); 
  const [posts, setPosts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [geData, setGeData] = useState([]); // ⚡ NEW: Real GE Data
  const [stats, setStats] = useState({ students: 0, alumni: 0, pendingPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('matrix'); 
  const [skillHeatmapData, setSkillHeatmapData] = useState([]);

  // UM Color Palette
  const umBlue = '#1e3a8a';
  const umLightBlue = '#2563eb';
  const umGold = '#fbbf24';

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const { count: sCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: aCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
        const { data: pData } = await supabase.from('alumni_posts').select('*, users(name, role)').order('created_at', { ascending: false });
        
        // ⚡ FETCH REAL GE DATA
        const { data: gData } = await supabase.from('faculty_ge_data').select('*').eq('year', 2025);

        const fRes = await fetch('http://127.0.0.1:5000/api/admin/feedback');
        const fData = await fRes.json();
        const hRes = await fetch('http://127.0.0.1:5000/api/admin/heatmap');
        const hData = await hRes.json();

        setStats({ students: sCount || 0, alumni: aCount || 0, pendingPosts: pData?.filter(p => p.status === 'pending').length || 0 });
        setPosts(pData || []);
        setGeData(gData || []);
        if (fData.success) setFeedback(fData.reports || []);
        if (hData.success) setSkillHeatmapData(hData.heatmap || []);
    } catch (err) { console.error("Error:", err); }
    finally { setLoading(false); }
  };

  const updateStatus = async (postId, newStatus) => {
    if (!window.confirm(`Mark as ${newStatus}?`)) return;
    const { error } = await supabase.from('alumni_posts').update({ status: newStatus }).eq('id', postId);
    if (!error) fetchData(); 
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'job': return '#10b981';
      case 'internship': return '#f59e0b';
      case 'mentorship': return '#3b82f6';
      case 'resume_review': return '#8b5cf6';
      default: return '#6b7280';
    }
  };

  const getHeatmapColor = (score) => {
    if (score === 0) return '#f3f4f6';
    if (score < 50) return '#ef4444';
    if (score < 75) return '#f59e0b';
    return '#10b981';
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", margin: '-20px', paddingBottom: '50px' }}>
      {/* 1. HERO BANNER */}
      <div style={{ 
        backgroundColor: umBlue,
        backgroundImage: `linear-gradient(135deg, ${umBlue} 0%, ${umLightBlue} 100%)`,
        color: 'white',
        padding: '20px 40px 100px 40px', 
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: activeTab === 'overview' ? '0px' : '40px'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '350px', height: '350px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto 40px auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Faculty Admin Console</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: 'white', fontWeight: '500' }}>{user.name}</span>
                <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer' }}>Logout</button>
            </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: umGold, color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>
            ADMINISTRATOR — FSKTM UM
          </span>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700' }}>
            {activeTab === 'skills' ? 'Skills Gap' : activeTab === 'employability' ? 'Employability' : activeTab === 'moderation' ? 'Content Moderation' : activeTab === 'content' ? 'Content Engine' : activeTab === 'resources' ? 'Resource Library' : activeTab === 'quizzes' ? 'Assessment Bank' : activeTab === 'curation' ? 'Quality Control' : 'System Overview'}
          </h1>

          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '30px' }}>
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'employability', label: '📈 Employability' },
              { id: 'skills', label: '🎯 Skills Gap' },
              { id: 'curation', label: '🎯 Quality Control' },
              { id: 'resources', label: '📚 Resource Manager' },
              { id: 'quizzes', label: '📝 Quiz Manager' },
              { id: 'moderation', label: `🛡️ Moderation ${stats.pendingPosts > 0 ? `(${stats.pendingPosts})` : ''}` },
              { id: 'content', label: '🗄️ Content Engine' }
            ].map((tab) => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                      padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', border: 'none',
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

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        {activeTab === 'curation' && <CurationManager umBlue={umBlue} umLightBlue={umLightBlue} />}
        {activeTab === 'resources' && <ResourceManager supabase={supabase} umBlue={umBlue} umLightBlue={umLightBlue} umGold={umGold} />}
        {activeTab === 'quizzes' && <QuizManager umBlue={umBlue} umLightBlue={umLightBlue} umGold={umGold} />}
        {activeTab === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <InteractiveGenerator fetchData={fetchData} umBlue={umBlue} umLightBlue={umLightBlue} umGold={umGold} />
                <PathwayList skillHeatmapData={skillHeatmapData} fetchData={fetchData} umGold={umGold} />
            </div>
        )}

        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '-50px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', borderTop: `4px solid ${umBlue}`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: umBlue, marginBottom: '5px' }}>{stats.students}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Active Students</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', borderTop: `4px solid #10b981`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>{stats.alumni}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Alumni Network</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', textAlign: 'center', borderTop: `4px solid #ef4444`, boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ef4444', marginBottom: '5px' }}>{stats.pendingPosts}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Reviews</div>
                </div>
            </div>

            {/* TWO-COLUMN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
               <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#4b5563', marginBottom: '20px', textTransform: 'uppercase' }}>Employability Pulse</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '5px' }}>AVG FACULTY GE SCORE</div>
                      <div style={{ fontSize: '48px', fontWeight: '800', color: '#111827' }}>
                        {geData.length > 0 
                            ? `${(geData.reduce((acc, curr) => acc + (curr.ge_pct || 0), 0) / geData.length).toFixed(1)}%` 
                            : '0.0%'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '5px' }}>COHORT SKILL HEALTH</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>
                        {skillHeatmapData.length > 0 
                            ? `${Math.round(skillHeatmapData.reduce((acc, curr) => acc + (curr.y1 + curr.y2 + curr.y3 + curr.y4)/4, 0) / skillHeatmapData.length)}%` 
                            : '0%'}
                      </div>
                    </div>
                  </div>
               </div>

               <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#4b5563', marginBottom: '20px', textTransform: 'uppercase' }}>AI Learning Insights</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '5px' }}>LATEST ARCHITECTED PATH</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: umBlue }}>
                        {skillHeatmapData.length > 0 ? skillHeatmapData[0].career_name : 'No active paths'}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '5px' }}>TOTAL GENERATED MODULES</div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>{skillHeatmapData.length}</div>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'employability' && <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}><EmployabilityDashboard /></div>}

        {activeTab === 'skills' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                    <h3 style={{ fontSize: '22px', fontWeight: '800' }}>Faculty Skills Matrix</h3>
                    <div style={{ background: '#f3f4f6', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
                        <button onClick={() => setViewMode('matrix')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'matrix' ? 'white' : 'transparent', color: umBlue, cursor: 'pointer', fontWeight: 'bold' }}>Matrix</button>
                        <button onClick={() => setViewMode('feedback')} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: viewMode === 'feedback' ? 'white' : 'transparent', color: umBlue, cursor: 'pointer', fontWeight: 'bold' }}>Feedback</button>
                    </div>
                </div>

                {viewMode === 'matrix' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {[...new Set(skillHeatmapData.map(s => s.career_name))].map(cName => (
                            <div key={cName} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                <div style={{ background: umBlue, color: 'white', padding: '12px 20px', fontWeight: 'bold', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📂 {cName}</div>
                                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1px', background: '#e5e7eb' }}>
                                    <div style={{ background: '#f9fafb', padding: '10px', fontWeight: 'bold', fontSize: '12px', color: '#4b5563' }}>TECHNICAL SKILL</div>
                                    {['Y1', 'Y2', 'Y3', 'Y4'].map(y => <div key={y} style={{ background: '#f9fafb', padding: '10px', textAlign: 'center', fontWeight: 'bold', fontSize: '12px', color: '#4b5563' }}>{y}</div>)}
                                    {skillHeatmapData.filter(s => s.career_name === cName).map((row, i) => (
                                        <React.Fragment key={i}>
                                            <div style={{ background: 'white', padding: '15px', fontWeight: '600', fontSize: '14px' }}>{row.skill}</div>
                                            {[row.y1, row.y2, row.y3, row.y4].map((val, idx) => (
                                                <div key={idx} style={{ background: getHeatmapColor(val), color: val === 0 ? '#6b7280' : 'white', padding: '15px', textAlign: 'center', fontWeight: 'bold' }}>{val === 0 ? '-' : `${val}%`}</div>
                                            ))}
                                        </React.Fragment>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {feedback.map((f, i) => (
                            <div key={i} style={{ padding: '15px', borderRadius: '8px', background: '#f8fafc', borderLeft: `5px solid ${umBlue}` }}>
                                <strong>{f.skill_name}</strong>
                                <p style={{ margin: '5px 0 0 0', fontStyle: 'italic' }}>"{f.reason}"</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        )}

        {activeTab === 'moderation' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '900px', margin: '0 auto' }}>
                {posts.filter(p => p.status === 'pending').map(post => (
                    <div key={post.id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', borderLeft: `6px solid ${getTypeColor(post.post_type)}`, boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div>
                                <span style={{ background: getTypeColor(post.post_type), color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>{post.post_type.replace('_', ' ')}</span>
                                <h3 style={{ margin: '12px 0 5px 0', fontSize: '22px', fontWeight: '700' }}>{post.title}</h3>
                                <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>👤 {post.users?.name || 'Anonymous Student'}</div>
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={() => updateStatus(post.id, 'approved')} style={{ padding: '10px 20px', background: '#dcfce7', color: '#166534', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>✅ Approve</button>
                                <button onClick={() => updateStatus(post.id, 'rejected')} style={{ padding: '10px 20px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>❌ Reject</button>
                            </div>
                        </div>
                        {post.company_name && <div style={{ background: '#f8fafc', padding: '6px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: '700', color: umBlue, display: 'inline-block', marginBottom: '15px' }}>🏢 {post.company_name}</div>}
                        <div style={{ color: '#374151', lineHeight: '1.6', background: '#f9fafb', padding: '20px', borderRadius: '10px' }}>{post.content}</div>
                    </div>
                ))}
                {posts.filter(p => p.status === 'pending').length === 0 && (
                    <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'white', borderRadius: '20px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <span style={{ fontSize: '50px' }}>✅</span>
                        <h3 style={{ marginTop: '20px', color: '#111827', fontWeight: '800' }}>Inbox Zero!</h3>
                        <p style={{ color: '#6b7280' }}>All alumni contributions have been moderated.</p>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
