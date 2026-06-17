import { API_BASE_URL } from '../../apiConfig';
// ============================================================================
// FILE: src/components/roadmap/RoadmapDisplay.jsx
// PURPOSE: Gamified Roadmap Display with Fixed Timeline Math
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import QuizModal from './QuizModal';
import SkillCard from './SkillCard';

const RoadmapDisplay = ({ careerId, onBack }) => { 
  const { user } = useAuth();
  
  const [roadmapInfo, setRoadmapInfo] = useState({ career_name: '', description: '' });
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set()); 

  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  
  const [showFinalExam, setShowFinalExam] = useState(false); 
  const [isCertified, setIsCertified] = useState(false);
  const [isEligibleForQuiz, setIsEligibleForQuiz] = useState(false);

  useEffect(() => {
    if (!careerId || !user?.user_id) return;
    fetchRoadmapData();
  }, [careerId, user?.user_id]);

  const fetchRoadmapData = async () => {
    if (!user?.user_id) return;
    
    setLoading(true);
    setErrorMsg(null);
    try {
      const url = `${API_BASE_URL}/api/roadmap/${careerId}?user_id=${user.user_id}`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
          setRoadmapInfo(data.career);
          setSteps(data.steps || []);
          setIsEligibleForQuiz(data.is_eligible_for_quiz);
          setIsCertified(data.is_certified);
          
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

      if (user) {
          try {
              const res = await fetch(`${API_BASE_URL}/api/progress`, {
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
                  fetchRoadmapData();
              }
          } catch (err) {
              console.error("Failed to sync progress:", err);
          }
      }
  };

  const handleExamPassed = async () => {
      setIsCertified(true);
      setIsEligibleForQuiz(false);
      setShowFinalExam(false); 
  };

  if (loading) return <div style={{textAlign:'center', padding:'40px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"}}>Loading your personalized learning path...</div>;
  if (errorMsg) return <div style={{textAlign:'center', color:'red', padding:'40px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif"}}>Error: {errorMsg}</div>;

  // ⚡ FIXED STATS CALCULATIONS: Only count steps that belong to THIS roadmap
  const validCompletedStepsCount = steps.filter(s => completedSteps.has(s.step_id)).length;
  const progressPercent = steps.length > 0 ? Math.round((validCompletedStepsCount / steps.length) * 100) : 0;
  const stepsCompleted = validCompletedStepsCount;
  const stepsRemaining = steps.length > 0 ? steps.length - stepsCompleted : 0;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '50px', fontFamily: "'Aeonik', 'Plus Jakarta Sans', sans-serif" }}>
      
      {/* 1. HEADER (Top Left Back Button + Center Title) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '30px' }}>
          
          <button onClick={onBack} style={{ backgroundColor: 'white', border: '1px solid #d1d5db', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#374151', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            ← Back to Dashboard
          </button>
          
          <div style={{ flex: 1, textAlign: 'center', paddingRight: '120px' }}>
            <h2 style={{ margin: '0 0 8px 0', fontSize: '32px', color: '#111827', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              🗺️ {roadmapInfo.career_name} Roadmap
            </h2>
            <p style={{ color: '#6b7280', fontSize: '15px', margin: 0 }}>
              Your personalized learning journey to become a {roadmapInfo.career_name}
            </p>
          </div>
      </div>

      {/* 2. STATS BANNER */}
      <div style={{ backgroundColor: 'white', borderRadius: '20px', padding: '30px', display: 'flex', alignItems: 'center', gap: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', marginBottom: '50px', border: '1px solid #f3f4f6' }}>
        
        {/* Circular Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '120px' }}>
            <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: `conic-gradient(#4f46e5 ${progressPercent}%, #e0e7ff 0)`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px' }}>
                <div style={{ width: '80px', height: '80px', backgroundColor: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: '800', color: '#111827' }}>
                    {progressPercent}%
                </div>
            </div>
            <span style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Overall Progress</span>
        </div>

        <div style={{ flex: 1 }}>
            <div style={{ width: '100%', height: '12px', backgroundColor: '#e0e7ff', borderRadius: '10px', overflow: 'hidden', marginBottom: '30px' }}>
                <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: '#4f46e5', borderRadius: '10px', transition: 'width 1s' }}></div>
            </div>

            {/* Exactly 2 Real Data KPI Elements */}
            <div style={{ display: 'flex', gap: '40px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>💠</div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>{stepsCompleted}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Steps Completed</div>
                    </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <div style={{ width: '40px', height: '40px', backgroundColor: '#fef3c7', color: '#f59e0b', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>🎯</div>
                    <div>
                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#111827' }}>{stepsRemaining}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '600' }}>Steps Left</div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* 3. VERTICAL TIMELINE ROADMAP */}
      <div style={{ paddingLeft: '40px' }}>
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(step.step_id);
          // Determine if this is the "Active/In-Progress" step
          const firstIncompleteIdx = steps.findIndex(s => !completedSteps.has(s.step_id));
          const isActive = index === firstIncompleteIdx;
          const isLocked = !isCompleted && !isActive;

          // Determine node status string for SkillCard
          let status = 'locked';
          if (isCompleted) status = 'completed';
          if (isActive) status = 'in-progress';

          return (
            <div key={step.step_id} style={{ position: 'relative', display: 'flex', gap: '40px', paddingBottom: '40px' }}>
              
              {/* Vertical Connecting Line */}
              {index < steps.length - 1 && (
                  <div style={{
                      position: 'absolute', left: '22px', top: '48px', bottom: '-10px', width: '3px',
                      backgroundColor: isCompleted ? '#10b981' : '#e5e7eb', zIndex: 0
                  }}></div>
              )}

              {/* Timeline Node Icon */}
              <div style={{ zIndex: 1 }}>
                  {status === 'completed' && (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 0 6px #d1fae5' }}>✓</div>
                  )}
                  {status === 'in-progress' && (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'white', border: '3px solid #4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 0 6px #e0e7ff', boxSizing: 'border-box' }}>
                          <div style={{ width: '20px', height: '20px', backgroundColor: '#4f46e5', borderRadius: '50%' }}></div>
                      </div>
                  )}
                  {status === 'locked' && (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f3f4f6', border: '2px solid #d1d5db', color: '#9ca3af', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', boxSizing: 'border-box' }}>🔒</div>
                  )}
              </div>

              {/* Skill Card Details */}
              <SkillCard 
                stepNumber={step.step_order}
                skill={step.skill}
                status={status}
                onUpdateProgress={() => toggleStep(step.step_id)}
              />
            </div>
          );
        })}
      </div>

      {/* 4. CAPSTONE FINAL EXAM SECTION */}
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
            careerId={careerId} 
            onClose={() => setShowFinalExam(false)}
            onQuizPass={handleExamPassed}
        />
      )}
    </div>
  );
};

export default RoadmapDisplay;