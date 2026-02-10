// ============================================================================
// FILE: src/components/dashboard/AlumniDashboard.jsx
// PURPOSE: Alumni Dashboard with Image Upload Capability
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';

const AlumniDashboard = ({ user, onLogout }) => {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState('jobs');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Comment System State
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Form State
  const [newPost, setNewPost] = useState({ 
    title: '', content: '', type: 'job', company_name: '', application_link: '' 
  });
  // NEW: State for the image file
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

  // --- COMMENT LOGIC ---
  const toggleComments = async (postId) => {
    if (expandedPostId === postId) {
      setExpandedPostId(null);
      setComments([]);
    } else {
      setExpandedPostId(postId);
      fetchComments(postId);
    }
  };

  const fetchComments = async (postId) => {
    setCommentLoading(true);
    const { data, error } = await supabase
      .from('post_comments')
      .select('*, users(name, role)')
      .eq('post_id', postId)
      .order('created_at', { ascending: true });

    if (!error) setComments(data);
    setCommentLoading(false);
  };

  const handleSubmitComment = async (postId) => {
    if (!newComment.trim()) return;

    const { error } = await supabase.from('post_comments').insert([
      { post_id: postId, user_id: user.user_id, content: newComment }
    ]);

    if (error) alert("Error posting comment: " + error.message);
    else {
      setNewComment("");
      fetchComments(postId);
    }
  };

  // --- FILTER & SUBMIT LOGIC ---
  const filteredPosts = posts.filter(post => {
    if (activeTab === 'jobs') {
        return post.post_type === 'job' || post.post_type === 'internship';
    } else {
        return ['mentorship', 'resume_review', 'interview_prep'].includes(post.post_type);
    }
  });

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert('You must be logged in');
    
    setUploading(true);
    let finalImageUrl = null;

    // 1. Upload Image (if selected)
    if (posterFile) {
      const fileExt = posterFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`; // Create unique name
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('post_images')
        .upload(filePath, posterFile);

      if (uploadError) {
        alert('Error uploading image: ' + uploadError.message);
        setUploading(false);
        return;
      }

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('post_images')
        .getPublicUrl(filePath);
      
      finalImageUrl = publicUrl;
    }

    // 2. Save Post Data
    const { error } = await supabase.from('alumni_posts').insert([{
        author_id: user.user_id, 
        title: newPost.title,
        content: newPost.content,
        post_type: newPost.type,
        company_name: ['mentorship', 'resume_review', 'interview_prep'].includes(newPost.type) ? null : newPost.company_name,
        application_link: newPost.application_link,
        image_url: finalImageUrl, // <--- Save the image URL here
        status: 'pending'
    }]);

    setUploading(false);

    if (error) {
      alert("Error: " + error.message);
    } else {
      alert('Post submitted! Pending Admin approval.');
      setNewPost({ title: '', content: '', type: activeTab === 'jobs' ? 'job' : 'mentorship', company_name: '', application_link: '' });
      setPosterFile(null); // Reset file input
      fetchPosts();
    }
  };

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
    <div style={styles.appContainer}>
      
      {/* HEADER */}
      <div style={{ ...styles.header, backgroundColor: '#059669' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
           <span style={{ fontSize: '24px' }}>🎓</span>
           <h1 style={{ margin: 0, fontSize: '18px' }}>FuturePath Alumni</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ color: 'white', fontWeight: '500' }}>{user.name}</span>
            <button onClick={onLogout} style={{ ...styles.logoutButton, background: 'rgba(255,255,255,0.2)', color:'white', border:'1px solid rgba(255,255,255,0.5)' }}>Logout</button>
        </div>
      </div>

      <div style={styles.dashboardContainer}>
        <div style={{marginBottom: '20px'}}>
          <h1 style={{fontSize: '28px', color: '#111827', marginBottom: '5px'}}>Welcome, {user.name}!</h1>
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

        <div style={styles.dashboardGrid}>
          
          {/* === LEFT COLUMN: FEED === */}
          <div style={styles.feedSection}>
            <h2 style={{...styles.widgetTitle, borderBottom: 'none'}}>
                {activeTab === 'jobs' ? 'Latest Job & Internship Openings' : 'Mentorship Discussions'}
            </h2>
            
            {loading ? <p>Loading...</p> : filteredPosts.length === 0 ? (
              <div style={{...styles.postCard, textAlign: 'center', padding: '40px', color: '#9ca3af'}}>
                 No posts found.
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div key={post.id} style={styles.postCard}>
                  {/* POST HEADER */}
                  <div style={styles.postHeader}>
                    <div>
                      <span style={getBadgeStyle(post.post_type)}>
                        {post.post_type.replace('_', ' ')}
                      </span>
                      <h3 style={styles.postTitle}>{post.title}</h3>
                      {post.company_name && <p style={styles.postCompany}>🏢 {post.company_name}</p>}
                    </div>
                    {/* Status Badge */}
                    {post.author_id === user.user_id && (
                      <span style={{
                        fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                        border: post.status === 'approved' ? '1px solid #10b981' : '1px solid #f59e0b',
                        color: post.status === 'approved' ? '#047857' : '#b45309',
                        backgroundColor: post.status === 'approved' ? '#ecfdf5' : '#fffbeb'
                      }}>
                        {post.status.toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <p style={{fontSize: '12px', color: '#9ca3af', marginBottom: '10px'}}>
                    Posted by: {post.users?.name || 'Alumni'} • {new Date(post.created_at).toLocaleDateString()}
                  </p>
                  
                  {/* POST CONTENT */}
                  <p style={{color: '#374151', whiteSpace: 'pre-line', lineHeight: '1.5'}}>{post.content}</p>

                  {/* DISPLAY IMAGE IF EXISTS */}
                  {post.image_url && (
                    <div style={{marginTop: '15px', marginBottom: '15px'}}>
                      <img 
                        src={post.image_url} 
                        alt="Post attachment" 
                        style={{maxWidth: '100%', maxHeight: '400px', borderRadius: '8px', border: '1px solid #e5e7eb'}} 
                      />
                    </div>
                  )}
                  
                  {/* ACTION BAR */}
                  <div style={{marginTop: '20px', display: 'flex', gap: '15px', borderTop: '1px solid #f3f4f6', paddingTop: '15px'}}>
                      {post.application_link && (
                        <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{...styles.link, display: 'inline-block', fontWeight: '600'}}>
                          {activeTab === 'jobs' ? 'Apply Now →' : 'View Link →'}
                        </a>
                      )}
                      
                      <button 
                        onClick={() => toggleComments(post.id)}
                        style={{
                            ...styles.secondaryButton, 
                            marginLeft: 'auto',
                            backgroundColor: expandedPostId === post.id ? '#eef2ff' : 'white',
                            borderColor: expandedPostId === post.id ? '#6366f1' : '#d1d5db',
                            fontSize: '13px',
                            padding: '6px 12px'
                        }}
                      >
                        💬 {expandedPostId === post.id ? 'Close Thread' : 'View Discussion'}
                      </button>
                  </div>

                  {/* COMMENT SECTION */}
                  {expandedPostId === post.id && (
                    <div style={{ marginTop: '20px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                      <h4 style={{fontSize: '13px', marginBottom: '15px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold'}}>
                        Discussion Thread
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
                        {commentLoading ? <p style={{fontSize:'14px', color:'#9ca3af'}}>Loading...</p> : comments.length === 0 ? (
                          <p style={{fontSize:'14px', color:'#9ca3af', fontStyle:'italic'}}>No comments yet.</p>
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
                              <div style={{backgroundColor: 'white', padding: '8px 12px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%'}}>
                                <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '2px'}}>
                                  <span style={{fontWeight: 'bold', fontSize: '13px', color: '#374151'}}>{comment.users?.name}</span>
                                  <span style={{fontSize: '10px', padding: '1px 5px', borderRadius: '4px', backgroundColor: comment.users?.role === 'alumni' ? '#ecfdf5' : '#eef2ff', color: comment.users?.role === 'alumni' ? '#047857' : '#4338ca'}}>
                                    {comment.users?.role === 'alumni' ? 'Alumni' : 'Student'}
                                  </span>
                                </div>
                                <p style={{fontSize: '14px', color: '#4b5563', margin: 0}}>{comment.content}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '10px' }}>
                        <input 
                          type="text" 
                          placeholder="Write a reply..." 
                          style={{...styles.input, marginBottom: 0, fontSize: '14px'}}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSubmitComment(post.id)}
                        />
                        <button 
                          onClick={() => handleSubmitComment(post.id)}
                          style={{...styles.primaryButton, width: 'auto', whiteSpace: 'nowrap', padding: '8px 16px', fontSize: '14px'}}
                        >
                          Reply
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* === RIGHT COLUMN: SIDEBAR FORM === */}
          <div style={styles.sidebarSection}>
            <div style={styles.sidebarWidget}>
              <h3 style={{...styles.widgetTitle, color: '#059669', fontSize: '16px'}}>
                  {activeTab === 'jobs' ? '📢 Post an Opportunity' : '🗣️ Start a Discussion'}
              </h3>
              <form onSubmit={handlePostSubmit} style={styles.form}>
                
                <div style={styles.inputGroup}>
                  <label style={styles.label}>Type</label>
                  <select style={styles.input} value={newPost.type} onChange={(e) => setNewPost({...newPost, type: e.target.value})}>
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
                        </>
                    )}
                  </select>
                </div>

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Title</label>
                  <input type="text" placeholder="Title..." required style={styles.input} value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} />
                </div>

                {activeTab === 'jobs' && (
                  <>
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Company Name</label>
                        <input type="text" placeholder="Company..." style={styles.input} value={newPost.company_name} onChange={(e) => setNewPost({...newPost, company_name: e.target.value})} />
                    </div>
                    {/* NEW: IMAGE UPLOAD */}
                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Upload Poster (Optional)</label>
                        <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => setPosterFile(e.target.files[0])}
                            style={{...styles.input, padding: '8px'}} 
                        />
                    </div>
                  </>
                )}

                <div style={styles.inputGroup}>
                  <label style={styles.label}>Description</label>
                  <textarea placeholder="Details..." required rows="3" style={{...styles.input, fontFamily: 'inherit'}} value={newPost.content} onChange={(e) => setNewPost({...newPost, content: e.target.value})}></textarea>
                </div>

                 <div style={styles.inputGroup}>
                   <label style={styles.label}>Link (Optional)</label>
                   <input type="url" placeholder="https://..." style={styles.input} value={newPost.application_link} onChange={(e) => setNewPost({...newPost, application_link: e.target.value})} />
                 </div>

                <button 
                    type="submit" 
                    disabled={uploading}
                    style={{...styles.button, backgroundColor: uploading ? '#6b7280' : '#059669', marginTop: '10px'}}
                >
                  {uploading ? 'Uploading...' : 'Submit Post'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AlumniDashboard;