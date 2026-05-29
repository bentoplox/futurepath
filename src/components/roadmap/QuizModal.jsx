import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { styles } from '../../styles/styles';

const QuizModal = ({ skillId, careerId, onClose, onQuizPass }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(null); 
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  
  const [showResults, setShowResults] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState(0);

  const isCapstone = !!careerId;

  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setApiError(null);
      try {
        // ⚡ FETCH FROM APPROPRIATE ENDPOINT
        const url = isCapstone 
            ? `http://127.0.0.1:5000/api/capstone/${careerId}`
            : `http://127.0.0.1:5000/api/quiz/${skillId}`;
            
        const response = await fetch(url);
        const data = await response.json();

        if (data.success) {
            setQuestions(data.questions);
        } else {
            throw new Error(data.error || "Failed to load quiz");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
        setApiError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (skillId || careerId) fetchQuiz();
  }, [skillId, careerId, isCapstone]); 

  // ⚡ THE SMART GRADER: Handles "B", "B. text", or exact matches
  const isCorrectMatch = (optionText, optionIndex, aiCorrectAnswer) => {
      if (!aiCorrectAnswer) return false;
      
      const target = String(aiCorrectAnswer).trim().toLowerCase();
      const opt = String(optionText).trim().toLowerCase();
      const letter = String.fromCharCode(97 + optionIndex); // 0 -> a, 1 -> b, etc.
      
      // 1. Exact match
      if (opt === target) return true;
      
      // 2. Did the AI just return the letter? (e.g., "b" or "b.")
      if (target === letter || target === `${letter}.`) return true;
      
      // 3. Did the AI include the letter in the string? (e.g., "b. to output text")
      if (target.includes(opt) || opt.includes(target)) return true;
      
      return false;
  };

  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: answerIndex });
  };

  const handleSubmit = async () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
        const selectedOptionText = q.options[selectedAnswers[index]]; 
        const selectedOptionIndex = selectedAnswers[index];
        
        if (isCorrectMatch(selectedOptionText, selectedOptionIndex, q.correct_answer)) {
            correctCount++;
        }
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(percentage);
    
    // ⚡ NEW: SAVE RESULTS TO BACKEND
    if (isCapstone && user) {
        try {
            await fetch('http://127.0.0.1:5000/api/quiz/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: user.user_id,
                    career_id: careerId,
                    score: percentage
                })
            });
        } catch (err) {
            console.error("Failed to submit quiz:", err);
        }
    }

    setShowResults(true);
  };

  const handleFinish = () => {
    if (score >= 66) { 
        onQuizPass();
    } else {
        onClose();
    }
  };

  // --- RENDER STATES ---
  if (loading) return (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <h3>📥 Loading Certification Exam...</h3>
            <p>Retrieving questions from the database...</p>
        </div>
    </div>
  );

  if (apiError) return (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <h3 style={{ color: '#ef4444' }}>❌ Error Loading Quiz</h3>
            <p>{apiError}</p>
            <button onClick={onClose} style={{...styles.secondaryButton, width:'100%', marginTop:'15px'}}>Close & Try Again</button>
        </div>
    </div>
  );

  if (isReviewing) {
    return (
      <div style={styles.modalOverlay}>
        <div style={{...styles.modalContent, maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'}}>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>🔍 Review Answers</h2>
            <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
                {questions.map((q, qIndex) => {
                    const userSelectedIdx = selectedAnswers[qIndex];
                    
                    return (
                        <div key={qIndex} style={{borderBottom: '1px solid #eee', paddingBottom: '20px'}}>
                            <p style={{fontWeight: 'bold', marginBottom: '10px'}}>{qIndex + 1}. {q.question}</p>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = userSelectedIdx === optIdx;
                                    const isTheCorrectAnswer = isCorrectMatch(opt, optIdx, q.correct_answer);
                                    
                                    let bgColor = isTheCorrectAnswer ? '#dcfce7' : (isSelected ? '#fee2e2' : 'white');
                                    let borderColor = isTheCorrectAnswer ? '#16a34a' : (isSelected ? '#dc2626' : '#ddd');

                                    return (
                                        <div key={optIdx} style={{
                                            padding: '10px', borderRadius: '6px', border: `1px solid ${borderColor}`,
                                            backgroundColor: bgColor, fontSize: '14px', display: 'flex', justifyContent: 'space-between'
                                        }}>
                                            <span><strong>{String.fromCharCode(65+optIdx)}.</strong> {opt}</span>
                                            {isTheCorrectAnswer && <span>✅ Correct</span>}
                                            {isSelected && !isTheCorrectAnswer && <span>❌ Yours</span>}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
            <button onClick={() => setIsReviewing(false)} style={{...styles.primaryButton, width: '100%', marginTop: '20px'}}>Back to Results</button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const passed = score >= 66;
    return (
      <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
          <h2 style={{textAlign:'center', color: passed ? '#10b981' : '#ef4444', marginBottom: '20px'}}>
            {passed ? '🎉 Passed!' : '❌ Keep Learning'}
          </h2>
          <div style={{textAlign: 'center', marginBottom: '30px'}}>
            <div style={{fontSize:'64px', fontWeight:'bold', color: passed ? '#10b981' : '#ef4444'}}>{score}%</div>
            <p style={{color:'#6b7280'}}>{passed ? 'Skill Verified.' : 'You need ~66% to pass.'}</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
              <button onClick={() => setIsReviewing(true)} style={{...styles.secondaryButton, flex: 1}}>🔍 Review</button>
              <button onClick={handleFinish} style={{...styles.primaryButton, flex: 1}}>
                {passed ? 'Complete Step' : 'Try Later'}
              </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={{ marginBottom: '10px' }}>📝 Certification Exam</h2>
        <p style={{color:'#666', fontSize:'14px', marginBottom:'20px'}}>Question {currentQuestion + 1} of {questions.length}</p>
        <div style={{height:'6px', background:'#e5e7eb', borderRadius:'3px', marginBottom:'30px', overflow:'hidden'}}>
            <div style={{height:'100%', background:'#6366f1', width:`${((currentQuestion+1)/questions.length)*100}%`, transition:'width 0.3s'}} />
        </div>
        <h3 style={{marginBottom:'20px', fontSize:'18px'}}>{question.question}</h3>
        <div style={styles.optionsContainer}>
            {question.options.map((opt, idx) => (
                <div key={idx} onClick={() => handleAnswerSelect(idx)} 
                    style={{...styles.optionItem, cursor:'pointer', backgroundColor: selectedAnswers[currentQuestion] === idx ? '#e0e7ff' : 'white', borderColor: selectedAnswers[currentQuestion] === idx ? '#4338ca' : '#ddd', borderWidth: '1px', borderStyle: 'solid', padding: '12px', borderRadius: '6px', marginBottom: '10px'}}>
                    <span style={{marginRight:'10px', fontWeight:'bold'}}>{String.fromCharCode(65+idx)}.</span> {opt}
                </div>
            ))}
        </div>
        <div style={styles.quizNavigation}>
            <button onClick={() => setCurrentQuestion(c => c - 1)} disabled={currentQuestion===0} style={{...styles.secondaryButton, opacity: currentQuestion===0?0.5:1}}>← Prev</button>
            {currentQuestion < questions.length - 1 ? (
                <button onClick={() => setCurrentQuestion(c => c + 1)} disabled={selectedAnswers[currentQuestion] === undefined} style={{...styles.primaryButton, opacity: selectedAnswers[currentQuestion]===undefined?0.5:1}}>Next →</button>
            ) : (
                <button onClick={handleSubmit} disabled={Object.keys(selectedAnswers).length !== questions.length} style={{...styles.successButton, opacity: Object.keys(selectedAnswers).length!==questions.length?0.5:1}}>Submit ✓</button>
            )}
        </div>
        <button onClick={onClose} style={{...styles.secondaryButton, width:'100%', marginTop:'15px'}}>Cancel</button>
      </div>
    </div>
  );
};

export default QuizModal;