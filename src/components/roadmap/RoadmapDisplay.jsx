// ============================================================================
// FILE: src/components/roadmap/RoadmapDisplay.jsx
// PURPOSE: Displays roadmap with Full Description below title
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import SkillCard from './SkillCard';
import QuizModal from './QuizModal';

const RoadmapDisplay = ({ careerId }) => {
  const { user } = useAuth();
  
  // Data States
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [quizScores, setQuizScores] = useState({}); 
  const [roadmapId, setRoadmapId] = useState(null);
  
  // Header States
  const [realCareerName, setRealCareerName] = useState('Loading...');
  const [realCareerDesc, setRealCareerDesc] = useState(''); // NEW STATE
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedSkillForQuiz, setSelectedSkillForQuiz] = useState(null);

  useEffect(() => {
    if (!careerId || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // A. Fetch Career Details (Name AND Description)
        const { data: careerData, error: careerError } = await supabase
            .from('career')
            .select('career_name, description') // Added description
            .eq('career_id', careerId)
            .single();
        
        if (careerError) throw careerError;
        setRealCareerName(careerData.career_name);
        setRealCareerDesc(careerData.description); // Set description

        // B. Get Roadmap ID
        const { data: roadmapData } = await supabase
          .from('roadmap')
          .select('roadmap_id')
          .eq('user_id', user.user_id)
          .eq('career_id', careerId)
          .single();
        if (roadmapData) setRoadmapId(roadmapData.roadmap_id);

        // C. Fetch Steps & Skills
        const { data: stepsData, error: stepsError } = await supabase
          .from('roadmap_step')
          .select(`
            step_id, step_order,
            skill:skill_id (
              skill_id, skill_name, skill_category, description,
              learning_resource (resource_id, title, provider, cost_type, url)
            )
          `)
          .eq('career_id', careerId)
          .order('step_order', { ascending: true });
        
        if (stepsError) throw stepsError;
        setSteps(stepsData || []);

        // D. Fetch Progress
        const validStepIds = new Set((stepsData || []).map(s => s.step_id));
        const { data: progressData } = await supabase
          .from('progress_record')
          .select('step_id')
          .eq('user_id', user.user_id)
          .eq('completion_status', 'completed');
        
        const filteredCompletedSet = new Set();
        if (progressData) {
            progressData.forEach(p => {
                if (validStepIds.has(p.step_id)) {
                    filteredCompletedSet.add(p.step_id);
                }
            });
        }
        setCompletedSteps(filteredCompletedSet);

        // E. Fetch Quiz Results
        const { data: quizData } = await supabase
            .from('quiz_result')
            .select('skill_id, score')
            .eq('user_id', user.user_id);
        
        const scoresMap = {};
        if (quizData) {
            quizData.forEach(r => {
                if (!scoresMap[r.skill_id] || r.score > scoresMap[r.skill_id]) {
                    scoresMap[r.skill_id] = r.score;
                }
            });
        }
        setQuizScores(scoresMap);

      } catch (err) {
        console.error("Error fetching data:", err);
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [careerId, user]);


  const handleUpdateProgress = async (stepId, skillId) => {
    const isCurrentlyCompleted = completedSteps.has(stepId);
    
    if (!isCurrentlyCompleted) {
        const bestScore = quizScores[skillId] || 0;
        if (bestScore < 80) {
            alert(`🔒 Locked! You must score at least 80% on the quiz to complete this skill.\nCurrent Best: ${bestScore}%`);
            return; 
        }
    }

    const nextCompletedSteps = new Set(completedSteps);
    let action = '';

    if (isCurrentlyCompleted) {
      nextCompletedSteps.delete(stepId);
      action = 'delete';
    } else {
      nextCompletedSteps.add(stepId);
      action = 'insert';
    }
    setCompletedSteps(nextCompletedSteps); 

    try {
      if (action === 'delete') {
         await supabase.from('progress_record').delete()
           .eq('user_id', user.user_id).eq('step_id', stepId);
         if (roadmapId) {
            await supabase.from('roadmap').update({ status: 'active' }).eq('roadmap_id', roadmapId);
         }
      } else {
         await supabase.from('progress_record').upsert({
            user_id: user.user_id, step_id: stepId,
            completion_status: 'completed', completion_date: new Date()
         });

         if (nextCompletedSteps.size === steps.length && roadmapId) {
             await supabase.from('roadmap').update({ status: 'completed' }).eq('roadmap_id', roadmapId);
             alert("🏆 CONGRATULATIONS! You have completed this entire Career Roadmap!");
         }
      }
    } catch (err) {
      console.error("Error updating progress:", err);
      setCompletedSteps(completedSteps); 
    }
  };

  const handleQuizPassed = (skill, newScore) => {
      setQuizScores(prev => {
          const currentBest = prev[skill.skill_id] || 0;
          return { ...prev, [skill.skill_id]: Math.max(currentBest, newScore) };
      });
      setSelectedSkillForQuiz(null);
  };

  if (loading) return <div style={{textAlign:'center', padding:'40px'}}>Loading Roadmap...</div>;
  
  if (errorMsg) return (
    <div style={{textAlign:'center', padding:'40px', color:'red'}}>
      <h3>⚠️ Error Loading Roadmap</h3>
      <p>{errorMsg}</p>
    </div>
  );

  if (steps.length === 0) return (
    <div style={{textAlign:'center', padding:'40px'}}>
      <h3>No steps found for {realCareerName}.</h3>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      
      {/* 1. Header with Title & Description */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h2 style={{ margin: '0 0 15px 0', fontSize: '32px', color: '#111827' }}>
            🗺️ {realCareerName}
          </h2>
          {realCareerDesc && (
              <p style={{ 
                  color: '#4b5563', 
                  fontSize: '16px', 
                  lineHeight: '1.6', 
                  maxWidth: '700px', 
                  margin: '0 auto' 
              }}>
                  {realCareerDesc}
              </p>
          )}
      </div>
      
      {/* Completion Badge */}
      {completedSteps.size === steps.length && steps.length > 0 && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '30px' }}>
              🏆 <strong>Roadmap Completed!</strong> Great job mastering these skills.
          </div>
      )}

      {/* Steps List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {steps.map((step, index) => (
          <div key={step.step_id} style={{ position: 'relative' }}>
            {index !== steps.length - 1 && (
              <div style={{
                position: 'absolute', left: '50%', bottom: '-20px',
                width: '2px', height: '20px', backgroundColor: '#e5e7eb',
                transform: 'translateX(-50%)', zIndex: 0
              }} />
            )}

            <SkillCard
              stepNumber={step.step_order}
              skill={step.skill}
              resources={step.skill.learning_resource || []}
              isCompleted={completedSteps.has(step.step_id)}
              quizScore={quizScores[step.skill.skill_id] || 0}
              onUpdateProgress={() => handleUpdateProgress(step.step_id, step.skill.skill_id)}
              onTakeQuiz={() => setSelectedSkillForQuiz(step.skill)}
            />
          </div>
        ))}
      </div>

      {selectedSkillForQuiz && (
          <QuizModal 
              skill={selectedSkillForQuiz} 
              onClose={() => setSelectedSkillForQuiz(null)}
              onQuizComplete={handleQuizPassed} 
          />
      )}
    </div>
  );
};

export default RoadmapDisplay;