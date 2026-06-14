import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';

const PostComments = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/discussion/comments/${postId}`);
      const data = await res.json();
      if (data.success) {
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!newComment.trim()) return;

    const finalCommentText = replyingTo ? `@${replyingTo} ${newComment}` : newComment;

    try {
      const res = await fetch('http://127.0.0.1:5000/api/discussion/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post_id: postId,
          user_id: currentUser.user_id || currentUser.id,
          content: finalCommentText
        })
      });
      const data = await res.json();
      if (data.success) {
        setNewComment(""); 
        setReplyingTo(null); 
        fetchComments();
      } else {
        alert("Error posting comment: " + data.error);
      }
    } catch (err) {
      console.error("Comment submission failed:", err);
    }
  };

  const renderCommentContent = (text) => {
    if (text.startsWith('@')) {
      const spaceIndex = text.indexOf(' ');
      if (spaceIndex !== -1) {
        const mention = text.substring(0, spaceIndex); 
        const restOfText = text.substring(spaceIndex); 
        return (
          <span>
            <strong style={{ color: '#4c2882', backgroundColor: '#f3e8ff', padding: '2px 6px', borderRadius: '4px', marginRight: '4px' }}>
              {mention}
            </strong>
            {restOfText}
          </span>
        );
      }
    }
    return text;
  };

  return (
    <div style={{ marginTop: '20px', backgroundColor: '#F9FAFB', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
      <h4 style={{fontSize: '13px', marginBottom: '15px', color: '#6B7280', textTransform: 'uppercase', fontWeight: 'bold'}}>
        Discussion Thread
      </h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '300px', overflowY: 'auto', marginBottom: '20px' }}>
        {loading ? <p style={{fontSize:'14px', color:'#9ca3af'}}>Loading...</p> : comments.length === 0 ? (
          <p style={{fontSize:'14px', color:'#9ca3af', fontStyle:'italic'}}>No comments yet.</p>
        ) : (
          comments.map(comment => {
            
            // 🛡️ BULLETPROOF DATA EXTRACTION 
            // Handles missing data gracefully if a user was deleted
            const userData = Array.isArray(comment.users) ? comment.users[0] : comment.users;
            const authorName = userData?.name || 'Student (Deleted)'; // Fallback name
            const authorRole = userData?.role || 'student';
            const isAlumni = authorRole.toLowerCase() === 'alumni';
            const avatarLetter = authorName.charAt(0).toUpperCase();

            return (
              <div key={comment.id} style={{ display: 'flex', gap: '10px' }}>
                
                {/* Avatar */}
                <div style={{ 
                  width: '32px', height: '32px', borderRadius: '50%', 
                  backgroundColor: isAlumni ? '#059669' : '#6366f1', 
                  color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 'bold', flexShrink: 0
                }}>
                  {avatarLetter}
                </div>
                
                {/* Comment Bubble */}
                <div style={{backgroundColor: 'white', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e5e7eb', width: '100%'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px'}}>
                    <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                      <span style={{fontWeight: 'bold', fontSize: '13px', color: '#374151'}}>{authorName}</span>
                      <span style={{fontSize: '10px', padding: '1px 5px', borderRadius: '4px', backgroundColor: isAlumni ? '#ecfdf5' : '#eef2ff', color: isAlumni ? '#047857' : '#4338ca'}}>
                        {isAlumni ? 'Alumni' : 'Student'}
                      </span>
                    </div>
                    
                    {/* 🛡️ USE user_id INSTEAD OF name TO CHECK FOR SELF-REPLIES */}
                    {comment.user_id !== currentUser.user_id && (
                        <button 
                            onClick={() => setReplyingTo(authorName)}
                            style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                            onMouseOver={(e) => e.currentTarget.style.color = '#4c2882'}
                            onMouseOut={(e) => e.currentTarget.style.color = '#6b7280'}
                        >
                            ↩ Reply
                        </button>
                    )}
                  </div>
                  
                  <p style={{fontSize: '14px', color: '#4b5563', margin: 0, lineHeight: '1.5'}}>
                      {renderCommentContent(comment.content)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {/* Visual indicator showing who you are replying to */}
      {replyingTo && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f3e8ff', padding: '8px 12px', borderRadius: '6px 6px 0 0', border: '1px solid #e5e7eb', borderBottom: 'none' }}>
              <span style={{ fontSize: '12px', color: '#4c2882', fontWeight: '600' }}>
                  Replying to @{replyingTo}
              </span>
              <button 
                  onClick={() => setReplyingTo(null)}
                  style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' }}
              >
                  ✕
              </button>
          </div>
      )}

      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="text" 
          placeholder={replyingTo ? `Message @${replyingTo}...` : "Write a general reply..."} 
          style={{
              ...styles.input, 
              marginBottom: 0, 
              fontSize: '14px',
              borderRadius: replyingTo ? '0 0 6px 6px' : '6px' 
          }}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
        />
        <button 
          onClick={handleSubmit}
          style={{...styles.primaryButton, width: 'auto', whiteSpace: 'nowrap', padding: '8px 16px', fontSize: '14px'}}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default PostComments;