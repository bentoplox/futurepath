import React, { useState, useEffect } from 'react';

const AdminQualityControl = () => {
    const [alumniInsights, setAlumniInsights] = useState([]);
    const [studentReports, setStudentReports] = useState([]);
    const [loading, setLoading] = useState(true);

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
            if (res.ok) fetchQCData();
        } catch (error) {
            console.error("Failed to resolve feedback", error);
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '100px', fontFamily: "'Aeonik', sans-serif" }}>Loading Quality Control Center...</div>;

    return (
        <div style={{ fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", maxWidth: '1200px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '30px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>🛡️ Quality Control Center</h2>
                <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Crowdsourced curriculum feedback from Alumni experts and Student bug reporters.</p>
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
                        {alumniInsights.length > 0 ? alumniInsights.map(item => (
                            <div key={item.feedback_id} style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '20px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                    <span style={{ background: '#f59e0b', color: 'white', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: '800', textTransform: 'uppercase' }}>
                                        {item.feedback_type.replace(/_/g, ' ')}
                                    </span>
                                    <span style={{ fontSize: '12px', color: '#92400e', fontWeight: 'bold' }}>👤 {item.author_name}</span>
                                </div>
                                <div style={{ fontSize: '13px', color: '#b45309', fontWeight: '800', marginBottom: '8px', textTransform: 'uppercase' }}>TARGET: {item.target_name} ({item.target_type.replace('_', ' ')})</div>
                                <p style={{ color: '#78350f', fontSize: '14px', lineHeight: '1.6', margin: '0 0 20px 0', fontStyle: 'italic', backgroundColor: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '8px' }}>"{item.suggested_alternative_text}"</p>
                                
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleResolve(item.feedback_id, 'implemented')} style={{ flex: 1, padding: '10px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.filter='brightness(1.1)'} onMouseOut={e=>e.currentTarget.style.filter='none'}>✅ Accept & Implement</button>
                                    <button onClick={() => handleResolve(item.feedback_id, 'dismissed')} style={{ padding: '10px 20px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s' }} onMouseOver={e=>e.currentTarget.style.background='#fef2f2'} onMouseOut={e=>e.currentTarget.style.background='transparent'}>Dismiss</button>
                                </div>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>📁</span>
                                <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>No pending insights from alumni.</p>
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
                        {studentReports.length > 0 ? studentReports.map(item => (
                            <div key={item.feedback_id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', borderLeft: item.feedback_type === 'downvote' || item.feedback_type === 'broken_link' ? '4px solid #ef4444' : `4px solid ${umBlue}` }}>
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
                                
                                <button onClick={() => handleResolve(item.feedback_id, 'reviewed')} style={{ width: '100%', padding: '12px', background: 'white', color: '#334155', border: '1px solid #cbd5e1', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }} onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'} onMouseOut={e=>e.currentTarget.style.background='white'}>Mark as Reviewed ✓</button>
                            </div>
                        )) : (
                            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>✨</span>
                                <p style={{ color: '#64748b', margin: 0, fontWeight: '500' }}>No pending student reports. Curriculum looks healthy!</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AdminQualityControl;