import React, { useState } from 'react';

const InteractiveGenerator = ({ fetchData, umBlue, umLightBlue, umGold }) => {
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
            alert("Saved as DRAFT!");
            setStep(1);
            setCareerName('');
            fetchData();
        }
        setLoading(false);
    };

    const removeDraftStep = (index) => setDraftSteps(draftSteps.filter((_, i) => i !== index));
    const updateDraftStep = (i, f, v) => { const u = [...draftSteps]; u[i][f] = v; setDraftSteps(u); };
    const removeDraftQuiz = (si, qi) => { const u = [...draftQuizzes]; u[si].questions = u[si].questions.filter((_, i) => i !== qi); setDraftQuizzes(u); };
    const updateDraftQuiz = (si, qi, f, v) => { const u = [...draftQuizzes]; u[si].questions[qi][f] = v; setDraftQuizzes(u); };
    const updateDraftQuizOption = (si, qi, oi, v) => { const u = [...draftQuizzes]; u[si].questions[qi].options[oi] = v; setDraftQuizzes(u); };

    return (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderTop: `4px solid ${umGold}` }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
                {[1, 2, 3].map(i => <div key={i} style={{ height: '4px', flex: 1, borderRadius: '2px', background: step >= i ? umGold : '#f3f4f6' }}></div>)}
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
                                        <button onClick={() => removeDraftQuiz(si, qi)} style={{ position: 'absolute', top: 0, right: 0, border: 'none', background: 'none', color: '#ef4444', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}>Delete ✕</button>
                                        <input style={{ width: '90%', padding: '8px 0', border: 'none', borderBottom: '1px solid #e5e7eb', fontSize: '14px', fontWeight: '500', marginBottom: '15px' }} value={q.question} onChange={(e) => updateDraftQuiz(si, qi, 'question', e.target.value)} />
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '15px' }}>
                                            {q.options.map((opt, oi) => <input key={oi} style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #f3f4f6', fontSize: '12px' }} value={opt} onChange={(e) => updateDraftQuizOption(si, qi, oi, e.target.value)} />)}
                                        </div>
                                        <select style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #e5e7eb', fontSize: '12px' }} value={q.correct_answer} onChange={(e) => updateDraftQuiz(si, qi, 'correct_answer', e.target.value)}>
                                            {q.options.map((opt, oi) => <option key={oi} value={opt}>{opt}</option>)}
                                        </select>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                    <button onClick={publishPath} disabled={loading} style={{ width: '100%', padding: '15px', background: '#10b981', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Saving...' : '💾 Save as Draft'}</button>
                </div>
            )}
        </div>
    );
};

export default InteractiveGenerator;
