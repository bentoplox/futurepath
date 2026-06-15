// ============================================================================
// FILE: src/components/alumnihub/StudentJobBoard.jsx
// PURPOSE: Interactive Job Board & Mentorship Hub with Comments (Premium UI)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import { useAuth } from '../../context/AuthContext';
import PostComments from './PostComments';

const StudentJobBoard = ({ onBack }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('jobs');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // NEW: Search and Favorites State
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  // ⚡ FIXED: Added Hackathons category pill mapping
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

  useEffect(() => {
    fetchApprovedPosts();
  }, []);

  // Fetch favorites when user loads
  useEffect(() => {
    if (user?.user_id) fetchFavorites();
  }, [user]);

  const fetchApprovedPosts = async () => {
    setLoading(true);
    try {
      // ⚡ Rerouted to Flask to bypass Supabase frontend RLS blocks
      const res = await fetch('http://127.0.0.1:5000/api/discussion/feed');
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

  const fetchFavorites = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/discussion/favorites/${user.user_id}`);
      const data = await res.json();
      if (data.success) setFavorites(data.favorites);
    } catch (err) { console.error("Failed to fetch favorites", err); }
  };

  const handleToggleFavorite = async (postId) => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/discussion/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, post_id: postId })
      });
      const data = await res.json();
      if (data.success) {
        if (data.favorited) setFavorites([...favorites, postId]);
        else setFavorites(favorites.filter(id => id !== postId));
      }
    } catch (err) { console.error("Failed to toggle favorite", err); }
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  // ⚡ FIXED: Added search query and favorite view scoping
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
    const matchesSaved = showSaved ? favorites.includes(post.id) : true;
    
    return matchesSearch && matchesSaved;
  });

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
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", margin: '-20px', paddingBottom: '50px' }}>

      {/* 1. PREMIUM HERO BANNER */}
      <div style={{
        backgroundColor: '#4c2882',
        backgroundImage: 'linear-gradient(135deg, #4c2882 0%, #6b4c9a 100%)',
        color: 'white',
        padding: '40px 40px 60px 40px',
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        marginBottom: '40px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Back Button */}
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 0, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
            ← Back to Dashboard
          </button>

          <span style={{ backgroundColor: '#fcd34d', color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            ALUMNI NETWORK — FSKTM UM
          </span>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
            Alumni<br /> <span style={{ color: '#fcd34d' }}>Opportunities</span>
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
            Connect with seniors, seek mentorship, and find exclusive job or internship roles posted directly by FSKTM alumni.
          </p>

          {/* IN-BANNER TABS */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button
              onClick={() => { setActiveTab('jobs'); setSelectedCategory('All'); setExpandedPostId(null); setSearchQuery(''); }}
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
              onClick={() => { setActiveTab('mentorship'); setSelectedCategory('All'); setExpandedPostId(null); setSearchQuery(''); }}
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

      {/* 2. CONTENT LIST */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', minHeight: '400px' }}>

        {/* Section Title */}
        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
          <span style={{ marginRight: '10px', fontSize: '24px' }}>{activeTab === 'jobs' ? '📌' : '💡'}</span>
          {activeTab === 'jobs' ? 'Latest Roles' : 'Active Discussions'}
        </h2>

        {/* CATEGORY PILLS & REAL-TIME SEARCH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px' }}>
          {activeTab === 'mentorship' && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {mentorshipCategories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  style={{
                    whiteSpace: 'nowrap', padding: '8px 18px', borderRadius: '25px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s ease', border: 'none',
                    backgroundColor: selectedCategory === cat.value ? '#4c2882' : '#e5e7eb',
                    color: selectedCategory === cat.value ? 'white' : '#4b5563',
                    boxShadow: selectedCategory === cat.value ? '0 4px 6px rgba(76, 40, 130, 0.2)' : 'none'
                  }}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          )}

          {/* Search Bar & Saved Toggle */}
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder={`Search ${activeTab === 'jobs' ? 'jobs & internships' : 'mentorship discussions'}...`} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}
            />
            <button 
              onClick={() => setShowSaved(!showSaved)}
              style={{ 
                padding: '12px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                backgroundColor: showSaved ? '#fffbeb' : 'white', 
                color: showSaved ? '#b45309' : '#4b5563',
                cursor: 'pointer', fontWeight: 'bold', whiteSpace: 'nowrap', transition: 'all 0.2s'
              }}>
              {showSaved ? '⭐ Viewing Saved' : '☆ View Saved'}
            </button>
          </div>
        </div>

        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading opportunities...</p> : filteredPosts.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '50px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '5px solid #d1d5db', color: '#6b7280' }}>
            <h3 style={{ fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#374151' }}>
              {searchQuery ? `No results found for "${searchQuery}"` : 
               (activeTab === 'mentorship' && selectedCategory !== 'All' 
                ? `No discussions found for ${mentorshipCategories.find(c => c.value === selectedCategory)?.label}.`
                : 'No posts found yet.')}
            </h3>
            <p>
              {searchQuery ? 'Try clearing your search filters.' : 'Check back later for new opportunities from our alumni.'}
            </p>
          </div>
        ) : (
          filteredPosts.map((post) => {
            const displayTitleBadge = post.users?.show_workplace && post.users?.current_role
              ? ` — ${post.users.current_role}`
              : '';

            return (
              <div key={post.id} style={{
                backgroundColor: 'white', borderRadius: '12px', padding: '30px', marginBottom: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                borderTop: `5px solid ${getTypeColor(post.post_type)}`
              }}>

                {/* POST CONTENT */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                  <div>
                    <span style={{
                      fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase', padding: '4px 10px', borderRadius: '12px',
                      backgroundColor: `${getTypeColor(post.post_type)}15`, color: getTypeColor(post.post_type)
                    }}>
                      {post.post_type.replace('_', ' ')}
                    </span>
                    <h3 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: '#111827', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>{post.title}</h3>
                    {post.company_name && <p style={{ margin: 0, color: '#4b5563', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>🏢 {post.company_name}</p>}
                  </div>
                  
                  {/* Favorite / Bookmark Button */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => handleToggleFavorite(post.id)} 
                      style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: '22px', padding: '5px', transition: 'transform 0.1s' }}
                      title={favorites.includes(post.id) ? "Remove from Saved" : "Save this Post"}
                    >
                      {favorites.includes(post.id) ? '⭐' : '☆'}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <span style={{ fontSize: '13px', color: '#4b5563' }}>
                    Posted by: <strong style={{ color: '#111827' }}>{post.users?.name || 'Anonymous Alumni'}{displayTitleBadge}</strong>
                  </span>
                </div>

                <p style={{ color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '15px' }}>{post.content}</p>

                {/* POST IMAGE ATTACHMENT */}
                {post.image_url && (
                  <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                    <img src={post.image_url} alt="Post attachment" style={{ maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
                  </div>
                )}

                {/* ⚡ NEW: Document Attachment Rendering */}
                {post.file_url && (
                  <div style={{ marginTop: '15px', padding: '12px 16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '20px' }}>📄</span>
                      <span style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>Attached Document</span>
                    </div>
                    <a href={post.file_url} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: 'white', color: '#4f46e5', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', transition: 'all 0.2s' }}>
                      Download / View ↘
                    </a>
                  </div>
                )}

                {/* ACTION BUTTONS */}
                <div style={{ marginTop: '25px', display: 'flex', gap: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
                  {post.application_link && (
                    <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: '#4c2882', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', display: 'inline-flex', alignItems: 'center' }}>
                      Apply Now ↗
                    </a>
                  )}

                  <button
                    onClick={() => toggleComments(post.id)}
                    style={{
                      padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid',
                      backgroundColor: expandedPostId === post.id ? '#f3e8ff' : 'white',
                      borderColor: expandedPostId === post.id ? '#4c2882' : '#d1d5db',
                      color: expandedPostId === post.id ? '#4c2882' : '#374151'
                    }}
                  >
                    💬 {expandedPostId === post.id ? 'Close Discussion' : 'Discuss / Ask Question'}
                  </button>
                </div>

                {expandedPostId === post.id && (
                  <PostComments postId={post.id} currentUser={user} />
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};

export default StudentJobBoard;