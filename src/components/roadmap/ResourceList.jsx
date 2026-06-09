// ============================================================================
// FILE: src/components/roadmap/ResourceList.jsx
// PURPOSE: Display learning resources for a skill
// DESCRIPTION: Shows free and paid resources with links to external platforms
// ============================================================================

import React, { useState } from 'react';
import { styles } from '../../styles/styles';
import { useAuth } from '../../context/AuthContext';

const ResourceList = ({ resources }) => {
  const { user } = useAuth();
  const [reportState, setReportState] = useState({});

  const handleReportSubmit = async (e, resourceId, title) => {
    e.preventDefault();
    if (!user) return;
    const state = reportState[resourceId];
    if (!state) return;

    try {
        await fetch('http://127.0.0.1:5000/api/quality/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.user_id || user.id,
                user_role: 'student',
                target_type: 'verified_resource',
                target_id: resourceId,
                target_name: title,
                feedback_type: state.reason,
                suggested_alternative_text: state.text
            })
        });
        alert('Report submitted to admins. Thank you!');
        setReportState(prev => ({ ...prev, [resourceId]: { ...prev[resourceId], show: false, text: '' } }));
    } catch(err) {
        console.error(err);
        alert('Failed to submit report');
    }
  };

  const toggleReport = (id) => {
      setReportState(prev => ({
          ...prev,
          [id]: { show: !prev[id]?.show, reason: prev[id]?.reason || 'broken_link', text: prev[id]?.text || '' }
      }));
  };

  const updateReportField = (id, field, value) => {
      setReportState(prev => ({
          ...prev,
          [id]: { ...prev[id], [field]: value }
      }));
  };

  // --- HELPER: Extract YouTube ID ---
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Handle case where no resources are available
  if (!resources || resources.length === 0) {
    return (
      <div style={styles.resourceList}>
        <h4 style={{ marginBottom: '15px', color: '#374151' }}>
          📖 Learning Resources
        </h4>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>
          No resources available yet. Check back soon or search online for materials!
        </p>
      </div>
    );
  }

  return (
    <div style={styles.resourceList}>
      <h4 style={{ marginBottom: '15px', color: '#374151' }}>
        📖 Learning Resources ({resources.length})
      </h4>
      
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>
        We've curated these resources to help you master this skill:
      </p>

      {/* Map through all resources and display them */}
      {resources.map((resource, index) => {
        const ytId = getYouTubeId(resource.url);
        // Fallback for missing thumbnails: derive from YouTube if possible, otherwise UI-avatar
        const thumb = ytId 
            ? `https://img.youtube.com/vi/${ytId}/mqdefault.jpg` 
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(resource.provider)}&background=random&color=fff`;

        const rState = reportState[resource.resource_id] || {};

        return (
          <div key={resource.resource_id || index} style={{
            ...styles.resourceItem,
            flexDirection: 'column',
            alignItems: 'stretch',
            gap: '15px',
            padding: '20px'
          }}>
            {/* TOP ROW: ICON + TITLE + BADGES */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <img 
                  src={thumb} 
                  alt={resource.title}
                  style={{
                    width: '100px',
                    height: '75px',
                    borderRadius: '8px',
                    objectFit: 'cover',
                    border: '1px solid #e5e7eb',
                    backgroundColor: '#f3f4f6'
                  }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/100x75?text=Resource'; }}
                />

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <strong style={{ color: '#111827', display: 'block', fontSize: '16px', marginBottom: '6px' }}>
                        {resource.title}
                    </strong>
                    <button onClick={() => toggleReport(resource.resource_id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '11px', color: '#ef4444', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#fef2f2' }} title="Report Broken Link">⚠️ Report</button>
                  </div>
                  
                  <div style={{ ...styles.resourceMeta, marginTop: '0' }}>
                    <span style={{ fontSize: '12px', fontWeight: '600' }}>{ytId ? '🎬 YouTube' : `📚 ${resource.provider}`}</span>
                    <span style={{
                      ...styles.costBadge,
                      backgroundColor: resource.cost_type === 'free' ? '#10b981' : '#f59e0b',
                      fontSize: '11px',
                      padding: '2px 8px'
                    }}>
                      {resource.cost_type === 'free' ? 'FREE' : 'PAID'}
                    </span>
                  </div>
                </div>

                <a 
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    ...styles.resourceLink,
                    backgroundColor: '#f3f4f6',
                    color: '#4b5563',
                    padding: '8px 14px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '13px',
                    border: '1px solid #d1d5db'
                  }}
                >
                  Visit Link ↗
                </a>
            </div>

            {rState.show && (
                <form onSubmit={(e) => handleReportSubmit(e, resource.resource_id, resource.title)} style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', padding: '15px', borderRadius: '8px', marginTop: '10px' }}>
                    <h4 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '13px' }}>Report an Issue with this Resource</h4>
                    <select value={rState.reason || 'broken_link'} onChange={(e) => updateReportField(resource.resource_id, 'reason', e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '12px' }}>
                        <option value="broken_link">The link is broken or gives a 404 error</option>
                        <option value="outdated_content">The content is outdated</option>
                        <option value="better_alternative">I know a better resource</option>
                    </select>
                    <textarea required value={rState.text || ''} onChange={(e) => updateReportField(resource.resource_id, 'text', e.target.value)} placeholder="Provide brief details..." style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #fca5a5', fontSize: '12px', marginBottom: '10px', fontFamily: 'inherit', resize: 'vertical' }} />
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button type="submit" style={{ background: '#dc2626', color: 'white', padding: '6px 12px', borderRadius: '6px', border: 'none', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Submit Report</button>
                        <button type="button" onClick={() => toggleReport(resource.resource_id)} style={{ background: 'transparent', color: '#dc2626', padding: '6px 12px', borderRadius: '6px', border: '1px solid #dc2626', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                    </div>
                </form>
            )}

            {/* IF YOUTUBE: SHOW EMBEDDED PLAYER */}
            {ytId && (
                <div style={{ 
                    marginTop: '10px', 
                    borderRadius: '12px', 
                    overflow: 'hidden', 
                    aspectRatio: '16/9',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                    <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${ytId}`}
                        title={resource.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
            )}
          </div>
        );
      })}

      {/* Additional help text */}
      <div style={{
        marginTop: '15px',
        padding: '12px',
        backgroundColor: '#f0fdf4',
        borderRadius: '6px',
        fontSize: '13px',
        color: '#166534'
      }}>
        <strong>💡 Pro Tip:</strong> Start with free resources first. 
        If you need more in-depth content, consider the paid options.
      </div>
    </div>
  );
};

export default ResourceList;