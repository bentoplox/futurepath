import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import EmployabilityDashboard from '../dashboard/EmployabilityDashboard';

// Sub-components
import ResourceManager from './admin/ResourceManager';
import QuizManager from './admin/QuizManager';
import InteractiveGenerator from './admin/InteractiveGenerator';
import PathwayList from './admin/PathwayList';
import AdminQualityControl from './admin/AdminQualityControl';
import AIFacultyAdvisor from './admin/AIFacultyAdvisor';

const AdminDashboard = ({ user, onLogout }) => {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState('analytics'); // analytics, curriculum, quality, moderation
  const [activeSubTab, setActiveSubTab] = useState('overview'); 
  
  const [posts, setPosts] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [geData, setGeData] = useState([]);
  const [summaryStats, setSummaryStats] = useState({
    total_students: 0,
    verified_alumni: 0,
    pending_moderation: 0,
    unread_alumni_insights: 0,
    unread_student_reports: 0
  });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('matrix'); 
  const [skillHeatmapData, setSkillHeatmapData] = useState([]);
  const [aiRecommendations, setAiRecommendations] = useState([]);

  // --- PREMIUM COLOR THEME TOKENS ---
  const brandPurple = '#4c2882';
  const umBlue = '#1e3a8a';
  const umLightBlue = '#2563eb';
  const umGold = '#fbbf24';
  const fontStack = "'Aeonik', 'Plus Jakarta Sans', sans-serif";

  // New Darker Status Tokens
  const theme = {
    success: { bg: '#ecfdf5', text: '#065f46', hover: '#047857' },
    danger: { bg: '#fef2f2', text: '#991b1b', hover: '#7f1d1d' },
    warning: { bg: '#fff7ed', text: '#9a3412', hover: '#c2410c' }
  };

  useEffect(() => { fetchData(); }, []);

  // Reset sub-tab when main tab changes
  useEffect(() => {
    if (activeTab === 'analytics') setActiveSubTab('overview');
    if (activeTab === 'curriculum') setActiveSubTab('quizzes');
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
        const { count: sCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: aCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
        
        // ⚡ RESTORED: Direct Supabase query for pending moderation queue
        const { data: pData, error: pError } = await supabase
            .from('alumni_posts')
            .select('*, users!fk_alumni_posts_author(name, role, show_workplace, current_role)')
            .eq('status', 'pending')
            .in('post_type', ['job', 'internship'])
            .order('created_at', { ascending: false });

        if (pError) console.error("Moderation fetch error:", pError);
        else setPosts(pData || []);

        const { data: gData } = await supabase.from('faculty_ge_data').select('*').eq('year', 2025);

        const fRes = await fetch('http://127.0.0.1:5000/api/admin/feedback');
        const fData = await fRes.json();
        const hRes = await fetch('http://127.0.0.1:5000/api/admin/heatmap');
        const hData = await hRes.json();

        // Summary Stats via API (Transactional logic is better on Flask)
        const sRes = await fetch('http://127.0.0.1:5000/api/admin/summary-stats');
        const sData = await sRes.json();

        if (sData.success) setSummaryStats(sData.stats);
        
        setGeData(gData || []);
        if (fData.success) setFeedback(fData.reports || []);
        if (hData.success) setSkillHeatmapData(hData.heatmap || []);
    } catch (err) { console.error("Error:", err); }
    finally { setLoading(false); }
  };

  const markFeedbackAsReviewed = async () => {
      try {
          await fetch('http://127.0.0.1:5000/api/admin/mark-feedback-reviewed', { method: 'POST' });
          const sRes = await fetch('http://127.0.0.1:5000/api/admin/summary-stats');
          const sData = await sRes.json();
          if (sData.success) setSummaryStats(sData.stats);
      } catch (err) { console.error("Error marking feedback as reviewed:", err); }
  };

  const updateStatus = async (postId, newStatus) => {
    if (!window.confirm(`Mark as ${newStatus}?`)) return;
    try {
        // Use Flask API for status update to ensure split logic consistency
        const res = await fetch('http://127.0.0.1:5000/api/admin/moderate-post', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ post_id: postId, status: newStatus })
        });
        const data = await res.json();
        if (data.success) {
            fetchData(); 
        } else {
            alert("Error: " + data.error);
        }
    } catch (err) {
        console.error("Moderation Error:", err);
    }
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
    if (score < 50) return theme.danger.bg;
    if (score < 75) return theme.warning.bg;
    return theme.success.bg;
  };

  const getHeatmapTextColor = (score) => {
    if (score === 0) return '#94a3b8';
    if (score < 50) return theme.danger.text;
    if (score < 75) return theme.warning.text;
    return theme.success.text;
  };

  const renderSubNav = (options) => (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginBottom: '25px', backgroundColor: '#f1f5f9', padding: '6px', borderRadius: '14px', width: 'fit-content', margin: '0 auto 30px auto' }}>
      {options.map(opt => (
        <button
          key={opt.id}
          onClick={() => setActiveSubTab(opt.id)}
          style={{
            padding: '10px 24px',
            borderRadius: '10px',
            border: 'none',
            fontSize: '13px',
            fontWeight: '700',
            cursor: 'pointer',
            backgroundColor: activeSubTab === opt.id ? 'white' : 'transparent',
            color: activeSubTab === opt.id ? brandPurple : '#64748b',
            boxShadow: activeSubTab === opt.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
            transition: 'all 0.2s'
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  return (
    <div style={{ backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: fontStack, margin: '-20px', paddingBottom: '80px' }}>
      
      {/* --- HERO BANNER --- */}
      <div style={{ 
        backgroundColor: brandPurple,
        backgroundImage: `linear-gradient(135deg, ${brandPurple} 0%, #6b21a8 100%)`,
        color: 'white',
        padding: '30px 40px 120px 40px', 
        borderBottomLeftRadius: '32px',
        borderBottomRightRadius: '32px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '350px', height: '350px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 1, maxWidth: '1400px', margin: '0 auto 40px auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ backgroundColor: 'white', padding: '8px', borderRadius: '10px' }}>
                  <span style={{ fontSize: '20px' }}>🛡️</span>
                </div>
                <h1 style={{ margin: 0, fontSize: '16px', fontWeight: '800', letterSpacing: '0.5px' }}>FUTUREPATH ADMIN</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '14px', fontWeight: '700' }}>{user.name}</div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', fontWeight: '600' }}>Principal Administrator</div>
                </div>
                <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.3)', padding: '8px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '13px' }}>Logout</button>
            </div>
        </div>

        <div style={{ maxWidth: '1400px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 10px 0', fontWeight: '800', letterSpacing: '-1px' }}>
            {activeTab === 'analytics' ? 'Executive Analytics' : 
             activeTab === 'curriculum' ? 'Curriculum Builder' : 
             activeTab === 'quality' ? 'Quality Control' : 'Screen Job Recruitments'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', fontWeight: '500', marginBottom: '40px' }}>
            {activeTab === 'analytics' ? 'Real-time cohort telemetry and AI-driven curriculum intervention insights.' : 
             activeTab === 'curriculum' ? 'Manage assessment banks, verified resources, and architect learning pathways.' : 
             activeTab === 'quality' ? 'Monitor student feedback, bug reports, and crowdsourced content validation.' : 
             'Review and approve alumni job posting opportunities.'}
          </p>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {[
              { id: 'analytics', label: '📊 Executive Analytics' },
              { id: 'curriculum', label: '🛠️ Curriculum Builder' },
              { id: 'quality', label: '⚖️ Quality Control' },
              { id: 'moderation', label: `📬 Job Screening ${summaryStats.pending_moderation > 0 ? `(${summaryStats.pending_moderation})` : ''}` }
            ].map((tab) => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                      padding: '12px 28px', borderRadius: '16px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', border: 'none',
                      backgroundColor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.12)', 
                      color: activeTab === tab.id ? brandPurple : 'white',
                      boxShadow: activeTab === tab.id ? '0 10px 15px -3px rgba(0,0,0,0.1)' : 'none',
                      transition: 'all 0.3s'
                  }}
              >
                  {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '-60px auto 0 auto', padding: '0 40px', position: 'relative', zIndex: 10 }}>
        
        {activeTab === 'analytics' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderSubNav([
              { id: 'overview', label: ' Dashboard Overview' },
              { id: 'heatmap', label: ' Skills Gap Heatmap' },
              { id: 'advisor', label: ' AI Curriculum Advisor' },
              { id: 'tracer', label: ' SKPG Graduate Tracer' }
            ])}

            {activeSubTab === 'overview' && (
              <div style={{ width: '100%', boxSizing: 'border-box' }}>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '20px', width: '100%', boxSizing: 'border-box' }}>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', textAlign: 'center', fontFamily: fontStack }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.8px' }}>Total Students</div>
                        <div style={{ fontSize: '34px', fontWeight: '800', color: brandPurple }}>{summaryStats.total_students}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', textAlign: 'center', fontFamily: fontStack }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.8px' }}>Verified Alumni</div>
                        <div style={{ fontSize: '34px', fontWeight: '800', color: theme.success.text }}>{summaryStats.verified_alumni}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', textAlign: 'center', fontFamily: fontStack }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.8px' }}>Pending Posts</div>
                        <div style={{ fontSize: '34px', fontWeight: '800', color: theme.warning.text }}>{summaryStats.pending_moderation}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', textAlign: 'center', fontFamily: fontStack }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.8px' }}>Alumni Insights</div>
                        <div style={{ fontSize: '34px', fontWeight: '800', color: umLightBlue }}>{summaryStats.unread_alumni_insights}</div>
                    </div>
                    <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0', textAlign: 'center', fontFamily: fontStack }}>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', marginBottom: '12px', letterSpacing: '0.8px' }}>Student Reports</div>
                        <div style={{ fontSize: '34px', fontWeight: '800', color: theme.danger.text }}>{summaryStats.unread_student_reports}</div>
                    </div>
                 </div>
              </div>
            )}

            {activeSubTab === 'advisor' && <AIFacultyAdvisor recommendations={aiRecommendations} setRecommendations={setAiRecommendations} />}

            {activeSubTab === 'heatmap' && (
              <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', alignItems: 'center' }}>
                      <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b' }}>Faculty Skills Matrix</h3>
                      <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '12px', display: 'flex', gap: '4px' }}>
                          <button onClick={() => setViewMode('matrix')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: viewMode === 'matrix' ? 'white' : 'transparent', color: brandPurple, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Matrix View</button>
                          <button onClick={() => setViewMode('feedback')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: viewMode === 'feedback' ? 'white' : 'transparent', color: brandPurple, cursor: 'pointer', fontWeight: 'bold', fontSize: '13px' }}>Qualitative Feedback</button>
                      </div>
                  </div>

                  {viewMode === 'matrix' ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                          {[...new Set(skillHeatmapData.map(s => s.career_name))].map(cName => (
                              <div key={cName} style={{ border: '1px solid #f1f5f9', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                  <div style={{ background: brandPurple, color: 'white', padding: '14px 24px', fontWeight: '800', fontSize: '13px', textTransform: 'uppercase', letterSpacing: '1px' }}>📂 {cName}</div>
                                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '1px', background: '#f1f5f9' }}>
                                      <div style={{ background: '#f8fafc', padding: '15px', fontWeight: '800', fontSize: '12px', color: '#64748b' }}>TECHNICAL SKILL</div>
                                      {['Y1', 'Y2', 'Y3', 'Y4'].map(y => <div key={y} style={{ background: '#f8fafc', padding: '15px', textAlign: 'center', fontWeight: '800', fontSize: '12px', color: '#64748b' }}>{y}</div>)}
                                      {skillHeatmapData.filter(s => s.career_name === cName).map((row, i) => (
                                          <React.Fragment key={i}>
                                              <div style={{ background: 'white', padding: '18px 24px', fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{row.skill}</div>
                                              {['y1', 'y2', 'y3', 'y4'].map((yearKey) => {
                                                  const score = row[yearKey];
                                                  const attemptCount = row[`${yearKey}_count`] || 0;
                                                  return (
                                                    <div 
                                                      key={yearKey} 
                                                      title={`📊 ${attemptCount} students attempted this quiz`}
                                                      style={{ background: getHeatmapColor(score), color: getHeatmapTextColor(score), padding: '18px', textAlign: 'center', fontWeight: '800', fontSize: '14px', cursor: 'help', fontFamily: fontStack }}
                                                    >
                                                      {score === 0 ? '-' : `${score}%`}
                                                    </div>
                                                  );
                                              })}
                                          </React.Fragment>
                                      ))}
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                          {feedback.map((f, i) => (
                              <div key={i} style={{ padding: '20px', borderRadius: '14px', background: '#f8fafc', borderLeft: `6px solid ${brandPurple}`, boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                                  <div style={{ fontWeight: '800', fontSize: '14px', color: brandPurple, marginBottom: '8px' }}>{f.skill_name}</div>
                                  <p style={{ margin: 0, fontSize: '13px', fontStyle: 'italic', color: '#475569', lineHeight: '1.6' }}>"{f.reason}"</p>
                              </div>
                          ))}
                      </div>
                  )}
              </div>
            )}

            {activeSubTab === 'tracer' && <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}><EmployabilityDashboard /></div>}
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {renderSubNav([{ id: 'pathways', label: '🛤️ Learning Pathways' }, { id: 'resources', label: '📚 Resource Library' }, { id: 'quizzes', label: '📖 Quiz Manager' }])}
            {activeSubTab === 'quizzes' && <QuizManager umBlue={umBlue} umLightBlue={umLightBlue} umGold={umGold} />}
            {activeSubTab === 'resources' && <ResourceManager supabase={supabase} umBlue={umBlue} umLightBlue={umLightBlue} umGold={umGold} />}
            {activeSubTab === 'pathways' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <InteractiveGenerator fetchData={fetchData} umBlue={umBlue} umLightBlue={umLightBlue} umGold={umGold} />
                  <PathwayList skillHeatmapData={skillHeatmapData} fetchData={fetchData} umGold={umGold} />
              </div>
            )}
          </div>
        )}

        {activeTab === 'quality' && (
          <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', width: '100%' }}>
              <div style={{ marginBottom: '30px' }}>
                  <h3 style={{ fontSize: '22px', fontWeight: '800', color: brandPurple, marginBottom: '10px' }}>⚖️ Student Quality Reports</h3>
                  <p style={{ fontSize: '15px', color: '#64748b' }}>Review crowdsourced flags from the cohort to maintain academic integrity.</p>
              </div>
              <AdminQualityControl umBlue={umBlue} umLightBlue={umLightBlue} />
          </div>
        )}

        {activeTab === 'moderation' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
              <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '16px', marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: brandPurple }}>Full Time/Internship Opportunities Queue</h3>
                <span style={{ backgroundColor: '#f1f5f9', color: '#64748b', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: '700' }}>{posts.length} Pending Reviews</span>
              </div>
              {posts.map(post => (
                  <div key={post.id} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '20px', borderLeft: `6px solid ${getTypeColor(post.post_type)}`, boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid #e2e8f0' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                          <div>
                              <span style={{ background: getTypeColor(post.post_type), color: 'white', padding: '4px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>{post.post_type.replace('_', ' ')}</span>
                              <h3 style={{ margin: '12px 0 5px 0', fontSize: '22px', fontWeight: '800', color: '#1e293b' }}>{post.title}</h3>
                              <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>👤 Submitted by: <span style={{ color: brandPurple }}>{post.users?.name || 'Anonymous Alumnus'}</span></div>
                          </div>
                          <div style={{ display: 'flex', gap: '12px' }}>
                              <button onClick={() => updateStatus(post.id, 'approved')} style={{ padding: '12px 24px', background: theme.success.bg, color: theme.success.text, border: `1px solid ${theme.success.text}`, borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>✅ Approve</button>
                              <button onClick={() => updateStatus(post.id, 'rejected')} style={{ padding: '12px 24px', background: theme.danger.bg, color: theme.danger.text, border: `1px solid ${theme.danger.text}`, borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '13px' }}>❌ Reject</button>
                          </div>
                      </div>
                      {post.company_name && <div style={{ background: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '800', color: brandPurple, display: 'inline-block', marginBottom: '15px' }}>🏢 {post.company_name}</div>}
                      <div style={{ color: '#334155', lineHeight: '1.7', background: '#f8fafc', padding: '25px', borderRadius: '16px', border: '1px solid #f1f5f9', fontSize: '15px' }}>
                        {post.content}
                        {post.image_url && <div style={{ marginTop: '20px' }}><img src={post.image_url} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '12px', border: '1px solid #e5e7eb', cursor: 'zoom-in' }} onClick={() => window.open(post.image_url, '_blank')} /></div>}
                        {post.application_link && <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}><a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', backgroundColor: '#f1f5f9', color: brandPurple, padding: '10px 20px', borderRadius: '10px', fontSize: '13px', fontWeight: '800', textDecoration: 'none', border: '1px solid #e2e8f0' }}>🔗 View Link ↗</a></div>}
                      </div>
                  </div>
              ))}
              {posts.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '100px', backgroundColor: 'white', borderRadius: '24px', border: '2px dashed #e2e8f0' }}>
                      <div style={{ fontSize: '60px', marginBottom: '20px' }}>✨</div>
                      <h3 style={{ margin: 0, color: '#1e293b', fontWeight: '800', fontSize: '24px' }}>Inbox Zero!</h3>
                      <p style={{ color: '#64748b', marginTop: '10px', fontWeight: '500' }}>All alumni contributions have been successfully moderated.</p>
                  </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
