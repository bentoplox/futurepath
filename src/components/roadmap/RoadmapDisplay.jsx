// ============================================================================
// FILE: src/components/roadmap/RoadmapDisplay.jsx
// PURPOSE: Fetches roadmap from Flask Internal API
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QuizModal from './QuizModal';
import SkillCard from './SkillCard';

const RoadmapDisplay = ({ careerId }) => { 
  const { user } = useAuth();
  
  // Data States
  const [roadmapInfo, setRoadmapInfo] = useState({ career_name: '', description: '' });
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set()); 

  // UI States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  // Capstone Exam State (Now synced with backend)
  const [showFinalExam, setShowFinalExam] = useState(false); 
  const [isCertified, setIsCertified] = useState(false);
  const [isEligibleForQuiz, setIsEligibleForQuiz] = useState(false);

  useEffect(() => {
    if (!careerId || !user?.user_id) return;
    fetchRoadmapData();
  }, [careerId, user?.user_id]);

  // ⚡ FETCH FROM YOUR FLASK BACKEND (Internal API)
  const fetchRoadmapData = async () => {
    if (!user?.user_id) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      // Calls the new FR4.2 route we built in app.py
      const url = `http://127.0.0.1:5000/api/roadmap/${careerId}?user_id=${user.user_id}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
          setRoadmapInfo(data.career);
          setSteps(data.steps || []);
          setIsEligibleForQuiz(data.is_eligible_for_quiz);
          setIsCertified(data.is_certified);
          
          // ⚡ RESTORE COMPLETED STEPS FROM BACKEND
          if (data.completed_steps) {
              setCompletedSteps(new Set(data.completed_steps));
          }
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

  const toggleStep = async (stepId) => {
      const isCurrentlyCompleted = completedSteps.has(stepId);
      const newSet = new Set(completedSteps);
      
      if (isCurrentlyCompleted) newSet.delete(stepId);
      else newSet.add(stepId);
      
      setCompletedSteps(newSet);

      // ⚡ SYNC WITH BACKEND
      if (user) {
          try {
              const res = await fetch('http://127.0.0.1:5000/api/progress', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                      user_id: user.user_id,
                      step_id: stepId,
                      status: isCurrentlyCompleted ? 'incomplete' : 'completed'
                  })
              });
              
              const syncData = await res.json();
              if (syncData.success) {
                  // After ticking, we refetch to check if we are now eligible for the quiz
                  fetchRoadmapData();
              }
          } catch (err) {
              console.error("Failed to sync progress:", err);
          }
      }
  };

  // ⚡ SEND PROGRESS TO FLASK
  const handleExamPassed = async () => {
      setIsCertified(true);
      setIsEligibleForQuiz(false);
      setShowFinalExam(false); 
  };

  if (loading) return <div style={{textAlign:'center', padding:'40px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"}}>Loading your personalized learning path...</div>;
  if (errorMsg) return <div style={{textAlign:'center', color:'red', padding:'40px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"}}>Error: {errorMsg}</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '50px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. HEADER */}
      <div style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#111827', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>🗺️ {roadmapInfo.career_name}</h2>
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

              <SkillCard 
                stepNumber={step.step_order}
                skill={skill}
                isCompleted={isCompleted}
                onUpdateProgress={() => toggleStep(step.step_id)}
              />
            </div>
          );
        })}
      </div>

      {/* 3. CAPSTONE FINAL EXAM SECTION (PERSISTENT UI) */}
      {isEligibleForQuiz && (
          <div style={{ backgroundColor: '#fffbeb', padding: '35px', borderRadius: '16px', textAlign: 'center', marginBottom: '40px', border: '2px solid #f59e0b', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
              <span style={{ fontSize: '50px', display: 'block', marginBottom: '15px' }}>🎓</span>
              <h3 style={{ color: '#92400e', fontSize: '24px', margin: '0 0 10px 0', fontWeight: 'bold' }}>Final Certification Exam</h3>
              <p style={{ color: '#b45309', marginBottom: '25px', fontSize: '16px', maxWidth: '500px', margin: '0 auto' }}>
                You have completed all {steps.length} modules! Take the 20-question capstone exam to verify your skills and earn your digital badge.
              </p>
              <button 
                onClick={() => setShowFinalExam(true)}
                style={{ backgroundColor: '#f59e0b', color: 'white', padding: '14px 32px', borderRadius: '10px', border: 'none', fontSize: '18px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#d97706'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f59e0b'}
              >
                Start Capstone Quiz 🚀
              </button>
          </div>
      )}

      {isCertified && (
          <div style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '30px', borderRadius: '16px', textAlign: 'center', marginBottom: '40px', border: '2px solid #22c55e', fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
              <span style={{ fontSize: '32px' }}>🏆</span>
              Congratulations! You are officially Certified in {roadmapInfo.career_name}.
          </div>
      )}

      {/* QUIZ MODAL TRIGGER */}
      {showFinalExam && (
        <QuizModal 
            // We pass the careerId to fetch the 20-question capstone quiz
            careerId={careerId} 
            onClose={() => setShowFinalExam(false)}
            onQuizPass={handleExamPassed}
        />
      )}

    </div>
  );
};

export default RoadmapDisplay;