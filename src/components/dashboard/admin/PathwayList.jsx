import { API_BASE_URL } from '../../../apiConfig';
import React, { useState } from 'react';

const PathwayList = ({ skillHeatmapData, fetchData, umGold }) => {
    const [lifecycleFilter, setLifecycleFilter] = useState('published');
    
    const uniqueCareers = [...new Map(skillHeatmapData.map(s => [s.career_id, s])).values()];
    
    // Filtered careers based on lifecycle
    const filteredCareers = uniqueCareers.filter(c => (c.career_status || 'published') === lifecycleFilter);

    const handlePublish = async (c) => {
        if (!window.confirm(`Make ${c.career_name} live for all students?`)) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/career/publish/${c.career_id}`, { method: 'POST' });
        if (res.ok) { 
            alert("Published Successfully!"); 
            fetchData();
            setLifecycleFilter('published');
        }
    };

    const handleDelete = async (c) => {
        if (!window.confirm(`Delete ${c.career_name} permanently? This will remove all student progress records for this path.`)) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/career/delete/${c.career_id}`, { method: 'DELETE' });
        if (res.ok) { alert("Pathway deleted."); fetchData(); }
    };

    // Premium Theme Tokens
    const theme = {
        success: { bg: '#ecfdf5', text: '#065f46', border: '#bbf7d0' },
        danger: { bg: '#fef2f2', text: '#991b1b', border: '#fecaca' },
        warning: { bg: '#fff7ed', text: '#9a3412', border: '#ffedd5' }
    };

    const fontStack = "'Aeonik', 'Plus Jakarta Sans', sans-serif";

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '24px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', border: '1px solid #e2e8f0', fontFamily: fontStack }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px' }}>
                <div>
                    <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#1e293b', marginBottom: '8px' }}>Manage Existing Pathways</h3>
                    <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Review, audit, or remove learning tracks from the system.</p>
                </div>

                {/* ⚡ LIFECYCLE TOGGLE (Centered in UI) */}
                <div style={{ display: 'flex', gap: '8px', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '12px' }}>
                    <button 
                        onClick={() => setLifecycleFilter('published')}
                        style={{ 
                            padding: '8px 20px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                            background: lifecycleFilter === 'published' ? 'white' : 'transparent',
                            color: lifecycleFilter === 'published' ? '#065f46' : '#64748b',
                            boxShadow: lifecycleFilter === 'published' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        Published
                    </button>
                    <button 
                        onClick={() => setLifecycleFilter('draft')}
                        style={{ 
                            padding: '8px 20px', borderRadius: '10px', border: 'none', fontSize: '12px', fontWeight: '800', cursor: 'pointer',
                            background: lifecycleFilter === 'draft' ? 'white' : 'transparent',
                            color: lifecycleFilter === 'draft' ? '#9a3412' : '#64748b',
                            boxShadow: lifecycleFilter === 'draft' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s'
                        }}
                    >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        Drafts
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredCareers.map((c, idx) => (
                    <div key={idx} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '20px 25px', 
                        background: '#f8fafc', 
                        borderRadius: '16px', 
                        border: '1px solid #f1f5f9',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateX(5px)'}
                    onMouseOut={e => e.currentTarget.style.transform = 'translateX(0)'}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                            <div style={{ fontSize: '20px' }}>{lifecycleFilter === 'published' ? '🌐' : '📝'}</div>
                            <div>
                                <span style={{ fontWeight: '700', fontSize: '16px', color: '#1e293b' }}>{c.career_name}</span>
                                {c.career_status === 'draft' && (
                                    <span style={{ marginLeft: '12px', fontSize: '10px', background: theme.warning.bg, color: theme.warning.text, padding: '3px 8px', borderRadius: '8px', fontWeight: '800', border: `1px solid ${theme.warning.border}` }}>
                                        SANDBOX DRAFT
                                    </span>
                                )}
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '12px' }}>
                            {c.career_status === 'draft' && (
                                <button 
                                    onClick={() => handlePublish(c)} 
                                    style={{ 
                                        background: theme.success.bg, 
                                        color: theme.success.text, 
                                        border: `1px solid ${theme.success.border}`, 
                                        padding: '10px 20px', 
                                        borderRadius: '10px', 
                                        cursor: 'pointer', 
                                        fontSize: '13px', 
                                        fontWeight: '800',
                                        transition: 'all 0.2s'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#dcfce7'}
                                    onMouseOut={e => e.currentTarget.style.backgroundColor = theme.success.bg}
                                >
                                    🚀 Publish Pathway
                                </button>
                            )}
                            <button 
                                onClick={() => handleDelete(c)} 
                                style={{ 
                                    background: theme.danger.bg, 
                                    color: theme.danger.text, 
                                    border: `1px solid ${theme.danger.border}`, 
                                    padding: '10px 20px', 
                                    borderRadius: '10px', 
                                    cursor: 'pointer', 
                                    fontSize: '13px', 
                                    fontWeight: '800',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={e => e.currentTarget.style.backgroundColor = '#fee2e2'}
                                onMouseOut={e => e.currentTarget.style.backgroundColor = theme.danger.bg}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                ))}
                
                {filteredCareers.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8', background: '#f8fafc', borderRadius: '16px', border: '2px dashed #e2e8f0' }}>
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📂</span>
                        <p style={{ margin: 0, fontWeight: '500' }}>No {lifecycleFilter} pathways found in the library.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PathwayList;
