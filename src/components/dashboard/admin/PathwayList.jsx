import React from 'react';

const PathwayList = ({ skillHeatmapData, fetchData, umGold }) => {
    const uniqueCareers = [...new Map(skillHeatmapData.map(s => [s.career_id, s])).values()];

    const handlePublish = async (c) => {
        if (!window.confirm(`Make ${c.career_name} live?`)) return;
        const res = await fetch(`http://127.0.0.1:5000/api/admin/career/publish/${c.career_id}`, { method: 'POST' });
        if (res.ok) { alert("Published!"); fetchData(); }
    };

    const handleDelete = async (c) => {
        if (!window.confirm(`Delete ${c.career_name} and all student progress?`)) return;
        const res = await fetch(`http://127.0.0.1:5000/api/admin/career/delete/${c.career_id}`, { method: 'DELETE' });
        if (res.ok) { alert("Deleted."); fetchData(); }
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: '4px solid #ef4444' }}>
            <h3 style={{ fontSize: '24px', color: '#111827', marginBottom: '10px' }}>Manage Existing Pathways</h3>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Review, publish, or delete existing roadmaps.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {uniqueCareers.map((c, idx) => (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontWeight: '600' }}>{c.career_name}</span>
                            {c.career_status === 'draft' && <span style={{ fontSize: '10px', background: umGold, color: '#78350f', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>DRAFT</span>}
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            {c.career_status === 'draft' && <button onClick={() => handlePublish(c)} style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>🚀 Publish</button>}
                            <button onClick={() => handleDelete(c)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>🗑️ Delete</button>
                        </div>
                    </div>
                ))}
                {uniqueCareers.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af' }}>No pathways found.</p>}
            </div>
        </div>
    );
};

export default PathwayList;
