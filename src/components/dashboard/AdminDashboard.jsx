// ============================================================================
// FILE: src/components/dashboard/AdminDashboard.jsx
// PURPOSE: Admin Command Center (Analytics, Moderation, Content Sync)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { styles } from '../../styles/styles';
import EmployabilityDashboard from '../dashboard/EmployabilityDashboard'; // Adjust path if needed!

const AdminDashboard = ({ user, onLogout }) => {
  // ... (Keep existing states) ...
  const [activeTab, setActiveTab] = useState('overview'); 

  // --- ⚡ RESOURCE MANAGER ---
  const ResourceManager = () => {
    const [careerMap, setCareerMap] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [verifiedResources, setVerifiedResources] = useState([]);
    const [newRes, setNewRes] = useState({ title: '', provider: '', url: '' });
    const [loadingRes, setLoadingRes] = useState(false);
    const [expandedCareer, setExpandedCareer] = useState(null);

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

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '20px' }}>Curriculum Library</h4>
                {careerMap.map(career => (
                    <div key={career.career_id} style={{ marginBottom: '10px' }}>
                        <div onClick={() => setExpandedCareer(expandedCareer === career.career_id ? null : career.career_id)} style={{ fontWeight: 'bold', color: umBlue, fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', borderRadius: '8px', background: expandedCareer === career.career_id ? '#f3f4f6' : 'transparent' }}>
                            <span>{expandedCareer === career.career_id ? '📂' : '📁'}</span> 
                            <div style={{ flex: 1 }}>
                                {career.career_name}
                                {career.status === 'draft' && <span style={{ marginLeft: '8px', fontSize: '10px', background: umGold, color: '#78350f', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>DRAFT</span>}
                            </div>
                        </div>
                        {expandedCareer === career.career_id && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '25px', marginTop: '5px', borderLeft: '2px solid #e5e7eb', paddingLeft: '10px' }}>
                                {career.status === 'draft' && (
                                    <button onClick={() => handlePublish(career.career_id)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>🚀 PUBLISH NOW</button>
                                )}
                                {career.skills.map(skill => (
                                    <button key={skill.skill_id} onClick={() => { setSelectedSkill(skill); fetchVerified(skill.concept_tag); }} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer', background: selectedSkill?.skill_id === skill.skill_id ? '#eff6ff' : 'transparent', color: selectedSkill?.skill_id === skill.skill_id ? umLightBlue : '#4b5563', fontWeight: selectedSkill?.skill_id === skill.skill_id ? 'bold' : 'normal' }}>
                                        {skill.skill_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div>
                {selectedSkill ? (
                    <div>
                        <h3 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>{selectedSkill.skill_name}</h3>
                        <span style={{ fontSize: '12px', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '3px 8px', borderRadius: '4px' }}>TAG: {selectedSkill.concept_tag}</span>
                        <div style={{ marginTop: '30px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Verified Resources</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {verifiedResources.length > 0 ? verifiedResources.map(res => (
                                    <div key={res.resource_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                                        <div><strong>{res.title}</strong><div style={{ fontSize: '12px', color: '#6b7280' }}>{res.provider} • <a href={res.url} target="_blank" rel="noreferrer" style={{ color: umLightBlue }}>View Link</a></div></div>
                                        <button onClick={async () => { if (window.confirm("Remove?")) { await fetch(`http://127.0.0.1:5000/api/admin/resources/delete/${res.resource_id}`, { method: 'DELETE' }); fetchVerified(selectedSkill.concept_tag); } }} style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Remove</button>
                                    </div>
                                )) : <p>No verified resources yet.</p>}
                            </div>
                        </div>
                        <div style={{ backgroundColor: '#f8fafc', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '30px' }}>
                            <h4 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '15px' }}>Add Trusted Resource</h4>
                            <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <input placeholder="Title" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} required />
                                <input placeholder="Provider" value={newRes.provider} onChange={e => setNewRes({...newRes, provider: e.target.value})} style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} required />
                                <input placeholder="URL" value={newRes.url} onChange={e => setNewRes({...newRes, url: e.target.value})} style={{ gridColumn: 'span 2', padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db' }} required />
                                <button type="submit" style={{ gridColumn: 'span 2', background: umBlue, color: 'white', border: 'none', padding: '12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>➕ Save to Library</button>
                            </form>
                        </div>
                    </div>
                ) : <div style={{ textAlign: 'center', padding: '100px', color: '#9ca3af' }}><span style={{ fontSize: '48px' }}>📚</span><p>Select a skill to curate its resources.</p></div>}
            </div>
        </div>
    );
  };

  // --- ⚡ QUIZ MANAGER ---
  const QuizManager = () => {
    const [careerMap, setCareerMap] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [expandedCareer, setExpandedCareer] = useState(null);

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

    const fetchQuizzes = async (skillId) => {
        setLoadingQuizzes(true);
        const res = await fetch(`http://127.0.0.1:5000/api/admin/quizzes?skill_id=${skillId}`);
        const data = await res.json();
        if (data.success) setQuizzes(data.quizzes);
        setLoadingQuizzes(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const res = await fetch('http://127.0.0.1:5000/api/admin/quizzes/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingQuiz)
        });
        if (res.ok) {
            setEditingQuiz(null);
            fetchQuizzes(selectedSkill.skill_id);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this quiz question forever?")) return;
        await fetch(`http://127.0.0.1:5000/api/admin/quizzes/delete/${id}`, { method: 'DELETE' });
        fetchQuizzes(selectedSkill.skill_id);
    };

    const startAdd = () => {
        setEditingQuiz({
            skill_id: selectedSkill.skill_id,
            question: '',
            options: ['', '', '', ''],
            correct_answer: '',
            difficulty: 'Beginner'
        });
    };

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                <h4 style={{ fontSize: '14px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '20px' }}>Assessment Bank</h4>
                {careerMap.map(career => (
                    <div key={career.career_id} style={{ marginBottom: '10px' }}>
                        <div onClick={() => setExpandedCareer(expandedCareer === career.career_id ? null : career.career_id)} style={{ fontWeight: 'bold', color: umBlue, fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '10px', borderRadius: '8px', background: expandedCareer === career.career_id ? '#f3f4f6' : 'transparent' }}>
                            <span>{expandedCareer === career.career_id ? '📂' : '📁'}</span> 
                            <div style={{ flex: 1 }}>
                                {career.career_name}
                                {career.status === 'draft' && <span style={{ marginLeft: '8px', fontSize: '10px', background: umGold, color: '#78350f', padding: '2px 6px', borderRadius: '10px', fontWeight: '800' }}>DRAFT</span>}
                            </div>
                        </div>
                        {expandedCareer === career.career_id && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '25px', marginTop: '5px', borderLeft: '2px solid #e5e7eb', paddingLeft: '10px' }}>
                                {career.status === 'draft' && (
                                    <button onClick={() => handlePublish(career.career_id)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px' }}>🚀 PUBLISH NOW</button>
                                )}
                                {career.skills.map(skill => (
                                    <button key={skill.skill_id} onClick={() => { setSelectedSkill(skill); fetchQuizzes(skill.skill_id); setEditingQuiz(null); }} style={{ textAlign: 'left', padding: '8px 12px', borderRadius: '6px', border: 'none', fontSize: '13px', cursor: 'pointer', background: selectedSkill?.skill_id === skill.skill_id ? '#eff6ff' : 'transparent', color: selectedSkill?.skill_id === skill.skill_id ? umLightBlue : '#4b5563', fontWeight: selectedSkill?.skill_id === skill.skill_id ? 'bold' : 'normal' }}>
                                        {skill.skill_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <div>
                {selectedSkill ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                            <div>
                                <h3 style={{ fontSize: '24px', margin: '0 0 5px 0' }}>{selectedSkill.skill_name} Quizzes</h3>
                                <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>Manage evaluation questions for this module.</p>
                            </div>
                            <button onClick={startAdd} style={{ padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                                ➕ Add Question
                            </button>
                        </div>

                        {editingQuiz ? (
                            <div style={{ backgroundColor: '#f8fafc', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 20px 0' }}>{editingQuiz.quiz_id ? 'Edit Question' : 'New Question'}</h4>
                                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>QUESTION TEXT</label>
                                        <textarea 
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '5px' }}
                                            value={editingQuiz.question}
                                            onChange={e => setEditingQuiz({...editingQuiz, question: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        {editingQuiz.options.map((opt, idx) => (
                                            <div key={idx}>
                                                <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#94a3b8' }}>OPTION {idx + 1}</label>
                                                <input 
                                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '5px' }}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...editingQuiz.options];
                                                        newOpts[idx] = e.target.value;
                                                        setEditingQuiz({...editingQuiz, options: newOpts});
                                                    }}
                                                    required
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>CORRECT ANSWER</label>
                                            <select 
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '5px' }}
                                                value={editingQuiz.correct_answer}
                                                onChange={e => setEditingQuiz({...editingQuiz, correct_answer: e.target.value})}
                                                required
                                            >
                                                <option value="">Select the correct choice</option>
                                                {editingQuiz.options.map((opt, idx) => opt && (
                                                    <option key={idx} value={opt}>{opt}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>DIFFICULTY</label>
                                            <select 
                                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #d1d5db', marginTop: '5px' }}
                                                value={editingQuiz.difficulty}
                                                onChange={e => setEditingQuiz({...editingQuiz, difficulty: e.target.value})}
                                            >
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                                        <button type="submit" style={{ flex: 1, padding: '12px', background: umBlue, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                                        <button type="button" onClick={() => setEditingQuiz(null)} style={{ padding: '12px 20px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                {loadingQuizzes ? <p>Loading questions...</p> : (
                                    quizzes.length > 0 ? quizzes.map(q => (
                                        <div key={q.quiz_id} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                                                <span style={{ fontSize: '11px', fontWeight: '800', background: '#eff6ff', color: umLightBlue, padding: '3px 8px', borderRadius: '4px' }}>{q.difficulty}</span>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <button onClick={() => setEditingQuiz(q)} style={{ color: umLightBlue, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Edit</button>
                                                    <button onClick={() => handleDelete(q.quiz_id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}>Delete</button>
                                                </div>
                                            </div>
                                            <p style={{ fontWeight: 'bold', margin: '0 0 15px 0', fontSize: '16px' }}>{q.question}</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                                                {q.options.map((opt, i) => (
                                                    <div key={i} style={{ padding: '10px', borderRadius: '8px', fontSize: '14px', border: '1px solid #f3f4f6', background: opt === q.correct_answer ? '#dcfce7' : '#f9fafb', color: opt === q.correct_answer ? '#166534' : '#6b7280', borderLeft: opt === q.correct_answer ? '4px solid #10b981' : '1px solid #f3f4f6' }}>
                                                        {opt} {opt === q.correct_answer && '✓'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )) : <p style={{ fontStyle: 'italic', color: '#9ca3af', textAlign: 'center', padding: '40px' }}>No questions found for this skill.</p>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '100px', color: '#9ca3af' }}>
                        <span style={{ fontSize: '48px' }}>📝</span>
                        <p>Select a skill from the sidebar to manage its assessment questions.</p>
                    </div>
                )}
            </div>
        </div>
    );
  };
  // --- ⚡ NEW: INTERACTIVE CONTENT GENERATOR ---
  const InteractiveGenerator = () => {
    const [step, setStep] = useState(1); 
    const [careerName, setCareerName] = useState('');
    const [draftSteps, setDraftSteps] = useState([]);
    const [draftQuizzes, setDraftQuizzes] = useState([]);
    const [draftDescription, setDraftDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const startDrafting = async () => {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:5000/api/admin/draft/steps', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ career_name: careerName })
        });
        const data = await res.json();
        if (data.success) {
            setDraftSteps(data.draft.steps);
            setDraftDescription(data.draft.description);
            setStep(2);
        }
        setLoading(false);
    };

    const generateQuizzes = async () => {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:5000/api/admin/draft/quizzes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skills: draftSteps.map(s => s.skill_name) })
        });
        const data = await res.json();
        if (data.success) {
            setDraftQuizzes(data.draft.quizzes);
            setStep(3);
        }
        setLoading(false);
    };

    const publishPath = async () => {
        setLoading(true);
        const res = await fetch('http://127.0.0.1:5000/api/admin/commit-pathway', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                career_name: careerName,
                description: draftDescription,
                steps: draftSteps,
                quizzes: draftQuizzes
            })
        });
        const data = await res.json();
        if (data.success) {
            alert("Saved as DRAFT! Finalize in Resource/Quiz Manager and click PUBLISH.");
            setStep(1);
            setCareerName('');
            fetchData();
        }
        setLoading(false);
    };

    // ⚡ EDIT/REJECT LOGIC
    const removeDraftStep = (index) => setDraftSteps(draftSteps.filter((_, i) => i !== index));
    const updateDraftStep = (i, f, v) => {
        const u = [...draftSteps]; u[i][f] = v; setDraftSteps(u);
    };
    const removeDraftQuiz = (si, qi) => {
        const u = [...draftQuizzes]; u[si].questions = u[si].questions.filter((_, i) => i !== qi); setDraftQuizzes(u);
    };
    const updateDraftQuiz = (si, qi, field, value) => {
        const u = [...draftQuizzes];
        u[si].questions[qi][field] = value;
        setDraftQuizzes(u);
    };

    const updateDraftQuizOption = (si, qi, oi, v) => {
        const u = [...draftQuizzes];
        u[si].questions[qi].options[oi] = v;
        setDraftQuizzes(u);
    };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `4px solid ${umGold}` }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= i ? umGold : '#f3f4f6' }}></div>
                ))}
            </div>

            {step === 1 && (
                <div>
                    <h3 style={{ fontSize: '24px', margin: '0 0 10px 0' }}>Build New Career Path</h3>
                    <p style={{ color: '#6b7280', marginBottom: '25px' }}>Enter a career name and let AI propose the technical roadmap.</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <input placeholder="e.g. Info System Auditor" value={careerName} onChange={e => setCareerName(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '16px' }} />
                        <button onClick={startDrafting} disabled={loading || !careerName} style={{ padding: '0 30px', background: umBlue, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Drafting...' : 'Propose Roadmap'}</button>
                    </div>
                </div>
            )}

            {step === 2 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '24px', margin: 0 }}>Review Curriculum Draft</h3>
                        <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>← Back</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px' }}>
                        {draftSteps.map((s, i) => (
                            <div key={i} style={{ padding: '15px', border: '1px solid #e5e7eb', borderRadius: '8px', background: '#f9fafb', position: 'relative' }}>
                                <button onClick={() => removeDraftStep(i)} style={{ position: 'absolute', top: '10px', right: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold' }}>Reject ✕</button>
                                <input style={{ background: 'transparent', border: 'none', fontWeight: 'bold', color: umBlue, fontSize: '16px', width: '80%' }} value={s.skill_name} onChange={(e) => updateDraftStep(i, 'skill_name', e.target.value)} />
                                <textarea style={{ width: '100%', border: 'none', background: 'transparent', fontSize: '13px', color: '#4b5563', marginTop: '8px', resize: 'none' }} value={s.description} onChange={(e) => updateDraftStep(i, 'description', e.target.value)} />
                            </div>
                        ))}
                    </div>
                    <button onClick={generateQuizzes} disabled={loading || draftSteps.length === 0} style={{ width: '100%', padding: '15px', background: umBlue, color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Generating Quizzes...' : 'Next: Generate Quizzes'}</button>
                </div>
            )}

            {step === 3 && (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '24px', margin: 0 }}>Final Review: Assessments</h3>
                        <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer' }}>← Back</button>
                    </div>
                    <div style={{ maxHeight: '500px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '30px', paddingRight: '10px' }}>
                        {draftQuizzes.map((sq, si) => (
                            <div key={si} style={{ padding: '20px', border: '1px solid #e5e7eb', borderRadius: '12px' }}>
                                <div style={{ fontWeight: 'bold', color: umLightBlue, marginBottom: '15px', fontSize: '14px', textTransform: 'uppercase' }}>{sq.skill_name}</div>
                                {sq.questions.map((q, qi) => (
                                    <div key={qi} style={{ marginBottom: '20px', borderBottom: qi < sq.questions.length - 1 ? '1px solid #f3f4f6' : 'none', paddingBottom: '15px', position: 'relative' }}>
                                        <button onClick={() => removeDraftQuiz(si, qi)} style={{ position: 'absolute', top: 0, right: 0, border: 'none', background: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Delete Question ✕</button>
                                        
                                        <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>QUESTION</label>
                                        <input style={{ width: '90%', padding: '8px 0', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '500', marginBottom: '15px' }} value={q.question} onChange={(e) => updateDraftQuiz(si, qi, 'question', e.target.value)} />
                                        
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                            {q.options.map((opt, oi) => (
                                                <div key={oi}>
                                                    <label style={{ fontSize: '9px', color: '#94a3b8' }}>OPTION {oi+1}</label>
                                                    <input style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #f3f4f6', fontSize: '12px' }} value={opt} onChange={(e) => updateDraftQuizOption(si, qi, oi, e.target.value)} />
                                                </div>
                                            ))}
                                        </div>

                                        <label style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' }}>CORRECT ANSWER</label>
                                        <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px', marginTop: '5px' }} value={q.correct_answer} onChange={(e) => updateDraftQuiz(si, qi, 'correct_answer', e.target.value)}>
                                            {q.options.map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <button onClick={publishPath} disabled={loading} style={{ width: '100%', padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Saving...' : '💾 Save as Draft Pathway'}</button>
                </div>
            )}
        </div>
    );
  };

  const [posts, setPosts] = useState([]);
  const [feedback, setFeedback] = useState([]); // ⚡ NEW: Feedback state
  const [stats, setStats] = useState({ students: 0, alumni: 0, pendingPosts: 0 });
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' or 'feedback'

  // ⚡ NEW: States for Content Sync (FR5)
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);

  // --- DYNAMIC DATA FOR SKILLS HEATMAP ---
  const [skillHeatmapData, setSkillHeatmapData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        // 1. Fetch User Stats
        const { count: studentCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'student');
        const { count: alumniCount } = await supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'alumni');
        
        // 2. Fetch Pending Posts
        const { data: postData } = await supabase
          .from('alumni_posts')
          .select('*, users(name, role)')
          .order('created_at', { ascending: false });

        const pendingCount = postData ? postData.filter(p => p.status === 'pending').length : 0;

        // 3. Fetch ANONYMIZED Feedback (FR6.3)
        const feedbackRes = await fetch('http://127.0.0.1:5000/api/admin/feedback');
        const feedbackData = await feedbackRes.json();

        // 4. Fetch Dynamic Heatmap Data
        const heatmapRes = await fetch('http://127.0.0.1:5000/api/admin/heatmap');
        const heatmapData = await heatmapRes.json();

        setStats({ students: studentCount || 0, alumni: alumniCount || 0, pendingPosts: pendingCount });
        setPosts(postData || []);
        if (feedbackData.success) setFeedback(feedbackData.reports || []);
        if (heatmapData.success) setSkillHeatmapData(heatmapData.heatmap || []);

    } catch (err) {
        console.error("Error fetching admin data:", err);
    } finally {
        setLoading(false);
    }
  };

  const updateStatus = async (postId, newStatus) => {
    if (!window.confirm(`Mark post as ${newStatus}?`)) return;
    const { error } = await supabase.from('alumni_posts').update({ status: newStatus }).eq('id', postId);
    if (!error) fetchData(); 
  };

  // ⚡ NEW: THE INTERNAL API SYNC TRIGGER (FR5.1)
  const handleContentSync = async () => {
      if (!window.confirm("This will trigger the background AI worker to populate the database. Proceed?")) return;
      
      setSyncing(true);
      setSyncMessage(null);
      
      try {
          const response = await fetch('http://127.0.0.1:5000/api/admin/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' }
          });
          const data = await response.json();
          
          if (data.success) {
              setSyncMessage({ type: 'success', text: "✅ Background generation started! Check your python terminal." });
          } else {
              setSyncMessage({ type: 'error', text: `❌ Sync Failed: ${data.error}` });
          }
      } catch (err) {
          setSyncMessage({ type: 'error', text: "❌ Connection to backend failed. Is Flask running?" });
      } finally {
          setSyncing(false);
      }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'job': return '#10b981'; // Green
      case 'internship': return '#f59e0b'; // Yellow
      case 'resume_review': return '#db2777'; // Pink
      case 'interview_prep': return '#7c3aed'; // Violet
      case 'career_advice': return '#0284c7'; // Light Blue
      case 'portfolio_review': return '#ea580c'; // Orange
      case 'coffee_chat': return '#9333ea'; // Deep Purple
      default: return '#4c2882'; // FuturePath Purple
    }
  };

  const getHeatmapColor = (score) => {
    if (score === 0) return '#f3f4f6'; // Gray for "No Data"
    if (score < 50) return '#ef4444'; // Red for < 50%
    if (score < 75) return '#f59e0b'; // Orange for 50-74%
    return '#10b981'; // Green for 75%+
  };

  // UM Color Palette
  const umBlue = '#1e3a8a'; // Deep Royal Blue
  const umLightBlue = '#2563eb';
  const umGold = '#fbbf24'; // University Gold

  return (
    <div style={{ backgroundColor: '#f9f9f9', minHeight: '100vh', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", margin: '-20px', paddingBottom: '50px' }}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-warning {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(0.98); background-color: #fee2e2; }
          100% { opacity: 1; transform: scale(1); }
        }
      `}} />
      
      {/* 1. PREMIUM UM BLUE HERO BANNER */}
      <div style={{ 
        backgroundColor: umBlue,
        backgroundImage: `linear-gradient(135deg, ${umBlue} 0%, ${umLightBlue} 100%)`,
        color: 'white',
        padding: '20px 40px 100px 40px', 
        borderBottomLeftRadius: '20px',
        borderBottomRightRadius: '20px',
        position: 'relative',
        overflow: 'hidden',
        marginBottom: activeTab === 'overview' ? '0px' : '40px'
      }}>
        {/* Decorative Circle Background */}
        <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '350px', height: '350px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
        
        {/* Top Nav Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto 40px auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span>
                <h1 style={{ margin: 0, fontSize: '18px', fontWeight: '800', letterSpacing: '0.5px' }}>Faculty Admin Console</h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: 'white', fontWeight: '500' }}>{user.name}</span>
                <button 
                    onClick={onLogout} 
                    style={{ background: 'rgba(255,255,255,0.15)', color:'white', border:'1px solid rgba(255,255,255,0.3)', padding: '6px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: '500', transition: 'all 0.2s' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                >
                    Logout
                </button>
            </div>
        </div>

        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <span style={{ backgroundColor: umGold, color: '#78350f', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold', letterSpacing: '1px', display: 'inline-block', marginBottom: '20px' }}>
            ADMINISTRATOR — FSKTM UM
          </span>
          <h1 style={{ fontSize: '42px', margin: '0 0 10px 0', fontWeight: '700', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
            {activeTab === 'skills' ? 'Skills Gap' : activeTab === 'employability' ? 'Employability' : activeTab === 'moderation' ? 'Content Moderation' : activeTab === 'content' ? 'Content Engine' : 'System Overview'}
          </h1>
          <p style={{ opacity: 0.9, maxWidth: '600px', fontSize: '15px', lineHeight: '1.6', marginBottom: '30px' }}>
            {activeTab === 'overview' ? 'Monitor graduate employability, analyze cohort skill gaps, and identify intervention opportunities.' : 
             activeTab === 'skills' ? 'Detailed matrix of cohort performance across technical skill paths.' :
             activeTab === 'moderation' ? 'Review and moderate community-contributed job posts and mentorship offers.' :
             'Access faculty-wide analytics and automated content generation tools.'}
          </p>

          {/* IN-BANNER TABS */}
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            {[
              { id: 'overview', label: '📊 Overview' },
              { id: 'employability', label: '📈 Employability' },
              { id: 'skills', label: '🎯 Skills Gap' },
              { id: 'resources', label: '📚 Resource Manager' },
              { id: 'quizzes', label: '📝 Quiz Manager' },
              { id: 'moderation', label: `🛡️ Moderation ${stats.pendingPosts > 0 ? `(${stats.pendingPosts})` : ''}` },
              { id: 'content', label: '🗄️ Content Engine' }
            ].map((tab) => (
              <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ 
                      padding: '10px 24px', borderRadius: '30px', fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', border: 'none', transition: 'all 0.2s',
                      backgroundColor: activeTab === tab.id ? 'white' : 'rgba(255,255,255,0.15)', 
                      color: activeTab === tab.id ? umBlue : 'white',
                      boxShadow: activeTab === tab.id ? '0 4px 6px rgba(0,0,0,0.1)' : 'none'
                  }}
              >
                  {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. MAIN CONTENT AREA */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* === TAB: RESOURCE MANAGER === */}
        {activeTab === 'resources' && (
            <ResourceManager />
        )}

        {/* === TAB: QUIZ MANAGER === */}
        {activeTab === 'quizzes' && (
            <QuizManager />
        )}

        {/* === TAB 1: OVERVIEW === */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '30px', marginTop: '-50px', position: 'relative', zIndex: 10 }}>
            {/* KPI METRIC CARDS (Top of Overview) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: `4px solid ${umBlue}` }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: umBlue, marginBottom: '5px' }}>{stats.students}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Active Students</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: `4px solid #10b981` }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#10b981', marginBottom: '5px' }}>{stats.alumni}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Alumni Network</div>
                </div>
                <div style={{ backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', textAlign: 'center', borderTop: `4px solid ${stats.pendingPosts > 0 ? '#ef4444' : '#6b7280'}` }}>
                    <div style={{ fontSize: '36px', fontWeight: 'bold', color: stats.pendingPosts > 0 ? '#ef4444' : '#6b7280', marginBottom: '5px' }}>
                        {stats.pendingPosts}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px' }}>Pending Reviews</div>
                </div>
            </div>

            {/* TWO-COLUMN GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
               {/* Left: Employability Pulse */}
               <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#4b5563', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Employability Pulse</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '5px' }}>FACULTY GE SCORE</div>
                      <div style={{ fontSize: '48px', fontWeight: '800', color: '#111827' }}>81.3%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '5px' }}>UNEMPLOYMENT RATE</div>
                      <div style={{ fontSize: '32px', fontWeight: '700', color: '#ef4444' }}>18.7%</div>
                    </div>
                  </div>
               </div>

               {/* Right: AI Learning Insights */}
               <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#4b5563', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>AI Learning Insights</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                    <div style={{ backgroundColor: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', marginBottom: '5px' }}>TOP REQUESTED ROLE</div>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#4c2882' }}>Software Engineer</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '600', marginBottom: '5px' }}>TOTAL LLM JOURNEYS INITIALIZED</div>
                      <div style={{ fontSize: '32px', fontWeight: '800', color: '#111827' }}>142</div>
                    </div>
                  </div>
               </div>
            </div>

            {/* BOTTOM UTILITY ROW */}
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <button 
                    onClick={() => setActiveTab('content')}
                    style={{ background: '#4c2882', color: 'white', border: 'none', padding: '12px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700', fontSize: '14px' }}
                  >
                    Trigger AI Database Sync ⚙️
                  </button>
                  <p style={{ margin: 0, color: '#6b7280', fontSize: '13px' }}>Last sync: Today at 04:12 AM</p>
               </div>

               {stats.pendingPosts > 0 && (
                  <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fee2e2', color: '#991b1b', padding: '10px 20px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '18px' }}>⚠️</span>
                    <span style={{ fontWeight: '700', fontSize: '13px' }}>Attention: {stats.pendingPosts} community posts require moderation.</span>
                  </div>
               )}
            </div>
          </div>
        )}

        {/* === TAB 2: EMPLOYABILITY DASHBOARD === */}
        {activeTab === 'employability' && (
            <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                <EmployabilityDashboard />
            </div>
        )}

        {/* === TAB 3: SKILLS GAP ANALYZER === */}
        {activeTab === 'skills' && (
            <div>
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '30px', borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
                      <div>
                        <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: 0 }}>Faculty Skills Matrix</h3>
                        <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '5px' }}>Analyze competency scores and qualitative feedback from students.</p>
                      </div>
                      
                      {/* SUB-NAV TOGGLE */}
                      <div style={{ background: '#f3f4f6', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
                        <button 
                          onClick={() => setViewMode('matrix')}
                          style={{ 
                            padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                            background: viewMode === 'matrix' ? 'white' : 'transparent',
                            color: viewMode === 'matrix' ? '#4c2882' : '#6b7280',
                            boxShadow: viewMode === 'matrix' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          📊 Competency Matrix
                        </button>
                        <button 
                          onClick={() => setViewMode('feedback')}
                          style={{ 
                            padding: '8px 16px', borderRadius: '8px', border: 'none', fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s',
                            background: viewMode === 'feedback' ? 'white' : 'transparent',
                            color: viewMode === 'feedback' ? '#4c2882' : '#6b7280',
                            boxShadow: viewMode === 'feedback' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                          }}
                        >
                          💬 Student Feedback Feed
                        </button>
                      </div>
                    </div>

                    {viewMode === 'matrix' ? (
                      <>
                        <p style={{marginBottom: '25px', color: '#6b7280', fontSize: '14px'}}>
                            Scores represent average competency based on AI Roadmaps. 
                            <span style={{color: '#ef4444', fontWeight: 'bold', marginLeft: '10px', backgroundColor: '#fef2f2', padding: '2px 8px', borderRadius: '4px'}}>Red = Critical Gap</span>
                        </p>
                        
                        {/* HEATMAP GRID */}
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: '2px', backgroundColor: '#e5e7eb', border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
                            <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase' }}>Technical Skill</div>
                            <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 1</div>
                            <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 2</div>
                            <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 3</div>
                            <div style={{ backgroundColor: '#f9fafb', padding: '12px', fontWeight: 'bold', color: '#4b5563', fontSize: '13px', textTransform: 'uppercase', textAlign: 'center' }}>Year 4</div>

                            {skillHeatmapData.length > 0 ? skillHeatmapData.map((row, index) => (
                                <React.Fragment key={index}>
                                    <div style={{ backgroundColor: 'white', padding: '15px 12px', fontWeight: '600', color: '#374151' }}>{row.skill}</div>
                                    <div style={{ backgroundColor: getHeatmapColor(row.y1), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y1}%</div>
                                    <div style={{ backgroundColor: getHeatmapColor(row.y2), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y2}%</div>
                                    <div style={{ backgroundColor: getHeatmapColor(row.y3), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y3}%</div>
                                    <div style={{ backgroundColor: getHeatmapColor(row.y4), padding: '15px 12px', color: 'white', fontWeight: 'bold', textAlign: 'center' }}>{row.y4}%</div>
                                </React.Fragment>
                            )) : (
                                <div style={{ gridColumn: 'span 5', backgroundColor: 'white', padding: '40px', textAlign: 'center', color: '#6b7280' }}>No competency data available yet.</div>
                            )}
                        </div>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                          <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '10px' }}>
                              Showing <strong>{feedback.length}</strong> anonymized reports from students. 
                              Use this data to identify gaps in the current curriculum.
                          </p>
                          
                          <div style={{ maxHeight: '600px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px', paddingRight: '10px' }}>
                            {feedback.map((report, idx) => (
                                <div key={idx} style={{ 
                                    padding: '20px', borderRadius: '10px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                    borderLeft: `5px solid ${report.category === 'Technical' ? '#4f46e5' : '#10b981'}`
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                                        <div>
                                            <span style={{ fontSize: '11px', fontWeight: '800', backgroundColor: '#e2e8f0', color: '#475569', padding: '3px 8px', borderRadius: '4px', textTransform: 'uppercase', marginRight: '10px' }}>
                                                {report.category}
                                            </span>
                                            <strong style={{ fontSize: '18px', color: '#1e293b' }}>{report.skill_name}</strong>
                                        </div>
                                        <span style={{ fontSize: '12px', color: '#94a3b8' }}>
                                            {new Date(report.created_at).toLocaleDateString()}
                                        </span>

                                    </div>
                                    <p style={{ margin: 0, color: '#475569', fontSize: '15px', lineHeight: '1.6', fontStyle: 'italic' }}>
                                        "{report.reason}"
                                    </p>
                                </div>
                            ))}
                            {feedback.length === 0 && (
                              <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>No feedback entries found.</div>
                            )}
                          </div>
                      </div>
                    )}
                </div>

                {/* Recommendations (Only in matrix mode) */}
                {viewMode === 'matrix' && (
                  <div style={{marginTop: '30px', display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))'}}>
                      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #ef4444' }}>
                          <h4 style={{fontSize: '16px', fontWeight: '700', color: '#ef4444', margin: '0 0 10px 0'}}>🚨 Critical Gap Detected</h4>
                          <p style={{color: '#4b5563', fontSize: '15px', lineHeight: '1.5'}}><strong>Cybersecurity</strong> proficiency is below 30% for Year 1-3 students. This falls below the industry benchmark.</p>
                          <button style={{marginTop: '15px', padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'}}>
                              Schedule "Cybersec 101" Workshop
                          </button>
                      </div>
                      <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '25px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b' }}>
                          <h4 style={{fontSize: '16px', fontWeight: '700', color: '#f59e0b', margin: '0 0 10px 0'}}>⚠️ Moderate Gap Detected</h4>
                          <p style={{color: '#4b5563', fontSize: '15px', lineHeight: '1.5'}}><strong>Cloud Computing (AWS)</strong> is lagging in Year 2 cohorts. Early intervention recommended.</p>
                          <button style={{marginTop: '15px', padding: '8px 16px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '600'}}>
                              Contact AWS Academy Partner
                          </button>
                      </div>
                  </div>
                )}
            </div>
        )}

        {/* === TAB 4: MODERATION === */}
        {activeTab === 'moderation' && (
            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h2 style={{ fontSize: '24px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', marginBottom: '20px' }}>Pending Content Review</h2>
                
                {posts.filter(p => p.status === 'pending').length === 0 ? (
                    <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '60px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', textAlign: 'center', borderTop: '4px solid #10b981' }}>
                        <span style={{ fontSize: '40px', display: 'block', marginBottom: '15px' }}>✅</span>
                        <h3 style={{ fontSize: '20px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', margin: '0 0 10px 0' }}>All Caught Up!</h3>
                        <p style={{color: '#6b7280'}}>No pending posts to review at this time.</p>
                    </div>
                ) : (
                    posts.filter(p => p.status === 'pending').map((post) => (
                        <div key={post.id} style={{ backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #f59e0b', marginBottom: '20px' }}>
                            
                            {/* Header */}
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                                <div>
                                    <span style={{fontSize: '12px', fontWeight: 'bold', color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.5px', backgroundColor: '#fef3c7', padding: '4px 10px', borderRadius: '12px'}}>
                                        Requires Approval
                                    </span>
                                    <h3 style={{fontSize: '22px', color: '#111827', margin: '10px 0 5px 0', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"}}>{post.title}</h3>
                                </div>
                                <span style={{fontSize: '12px', background: '#e5e7eb', padding: '6px 12px', borderRadius: '12px', color: '#374151', fontWeight: 'bold', textTransform: 'uppercase'}}>
                                    {post.post_type.replace('_', ' ')}
                                </span>
                            </div>

                            {/* Author Info */}
                            <p style={{fontSize: '14px', color: '#6b7280', margin: '5px 0 15px 0'}}>
                                Posted by: <strong style={{color: '#374151'}}>{post.users?.name}</strong> 
                                {post.company_name && ` • Company: ${post.company_name}`}
                            </p>
                            
                            {/* Main Content */}
                            <div style={{background: '#f9fafb', padding: '20px', fontSize: '15px', color: '#374151', borderRadius: '8px', whiteSpace: 'pre-line', lineHeight: '1.6', border: '1px solid #e5e7eb'}}>
                                {post.content}
                            </div>

                            {/* Attachments (Image & Link) */}
                            <div style={{marginTop: '20px'}}>
                                {post.image_url && (
                                    <div style={{marginBottom: '15px'}}>
                                        <p style={{fontSize: '12px', color: '#6b7280', fontWeight: 'bold', margin: '0 0 8px 0', textTransform: 'uppercase'}}>Attached Image:</p>
                                        <img src={post.image_url} alt="Attached poster" style={{maxHeight: '250px', borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}} />
                                    </div>
                                )}

                                {post.application_link && (
                                    <p style={{fontSize: '14px', backgroundColor: '#eff6ff', padding: '10px', borderRadius: '6px', color: '#1d4ed8'}}>
                                        <strong>External Link:</strong> <a href={post.application_link} target="_blank" rel="noopener noreferrer" style={{color: '#2563eb', textDecoration: 'none', fontWeight: '500'}}>{post.application_link}</a>
                                    </p>
                                )}
                            </div>

                            {/* Admin Action Buttons */}
                            <div style={{display: 'flex', gap: '15px', marginTop: '25px', borderTop: '1px solid #e5e7eb', paddingTop: '20px'}}>
                                <button 
                                    onClick={() => updateStatus(post.id, 'approved')} 
                                    style={{padding: '12px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '15px', transition: 'background 0.2s'}}
                                >
                                    ✅ Approve Post
                                </button>
                                <button 
                                    onClick={() => updateStatus(post.id, 'rejected')} 
                                    style={{padding: '12px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', flex: 1, fontSize: '15px', transition: 'background 0.2s'}}
                                >
                                    ❌ Reject Post
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        )}

        {/* === ⚡ NEW TAB 5: CONTENT ENGINE === */}
        {activeTab === 'content' && (
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* 1. INTERACTIVE AI GENERATOR */}
                <InteractiveGenerator />

                {/* 2. CAREER MANAGEMENT (DELETE/PUBLISH) */}
                <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: '4px solid #ef4444' }}>
                    <h3 style={{ fontSize: '24px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif", color: '#111827', marginBottom: '10px' }}>Manage Existing Pathways</h3>
                    <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>Review, publish, or delete existing roadmaps.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {[...new Map(skillHeatmapData.map(s => [s.career_id, s])).values()].map((c, idx) => (
                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ fontWeight: '600' }}>{c.career_name}</span>
                                    {c.career_status === 'draft' && <span style={{ fontSize: '10px', background: umGold, color: '#78350f', padding: '2px 8px', borderRadius: '10px', fontWeight: '800' }}>DRAFT</span>}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {c.career_status === 'draft' && (
                                        <button 
                                            onClick={async () => {
                                                if (!window.confirm(`Make ${c.career_name} live for students?`)) return;
                                                const res = await fetch(`http://127.0.0.1:5000/api/admin/career/publish/${c.career_id}`, { method: 'POST' });
                                                if (res.ok) { alert("Published!"); fetchData(); }
                                            }}
                                            style={{ background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                        >
                                            🚀 Publish
                                        </button>
                                    )}
                                    <button 
                                        onClick={async () => {
                                            if (!window.confirm(`Are you SURE? This will delete the entire ${c.career_name} roadmap and ALL student progress for it.`)) return;
                                            const res = await fetch(`http://127.0.0.1:5000/api/admin/career/delete/${c.career_id}`, { method: 'DELETE' });
                                            if (res.ok) { alert("Deleted."); fetchData(); }
                                        }}
                                        style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #fee2e2', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                                    >
                                        🗑️ Delete Path
                                    </button>
                                </div>
                            </div>
                        ))}
                        {skillHeatmapData.length === 0 && <p style={{ textAlign: 'center', color: '#9ca3af' }}>No pathways found.</p>}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};
export default AdminDashboard;
