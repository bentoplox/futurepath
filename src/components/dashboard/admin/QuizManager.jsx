import { API_BASE_URL } from '../../../apiConfig';
import React, { useState, useEffect } from 'react';

const QuizManager = ({ umBlue, umLightBlue, umGold }) => {
    const [careerMap, setCareerMap] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState(null);
    const [quizzes, setQuizzes] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [loadingQuizzes, setLoadingQuizzes] = useState(false);
    const [expandedCareer, setExpandedCareer] = useState(null);

    const [generatingQuiz, setGeneratingQuiz] = useState(false);
    const [quizDraft, setQuizDraft] = useState(null);

    // ⚡ NEW: Lifecycle Filter State
    const [lifecycleFilter, setLifecycleFilter] = useState('published');

    useEffect(() => { fetchCareerSkills(); }, []);

    const fetchCareerSkills = async () => {
        const res = await fetch(`${API_BASE_URL}/api/admin/career-skills`);
        const data = await res.json();
        if (data.success) setCareerMap(data.data);
    };

    const handlePublish = async (cId) => {
        if (!window.confirm("Make this career LIVE for all students?")) return;
        const res = await fetch(`${API_BASE_URL}/api/admin/career/publish/${cId}`, { method: 'POST' });
        if (res.ok) { 
            alert("Published Successfully!"); 
            fetchCareerSkills();
            setLifecycleFilter('published'); // Switch to published view after success
        }
    };

    const fetchQuizzes = async (skillId) => {
        setLoadingQuizzes(true);
        const res = await fetch(`${API_BASE_URL}/api/admin/quizzes?skill_id=${skillId}`);
        const data = await res.json();
        if (data.success) setQuizzes(data.quizzes);
        setLoadingQuizzes(false);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        const res = await fetch(`${API_BASE_URL}/api/admin/quizzes/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editingQuiz)
        });
        if (res.ok) {
            setEditingQuiz(null);
            fetchQuizzes(selectedSkill.skill_id);
        }
    };

    const handleGenerateQuiz = async (skill) => {
        setGeneratingQuiz(true);
        const res = await fetch(`${API_BASE_URL}/api/admin/skill/generate-quiz`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill_name: skill.skill_name })
        });
        const data = await res.json();
        if (data.success) setQuizDraft(data.draft);
        setGeneratingQuiz(false);
    };

    const saveApprovedQuiz = async () => {
        const res = await fetch(`${API_BASE_URL}/api/admin/skill/save-quizzes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ skill_id: selectedSkill.skill_id, questions: quizDraft })
        });
        if (res.ok) { alert("Quizzes saved!"); setQuizDraft(null); fetchQuizzes(selectedSkill.skill_id); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this quiz question forever?")) return;
        await fetch(`${API_BASE_URL}/api/admin/quizzes/delete/${id}`, { method: 'DELETE' });
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

    // Filtered pathways for the sidebar
    const filteredPathways = careerMap.filter(p => p.status === lifecycleFilter);

    const fontStack = "'Aeonik', 'Plus Jakarta Sans', sans-serif";

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '30px', backgroundColor: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', minHeight: '600px', fontFamily: fontStack }}>
            {/* Sidebar */}
            <div style={{ borderRight: '1px solid #f3f4f6', paddingRight: '20px', maxHeight: '70vh', overflowY: 'auto' }}>
                
                {/* ⚡ LIFECYCLE TOGGLE */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '25px', backgroundColor: '#f1f5f9', padding: '5px', borderRadius: '10px' }}>
                    <button 
                        onClick={() => { setLifecycleFilter('published'); setExpandedCareer(null); setSelectedSkill(null); }}
                        style={{ 
                            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                            background: lifecycleFilter === 'published' ? 'white' : 'transparent',
                            color: lifecycleFilter === 'published' ? '#065f46' : '#64748b',
                            boxShadow: lifecycleFilter === 'published' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                    >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10b981' }}></div>
                        Published
                    </button>
                    <button 
                        onClick={() => { setLifecycleFilter('draft'); setExpandedCareer(null); setSelectedSkill(null); }}
                        style={{ 
                            flex: 1, padding: '8px', borderRadius: '8px', border: 'none', fontSize: '11px', fontWeight: '800', cursor: 'pointer',
                            background: lifecycleFilter === 'draft' ? 'white' : 'transparent',
                            color: lifecycleFilter === 'draft' ? '#9a3412' : '#64748b',
                            boxShadow: lifecycleFilter === 'draft' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                    >
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
                        Drafts
                    </button>
                </div>

                <h4 style={{ fontSize: '12px', color: '#6b7280', textTransform: 'uppercase', marginBottom: '20px', letterSpacing: '1px', fontWeight: '800' }}>
                    {lifecycleFilter === 'published' ? '🌐 Live Library' : '📝 Sandbox Drafts'}
                </h4>

                {filteredPathways.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px', fontStyle: 'italic' }}>
                        No {lifecycleFilter} pathways found.
                    </div>
                ) : filteredPathways.map(career => (
                    <div key={career.career_id} style={{ marginBottom: '10px' }}>
                        <div 
                            onClick={() => setExpandedCareer(expandedCareer === career.career_id ? null : career.career_id)}
                            style={{ 
                                fontWeight: 'bold', color: umBlue, fontSize: '14px', marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                                padding: '12px', borderRadius: '10px', background: expandedCareer === career.career_id ? '#f8fafc' : 'transparent', transition: 'all 0.2s'
                            }}
                        >
                            <span>{expandedCareer === career.career_id ? '📂' : '📁'}</span> 
                            <div style={{ flex: 1 }}>
                                {career.career_name}
                                {career.status === 'draft' && <span style={{ marginLeft: '8px', fontSize: '10px', background: '#fff7ed', color: '#9a3412', padding: '2px 6px', borderRadius: '10px', fontWeight: '800', border: '1px solid #ffedd5' }}>DRAFT</span>}
                            </div>
                        </div>
                        {expandedCareer === career.career_id && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginLeft: '25px', marginTop: '5px', borderLeft: '2px solid #e5e7eb', paddingLeft: '10px' }}>
                                {career.status === 'draft' && (
                                    <button onClick={() => handlePublish(career.career_id)} style={{ background: '#065f46', color: 'white', border: 'none', borderRadius: '6px', padding: '10px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '10px', boxShadow: '0 4px 6px rgba(6, 95, 70, 0.2)' }}>🚀 PUBLISH NOW</button>
                                )}
                                {career.skills.map(skill => (
                                    <button 
                                        key={skill.skill_id}
                                        onClick={() => { setSelectedSkill(skill); fetchQuizzes(skill.skill_id); setEditingQuiz(null); }}
                                        style={{ 
                                            textAlign: 'left', padding: '10px 15px', borderRadius: '8px', border: 'none', fontSize: '13px', cursor: 'pointer',
                                            background: selectedSkill?.skill_id === skill.skill_id ? '#eff6ff' : 'transparent',
                                            color: selectedSkill?.skill_id === skill.skill_id ? umLightBlue : '#4b5563',
                                            fontWeight: selectedSkill?.skill_id === skill.skill_id ? '800' : '500',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        {skill.skill_name}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Main Content */}
            <div>
                {selectedSkill ? (
                    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #f3f4f6', paddingBottom: '20px' }}>
                            <div>
                                <h3 style={{ fontSize: '28px', margin: '0 0 5px 0', fontWeight: '800', color: '#111827' }}>{selectedSkill.skill_name}</h3>
                                <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>Review and refine assessment questions for this technical module.</p>
                            </div>
                            {!editingQuiz && !quizDraft && (
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={() => handleGenerateQuiz(selectedSkill)} disabled={generatingQuiz} style={{ padding: '12px 20px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}>
                                        {generatingQuiz ? '⏳ Drafting...' : 'Auto-Generate with AI'}
                                    </button>
                                    <button onClick={startAdd} style={{ padding: '12px 20px', background: '#065f46', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(6, 95, 70, 0.2)' }}>
                                        <span>➕</span> Manual Input
                                    </button>
                                </div>
                            )}
                        </div>

                        {quizDraft ? (
                            <div style={{ backgroundColor: '#fff7ed', padding: '30px', borderRadius: '16px', border: '1px solid #ffedd5', marginBottom: '40px' }}>
                                <h4 style={{ color: '#9a3412', marginBottom: '15px' }}>📋 Review AI Draft Quizzes</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                                    {quizDraft.map((q, i) => (
                                        <div key={i} style={{ background: 'white', padding: '15px', borderRadius: '10px', border: '1px solid #fed7aa' }}>
                                            <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{q.question}</p>
                                            <div style={{ fontSize: '12px', color: '#065f46', fontWeight: 'bold' }}>✓ Correct: {q.correct_answer}</div>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button onClick={saveApprovedQuiz} style={{ flex: 1, padding: '12px', background: '#065f46', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>✅ Approve & Save</button>
                                    <button onClick={() => setQuizDraft(null)} style={{ padding: '12px 25px', background: '#e5e7eb', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Discard</button>
                                </div>
                            </div>
                        ) : editingQuiz ? (
                            <div style={{ backgroundColor: '#f8fafc', padding: '40px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)' }}>
                                <h4 style={{ margin: '0 0 25px 0', fontSize: '20px', fontWeight: '700', color: umBlue }}>{editingQuiz.quiz_id ? '✏️ Edit Question' : '✨ New Assessment Question'}</h4>
                                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                                    <div>
                                        <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Question Text</label>
                                        <textarea 
                                            style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #d1d5db', marginTop: '8px', fontSize: '15px', minHeight: '100px', outline: 'none', transition: 'border-color 0.2s', fontFamily: 'inherit' }}
                                            value={editingQuiz.question}
                                            onChange={e => setEditingQuiz({...editingQuiz, question: e.target.value})}
                                            required
                                            placeholder="Enter the question here..."
                                        />
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        {editingQuiz.options.map((opt, idx) => (
                                            <div key={idx}>
                                                <label style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8' }}>OPTION {idx + 1}</label>
                                                <input 
                                                    style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', marginTop: '6px', fontSize: '14px', outline: 'none', fontFamily: 'inherit' }}
                                                    value={opt}
                                                    onChange={e => {
                                                        const newOpts = [...editingQuiz.options];
                                                        newOpts[idx] = e.target.value;
                                                        setEditingQuiz({...editingQuiz, options: newOpts});
                                                    }}
                                                    required
                                                    placeholder={`Choice ${idx + 1}`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>CORRECT ANSWER</label>
                                            <select 
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', marginTop: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', fontFamily: 'inherit' }}
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
                                            <label style={{ fontSize: '12px', fontWeight: '800', color: '#64748b' }}>DIFFICULTY LEVEL</label>
                                            <select 
                                                style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #d1d5db', marginTop: '8px', fontSize: '14px', outline: 'none', backgroundColor: 'white', fontFamily: 'inherit' }}
                                                value={editingQuiz.difficulty}
                                                onChange={e => setEditingQuiz({...editingQuiz, difficulty: e.target.value})}
                                            >
                                                <option value="Beginner">Beginner</option>
                                                <option value="Intermediate">Intermediate</option>
                                                <option value="Advanced">Advanced</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                                        <button type="submit" style={{ flex: 1, padding: '16px', background: umBlue, color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>💾 Save Question</button>
                                        <button type="button" onClick={() => setEditingQuiz(null)} style={{ padding: '16px 30px', background: '#e5e7eb', color: '#4b5563', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', fontSize: '15px' }}>Cancel</button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {loadingQuizzes ? <p style={{ textAlign: 'center', color: '#6b7280', padding: '40px' }}>Loading assessment data...</p> : (
                                    quizzes.length > 0 ? quizzes.map(q => (
                                        <div key={q.quiz_id} style={{ padding: '30px', border: '1px solid #e5e7eb', borderRadius: '16px', backgroundColor: 'white', transition: 'transform 0.2s', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }} onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseOut={e => e.currentTarget.style.transform = 'none'}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                                                    <span style={{ fontSize: '11px', fontWeight: '900', background: '#eff6ff', color: umLightBlue, padding: '4px 12px', borderRadius: '6px', textTransform: 'uppercase' }}>{q.difficulty}</span>
                                                    {/* ⚡ QUIZ QUALITY VOTE COUNTERS */}
                                                    <div style={{ display: 'flex', gap: '5px', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                                                        <span style={{ fontSize: '12px', color: '#065f46', fontWeight: 'bold' }}>▲ {q.upvotes || 0}</span>
                                                        <span style={{ fontSize: '12px', color: '#cbd5e1' }}>|</span>
                                                        <span style={{ fontSize: '12px', color: '#991b1b', fontWeight: 'bold' }}>▼ {q.downvotes || 0}</span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '15px' }}>
                                                    <button onClick={() => setEditingQuiz(q)} style={{ color: umLightBlue, background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '800' }}>Edit</button>
                                                    <button onClick={() => handleDelete(q.quiz_id)} style={{ color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '800' }}>Delete</button>
                                                </div>
                                            </div>
                                            <p style={{ fontWeight: '700', margin: '0 0 20px 0', fontSize: '18px', color: '#111827', lineHeight: '1.4' }}>{q.question}</p>
                                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                                {q.options.map((opt, i) => (
                                                    <div key={i} style={{ 
                                                        padding: '12px 15px', borderRadius: '10px', fontSize: '14px', border: '1px solid #f3f4f6',
                                                        background: opt === q.correct_answer ? '#ecfdf5' : '#f9fafb',
                                                        color: opt === q.correct_answer ? '#065f46' : '#6b7280',
                                                        borderLeft: opt === q.correct_answer ? `4px solid #065f46` : '1px solid #f3f4f6',
                                                        fontWeight: opt === q.correct_answer ? '700' : '500'
                                                    }}>
                                                        {String.fromCharCode(65 + i)}. {opt} {opt === q.correct_answer && '✓'}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )) : (
                                        <div style={{ textAlign: 'center', padding: '80px', backgroundColor: '#f9fafb', borderRadius: '16px', border: '2px dashed #e5e7eb' }}>
                                            <span style={{ fontSize: '48px', display: 'block', marginBottom: '20px' }}>📝</span>
                                            <h4 style={{ color: '#111827', margin: '0 0 10px 0' }}>No Questions Found</h4>
                                            <p style={{ color: '#6b7280', margin: 0 }}>There are no assessment questions for this skill yet.</p>
                                            <button onClick={startAdd} style={{ marginTop: '20px', background: 'none', border: 'none', color: umLightBlue, fontWeight: '800', cursor: 'pointer' }}>Create the first question →</button>
                                        </div>
                                    )
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '150px 0', color: '#9ca3af' }}>
                        <span style={{ fontSize: '64px', display: 'block', marginBottom: '20px' }}>📝</span>
                        <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#4b5563', margin: '0 0 10px 0' }}>Assessment Management</h3>
                        <p style={{ maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>Select a career path and skill from the library to manage student evaluation questions.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuizManager;
