// ============================================================================
// FILE: src/components/dashboard/admin/AdminQualityControl.jsx
// ============================================================================

import React, { useState, useEffect } from 'react';

const AdminQualityControl = () => {
    const [alumniInsights, setAlumniInsights] = useState([]);
    const [studentReports, setStudentReports] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // 1. ADD TAB STATE
    const [activeTab, setActiveTab] = useState('pending'); 

    const umBlue = '#1e3a8a';

    useEffect(() => { fetchQCData(); }, []);

    const fetchQCData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/api/admin/quality-control');
            const json = await res.json();
            if (json.success) {
                setAlumniInsights(json.data.alumni_insights);
                setStudentReports(json.data.student_reports);
            }
        } catch (error) {
            console.error("Failed to fetch QC data", error);
        }
        setLoading(false);
    };

    const handleResolve = async (id, action) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/admin/quality-control/resolve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();

            if (data.success) {
                // Instead of re-fetching the whole database, update the React state directly!
                // This makes the toggle feel instant and prevents "stale reads".
                setAlumniInsights(prev => prev.map(item => 
                    item.feedback_id === id ? { ...item, status: action } : item
                ));
                
                setStudentReports(prev => prev.map(item => 
                    item.feedback_id === id ? { ...item, status: action } : item
                ));
            } else {
                alert("Failed to update database: " + data.error);
            }
        } catch (error) {
            console.error("Failed to resolve feedback", error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Aeonik', sans-serif" }}>Loading Quality Control Center...</div>;

    // 2. DATA FILTERING LOGIC
    const displayAlumni = alumniInsights.filter(item => 
        activeTab === 'pending' 
            ? (item.status === 'pending' || item.status === 'havent reviewed') 
            : item.status === 'reviewed'
    );

    const displayStudents = studentReports.filter(item => 
        activeTab === 'pending' 
            ? (item.status === 'pending' || item.status === 'havent reviewed') 
            : item.status === 'reviewed'
    );

    return (
        <div style={{ fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>🛡️ Quality Control Center</h2>
                <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Crowdsourced curriculum feedback from Alumni experts and Student bug reporters.</p>
            </div>

            {/* 3. NEW TOP LEVEL TAB NAVIGATION */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px' }}>
                <button 
                    onClick={() => setActiveTab('pending')}
                    style={{ 
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                        backgroundColor: activeTab === 'pending' ? umBlue : '#f1f5f9',
                        color: activeTab === 'pending' ? 'white' : '#64748b'
                    }}
                >
                    Pending Feedback Review
                </button>
                <button 
                    onClick={() => setActiveTab('reviewed')}
                    style={{ 
                        padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', border: 'none',
                        backgroundColor: activeTab === 'reviewed' ? umBlue : '#f1f5f9',
                        color: activeTab === 'reviewed' ? 'white' : '#64748b'
                    }}
                >
                    Reviewed History
                </button>
            </div>

            {/* DUAL COLUMN SCANNABLE LAYOUT */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
                
                {/* COLUMN 1: ALUMNI INDUSTRY INSIGHTS */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: '6px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                        <span style={{ fontSize: '24px' }}>📈</span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#1e293b' }}>Alumni Expert Insights</h3>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {displayAlumni.length > 0 ? displayAlumni.map(item => (
                            <div key={item.feedback_id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px', opacity: activeTab === 'reviewed' ? 0.7 : 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ background: '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                                        {item.feedback_type.replace(/_/g, ' ')}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 'bold' }}>👤 {item.author_name}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>TARGET: {item.target_name} ({item.target_type.replace('_', ' ')})</div>
                                <p style={{ color: '#78350f', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '8px' }}>"{item.suggested_alternative_text}"</p>
                                
                                {/* 4. CONDITIONAL TOGGLE BUTTONS */}
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {activeTab === 'pending' ? (
                                        <button onClick={() => handleResolve(item.feedback_id, 'reviewed')} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Mark as Complete ✓</button>
                                    ) : (
                                        <button onClick={() => handleResolve(item.feedback_id, 'pending')} style={{ flex: 1, padding: '10px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Unmark Complete ↺</button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📁</span>
                                <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>No {activeTab} insights from alumni.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* COLUMN 2: STUDENT BUG REPORTS */}
                <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', borderTop: `6px solid ${umBlue}` }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
                        <span style={{ fontSize: '24px' }}>🚩</span>
                        <h3 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#1e293b' }}>Student Quality Reports</h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {displayStudents.length > 0 ? displayStudents.map(item => (
                            <div key={item.feedback_id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', borderLeft: item.feedback_type === 'downvote' || item.feedback_type === 'broken_link' ? '4px solid #ef4444' : `4px solid ${umBlue}`, opacity: activeTab === 'reviewed' ? 0.7 : 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ fontSize: '10px', fontWeight: '800', color: item.feedback_type === 'downvote' || item.feedback_type === 'broken_link' ? '#ef4444' : '#64748b', textTransform: 'uppercase', backgroundColor: item.feedback_type === 'downvote' || item.feedback_type === 'broken_link' ? '#fef2f2' : '#e2e8f0', padding: '4px 10px', borderRadius: '6px' }}>
                                        {item.feedback_type.replace(/_/g, ' ')}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>{new Date(item.created_at).toLocaleDateString()}</span>
                                </div>
                                <div style={{ fontSize: '14px', color: '#334155', fontWeight: '800', marginBottom: '10px' }}>TARGET: {item.target_name}</div>
                                {item.suggested_alternative_text && (
                                    <div style={{ background: 'white', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '15px' }}>
                                        <p style={{ color: '#475569', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>"{item.suggested_alternative_text}"</p>
                                    </div>
                                )}
                                
                                {/* 4. CONDITIONAL TOGGLE BUTTONS */}
                                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                    {activeTab === 'pending' ? (
                                        <button onClick={() => handleResolve(item.feedback_id, 'reviewed')} style={{ width: '100%', padding: '12px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Mark as Complete ✓</button>
                                    ) : (
                                        <button onClick={() => handleResolve(item.feedback_id, 'pending')} style={{ width: '100%', padding: '12px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Unmark Complete ↺</button>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>✨</span>
                                <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>No {activeTab} student reports.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminQualityControl;