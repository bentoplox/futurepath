// ============================================================================
// FILE: src/components/roadmap/RoadmapDisplay.jsx
// PURPOSE: Fetches roadmap from Flask Internal API
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QuizModal from './QuizModal';

const RoadmapDisplay = ({ careerId }) => { 
  const { user } = useAuth();
  
  // Data States
  const [roadmapInfo, setRoadmapInfo] = useState({ career_name: '', description: '' });
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set()); 

  // UI States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Capstone Exam State
  const [showFinalExam, setShowFinalExam] = useState(false); 
  const [isCertified, setIsCertified] = useState(false);

  useEffect(() => {
    if (!careerId) return;
    fetchRoadmapData();
  }, [careerId]);

  // ⚡ FETCH FROM YOUR FLASK BACKEND (Internal API)
  const fetchRoadmapData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      // Calls the new FR4.2 route we built in app.py
      const response = await fetch(`http://127.0.0.1:5000/api/roadmap/${careerId}`);
      const data = await response.json();

      if (data.success) {
          setRoadmapInfo(data.career);
          setSteps(data.steps || []);
      } else {
          setErrorMsg(data.error || "Failed to load roadmap.");
      }
    } catch (err) {
      console.error("Error fetching from Flask:", err);
      setErrorMsg("Failed to connect to the backend server.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (stepId) => {
      const newSet = new Set(completedSteps);
      if (newSet.has(stepId)) newSet.delete(stepId);
      else newSet.add(stepId);
      setCompletedSteps(newSet);
  };

  // ⚡ SEND PROGRESS TO FLASK
  const handleExamPassed = async () => {
      setIsCertified(true);
      setShowFinalExam(false); 
      
      if (user) {
          try {
              await fetch('http://127.0.0.1:5000/api/progress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      user_id: user.user_id,
                      step_id: steps[steps.length - 1].step_id, // Marks last step to signify completion
                      status: 'completed'
                  })
              });
          } catch (err) {
              console.error("Failed to save progress:", err);
          }
      }
  };

  if (loading) return <div style={{textAlign:'center', padding:'40px'}}>Loading your personalized learning path...</div>;
  if (errorMsg) return <div style={{textAlign:'center', color:'red', padding:'40px'}}>Error: {errorMsg}</div>;

  const allStepsDone = steps.length > 0 && completedSteps.size === steps.length;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '50px' }}>
      
      {/* 1. HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#111827', fontFamily: 'Georgia, serif' }}>🗺️ {roadmapInfo.career_name}</h2>
          <p style={{ color: '#4b5563', fontSize: '16px', maxWidth: '600px', margin: '0 auto' }}>{roadmapInfo.description}</p>
      </div>

      {/* 2. ROADMAP STEPS */}
      <div style={{ position: 'relative', paddingLeft: '20px', marginBottom: '40px' }}>
        <div style={{ position: 'absolute', left: '29px', top: '20px', bottom: '20px', width: '2px', backgroundColor: '#e5e7eb' }}></div>

        {steps.map((step) => {
          const isCompleted = completedSteps.has(step.step_id);
          const skill = step.skill; // Unpacking the nested skill object from the database

          return (
            <div key={step.step_id} style={{ marginBottom: '30px', position: 'relative', display: 'flex', gap: '20px' }}>
              
              <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', 
                  backgroundColor: isCompleted ? '#10b981' : 'white', 
                  border: isCompleted ? '2px solid #10b981' : '2px solid #6366f1',
                  color: isCompleted ? 'white' : '#6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '18px', zIndex: 1, flexShrink: 0, transition: 'all 0.3s'
              }}>
                {isCompleted ? '✓' : step.step_order}
              </div>

              <div style={{ flex: 1, backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', border: isCompleted ? '1px solid #10b981' : '1px solid #e5e7eb', transition: 'all 0.3s' }}>
                <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#111827', fontSize: '18px' }}>{skill.skill_name}</h3>
                <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '14px', marginBottom: '15px' }}>{skill.description}</p>
                
                {/* Checkbox */}
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', padding: '10px', backgroundColor: isCompleted ? '#ecfdf5' : '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb', width: 'fit-content' }}>
                  <input type="checkbox" checked={isCompleted} onChange={() => toggleStep(step.step_id)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
                  <span style={{ fontSize: '14px', fontWeight: '600', color: isCompleted ? '#065f46' : '#4b5563' }}>
                      {isCompleted ? 'Module Completed' : 'Mark as Read'}
                  </span>
                </label>
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. CAPSTONE FINAL EXAM SECTION */}
      {allStepsDone && !isCertified && (
          <div style={{ backgroundColor: '#e0e7ff', padding: '30px', borderRadius: '12px', textAlign: 'center', marginBottom: '40px', border: '2px solid #6366f1' }}>
              <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🎓</span>
              <h3 style={{ color: '#3730a3', fontSize: '22px', margin: '0 0 10px 0' }}>Ready for Certification?</h3>
              <p style={{ color: '#4338ca', marginBottom: '20px' }}>You've finished all the modules. Take the final exam to verify your skills.</p>
              <button 
                onClick={() => setShowFinalExam(true)}
                style={{ backgroundColor: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                Start Final Exam 🚀
              </button>
          </div>
      )}

      {isCertified && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '40px', border: '1px solid #34d399', fontSize: '18px', fontWeight: 'bold' }}>
              🏆 Certification Passed! You are ready for the job market.
          </div>
      )}

      {/* QUIZ MODAL TRIGGER */}
      {showFinalExam && (
        <QuizModal 
            // We pass the ID of the last skill to fetch the associated quiz
            skillId={steps[steps.length - 1].skill.skill_id} 
            onClose={() => setShowFinalExam(false)}
            onQuizPass={handleExamPassed}
        />
      )}

    </div>
  );
};

export default RoadmapDisplay;