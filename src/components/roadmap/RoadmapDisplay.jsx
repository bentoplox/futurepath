// ============================================================================
// FILE: src/components/roadmap/RoadmapDisplay.jsx
// PURPOSE: Displays Roadmap and LOCKS completion behind Quiz
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import QuizModal from './QuizModal';

const RoadmapDisplay = ({ careerId }) => { 
  const { user } = useAuth();
  
  // Data States
  const [roadmapInfo, setRoadmapInfo] = useState({ title: '', description: '' });
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set()); 
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [activeQuizStep, setActiveQuizStep] = useState(null); 

  useEffect(() => {
    if (!careerId || !user) return;
    fetchRoadmapData();
  }, [careerId, user]);

  const fetchRoadmapData = async () => {
    setLoading(true);
    try {
      // 1. Get Roadmap Info
      const { data: info } = await supabase.from('ai_roadmaps').select('*').eq('id', careerId).single();
      if (info) setRoadmapInfo(info);

      // 2. Get Steps
      const { data: stepData } = await supabase.from('ai_roadmap_steps').select('*').eq('roadmap_id', careerId).order('step_order', { ascending: true });
      setSteps(stepData || []);

    } catch (err) {
      console.error("Error fetching roadmap:", err);
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  // HANDLER: When user clicks the button
  const handleStepAction = (step) => {
    if (completedSteps.has(step.id)) {
        const newSet = new Set(completedSteps);
        newSet.delete(step.id);
        setCompletedSteps(newSet);
    } else {
        // IF NOT DONE -> OPEN QUIZ
        setActiveQuizStep(step);
    }
  };

  // HANDLER: When Quiz is Passed
  const handleQuizPassed = () => {
      const newSet = new Set(completedSteps);
      newSet.add(activeQuizStep.id);
      setCompletedSteps(newSet);
      setActiveQuizStep(null); // Close modal
  };

  if (loading) return <div style={{textAlign:'center', padding:'40px'}}>Loading generated roadmap...</div>;
  if (errorMsg) return <div style={{textAlign:'center', color:'red', padding:'40px'}}>Error: {errorMsg}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#111827' }}>🗺️ {roadmapInfo.title}</h2>
          <p style={{ color: '#4b5563', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>{roadmapInfo.description}</p>
      </div>
      
      {/* Completion Badge */}
      {steps.length > 0 && completedSteps.size === steps.length && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '30px', border: '1px solid #34d399' }}>
              🏆 <strong>Roadmap Completed!</strong> You are ready for the Malaysian job market.
          </div>
      )}

      {/* Timeline Steps */}
      <div style={{ position: 'relative', paddingLeft: '20px' }}>
        <div style={{ position: 'absolute', left: '29px', top: '20px', bottom: '20px', width: '2px', backgroundColor: '#e5e7eb' }}></div>

        {steps.map((step) => {
          const isCompleted = completedSteps.has(step.id);
          return (
            <div key={step.id} style={{ marginBottom: '30px', position: 'relative', display: 'flex', gap: '20px' }}>
              <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: isCompleted ? '#10b981' : 'white', 
                  border: isCompleted ? '2px solid #10b981' : '2px solid #6366f1',
                  color: isCompleted ? 'white' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', zIndex: 1, flexShrink: 0
              }}>
                {isCompleted ? '✓' : step.step_order}
              </div>

              <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: isCompleted ? '1px solid #10b981' : '1px solid #e5e7eb' }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#111827', fontSize: '18px' }}>{step.title}</h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '14px', marginBottom: '15px' }}>{step.description}</p>
                
                {/* ⚡ NEW RESOURCE DISPLAY BLOCK */}
                {step.resource_link && (
                    <div style={{ 
                        marginTop: '15px', 
                        backgroundColor: '#f8fafc', 
                        border: '1px solid #e2e8f0', 
                        borderRadius: '8px', 
                        padding: '12px' 
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '11px', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Recommended Resource
                            </span>
                            {/* Cost Badge */}
                            <span style={{ 
                                fontSize: '11px', fontWeight: '700', 
                                padding: '2px 8px', borderRadius: '12px',
                                backgroundColor: step.resource_type === 'Paid' ? '#fef3c7' : '#dcfce7',
                                color: step.resource_type === 'Paid' ? '#92400e' : '#166534',
                                border: step.resource_type === 'Paid' ? '1px solid #fcd34d' : '1px solid #86efac'
                            }}>
                                {step.resource_type || 'Free'}
                            </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '16px' }}>📚</span>
                            <a 
                                href={step.resource_link} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                style={{ 
                                    color: '#2563eb', 
                                    textDecoration: 'none', 
                                    fontWeight: '600', 
                                    fontSize: '14px',
                                    flex: 1,
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            >
                                {step.resource_title || "View Learning Material"}
                            </a>
                            <span style={{ color: '#94a3b8', fontSize: '12px' }}>↗</span>
                        </div>
                    </div>
                )}
                
                {/* THE BUTTON */}
                <button 
                    onClick={() => handleStepAction(step)}
                    style={{
                        marginTop: '15px', padding: '8px 16px', fontSize: '13px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: '600',
                        backgroundColor: isCompleted ? '#d1fae5' : '#4f46e5',
                        color: isCompleted ? '#065f46' : 'white',
                        width: '100%' // Full width button looks cleaner on mobile
                    }}
                >
                    {isCompleted ? 'Mark as Incomplete' : 'Take Quiz to Verify Skill'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* QUIZ MODAL */}
      {activeQuizStep && (
        <QuizModal 
            skillTitle={activeQuizStep.title} 
            onClose={() => setActiveQuizStep(null)}
            onQuizPass={handleQuizPassed}
        />
      )}

    </div>
  );
};

export default RoadmapDisplay;