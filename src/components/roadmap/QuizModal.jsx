// ============================================================================
// FILE: src/components/roadmap/QuizModal.jsx
// PURPOSE: Dynamic AI Quiz with Review Feature
// ============================================================================

import React, { useState, useEffect } from 'react';
import { styles } from '../../styles/styles';

const QuizModal = ({ skillTitle, onClose, onQuizPass }) => {
  // State management
  const [questions, setQuestions] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); 
  
  // View States
  const [showResults, setShowResults] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [score, setScore] = useState(0);

  // 1. FETCH QUIZ FROM PYTHON API
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/generate-quiz', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic: skillTitle })
        });
        const data = await response.json();

        if (data.success) {
            setQuestions(data.quiz);
        } else {
            throw new Error("Failed to generate quiz");
        }
      } catch (err) {
        console.error("Error fetching quiz:", err);
      } finally {
        setLoading(false);
      }
    };

    if (skillTitle) fetchQuiz();
  }, [skillTitle]);

  // 2. QUIZ LOGIC
  const handleAnswerSelect = (answerIndex) => {
    setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: answerIndex });
  };

  const handleSubmit = () => {
    let correctCount = 0;
    questions.forEach((q, index) => {
        // The API returns the full string of the answer, so we compare strings
        const selectedOptionText = q.options[selectedAnswers[index]]; 
        if (selectedOptionText === q.correct_answer) correctCount++;
    });

    const percentage = Math.round((correctCount / questions.length) * 100);
    setScore(percentage);
    setShowResults(true);
  };

  const handleFinish = () => {
    // Only close if passed
    if (score >= 66) { // 2 out of 3 is 66%
        onQuizPass();
    } else {
        onClose();
    }
  };

  // --- RENDER ---
  if (loading) return (
    <div style={styles.modalOverlay}>
        <div style={styles.modalContent}>
            <h3>🧠 AI is generating your quiz...</h3>
            <p>Verifying Malaysian market standards for {skillTitle}</p>
        </div>
    </div>
  );

  // VIEW 1: REVIEW ANSWERS SCREEN
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
                            <p style={{fontWeight: 'bold', marginBottom: '10px'}}>{qIndex + 1}. {q.question}</p>
                            <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                                {q.options.map((opt, optIdx) => {
                                    const isSelected = userSelectedIdx === optIdx;
                                    const isTheCorrectAnswer = opt === q.correct_answer;
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

  // VIEW 2: RESULTS SCREEN
  if (showResults) {
    const passed = score >= 66; // 66% (2/3 questions)
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

  // VIEW 3: QUESTION SCREEN
  const question = questions[currentQuestion];
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <h2 style={{ marginBottom: '10px' }}>📝 Quiz: {skillTitle}</h2>
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