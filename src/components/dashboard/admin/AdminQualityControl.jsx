import React, { useState, useEffect } from 'react';

const AdminQualityControl = () => {
    const [alumniInsights, setAlumniInsights] = useState([]);
    const [studentReports, setStudentReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'reviewed'
    const [activeRole, setActiveRole] = useState('alumni'); // 'alumni' or 'student'

    // Premium UI Theme Colors
    const umBlue = '#1e3a8a';
    const amberAccent = '#f59e0b';

    useEffect(() => { fetchQCData(); }, []);

    const fetchQCData = async () => {
        setLoading(true);
        try {
            const res = await fetch('http://127.0.0.1:5000/api/admin/quality-control');
            const json = await res.json();
            if (json.success) {
                setAlumniInsights(json.data.alumni_insights || []);
                setStudentReports(json.data.student_reports || []);
            }
        } catch (error) {
            console.error("Failed to fetch QC data", error);
        }
        setLoading(false);
    };

    // ⚡ RESTORED WORKING RESOLVE FUNCTION FROM OLD CODE
    const handleResolve = async (id, action) => {
        try {
            const res = await fetch(`http://127.0.0.1:5000/api/admin/quality-control/resolve/${id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action })
            });
            const data = await res.json();

            if (data.success) {
                // Instantly update the UI state so the card moves to the other tab immediately
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

    // --- FILTERING LOGIC ---
    const filterData = (data) => {
        if (activeTab === 'pending') {
            return data.filter(i => i.status === 'pending' || i.status === 'havent reviewed');
        }
        return data.filter(i => i.status === 'reviewed');
    };

    const displayAlumni = filterData(alumniInsights);
    const displayStudent = filterData(studentReports);

    const getBadgeStyle = (status) => {
        switch(status) {
            case 'implemented': return { bg: '#ecfdf5', text: '#047857', label: '🚀 FIXED' };
            case 'dismissed': return { bg: '#fef2f2', text: '#991b1b', label: '❌ DISMISSED' };
            case 'reviewed': return { bg: '#f3f4f6', text: '#4b5563', label: '✅ REVIEWED' };
            default: return { bg: '#fef3c7', text: '#b45309', label: '⏳ PENDING' };
        }
    };

    return (
        <div style={{ fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
            <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                    <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#111827', margin: '0 0 8px 0' }}>🛡️ Quality Control Center</h2>
                    <p style={{ color: '#64748b', fontSize: '15px', margin: 0 }}>Review high-signal curriculum feedback and maintain academic excellence.</p>
                </div>

                {/* ROLE TOGGLE (ALUMNI VS STUDENT) */}
                <div style={{ display: 'flex', backgroundColor: 'white', borderRadius: '12px', padding: '6px', border: '1px solid #e2e8f0', gap: '5px' }}>
                    <button 
                        onClick={() => setActiveRole('alumni')}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s', backgroundColor: activeRole === 'alumni' ? umBlue : 'transparent', color: activeRole === 'alumni' ? 'white' : '#64748b' }}
                    >
                        📈 Alumni Insights
                    </button>
                    <button 
                        onClick={() => setActiveRole('student')}
                        style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold', fontSize: '13px', transition: 'all 0.2s', backgroundColor: activeRole === 'student' ? umBlue : 'transparent', color: activeRole === 'student' ? 'white' : '#64748b' }}
                    >
                        🚩 Student Reports
                    </button>
                </div>
            </div>

            {/* STATUS ARCHIVING TABS */}
            <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
                <button 
                    onClick={() => setActiveTab('pending')}
                    style={{ 
                        padding: '8px 24px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid', transition: 'all 0.2s', fontSize: '14px',
                        backgroundColor: activeTab === 'pending' ? `${amberAccent}15` : 'transparent',
                        borderColor: activeTab === 'pending' ? amberAccent : 'transparent',
                        color: activeTab === 'pending' ? '#92400e' : '#64748b'
                    }}
                >
                    Pending Feedback Review
                </button>
                <button 
                    onClick={() => setActiveTab('reviewed')}
                    style={{ 
                        padding: '8px 24px', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', border: '2px solid', transition: 'all 0.2s', fontSize: '14px',
                        backgroundColor: activeTab === 'reviewed' ? `${amberAccent}15` : 'transparent',
                        borderColor: activeTab === 'reviewed' ? amberAccent : 'transparent',
                        color: activeTab === 'reviewed' ? '#92400e' : '#64748b'
                    }}
                >
                    Reviewed History
                </button>
            </div>

            {/* SINGLE COLUMN FULL-WIDTH LAYOUT */}
            <div style={{ backgroundColor: 'white', borderRadius: '16px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', borderTop: `6px solid ${activeRole === 'alumni' ? amberAccent : umBlue}` }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '35px' }}>
                    <span style={{ fontSize: '28px' }}>{activeRole === 'alumni' ? '📈' : '🚩'}</span>
                    <h3 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#1e293b' }}>
                        {activeRole === 'alumni' ? 'Alumni Expert Industry Insights' : 'Student Curriculum Bug Reports'}
                    </h3>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    
                    {/* RENDER ALUMNI LIST */}
                    {activeRole === 'alumni' && (
                        displayAlumni.length > 0 ? displayAlumni.map(item => {
                            const badge = getBadgeStyle(item.status);
                            return (
                                <div key={item.feedback_id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '25px', transition: 'transform 0.2s' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ background: amberAccent, color: 'white', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase' }}>
                                                {item.feedback_type.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontSize: '10px', fontWeight: '900', padding: '3px 10px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.text}33` }}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 'bold' }}>👤 {item.author_name}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: '800', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        TARGET: <span style={{color:'#475569'}}>{item.target_name} ({item.target_type.replace('_', ' ')})</span>
                                    </div>
                                    <div style={{ backgroundColor: 'white', padding: '15px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                        <p style={{ color: '#334155', fontSize: '15px', lineHeight: '1.7', margin: 0, fontStyle: 'italic' }}>"{item.suggested_alternative_text}"</p>
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                        {activeTab === 'pending' ? (
                                            <button 
                                                onClick={() => handleResolve(item.feedback_id, 'reviewed')}
                                                style={{ padding: '12px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
                                                onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                                                onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}
                                            >
                                                Mark as Complete ✓
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleResolve(item.feedback_id, 'pending')}
                                                style={{ padding: '10px 25px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'}
                                                onMouseOut={e=>e.currentTarget.style.background='white'}
                                            >
                                                Unmark Complete ↺
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                <p style={{ color: '#64748b', margin: 0, fontWeight: '500', fontSize: '16px' }}>No {activeTab} alumni insights in the queue.</p>
                            </div>
                        )
                    )}

                    {/* RENDER STUDENT LIST */}
                    {activeRole === 'student' && (
                        displayStudent.length > 0 ? displayStudent.map(item => {
                            const badge = getBadgeStyle(item.status);
                            const isCritical = item.feedback_type === 'broken_link' || item.feedback_type === 'outdated_content';
                            
                            return (
                                <div key={item.feedback_id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '25px', borderLeft: `6px solid ${isCritical ? '#ef4444' : umBlue}` }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                            <span style={{ fontSize: '11px', fontWeight: '800', color: isCritical ? '#ef4444' : umBlue, textTransform: 'uppercase', backgroundColor: isCritical ? '#fef2f2' : '#eff6ff', padding: '5px 12px', borderRadius: '6px' }}>
                                                {item.feedback_type.replace(/_/g, ' ')}
                                            </span>
                                            <span style={{ fontSize: '10px', fontWeight: '900', padding: '3px 10px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.text, border: `1px solid ${badge.text}33` }}>
                                                {badge.label}
                                            </span>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold' }}>📅 {new Date(item.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ fontSize: '14px', color: '#1e3a8a', fontWeight: '800', marginBottom: '12px', textTransform: 'uppercase' }}>TARGET: <span style={{color:'#475569'}}>{item.target_name}</span></div>
                                    
                                    <div style={{ background: 'white', padding: '15px 20px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                                        <p style={{ color: '#334155', fontSize: '15px', margin: 0, lineHeight: '1.6' }}>"{item.suggested_alternative_text}"</p>
                                    </div>
                                    
                                    <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                                        {activeTab === 'pending' ? (
                                            <button 
                                                onClick={() => handleResolve(item.feedback_id, 'reviewed')}
                                                style={{ padding: '12px 30px', background: '#10b981', color: 'white', border: 'none', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}
                                                onMouseOver={e=>e.currentTarget.style.transform='translateY(-2px)'}
                                                onMouseOut={e=>e.currentTarget.style.transform='translateY(0)'}
                                            >
                                                Mark as Reviewed ✓
                                            </button>
                                        ) : (
                                            <button 
                                                onClick={() => handleResolve(item.feedback_id, 'pending')}
                                                style={{ padding: '10px 25px', background: 'white', color: '#64748b', border: '1px solid #cbd5e1', borderRadius: '10px', fontWeight: '800', cursor: 'pointer', transition: 'all 0.2s' }}
                                                onMouseOver={e=>e.currentTarget.style.background='#f1f5f9'}
                                                onMouseOut={e=>e.currentTarget.style.background='white'}
                                            >
                                                Unmark Complete ↺
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        }) : (
                            <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#f9fafb', borderRadius: '12px', border: '2px dashed #e2e8f0' }}>
                                <p style={{ color: '#64748b', margin: 0, fontWeight: '500', fontSize: '16px' }}>No {activeTab} student reports in the system.</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminQualityControl;