// ============================================================================
// FILE: src/components/roadmap/QuizModal.jsx
// PURPOSE: Quiz with Scoring + Answer Review Feature
// ============================================================================

import React, { useState, useEffect } from 'react';
import { styles } from '../../styles/styles';
import { supabase } from '../../supabaseClient'; 
import { useAuth } from '../../context/AuthContext';

const QuizModal = ({ skill, onClose, onQuizComplete }) => {
  const { user } = useAuth();
  
  // State management
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { 0: 1, 1: 3 } (QuestionIndex: OptionIndex)
  
  // View States
  const [showResults, setShowResults] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false); // <--- NEW STATE FOR REVIEW MODE
  const [score, setScore] = useState(0);

  // 1. FETCH QUIZ
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data, error } = await supabase
          .from('quiz')
          .select('*')
          .eq('skill_id', skill.skill_id);

        if (error) throw error;
        if (data && data.length > 0) setQuestions(data);
      } catch (err) {
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    if (skill?.skill_id) fetchQuiz();
  }, [skill]);

  // 2. QUIZ LOGIC
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: answerIndex });
  };

  const handleSubmit = async () => {
    // Calculate Score
    let correctCount = 0;
    questions.forEach((q, index) => {
        const selectedOptionText = q.options[selectedAnswers[index]]; 
        if (selectedOptionText === q.correct_answer) correctCount++;
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    
    setScore(percentage);
    setShowResults(true); // Show score first

    // Save Result
    if (user) {
      try {
        await supabase.from('quiz_result').insert([{
            user_id: user.user_id,
            skill_id: skill.skill_id,
            score: percentage,
            attempt_date: new Date()
        }]);
      } catch (error) { console.error("Error saving result:", error); }
    }
  };

  const handleFinish = () => {
    if (onQuizComplete) onQuizComplete(skill, score);
    else onClose();
  };

  // --- RENDER HELPERS ---

  if (loading) return <div style={styles.modalOverlay}><div style={styles.modalContent}><h3>Loading Quiz...</h3></div></div>;
  if (questions.length === 0) return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent}>
          <h3>Quiz Not Available</h3>
          <p>No questions found for this skill.</p>
          <button onClick={onClose} style={styles.button}>Close</button>
        </div>
      </div>
  );

  // =========================================================
  // VIEW 1: REVIEW ANSWERS SCREEN (NEW)
  // =========================================================
  if (isReviewing) {
    return (
      <div style={styles.modalOverlay}>
        <div style={{...styles.modalContent, maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>🔍 Review Answers</h2>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                {questions.map((q, qIndex) => {
                    const userSelectedIdx = selectedAnswers[qIndex];
                    const userSelectedText = q.options[userSelectedIdx];
                    const isCorrect = userSelectedText === q.correct_answer;

                    return (
                        <div key={qIndex} style={{borderBottom: '1px solid #eee', paddingBottom: '20px'}}>
                            <p style={{fontWeight: 'bold', marginBottom: '10px'}}>
                                {qIndex + 1}. {q.question}
                            </p>
                            
                            {/* Render Options for Review */}
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = userSelectedIdx === optIdx;
                                    const isTheCorrectAnswer = opt === q.correct_answer;
                                    
                                    let bgColor = 'white';
                                    let borderColor = '#ddd';
                                    let textColor = 'black';

                                    // Logic for Coloring
                                    if (isTheCorrectAnswer) {
                                        // Always highlight the correct answer in Green
                                        bgColor = '#dcfce7'; // Light Green
                                        borderColor = '#16a34a';
                                        textColor = '#166534';
                                    } 
                                    else if (isSelected && !isTheCorrectAnswer) {
                                        // Highlight wrong selection in Red
                                        bgColor = '#fee2e2'; // Light Red
                                        borderColor = '#dc2626';
                                        textColor = '#991b1b';
                                    }

                                    return (
                                        <div key={optIdx} style={{
                                            padding: '10px', borderRadius: '6px', border: `1px solid ${borderColor}`,
                                            backgroundColor: bgColor, color: textColor, fontSize: '14px',
                                            display: 'flex', justifyContent: 'space-between'
                                        }}>
                                            <span>
                                                <strong>{String.fromCharCode(65+optIdx)}.</strong> {opt}
                                            </span>
                                            {/* Status Icons */}
                                            {isTheCorrectAnswer && <span>✅ Correct</span>}
                                            {isSelected && !isTheCorrectAnswer && <span>❌ Your Answer</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            <button 
                onClick={() => setIsReviewing(false)} 
                style={{...styles.primaryButton, width: '100%', marginTop: '20px'}}
            >
                Back to Results
            </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 2: RESULTS SCREEN (UPDATED)
  // =========================================================
  if (showResults) {
    const passed = score >= 80;
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={{textAlign:'center', color: passed ? '#10b981' : '#ef4444', marginBottom: '20px'}}>
            {passed ? '🎉 You Passed!' : '❌ Keep Learning'}
          </h2>
          
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <div style={{fontSize:'64px', fontWeight:'bold', color: passed ? '#10b981' : '#ef4444'}}>
                {score}%
            </div>
            <p style={{color:'#6b7280'}}>
                {passed ? 'You have unlocked this skill!' : 'You need 80% to pass.'}
            </p>
          </div>

          <div style={{display: 'flex', gap: '10px'}}>
              {/* BUTTON TO REVIEW ANSWERS */}
              <button 
                onClick={() => setIsReviewing(true)} 
                style={{...styles.secondaryButton, flex: 1}}
              >
                🔍 Review Answers
              </button>

              {/* BUTTON TO FINISH */}
              <button 
                onClick={handleFinish} 
                style={{...styles.primaryButton, flex: 1}}
              >
                {passed ? 'Finish' : 'Try Again Later'}
              </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // VIEW 3: QUESTION SCREEN (EXISTING)
  // =========================================================
  const question = questions[currentQuestion];

  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={{ marginBottom: '10px' }}>📝 Quiz: {skill.skill_name}</h2>
        <p style={{color:'#666', fontSize:'14px', marginBottom:'20px'}}>Question {currentQuestion + 1} of {questions.length}</p>
        
        <div style={{height:'6px', background:'#e5e7eb', borderRadius:'3px', marginBottom:'30px', overflow:'hidden'}}>
            <div style={{height:'100%', background:'#6366f1', width:`${((currentQuestion+1)/questions.length)*100}%`, transition:'width 0.3s'}} />
        </div>

        <div style={styles.questionContainer}>
            <h3 style={{marginBottom:'20px', fontSize:'18px', color:'#111827', lineHeight:'1.5'}}>
                {question.question}
            </h3>

            <div style={styles.optionsContainer}>
                {question.options.map((opt, idx) => (
                    <div key={idx} 
                        onClick={() => handleAnswerSelect(idx)}
                        style={{
                            ...styles.optionItem,
                            cursor:'pointer',
                            backgroundColor: selectedAnswers[currentQuestion] === idx ? '#e0e7ff' : 'white',
                            borderColor: selectedAnswers[currentQuestion] === idx ? '#4338ca' : '#ddd',
                            borderWidth: '1px', borderStyle: 'solid', padding: '12px', borderRadius: '6px', marginBottom: '10px'
                        }}
                    >
                        <span style={{marginRight:'10px', fontWeight:'bold'}}>{String.fromCharCode(65+idx)}.</span> 
                        {opt}
                    </div>
                ))}
            </div>
        </div>

        <div style={styles.quizNavigation}>
            <button onClick={() => setCurrentQuestion(curr => curr - 1)} disabled={currentQuestion===0} style={{...styles.secondaryButton, opacity: currentQuestion===0?0.5:1}}>
                ← Previous
            </button>
            
            {currentQuestion < questions.length - 1 ? (
                <button onClick={() => setCurrentQuestion(curr => curr + 1)} disabled={selectedAnswers[currentQuestion] === undefined} style={{...styles.primaryButton, opacity: selectedAnswers[currentQuestion]===undefined?0.5:1}}>
                    Next →
                </button>
            ) : (
                <button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== questions.length} style={{...styles.successButton, opacity: Object.keys(selectedAnswers).length!==questions.length?0.5:1}}>
                    Submit Quiz ✓
                </button>
            )}
        </div>
        <button onClick={onClose} style={{...styles.secondaryButton, width:'100%', marginTop:'15px'}}>Cancel Quiz</button>
      </div>
    </div>
  );
};

export default QuizModal;