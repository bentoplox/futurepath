import React, { useState, useEffect } from 'react';

const ResourceManager = ({ supabase, umBlue, umLightBlue, umGold }) => {
    const [careerMap, setCareerMap] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [verifiedResources, setVerifiedResources] = useState([]);
    const [newRes, setNewRes] = useState({ title: '', provider: '', url: '' });
    const [loadingRes, setLoadingRes] = useState(false);
    const [expandedCareer, setExpandedCareer] = useState(null);

    // ⚡ NEW: MANUAL SKILL INSERTION & QUIZ REVIEW
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [newSkill, setNewSkill] = useState({ skill_name: '', description: '', concept_tag: '', step_order: 1 });
    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    const [quizDraft, setQuizDraft] = useState(null);

    useEffect(() => { fetchCareerSkills(); }, []);

    const fetchCareerSkills = async () => {
        const res = await fetch('http://127.0.0.1:5000/api/admin/career-skills');
        const data = await res.json();
        if (data.success) setCareerMap(data.data);
    };

    const handlePublish = async (cId) => {
        if (!window.confirm("Make this career LIVE for all students?")) return;
        const res = await fetch(`http://127.0.0.1:5000/api/admin/career/publish/${cId}`, { method: 'POST' });
        if (res.ok) { alert("Published Successfully!"); fetchCareerSkills(); }
    };

    const fetchVerified = async (tag) => {
        setLoadingRes(true);
        const res = await fetch(`http://127.0.0.1:5000/api/admin/resources?tag=${tag}`);
        const data = await res.json();
        if (data.success) setVerifiedResources(data.resources);
        setLoadingRes(false);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!selectedSkill) return;
        await fetch('http://127.0.0.1:5000/api/admin/resources/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newRes, concept_tag: selectedSkill.concept_tag })
        });
        setNewRes({ title: '', provider: '', url: '' });
        fetchVerified(selectedSkill.concept_tag);
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        const res = await fetch('http://127.0.0.1:5000/api/admin/career/add-skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...newSkill, career_id: expandedCareer })
        });
        if (res.ok) {
            alert("Skill added successfully!");
            setShowAddSkill(false);
            setNewSkill({ skill_name: '', description: '', concept_tag: '', step_order: 1 });
            fetchCareerSkills();
        }
    };

    const handleGenerateQuiz = async (skill) => {
        setGeneratingQuiz(true);
        const res = await fetch('http://127.0.0.1:5000/api/admin/skill/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill_name: skill.skill_name })
        });
        const data = await res.json();
        if (data.success) setQuizDraft(data.draft);
        setGeneratingQuiz(false);
    };

    const saveApprovedQuiz = async () => {
        const res = await fetch('http://127.0.0.1:5000/api/admin/skill/save-quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill_id: selectedSkill.skill_id, questions: quizDraft })
        });
        if (res.ok) { alert("Quizzes saved!"); setQuizDraft(null); }
    };

    const handleDeleteSkill = async (skill) => {
        if (!window.confirm(`Delete "${skill.skill_name}"?`)) return;
        const res = await fetch(`http://127.0.0.1:5000/api/admin/career/delete-skill?career_id=${expandedCareer}&skill_id=${skill.skill_id}&step_order=${skill.step_order}`, { method: 'DELETE' });
        if (res.ok) { setSelectedSkill(null); fetchCareerSkills(); }
    };

    const handleReorder = async (skill, direction) => {
        await fetch('http://127.0.0.1:5000/api/admin/career/reorder-skill', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ career_id: expandedCareer, skill_id: skill.skill_id, step_order: skill.step_order, direction })
        });
        fetchCareerSkills();
    };

    // ⚡ CLEANUP: AI Quiz Generation and Voting moved to QuizManager

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '30px', backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '600px' }}>
            {/* Sidebar */}
            <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px', fontWeight: '800' }}>Curriculum Library</h4>
                {careerMap.map(career => (
                    <div key={career.career_id} style={{ marginBottom: '10px' }}>
                        <div onClick={() => setExpandedCareer(expandedCareer === career.career_id ? null : career.career_id)} style={{ fontWeight: 'bold', color: umBlue, fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', borderRadius: '10px', background: expandedCareer === career.career_id ? '#f8fafc' : 'transparent' }}>
                            <span>{expandedCareer === career.career_id ? '📂' : '📁'}</span> 
                            <div style={{ flex: 1 }}>{career.career_name} {career.status === 'draft' && <span style={{ fontSize: '10px', background: umGold, color: '#78350f', padding: '2px 6px', borderRadius: '10px' }}>DRAFT</span>}</div>
                        </div>
                        {expandedCareer === career.career_id && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', marginLeft: '25px', borderLeft: '2px solid #e5e7eb', paddingLeft: '10px' }}>
                                <div style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
                                    {career.status === 'draft' && <button onClick={() => handlePublish(career.career_id)} style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 'bold' }}>🚀 PUBLISH</button>}
                                    <button onClick={() => setShowAddSkill(true)} style={{ flex: 1, background: umBlue, color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '10px', fontWeight: 'bold' }}>➕ ADD SKILL</button>
                                </div>
                                {career.skills.map((skill, idx) => (
                                    <div key={skill.skill_id} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <button onClick={() => handleReorder(skill, 'up')} disabled={idx === 0} style={{ border: 'none', background: 'none', fontSize: '10px', cursor: 'pointer', opacity: idx === 0 ? 0.2 : 0.5 }}>▲</button>
                                            <button onClick={() => handleReorder(skill, 'down')} disabled={idx === career.skills.length - 1} style={{ border: 'none', background: 'none', fontSize: '10px', cursor: 'pointer', opacity: idx === career.skills.length - 1 ? 0.2 : 0.5 }}>▼</button>
                                        </div>
                                        <button onClick={() => { setSelectedSkill(skill); fetchVerified(skill.concept_tag); }} style={{ flex: 1, textAlign: 'left', padding: '10px 15px', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer', background: selectedSkill?.skill_id === skill.skill_id ? '#eff6ff' : 'transparent', color: selectedSkill?.skill_id === skill.skill_id ? umLightBlue : '#4b5563', fontWeight: selectedSkill?.skill_id === skill.skill_id ? '800' : '500', display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{skill.skill_name}</span>
                                            <span style={{ opacity: 0.5, fontSize: '9px' }}>#{skill.step_order}</span>
                                        </button>
                                        <button onClick={() => handleDeleteSkill(skill)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '5px' }}>✕</button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div>
                {showAddSkill ? (
                    <div style={{ backgroundColor: '#f8fafc', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ color: umBlue, marginBottom: '20px' }}>Insert Manual Skill</h3>
                        <form onSubmit={handleAddSkill} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px' }}>
                                <input placeholder="Skill Name" value={newSkill.skill_name} onChange={e => setNewSkill({...newSkill, skill_name: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
                                <input type="number" placeholder="Step" value={newSkill.step_order} onChange={e => setNewSkill({...newSkill, step_order: parseInt(e.target.value)})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
                            </div>
                            <input placeholder="Tag (e.g. react-hooks)" value={newSkill.concept_tag} onChange={e => setNewSkill({...newSkill, concept_tag: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db' }} required />
                            <textarea placeholder="Description" value={newSkill.description} onChange={e => setNewSkill({...newSkill, description: e.target.value})} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', minHeight: '100px' }} required />
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" style={{ flex: 1, padding: '15px', background: umBlue, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold' }}>Save Skill</button>
                                <button type="button" onClick={() => setShowAddSkill(false)} style={{ padding: '15px 30px', background: '#e5e7eb', border: 'none', borderRadius: '8px' }}>Cancel</button>
                            </div>
                        </form>
                    </div>
                ) : selectedSkill ? (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px', borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                                    <h3 style={{ fontSize: '28px', margin: 0, fontWeight: '800', color: '#111827' }}>{selectedSkill.skill_name}</h3>
                                    <span style={{ fontSize: '11px', background: umBlue, color: 'white', padding: '2px 8px', borderRadius: '4px' }}>Step {selectedSkill.step_order}</span>
                                </div>
                                <span style={{ fontSize: '12px', color: umLightBlue, backgroundColor: '#eff6ff', padding: '4px 12px', borderRadius: '6px', fontWeight: '800' }}>TAG: {selectedSkill.concept_tag}</span>
                            </div>
                        </div>

                        <div style={{ marginBottom: '50px' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px' }}>🛡️ Verified Learning Resources</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                {verifiedResources.map(res => (
                                    <div key={res.resource_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px', backgroundColor: 'white' }}>
                                        <div>
                                            <strong>{res.title}</strong>
                                            <div style={{ fontSize: '13px', color: '#6b7280' }}>{res.provider} • <a href={res.url} target="_blank" rel="noreferrer" style={{ color: umLightBlue }}>Visit ↗</a></div>
                                        </div>
                                        <button onClick={async () => { if (window.confirm("Remove?")) { await fetch(`http://127.0.0.1:5000/api/admin/resources/delete/${res.resource_id}`, { method: 'DELETE' }); fetchVerified(selectedSkill.concept_tag); } }} style={{ color: '#ef4444', border: 'none', background: 'none', fontWeight: 'bold', cursor: 'pointer' }}>Remove</button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ backgroundColor: '#f8fafc', padding: '35px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' }}>
                            <h4 style={{ fontWeight: '700', marginBottom: '20px' }}>✨ Add Trusted Resource</h4>
                            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <input placeholder="Title" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db' }} required />
                                <input placeholder="Provider" value={newRes.provider} onChange={e => setNewRes({...newRes, provider: e.target.value})} style={{ padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db' }} required />
                                <input placeholder="URL" value={newRes.url} onChange={e => setNewRes({...newRes, url: e.target.value})} style={{ gridColumn: 'span 2', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db' }} required />
                                <button type="submit" style={{ gridColumn: 'span 2', background: umBlue, color: 'white', padding: '15px', borderRadius: '12px', fontWeight: '800' }}>➕ Save to Global Library</button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '150px 0', color: '#9ca3af' }}><span style={{ fontSize: '64px' }}>📚</span><h3 style={{ fontSize: '20px', fontWeight: '700' }}>Curriculum Curation</h3></div>
                )}
            </div>
        </div>
    );
};

export default ResourceManager;
