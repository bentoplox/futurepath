import { API_BASE_URL } from '../../../apiConfig';
import React, { useState, useEffect } from 'react';

const CurationManager = ({ umBlue, umLightBlue }) => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        setLoading(true);
        // We'll create this endpoint in admin_routes.py
        const res = await fetch(`${API_BASE_URL}/api/admin/curation/logs`);
        const data = await res.json();
        if (data.success) setLogs(data.logs);
        setLoading(false);
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '10px' }}>🎯 Content Quality Control</h3>
            <p style={{ color: '#6b7280', marginBottom: '30px' }}>Monitor admin upvotes, downvotes, and pinpointed corrections for AI content.</p>

            {loading ? <p>Loading logs...</p> : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {logs.length > 0 ? logs.map(log => (
                        <div key={log.log_id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', borderLeft: `6px solid ${log.vote_type === 'upvote' ? '#10b981' : log.vote_type === 'downvote' ? '#ef4444' : '#f59e0b'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                <span style={{ fontWeight: 'bold', textTransform: 'uppercase', fontSize: '12px', color: '#64748b' }}>
                                    {log.content_type} #{log.content_id}
                                </span>
                                <span style={{ fontSize: '11px', color: '#9ca3af' }}>{new Date(log.created_at).toLocaleString()}</span>
                            </div>
                            <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '10px' }}>
                                {log.vote_type === 'upvote' ? '👍 Accurate' : log.vote_type === 'downvote' ? '👎 Hallucinated/Poor' : '📍 Targeted Correction'}
                            </div>
                            {log.admin_comment && <p style={{ margin: '0 0 10px 0', background: '#f8fafc', padding: '10px', borderRadius: '8px', fontSize: '14px', fontStyle: 'italic' }}>"{log.admin_comment}"</p>}
                            {log.suggested_value && (
                                <div style={{ marginTop: '10px', padding: '10px', background: '#ecfdf5', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                                    <strong style={{ fontSize: '12px', color: '#047857' }}>SUGGESTED REPLACEMENT:</strong>
                                    <div style={{ fontSize: '14px', marginTop: '5px', wordBreak: 'break-all' }}>{log.suggested_value}</div>
                                </div>
                            )}
                        </div>
                    )) : <p style={{ textAlign: 'center', color: '#9ca3af', padding: '40px' }}>No quality logs recorded yet.</p>}
                </div>
            )}
        </div>
    );
};

export default CurationManager;
