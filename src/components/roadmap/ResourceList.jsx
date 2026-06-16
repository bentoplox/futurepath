// ============================================================================
// FILE: src/components/roadmap/ResourceList.jsx
// PURPOSE: Styled resource items matching the Gamified UI
// ============================================================================

import React, { useState } from 'react';
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
    } catch (err) {
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

  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  if (!resources || resources.length === 0) {
    return <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>No curated resources available yet.</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {resources.map((resource, index) => {
        const ytId = getYouTubeId(resource.url);
        // Clean provider name for icon
        const pName = resource.provider ? resource.provider.substring(0, 2).toUpperCase() : 'RE';
        const rState = reportState[resource.resource_id] || {};

        return (
          <div key={resource.resource_id || index}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '20px',
              padding: '20px',
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}>

              {/* Logo / Thumbnail Box */}
              <div style={{
                width: '80px', height: '80px', borderRadius: '12px', flexShrink: 0,
                backgroundColor: ytId ? '#ef4444' : '#1e1b4b', // Red for YT, Dark for others
                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', fontSize: '24px', fontWeight: '800', letterSpacing: '1px'
              }}>
                {ytId ? '▶' : pName}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <strong style={{ color: '#111827', fontSize: '18px', fontWeight: '800' }}>
                    {resource.title}
                  </strong>
                  <span style={{
                    backgroundColor: resource.cost_type === 'free' ? '#d1fae5' : '#fef3c7',
                    color: resource.cost_type === 'free' ? '#059669' : '#d97706',
                    fontSize: '10px', fontWeight: '800', padding: '2px 8px', borderRadius: '12px', textTransform: 'uppercase'
                  }}>
                    {resource.cost_type === 'free' ? 'FREE' : 'PAID'}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', fontSize: '13px', color: '#6b7280', fontWeight: '500' }}> 
                  <span>🔗 {ytId ? 'YouTube' : resource.provider}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                <a
                  href={resource.url} target="_blank" rel="noopener noreferrer"
                  style={{ backgroundColor: '#f3f4f6', color: '#374151', padding: '8px 16px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '700', border: '1px solid #d1d5db' }}
                >
                  Visit Link ↗
                </a>
                <button onClick={() => toggleReport(resource.resource_id)} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Report Issue
                </button>
              </div>
            </div>

            {/* Hidden Report Form */}
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
          </div>
        );
      })}
    </div>
  );
};

export default ResourceList;