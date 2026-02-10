// ============================================================================
// FILE: src/components/dashboard/StudentJobBoard.jsx
// PURPOSE: Interactive Job Board & Mentorship Hub with Comments
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import { useAuth } from '../../context/AuthContext';

const StudentJobBoard = ({ onBack }) => {
  const { user } = useAuth(); // Get current user for commenting
  const [activeTab, setActiveTab] = useState('jobs');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- COMMENT STATE ---
  const [expandedPostId, setExpandedPostId] = useState(null); // Which post is open?
  const [comments, setComments] = useState([]); // Comments for the open post
  const [newComment, setNewComment] = useState(""); // Input field value
  const [commentLoading, setCommentLoading] = useState(false);

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

  // --- COMMENT FUNCTIONS ---

  // 1. Toggle the comment section for a specific post
  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null); // Close if already open
      setComments([]);
    } else {
      setExpandedPostId(postId); // Open this one
      fetchComments(postId);
    }
  };

  // 2. Fetch comments from database
  const fetchComments = async (postId) => {
    setCommentLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, users(name, role)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true }); // Oldest first (like a chat)

    if (!error) setComments(data);
    setCommentLoading(false);
  };

  // 3. Submit a new comment
  const handleSubmitComment = async (postId) => {
    if (!newComment.trim()) return;

    const { error } = await supabase.from('post_comments').insert([
      {
        post_id: postId,
        user_id: user.user_id,
        content: newComment
      }
    ]);

    if (error) {
      alert("Error posting comment: " + error.message);
    } else {
      setNewComment(""); // Clear input
      fetchComments(postId); // Refresh list
    }
  };

  // Filter posts based on tab
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'jobs') return post.post_type === 'job' || post.post_type === 'internship';
    return ['mentorship', 'resume_review', 'interview_prep'].includes(post.post_type);
  });

  const getBadgeStyle = (type) => {
    switch (type) {
      case 'job': return { ...styles.postTypeBadge, ...styles.badgeJob };
      case 'internship': return { ...styles.postTypeBadge, ...styles.badgeIntern };
      case 'resume_review': return { ...styles.postTypeBadge, backgroundColor: '#db2777' };
      case 'interview_prep': return { ...styles.postTypeBadge, backgroundColor: '#7c3aed' };
      default: return { ...styles.postTypeBadge, ...styles.badgeMentor };
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      
      {/* HEADER */}
      <div style={{ marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <button onClick={onBack} style={styles.secondaryButton}>← Back to Dashboard</button>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Alumni Opportunities</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Connect with seniors and find your next role.</p>
        </div>
      </div>

      {/* TABS */}
      <div style={styles.tabContainer}>
        <button 
            onClick={() => { setActiveTab('jobs'); setExpandedPostId(null); }}
            style={{ ...styles.tabButton, ...(activeTab === 'jobs' ? styles.activeTab : {}) }}
        >
            💼 Job Board
        </button>
        <button 
            onClick={() => { setActiveTab('mentorship'); setExpandedPostId(null); }}
            style={{ ...styles.tabButton, ...(activeTab === 'mentorship' ? styles.activeTab : {}) }}
        >
            💬 Mentorship Hub
        </button>
      </div>

      {/* LIST */}
      <div style={{ minHeight: '400px' }}>
        {loading ? <p style={{textAlign:'center', padding:'40px'}}>Loading opportunities...</p> : filteredPosts.length === 0 ? (
          <div style={{...styles.postCard, textAlign: 'center', padding: '50px', color: '#6b7280'}}>
            <h3>No posts found yet.</h3>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <div key={post.id} style={styles.postCard}>
              {/* POST CONTENT */}
              <div style={styles.postHeader}>
                <div>
                  <span style={getBadgeStyle(post.post_type)}>{post.post_type.replace('_', ' ')}</span>
                  <h3 style={styles.postTitle}>{post.title}</h3>
                  {post.company_name && <p style={styles.postCompany}>🏢 {post.company_name}</p>}
                </div>
                <span style={{fontSize: '12px', color: '#9ca3af'}}>
                    {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>
              
              <div style={{marginBottom:'15px'}}>
                <span style={{fontSize: '12px', background:'#f3f4f6', padding:'4px 8px', borderRadius:'4px', color:'#4b5563'}}>
                  Posted by: <strong>{post.users?.name || 'Alumni'}</strong>
                </span>
              </div>

              <p style={{color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.6'}}>{post.content}</p>

              {/* ACTION BUTTONS */}
              <div style={{marginTop: '20px', display: 'flex', gap: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '15px'}}>
                {post.application_link && (
                  <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{...styles.primaryButton, display: 'inline-block', width: 'auto', textDecoration:'none', fontSize:'14px'}}>
                    {activeTab === 'jobs' ? 'Apply Now ↗' : 'View Link ↗'}
                  </a>
                )}
                
                {/* TOGGLE COMMENTS BUTTON */}
                <button 
                  onClick={() => toggleComments(post.id)}
                  style={{
                    ...styles.secondaryButton, 
                    display: 'flex', alignItems: 'center', gap: '8px',
                    backgroundColor: expandedPostId === post.id ? '#eef2ff' : 'white',
                    borderColor: expandedPostId === post.id ? '#6366f1' : '#d1d5db'
                  }}
                >
                  💬 {expandedPostId === post.id ? 'Close Discussion' : 'Discuss / Ask Question'}
                </button>
              </div>

              {/* COMMENT SECTION (Only shows if expanded) */}
              {expandedPostId === post.id && (
                <div style={{ marginTop: '20px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px' }}>
                  <h4 style={{fontSize: '14px', marginBottom: '15px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold'}}>Discussion Thread</h4>
                  
                  {/* COMMENT LIST */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                    {commentLoading ? <p style={{fontSize:'14px', color:'#9ca3af'}}>Loading comments...</p> : comments.length === 0 ? (
                      <p style={{fontSize:'14px', color:'#9ca3af', fontStyle:'italic'}}>No comments yet. Be the first to ask!</p>
                    ) : (
                      comments.map(comment => (
                        <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                          <div style={{ 
                            width: '32px', height: '32px', borderRadius: '50%', 
                            backgroundColor: comment.users?.role === 'alumni' ? '#059669' : '#6366f1', 
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                          }}>
                            {comment.users?.name.charAt(0)}
                          </div>
                          <div>
                            <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                              <span style={{fontWeight: 'bold', fontSize: '14px', color: '#374151'}}>{comment.users?.name}</span>
                              <span style={{fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#e5e7eb', color: '#6b7280'}}>
                                {comment.users?.role === 'alumni' ? 'Alumni' : 'Student'}
                              </span>
                            </div>
                            <p style={{fontSize: '14px', color: '#4b5563', marginTop: '2px'}}>{comment.content}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* INPUT AREA */}
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Type your question or reply..." 
                      style={{...styles.input, marginBottom: 0}}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                    />
                    <button 
                      onClick={() => handleSubmitComment(post.id)}
                      style={{...styles.primaryButton, width: 'auto', whiteSpace: 'nowrap'}}
                    >
                      Send ↵
                    </button>
                  </div>
                </div>
              )}

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default StudentJobBoard;