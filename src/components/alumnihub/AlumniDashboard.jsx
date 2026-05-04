// ============================================================================
// FILE: src/components/alumnihub/AlumniDashboard.jsx
// PURPOSE: Alumni Dashboard with Premium UI & Image Upload
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import PostComments from './PostComments';

const AlumniDashboard = ({ user, onLogout }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('jobs');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Track which post has its comment section open
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Form State
  const [newPost, setNewPost] = useState({
    title: '', content: '', type: 'job', company_name: '', application_link: ''
  });
  const [posterFile, setPosterFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (activeTab === 'mentorship') {
      setNewPost(prev => ({ ...prev, type: 'mentorship' }));
    } else {
      setNewPost(prev => ({ ...prev, type: 'job' }));
    }
  }, [activeTab]);

  const fetchPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alumni_posts')
      .select('*, users(name)')
      .order('created_at', { ascending: false });

    if (error) console.error(error);
    else setPosts(data || []);
    setLoading(false);
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // --- FILTER & SUBMIT LOGIC ---
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'jobs') {
      return post.post_type === 'job' || post.post_type === 'internship';
    } else {
      // Added the new types to this list!
      return ['mentorship', 'resume_review', 'interview_prep', 'career_advice', 'portfolio_review', 'coffee_chat'].includes(post.post_type);
    }
  });

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in');

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

    const { error } = await supabase.from('alumni_posts').insert([{
      author_id: user.user_id,
      title: newPost.title,
      content: newPost.content,
      post_type: newPost.type,
      company_name: ['mentorship', 'resume_review', 'interview_prep'].includes(newPost.type) ? null : newPost.company_name,
      application_link: newPost.application_link,
      image_url: finalImageUrl,
      status: 'pending'
    }]);

    setUploading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert('Post submitted! Pending Admin approval.');
      setNewPost({ title: '', content: '', type: activeTab === 'jobs' ? 'job' : 'mentorship', company_name: '', application_link: '' });
      setPosterFile(null);
      fetchPosts();
    }
  };

  // Dynamic colors for tags and card top-borders
  const getTypeColor = (type) => {
    switch (type) {
      case 'job': return '#10b981'; // Green
      case 'internship': return '#f59e0b'; // Yellow
      case 'resume_review': return '#db2777'; // Pink
      case 'interview_prep': return '#7c3aed'; // Violet
      // NEW COLORS BELOW
      case 'career_advice': return '#0284c7'; // Light Blue
      case 'portfolio_review': return '#ea580c'; // Orange
      case 'coffee_chat': return '#9333ea'; // Deep Purple
      default: return '#4c2882'; // FuturePath Purple
    }
  };

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif', paddingBottom: '50px' }}>

      {/* 1. PREMIUM HERO BANNER */}
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
        {/* Decorative Circle Background */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

        {/* Top Nav Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎓</span>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>FuturePath Alumni</h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontWeight: '500' }}>{user.name}</span>
            <button
              onClick={onLogout}
              style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
            >
              Logout
            </button>
          </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: '#fcd34d', color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            ALUMNI PORTAL — FSKTM UM
          </span>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
            Welcome back,<br /><span style={{ color: '#fcd34d' }}>{user.name.split(' ')[0]}</span>
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
            Share your expertise, post job opportunities, and mentor the next generation of FSKTM students.
          </p>

          {/* IN-BANNER TABS */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActiveTab('jobs'); setExpandedPostId(null); }}
              style={{
                padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                backgroundColor: activeTab === 'jobs' ? 'white' : 'rgba(255,255,255,0.15)',
                color: activeTab === 'jobs' ? '#4c2882' : 'white',
                boxShadow: activeTab === 'jobs' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              💼 Job Board
            </button>
            <button
              onClick={() => { setActiveTab('mentorship'); setExpandedPostId(null); }}
              style={{
                padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                backgroundColor: activeTab === 'mentorship' ? 'white' : 'rgba(255,255,255,0.15)',
                color: activeTab === 'mentorship' ? '#4c2882' : 'white',
                boxShadow: activeTab === 'mentorship' ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              💬 Mentorship Hub
            </button>
          </div>
        </div>
      </div>

      {/* 2. MAIN DASHBOARD GRID */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px', alignItems: 'start' }}>

        {/* === LEFT COLUMN: FEED === */}
        <div style={{ flex: 2, minWidth: '60%' }}>
          <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
            <span style={{ marginRight: '10px', fontSize: '24px' }}>{activeTab === 'jobs' ? '📌' : '💡'}</span>
            {activeTab === 'jobs' ? 'Active Job & Internship Posts' : 'Mentorship Discussions'}
          </h2>

          {loading ? <p style={{ textAlign: 'center', color: '#6b7280' }}>Loading feed...</p> : filteredPosts.length === 0 ? (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '50px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '5px solid #d1d5db', color: '#6b7280' }}>
              <h3 style={{ fontFamily: 'Georgia, serif', color: '#374151' }}>No posts found.</h3>
              <p>Use the form on the right to share an opportunity!</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post.id} style={{
                backgroundColor: 'white',
                borderRadius: '12px',
                padding: '30px',
                marginBottom: '20px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                borderTop: `5px solid ${getTypeColor(post.post_type)}`
              }}>
                {/* POST HEADER */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <span style={{
                      fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase',
                      padding: '4px 10px', borderRadius: '12px',
                      backgroundColor: `${getTypeColor(post.post_type)}15`,
                      color: getTypeColor(post.post_type)
                    }}>
                      {post.post_type.replace('_', ' ')}
                    </span>
                    <h3 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: '#111827', fontFamily: 'Georgia, serif' }}>{post.title}</h3>
                    {post.company_name && <p style={{ margin: 0, color: '#4b5563', fontWeight: '500' }}>🏢 {post.company_name}</p>}
                  </div>

                  {/* Status Badge (Only for Alumni's own posts) */}
                  {post.author_id === user.user_id && (
                    <span style={{
                      fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold',
                      border: post.status === 'approved' ? '1px solid #10b981' : '1px solid #f59e0b',
                      color: post.status === 'approved' ? '#047857' : '#b45309',
                      backgroundColor: post.status === 'approved' ? '#ecfdf5' : '#fffbeb'
                    }}>
                      {post.status === 'approved' ? '✅ LIVE' : '⏳ PENDING'}
                    </span>
                  )}
                </div>

                <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
                  Posted by: <strong style={{ color: '#374151' }}>{post.users?.name || 'Alumni'}</strong> • {new Date(post.created_at).toLocaleDateString()}
                </p>

                {/* POST CONTENT */}
                <p style={{ color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '15px' }}>{post.content}</p>

                {/* DISPLAY IMAGE IF EXISTS */}
                {post.image_url && (
                  <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                    <img
                      src={post.image_url}
                      alt="Post attachment"
                      style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                    />
                  </div>
                )}

                {/* ACTION BAR */}
                <div style={{ marginTop: '25px', display: 'flex', gap: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                  {post.application_link && (
                    <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{
                      backgroundColor: '#4c2882', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'background 0.2s'
                    }}>
                      {activeTab === 'jobs' ? 'View Application ↗' : 'View Resource ↗'}
                    </a>
                  )}

                  <button
                    onClick={() => toggleComments(post.id)}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid', marginLeft: 'auto',
                      backgroundColor: expandedPostId === post.id ? '#f3e8ff' : 'white',
                      borderColor: expandedPostId === post.id ? '#4c2882' : '#d1d5db',
                      color: expandedPostId === post.id ? '#4c2882' : '#374151'
                    }}
                  >
                    💬 {expandedPostId === post.id ? 'Close Thread' : 'View Discussion'}
                  </button>
                </div>

                {/* IMPORTED COMMENT SECTION */}
                {expandedPostId === post.id && (
                  <PostComments postId={post.id} currentUser={user} />
                )}

              </div>
            ))
          )}
        </div>

        {/* === RIGHT COLUMN: SIDEBAR FORM === */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', position: 'sticky', top: '20px' }}>
            <h3 style={{ fontSize: '18px', color: '#4c2882', marginBottom: '20px', fontFamily: 'Georgia, serif', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px' }}>
              {activeTab === 'jobs' ? '📢 Post an Opportunity' : '🗣️ Start a Discussion'}
            </h3>
            <form onSubmit={handlePostSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '5px' }}>Type</label>
                <select
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', color: '#111827' }}
                  value={newPost.type}
                  onChange={(e) => setNewPost({ ...newPost, type: e.target.value })}
                >
                  {activeTab === 'jobs' ? (
                    <>
                      <option value="job">Job Opportunity</option>
                      <option value="internship">Internship</option>
                    </>
                  ) : (
                    <>
                      <option value="mentorship">General Discussion</option>
                      <option value="resume_review">📄 Resume Review Offer</option>
                      <option value="interview_prep">🎤 Mock Interview / Prep</option>
                      {/* NEW ADDITIONS BELOW */}
                      <option value="career_advice">🧭 Career Path Advice</option>
                      <option value="portfolio_review">🎨 Portfolio / GitHub Review</option>
                      <option value="coffee_chat">☕ Coffee Chat / AMA</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '5px' }}>Title</label>
                <input type="text" placeholder="Title..." required
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                  value={newPost.title} onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                />
              </div>

              {activeTab === 'jobs' && (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '5px' }}>Company Name</label>
                    <input type="text" placeholder="Company..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                      value={newPost.company_name} onChange={(e) => setNewPost({ ...newPost, company_name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '5px' }}>Upload Poster (Optional)</label>
                    <input
                      type="file" accept="image/*"
                      onChange={(e) => setPosterFile(e.target.files[0])}
                      style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '13px', backgroundColor: '#f9fafb' }}
                    />
                  </div>
                </>
              )}

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '5px' }}>Description</label>
                <textarea placeholder="Details..." required rows="4"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={newPost.content} onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}></textarea>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '5px' }}>External Link (Optional)</label>
                <input type="url" placeholder="https://..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
                  value={newPost.application_link} onChange={(e) => setNewPost({ ...newPost, application_link: e.target.value })}
                />
              </div>

              <button
                type="submit"
                disabled={uploading}
                style={{
                  width: '100%', padding: '12px', marginTop: '10px', borderRadius: '8px', border: 'none',
                  backgroundColor: uploading ? '#9ca3af' : '#4c2882', color: 'white', fontWeight: 'bold', fontSize: '15px', cursor: uploading ? 'not-allowed' : 'pointer', transition: 'background 0.2s'
                }}
              >
                {uploading ? 'Uploading...' : 'Submit Post'}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AlumniDashboard;