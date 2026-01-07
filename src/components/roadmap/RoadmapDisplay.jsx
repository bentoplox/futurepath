// ============================================================================
// FILE: src/components/roadmap/RoadmapDisplay.jsx
// PURPOSE: Displays roadmap, fetches Career Name, and handles errors visible
// ============================================================================

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { useAuth } from '../../context/AuthContext';
import SkillCard from './SkillCard';
import QuizModal from './QuizModal';
import { styles } from '../../styles/styles';

const RoadmapDisplay = ({ careerId }) => { // Removed 'careerName' prop, we fetch it now
  const { user } = useAuth();
  
  // Data States
  const [steps, setSteps] = useState([]);
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [quizScores, setQuizScores] = useState({}); 
  const [roadmapId, setRoadmapId] = useState(null);
  const [realCareerName, setRealCareerName] = useState('Loading...'); // New State
  
  // UI States
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null); // New State for visible errors
  const [selectedSkillForQuiz, setSelectedSkillForQuiz] = useState(null);

  // 1. Fetch Everything
  useEffect(() => {
    if (!careerId || !user) return;

    const fetchData = async () => {
      setLoading(true);
      setErrorMsg(null);
      try {
        // A. Fetch Career Details (Name)
        const { data: careerData, error: careerError } = await supabase
            .from('career')
            .select('career_name')
            .eq('career_id', careerId)
            .single();
        
        if (careerError) throw careerError;
        setRealCareerName(careerData.career_name);

        // B. Get Roadmap ID
        const { data: roadmapData } = await supabase
          .from('roadmap')
          .select('roadmap_id')
          .eq('user_id', user.user_id)
          .eq('career_id', careerId)
          .single();
        if (roadmapData) setRoadmapId(roadmapData.roadmap_id);

        // C. Fetch Steps & Skills
        // Note: We request 'description' here. Make sure you ran the SQL Fix!
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
        const { data: progressData } = await supabase
          .from('progress_record')
          .select('step_id')
          .eq('user_id', user.user_id)
          .eq('completion_status', 'completed');
        
        const completedSet = new Set(progressData?.map(p => p.step_id) || []);
        setCompletedSteps(completedSet);

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
        setErrorMsg(err.message); // Show error to user
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [careerId, user]);


  // 2. Logic: Handle "Mark Done" Click
  const handleUpdateProgress = async (stepId, skillId) => {
    const isCurrentlyCompleted = completedSteps.has(stepId);
    
    // --- VALIDATION: CHECK QUIZ SCORE FIRST ---
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
          // Get the previous best score (or 0 if none)
          const currentBest = prev[skill.skill_id] || 0;
          
          // Compare: Is the new score higher?
          // If yes, save the new score.
          // If no, keep the old best score.
          return {
              ...prev,
              [skill.skill_id]: Math.max(currentBest, newScore)
          };
      });
      setSelectedSkillForQuiz(null); // Close modal
  };

  // --- RENDER ---

  if (loading) return <div style={{textAlign:'center', padding:'40px'}}>Loading Roadmap...</div>;
  
  // ERROR STATE (Shows you exactly what went wrong)
  if (errorMsg) return (
    <div style={{textAlign:'center', padding:'40px', color:'red'}}>
      <h3>⚠️ Error Loading Roadmap</h3>
      <p>{errorMsg}</p>
      <p style={{fontSize:'12px', color:'#666'}}>Tip: Check your browser console (F12) for details.</p>
    </div>
  );

  if (steps.length === 0) return (
    <div style={{textAlign:'center', padding:'40px'}}>
      <h3>No steps found for {realCareerName}.</h3>
      <p>Please contact the admin or try selecting a different career.</p>
    </div>
  );

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px' }}>🗺️ {realCareerName}</h2>
      
      {/* Completion Badge */}
      {completedSteps.size === steps.length && steps.length > 0 && (
          <div style={{ backgroundColor: '#d1fae5', color: '#065f46', padding: '10px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px' }}>
              🏆 <strong>Roadmap Completed!</strong> Great job mastering these skills.
          </div>
      )}

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