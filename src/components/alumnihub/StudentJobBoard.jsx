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

  useEffect(() => {
    fetchApprovedPosts();
  }, []);

  const fetchApprovedPosts = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('alumni_posts')
      .select('*, users(name)')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) console.error("Error fetching posts:", error);
    else setPosts(data || []);
    setLoading(false);
  };

  const toggleComments = (postId) => {
    setExpandedPostId(expandedPostId === postId ? null : postId);
  };

  const filteredPosts = posts.filter(post => {
    if (activeTab === 'jobs') {
      return post.post_type === 'job' || post.post_type === 'internship';
    } else {
      // Added the new types to this list!
      return ['mentorship', 'resume_review', 'interview_prep', 'career_advice', 'portfolio_review', 'coffee_chat'].includes(post.post_type);
    }
  });

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
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: '"Segoe UI", Roboto, "Helvetica Neue", sans-serif', margin: '-20px', paddingBottom: '50px' }}>

      {/* 1. PREMIUM HERO BANNER (Matches Employability UI) */}
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
        {/* Decorative Circle Background */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '300px', height: '300px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>

        <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Back Button */}
          <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.8)', cursor: 'pointer', padding: 0, marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px', fontWeight: '500', transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'white'} onMouseOut={(e) => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}>
            ← Back to Dashboard
          </button>

          <span style={{ backgroundColor: '#fcd34d', color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            ALUMNI NETWORK — FSKTM UM
          </span>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: 'Georgia, serif' }}>
            Alumni<br /><span style={{ color: '#fcd34d' }}>Opportunities</span>
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
            Connect with seniors, seek mentorship, and find exclusive job or internship roles posted directly by FSKTM alumni.
          </p>

          {/* IN-BANNER TABS (Pill Style) */}
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

      {/* 2. CONTENT LIST */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 20px', minHeight: '400px' }}>

        {/* Section Title */}
        <h2 style={{ fontSize: '20px', color: '#333', marginBottom: '20px', display: 'flex', alignItems: 'center', fontWeight: 'bold', fontFamily: 'Georgia, serif' }}>
          <span style={{ marginRight: '10px', fontSize: '24px' }}>{activeTab === 'jobs' ? '📌' : '💡'}</span>
          {activeTab === 'jobs' ? 'Latest Roles' : 'Active Discussions'}
        </h2>

        {loading ? <p style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading opportunities...</p> : filteredPosts.length === 0 ? (
          <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '50px', textAlign: 'center', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '5px solid #d1d5db', color: '#6b7280' }}>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#374151' }}>No posts found yet.</h3>
            <p>Check back later for new opportunities from our alumni.</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '30px',
              marginBottom: '20px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
              borderTop: `5px solid ${getTypeColor(post.post_type)}` // Dynamic Color Border!
            }}>

              {/* POST CONTENT */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <span style={{
                    fontSize: '11px', fontWeight: 'bold', letterSpacing: '0.5px', textTransform: 'uppercase',
                    padding: '4px 10px', borderRadius: '12px',
                    backgroundColor: `${getTypeColor(post.post_type)}15`, // Light transparent background
                    color: getTypeColor(post.post_type)
                  }}>
                    {post.post_type.replace('_', ' ')}
                  </span>
                  <h3 style={{ margin: '10px 0 5px 0', fontSize: '22px', color: '#111827', fontFamily: 'Georgia, serif' }}>{post.title}</h3>
                  {post.company_name && <p style={{ margin: 0, color: '#4b5563', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>🏢 {post.company_name}</p>}
                </div>
                <span style={{ fontSize: '13px', color: '#9ca3af', fontWeight: '500' }}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <span style={{ fontSize: '13px', color: '#4b5563' }}>
                  Posted by: <strong style={{ color: '#111827' }}>{post.users?.name || 'Alumni'}</strong>
                </span>
              </div>

              <p style={{ color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.7', fontSize: '15px' }}>{post.content}</p>

              {/* ACTION BUTTONS */}
              <div style={{ marginTop: '25px', display: 'flex', gap: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
                {post.application_link && (
                  <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{
                    backgroundColor: '#4c2882', color: 'white', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '600', transition: 'background 0.2s'
                  }}>
                    {activeTab === 'jobs' ? 'Apply Now ↗' : 'View Link ↗'}
                  </a>
                )}

                {/* TOGGLE COMMENTS BUTTON */}
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

              {/* IMPORTED COMMENT SECTION */}
              {expandedPostId === post.id && (
                <PostComments postId={post.id} currentUser={user} />
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default StudentJobBoard;