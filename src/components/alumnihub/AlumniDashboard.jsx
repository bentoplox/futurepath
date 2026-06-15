// ============================================================================
// FILE: src/components/alumnihub/AlumniDashboard.jsx
// PURPOSE: Alumni Hub with Interactive Curriculum Review (Professional Emojis)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import PostComments from './PostComments';

const AlumniDashboard = ({ user, onLogout }) => {
  // Safely resolve the primary authenticated user identity token variant
  const activeUserId = user?.user_id || user?.id;

  // --- STATE SYSTEM ---
  const [activeTab, setActiveTab] = useState('jobs');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // NEW: Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Consolidated isolated data vectors 
  const [careerStats, setCareerStats] = useState({
    name: user?.name || '',
    current_role: '',
    programme: '',
    internship_company: '',
    employer_name: '',
    job_title: '',
    salary: '',
    years_xp: '',
    show_workplace: false,
    is_public: true
  });

  const [loadingStats, setLoadingStats] = useState(false);
  const [isDataSaved, setIsDataSaved] = useState(false);
  const [isSettingsSaved, setIsSettingsSaved] = useState(false);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const programs = [
    "BACHELOR OF COMPUTER SCIENCE (DATA SCIENCE)",
    "BACHELOR OF COMPUTER SCIENCE (SOFTWARE ENGINEERING)",
    "BACHELOR OF COMPUTER SCIENCE (INFORMATION SYSTEMS)",
    "BACHELOR OF COMPUTER SCIENCE (MULTIMEDIA COMPUTING)",
    "BACHELOR OF COMPUTER SCIENCE (ARTIFICIAL INTELLIGENCE)",
    "BACHELOR OF COMPUTER SCIENCE (COMPUTER SYSTEM AND NETWORK)"
  ];

  const mentorshipCategories = [
    { label: 'All', value: 'All' },
    { label: 'General', value: 'mentorship' },
    { label: 'Resume Review', value: 'resume_review' },
    { label: 'Interview Prep', value: 'interview_prep' },
    { label: 'Career Advice', value: 'career_advice' },
    { label: 'Portfolio Review', value: 'portfolio_review' },
    { label: 'Coffee Chat', value: 'coffee_chat' },
    { label: 'Hackathons', value: 'hackathon' }
  ];

  const [newPost, setNewPost] = useState({
    title: '', content: '', type: 'job', company_name: '', application_link: ''
  });
  const [posterFile, setPosterFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeUserId) {
      fetchPosts();
      fetchCareerStats();
    }
  }, [activeUserId]);

  const fetchCareerStats = async () => {
    if (!activeUserId) return;
    setLoadingStats(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/alumni/profile/stats?user_id=${activeUserId}`);
      const data = await res.json();

      if (data.success) {
        if (data.stats) {
          const userObj = data.stats.users;
          const savedProgram = userObj?.programme || (Array.isArray(userObj) ? userObj[0]?.programme : '') || '';
          const savedName = userObj?.name || (Array.isArray(userObj) ? userObj[0]?.name : user?.name || '');
          const savedShowWorkplace = userObj?.show_workplace || (Array.isArray(userObj) ? userObj[0]?.show_workplace : false);
          const savedCurrentRole = userObj?.current_role || (Array.isArray(userObj) ? userObj[0]?.current_role : '');

          setCareerStats({
            name: savedName,
            current_role: savedCurrentRole,
            programme: savedProgram,
            internship_company: data.stats.internship_company || '',
            internship_role: data.stats.internship_role || '',
            employer_name: data.stats.employer_name || '',
            job_title: data.stats.job_title || '',
            salary: data.stats.salary || '',
            show_workplace: savedShowWorkplace,
            is_public: data.stats.is_public ?? true
          });
          setIsDataSaved(true);
        } else {
          setCareerStats(prev => ({
            ...prev,
            programme: data.programme || prev.programme,
            name: data.name || prev.name,
            current_role: data.current_role || '',
            show_workplace: data.show_workplace || false
          }));
        }
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  const handleStatsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/alumni/profile/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...careerStats, user_id: activeUserId })
      });
      if (res.ok) {
        setIsDataSaved(true);
        alert("Early-career metrics updated successfully!");
        fetchCareerStats();
        fetchPosts();
      }
    } catch (err) { console.error(err); }
  };

  const handleSettingsSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('http://127.0.0.1:5000/api/alumni/profile/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...careerStats, user_id: activeUserId })
      });
      if (res.ok) {
        setIsSettingsSaved(true);
        alert("Profile display preferences updated successfully!");
        fetchCareerStats();
        fetchPosts();
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (activeTab === 'mentorship') {
      setNewPost(prev => ({ ...prev, type: 'mentorship' }));
    } else {
      setNewPost(prev => ({ ...prev, type: 'job' }));
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/discussion/all?user_id=${activeUserId}`);
      const data = await res.json();

      if (data.success) {
        setPosts(data.posts || []);
      } else {
        console.error("Error fetching posts:", data.error);
      }
    } catch (err) {
      console.error("Fetch failed:", err);
    }
    setLoading(false);
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to permanently delete this post?")) return;

    try {
      const res = await fetch(`http://127.0.0.1:5000/api/discussion/delete/${postId}?user_id=${activeUserId}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (data.success) {
        setPosts(posts.filter(p => p.id !== postId));
      } else {
        alert("Error deleting post: " + data.error);
      }
    } catch (err) { console.error("Delete failed", err); }
  };

  const filteredPosts = posts.filter(post => {
    const isTabMatch = activeTab === 'jobs'
      ? (post.post_type === 'job' || post.post_type === 'internship')
      : ['mentorship', 'resume_review', 'interview_prep', 'career_advice', 'portfolio_review', 'coffee_chat', 'hackathon'].includes(post.post_type);

    if (!isTabMatch) return false;
    if (activeTab === 'mentorship' && selectedCategory !== 'All') {
      if (post.post_type !== selectedCategory) return false;
    }

    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!activeUserId) return alert('You must be logged in');

    setUploading(true);
    let finalImageUrl = null;

    if (posterFile) {
      const fileExt = posterFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post_images')
        .upload(filePath, posterFile);

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        setUploading(false);
        return;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('post_images')
        .getPublicUrl(filePath);

      finalImageUrl = publicUrl;
    }

    const payload = {
      author_id: activeUserId,
      title: newPost.title,
      content: newPost.content,
      post_type: newPost.type,
      company_name: ['mentorship', 'resume_review', 'interview_prep'].includes(newPost.type) ? null : newPost.company_name,
      application_link: newPost.application_link,
      image_url: finalImageUrl
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/discussion/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (data.success) {
        alert(payload.post_type === 'job' || payload.post_type === 'internship'
          ? 'Post submitted! Pending Admin approval.'
          : 'Discussion posted successfully!');
        setNewPost({ title: '', content: '', type: activeTab === 'jobs' ? 'job' : 'mentorship', company_name: '', application_link: '' });
        setPosterFile(null);
        fetchPosts(); 
      } else {
        alert("Error: " + data.error);
      }
    } catch (err) {
      alert("Error submitting post. Ensure backend is running.");
      console.error(err);
    }
    setUploading(false);
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'job': return '#10b981';
      case 'internship': return '#f59e0b';
      case 'resume_review': return '#db2777';
      case 'interview_prep': return '#7c3aed';
      case 'career_advice': return '#0284c7';
      case 'portfolio_review': return '#ea580c';
      case 'coffee_chat': return '#9333ea';
      case 'hackathon': return '#06b6d4';
      default: return '#4c2882';
    }
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", paddingBottom: '50px' }}>

      {/* 1. HERO BANNER */}
      <div style={{
        backgroundColor: '#4c2882',
        backgroundImage: 'linear-gradient(135deg, #4c2882 0%, #6b4c9a 100%)',
        color: 'white',
        padding: '20px 40px 60px 40px',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

        {/* NAVIGATION WRAPPER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto 40px auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎓</span>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>FuturePath Alumni</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontWeight: '500' }}>{careerStats.name}</span>
            <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500' }}>Logout</button>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: '#fcd34d', color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', display: 'inline-block', marginBottom: '20px' }}>
            ALUMNI PORTAL — FSKTM UM
          </span>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700', lineHeight: '1.2' }}>
            Welcome back,<br />
            <span style={{ color: '#fcd34d' }}>{careerStats.name || 'Alumni'}</span>

            {careerStats.show_workplace && careerStats.current_role && (
              <span style={{ fontSize: '18px', color: '#fcd34d', display: 'block', marginTop: '10px', fontWeight: '500', opacity: 0.95, letterSpacing: '0.5px' }}>
                - {careerStats.current_role}
              </span>
            )}
          </h1>

          {/* CONTROL TABS INTERFACE */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginTop: '30px' }}>
            {[
              { id: 'jobs', label: '💼 Job Board' },
              { id: 'mentorship', label: '💬 Mentorship Hub' },
              { id: 'stats', label: '📊 Fresh Graduate Data' },
              { id: 'review', label: '🔍 Curriculum Review' }, // ⚡ Professional Emoji Updated
              { id: 'settings', label: '⚙️ Profile Settings' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setExpandedPostId(null); setSearchQuery(''); }}
                style={{
                  padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                  backgroundColor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.15)',
                  color: activeTab === tab.id ? '#4c2882' : 'white',
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

        {/* ⚡ TAB: CURRICULUM REVIEW (ALUMNI CROWDSOURCING) */}
        {activeTab === 'review' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <AlumniCurriculumReview user={user} />
          </div>
        )}

        {/* ⚡ TAB: FRESH GRADUATE ANALYTICS DISCLOSURE PANEL */}
        {activeTab === 'stats' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '6px solid #4c2882' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Faculty Analytics Disclosure</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px', lineHeight: '1.6' }}>
              Document your historical final-year internship company and entry starting career fields. This anonymous data directly aggregates global dashboard operations.
            </p>

            {loadingStats ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#4c2882' }}><h3>Loading telemetry configurations...</h3></div>
            ) : (
              <form onSubmit={handleStatsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>Graduated Department</label>
                  <select
                    value={careerStats.programme}
                    onChange={e => setCareerStats({ ...careerStats, programme: e.target.value })}
                    required
                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontSize: '14px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
                  >
                    <option value="" disabled>Select your FSKTM Department</option>
                    {programs.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>Final Year Internship Company</label>
                    <input placeholder="e.g. Grab, Axiata, TM" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={careerStats.internship_company} onChange={e => setCareerStats({ ...careerStats, internship_company: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>Internship Role</label>
                    <input placeholder="e.g. Software Engineer Intern" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={careerStats.internship_role} onChange={e => setCareerStats({ ...careerStats, internship_role: e.target.value })} required />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>First Full-Time Employer</label>
                    <input placeholder="e.g. Maybank, Shopee, Maxis" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={careerStats.employer_name} onChange={e => setCareerStats({ ...careerStats, employer_name: e.target.value })} required />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>Starting Job Title</label>
                    <input placeholder="e.g. Junior Systems Analyst" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={careerStats.job_title} onChange={e => setCareerStats({ ...careerStats, job_title: e.target.value })} required />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>Starting Monthly Salary (MYR)</label>
                  <input type="number" placeholder="e.g. 4800" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={careerStats.salary} onChange={e => setCareerStats({ ...careerStats, salary: e.target.value })} required />
                </div>

                <button
                  type="submit"
                  style={{ padding: '16px', background: isDataSaved ? '#10b981' : '#4c2882', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s', fontFamily: 'inherit' }}
                >
                  {isDataSaved ? "✓ Update Early-Career Profile" : "Submit Early-Career Data"}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ⚡ TAB: PROFILE VISIBILITY SETTINGS */}
        {activeTab === 'settings' && (
          <div style={{ maxWidth: '800px', margin: '0 auto', backgroundColor: 'white', borderRadius: '20px', padding: '40px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderTop: '6px solid #fcd34d' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>Profile Settings</h2>
            <p style={{ color: '#6b7280', marginBottom: '30px', lineHeight: '1.6' }}>
              Customize your current professional visibility settings shown to other platform users.
            </p>

            <form onSubmit={handleSettingsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>Full Name</label>
                <input placeholder="Your registered name" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={careerStats.name} onChange={e => setCareerStats({ ...careerStats, name: e.target.value })} required />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#4b5563', marginBottom: '8px' }}>Current Role</label>
                <input placeholder="e.g. AI Engineer @ RHB" style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={careerStats.current_role} onChange={e => setCareerStats({ ...careerStats, current_role: e.target.value })} />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', backgroundColor: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                <div>
                  <strong style={{ display: 'block', fontSize: '14px', color: '#1e293b' }}>Show Workplace Status to Students</strong>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>Appends your current role info badge alongside your name on posts and threads.</span>
                </div>
                <label style={{ position: 'relative', display: 'inline-block', width: '46px', height: '24px' }}>
                  <input
                    type="checkbox"
                    checked={careerStats.show_workplace}
                    onChange={e => setCareerStats({ ...careerStats, show_workplace: e.target.checked })}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{ position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: careerStats.show_workplace ? '#10b981' : '#cbd5e1', transition: '0.3s', borderRadius: '24px' }}>
                    <span style={{ position: 'absolute', content: '""', height: '18px', width: '18px', left: '3px', bottom: '3px', backgroundColor: 'white', transition: '0.3s', borderRadius: '50%', transform: careerStats.show_workplace ? 'translateX(22px)' : 'translateX(0)' }} />
                  </span>
                </label>
              </div>

              <button
                type="submit"
                style={{ padding: '16px', background: isSettingsSaved ? '#10b981' : '#4c2882', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', marginTop: '10px', transition: 'background 0.2s', fontFamily: 'inherit' }}
              >
                {isSettingsSaved ? "✓ Settings Saved" : "Save Profile Settings"}
              </button>
            </form>
          </div>
        )}

        {/* CORE DISCUSSIONS & CHAT VISUAL TIMELINE */}
        {(activeTab === 'jobs' || activeTab === 'mentorship') && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>
            <div style={{ flex: 2, minWidth: '60%' }}>

              {/* Contextual Category Navigation Header */}
              {activeTab === 'mentorship' && (
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px', backgroundColor: 'white', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  {mentorshipCategories.map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => setSelectedCategory(cat.value)}
                      style={{
                        padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                        backgroundColor: selectedCategory === cat.value ? '#4c2882' : '#f3f4f6',
                        color: selectedCategory === cat.value ? 'white' : '#4b5563'
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}

              {/* NEW: Alumni Search Input */}
              <input
                type="text"
                placeholder={`Search your ${activeTab === 'jobs' ? 'opportunities' : 'discussions'}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '20px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}
              />

              <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold' }}>
                <span style={{ marginRight: '10px', fontSize: '24px' }}>{activeTab === 'jobs' ? '📌' : '💡'}</span>
                {activeTab === 'jobs' ? 'Active Opportunities' : 'Mentorship Discussions'}
              </h2>

              {loading ? <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading feed...</p> : filteredPosts.length === 0 ? (
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '50px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '5px solid #d1d5db', color: '#6b7280' }}>
                  <h3>{searchQuery ? `No matches for "${searchQuery}"` : 'No posts found.'}</h3>
                  <p>Use the form on the right to share an opportunity!</p>
                </div>
              ) : filteredPosts.map((post) => {
                const displayTitleBadge = post.users?.show_workplace && post.users?.current_role
                  ? ` — ${post.users.current_role}`
                  : '';

                return (
                  <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: `5px solid ${getTypeColor(post.post_type)}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div>
                        <span style={{ fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '12px', backgroundColor: `${getTypeColor(post.post_type)}15`, color: getTypeColor(post.post_type) }}>{post.post_type.replace('_', ' ')}</span>
                        <h3 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: '#111827' }}>{post.title}</h3>
                        {post.company_name && <p style={{ margin: 0, color: '#4b5563', fontWeight: '500' }}>🏢 {post.company_name}</p>}
                      </div>
                      {post.author_id === activeUserId && (
                        <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', border: post.status === 'approved' ? '1px solid #10b981' : '1px solid #f59e0b', color: post.status === 'approved' ? '#047857' : '#b45309', backgroundColor: post.status === 'approved' ? '#ecfdf5' : '#fffbeb' }}>{post.status === 'approved' ? '✅ LIVE' : '⏳ PENDING'}</span>
                      )}
                    </div>
                    <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                      Posted by: <strong style={{ color: '#374151' }}>{post.users?.name || 'Alumni'}{displayTitleBadge}</strong> • {new Date(post.created_at).toLocaleDateString()}
                    </p>
                    <p style={{ color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '15px' }}>{post.content}</p>
                    {post.image_url && <div style={{ marginTop: '20px', marginBottom: '15px' }}><img src={post.image_url} alt="Post attachment" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #e5e7eb' }} /></div>}

                    {/* Action Buttons (Include Delete functionality) */}
                    <div style={{ marginTop: '25px', display: 'flex', gap: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '20px', flexWrap: 'wrap' }}>
                      {post.application_link && <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#4c2882', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>{activeTab === 'jobs' ? 'View Application ↗' : 'View Resource ↗'}</a>}

                      <button onClick={() => toggleComments(post.id)} style={{ padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid', backgroundColor: expandedPostId === post.id ? '#f3e8ff' : 'white', borderColor: expandedPostId === post.id ? '#4c2882' : '#d1d5db', color: expandedPostId === post.id ? '#4c2882' : '#374151' }}>💬 {expandedPostId === post.id ? 'Close Thread' : 'View Discussion'}</button>

                      {/* Delete Post Button */}
                      {post.author_id === activeUserId && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          style={{ backgroundColor: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}>
                          🗑️ Delete
                        </button>
                      )}
                    </div>
                    {expandedPostId === post.id && <PostComments postId={post.id} currentUser={user} />}
                  </div>
                );
              })}
            </div>

            {/* SIDEBAR SUBMIT OPPORTUNITIES SYSTEM FORM */}
            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'sticky', top: '20px' }}>
                <h3 style={{ fontSize: '18px', color: '#4c2882', marginBottom: '20px', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>{activeTab === 'jobs' ? '📢 Post an Opportunity' : '🗣️ Start a Discussion'}</h3>
                <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Type</label>
                    <select style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={newPost.type} onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}>
                      {activeTab === 'jobs' ? (<><option value="job">Job Opportunity</option><option value="internship">Internship</option></>) : (<><option value="mentorship">General Discussion</option><option value="resume_review">📄 Resume Review Offer</option><option value="interview_prep">🎤 Mock Interview / Prep</option><option value="career_advice">🧭 Career Path Advice</option><option value="portfolio_review">🎨 Portfolio / GitHub Review</option><option value="coffee_chat">☕ Coffee Chat / AMA</option><option value="hackathon">🏆 Hackathon Promotion / Team Up</option></>)}
                    </select>
                  </div>
                  <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Title</label><input type="text" placeholder="Title..." required style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} /></div>
                  {activeTab === 'jobs' && (<><div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Company Name</label><input type="text" placeholder="Company..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={newPost.company_name} onChange={(e) => setNewPost({ ...newPost, company_name: e.target.value })} /></div><div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Upload Poster (Optional)</label><input type="file" accept="image/*" onChange={(e) => setPosterFile(e.target.files[0])} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }} /></div></>)}
                  <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>Description</label><textarea placeholder="Details..." required rows="4" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}></textarea></div>
                  <div><label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '5px' }}>External Link (Optional)</label><input type="url" placeholder="https://..." style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontFamily: 'inherit' }} value={newPost.application_link} onChange={(e) => setNewPost({ ...newPost, application_link: e.target.value })} /></div>
                  <button type="submit" disabled={uploading} style={{ width: '100%', padding: '12px', marginTop: '10px', borderRadius: '8px', border: 'none', backgroundColor: uploading ? '#9ca3af' : '#4c2882', color: 'white', fontWeight: 'bold', cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{uploading ? 'Uploading...' : 'Submit Post'}</button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AlumniCurriculumReview = ({ user }) => {
  const [treeData, setTreeData] = useState([]);
  const [loadingTree, setLoadingTree] = useState(true);

  // Expand/Collapse state
  const [expandedCareers, setExpandedCareers] = useState({});
  const [expandedSkills, setExpandedSkills] = useState({});

  // Feedback Form State
  const [activeTarget, setActiveTarget] = useState(null); // { id, type, name }
  const [feedbackType, setFeedbackType] = useState('better_alternative');
  const [suggestion, setSuggestion] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const res = await fetch('http://127.0.0.1:5000/api/quality/curriculum-tree');
        const data = await res.json();
        if (data.success) setTreeData(data.tree);
      } catch (err) {
        console.error("Failed to fetch curriculum tree", err);
      }
      setLoadingTree(false);
    };
    fetchTree();
  }, []);

  const toggleCareer = (id) => setExpandedCareers(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleSkill = (id) => setExpandedSkills(prev => ({ ...prev, [id]: !prev[id] }));

  const handleSelectTarget = (id, type, name) => {
    setActiveTarget({ id, type, name });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeTarget) return alert("Please select a target from the curriculum tree first.");

    setSubmitting(true);
    const payload = {
      user_id: user.user_id || user.id,
      user_role: 'alumni',
      target_type: activeTarget.type,
      target_id: activeTarget.id,
      target_name: activeTarget.name,
      feedback_type: feedbackType,
      suggested_alternative_text: suggestion
    };

    try {
      const res = await fetch('http://127.0.0.1:5000/api/quality/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        alert("Insight submitted to Faculty Admins. Thank you!");
        setSuggestion('');
        setActiveTarget(null);
      } else {
        alert("Failed to submit insight.");
      }
    } catch (err) {
      alert("Failed to submit insight.");
    }
    setSubmitting(false);
  };

  return (
    <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderTop: '5px solid #f59e0b', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      {/* ⚡ Professional Emoji Updated Here */}
      <h3 style={{ fontSize: '20px', color: '#111827', marginBottom: '10px' }}>🔍 Interactive Curriculum Review</h3>
      <p style={{ color: '#64748b', fontSize: '14px', marginBottom: '25px', lineHeight: '1.6' }}>Browse the current Faculty curriculum below. Click on any Career, Skill, or Resource to propose industry-aligned alternatives, flag outdated tech, or suggest new additions.</p>

      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        {/* LEFT PANE: CURRICULUM TREE */}
        <div style={{ flex: '1 1 50%', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', backgroundColor: '#f8fafc', maxHeight: '600px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#334155', fontSize: '16px' }}>Curriculum Explorer</h4>

          {loadingTree ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>Loading structure...</div>
          ) : treeData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No curriculum data available.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {treeData.map(career => (
                <div key={career.id} style={{ backgroundColor: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 15px', backgroundColor: '#f1f5f9', cursor: 'pointer' }} onClick={() => toggleCareer(career.id)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '12px' }}>{expandedCareers[career.id] ? '▼' : '▶'}</span>
                      <strong style={{ color: '#1e293b', fontSize: '14px' }}>🗺️ {career.name}</strong>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleSelectTarget(career.id, 'career_path', career.name); }} style={{ padding: '4px 10px', fontSize: '11px', borderRadius: '4px', border: '1px solid #f59e0b', background: activeTarget?.id === career.id ? '#f59e0b' : 'white', color: activeTarget?.id === career.id ? 'white' : '#b45309', cursor: 'pointer', fontWeight: 'bold' }}>Review</button>
                  </div>

                  {expandedCareers[career.id] && (
                    <div style={{ padding: '10px 10px 10px 30px', display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid #e2e8f0' }}>
                      {career.skills.length === 0 ? <span style={{ fontSize: '12px', color: '#94a3b8' }}>No skills defined.</span> : career.skills.map(skill => (
                        <div key={skill.id} style={{ border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', backgroundColor: '#f8fafc', cursor: 'pointer' }} onClick={() => toggleSkill(skill.id)}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '10px', color: '#64748b' }}>{expandedSkills[skill.id] ? '▼' : '▶'}</span>
                              {/* ⚡ Professional Emoji Updated Here */}
                              <span style={{ color: '#334155', fontSize: '13px', fontWeight: '600' }}>🔹 {skill.name}</span>
                            </div>
                            <button onClick={(e) => { e.stopPropagation(); handleSelectTarget(skill.id, 'skill', skill.name); }} style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid #3b82f6', background: activeTarget?.id === skill.id ? '#3b82f6' : 'white', color: activeTarget?.id === skill.id ? 'white' : '#1d4ed8', cursor: 'pointer', fontWeight: 'bold' }}>Review</button>
                          </div>

                          {expandedSkills[skill.id] && (
                            <div style={{ padding: '10px 10px 10px 25px', display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid #e2e8f0', backgroundColor: 'white' }}>
                              {skill.resources.length === 0 ? <span style={{ fontSize: '11px', color: '#94a3b8' }}>No resources mapped.</span> : skill.resources.map(res => (
                                <div key={res.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', border: '1px solid #f1f5f9', borderRadius: '4px', backgroundColor: '#f8fafc' }}>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', overflow: 'hidden' }}>
                                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: '500', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>🔗 {res.name}</span>
                                    <a href={res.url} target="_blank" rel="noreferrer" style={{ fontSize: '10px', color: '#3b82f6', textDecoration: 'none' }}>{res.provider}</a>
                                  </div>
                                  <button onClick={() => handleSelectTarget(res.id, 'verified_resource', res.name)} style={{ padding: '3px 8px', fontSize: '10px', borderRadius: '4px', border: '1px solid #10b981', background: activeTarget?.id === res.id ? '#10b981' : 'white', color: activeTarget?.id === res.id ? 'white' : '#047857', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0 }}>Review</button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT PANE: FEEDBACK FORM */}
        <div style={{ flex: '1 1 40%', minWidth: '300px' }}>
          <div style={{ position: 'sticky', top: '20px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
            {activeTarget ? (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#b45309', textTransform: 'uppercase' }}>Selected Target</span>
                  <div style={{ fontSize: '15px', color: '#78350f', fontWeight: '800', marginTop: '2px' }}>{activeTarget.name}</div>
                  <div style={{ fontSize: '10px', color: '#92400e', marginTop: '2px' }}>Type: {activeTarget.type.replace('_', ' ')}</div>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Type of Insight</label>
                  <select value={feedbackType} onChange={(e) => setFeedbackType(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px', fontFamily: 'inherit', backgroundColor: '#f8fafc' }}>
                    <option value="better_alternative">Suggest Better Alternative / URL</option>
                    <option value="outdated_content">Flag Outdated Content/Tech</option>
                    <option value="new_demand_suggestion">Propose New High-Demand Skill</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', textTransform: 'uppercase' }}>Your Professional Recommendation</label>
                  <textarea value={suggestion} onChange={(e) => setSuggestion(e.target.value)} required rows="5" placeholder="Provide link replacements, explain why the industry has moved away from this tech, or suggest additions..." style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '8px', fontFamily: 'inherit', resize: 'vertical', backgroundColor: '#f8fafc' }} />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="button" onClick={() => setActiveTarget(null)} style={{ padding: '12px', flex: 1, backgroundColor: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                  <button type="submit" disabled={submitting} style={{ padding: '12px', flex: 2, background: '#4c2882', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px' }}>
                    {submitting ? 'Submitting...' : 'Submit Insight'}
                  </button>
                </div>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                {/* ⚡ Professional Emoji Updated Here */}
                <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>📋</span>
                <p style={{ margin: 0, fontWeight: '500', lineHeight: '1.5' }}>Select a Career, Skill, or Resource from the curriculum tree to provide specific industry feedback.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;