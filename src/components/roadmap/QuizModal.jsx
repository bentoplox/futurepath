// ============================================================================
// FILE: src/components/roadmap/QuizModal.jsx
// PURPOSE: Skill verification quiz interface
// DESCRIPTION: Multiple-choice quiz with scoring and results
// ============================================================================

import React, { useState } from 'react';
import { MOCK_QUIZZES } from '../../data/mockData';
import { styles } from '../../styles/styles';

const QuizModal = ({ skill, onClose, onQuizComplete }) => {
  // Get quiz data for this skill
  const quiz = MOCK_QUIZZES[skill.skill_id];
  
  // State management
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);

  // Handle case where quiz doesn't exist
  if (!quiz) {
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginBottom: '20px' }}>Quiz Not Available</h2>
          <p style={{ color: '#6b7280', marginBottom: '20px' }}>
            Sorry, no quiz is available for this skill yet. We're working on adding more quizzes!
          </p>
          <button onClick={onClose} style={styles.button}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // Handle answer selection
  const handleAnswerSelect = (answerIndex) => {
    // Create a copy of selected answers array
    const newAnswers = [...selectedAnswers];
    // Update the answer for current question
    newAnswers[currentQuestion] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  // Navigate to next question
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  // Navigate to previous question
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  // Submit quiz and calculate score
  const handleSubmit = () => {
    // Count correct answers
    let correctCount = 0;
    quiz.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correct) {
        correctCount++;
      }
    });

    // Calculate percentage
    const percentage = Math.round((correctCount / quiz.questions.length) * 100);
    setScore(percentage);
    setShowResults(true);

    // Determine if user passed (70% threshold)
    const passed = percentage >= 70;
    
    // Call parent callback with results
    onQuizComplete(skill, percentage, passed);
  };

  // Get current question
  const question = quiz.questions[currentQuestion];

  // Show results screen
  if (showResults) {
    const passed = score >= 70;
    
    return (
      <div style={styles.modalOverlay} onClick={onClose}>
        <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
          <h2 style={{ marginBottom: '20px', textAlign: 'center' }}>
            Quiz Results
          </h2>
          
          <div style={styles.scoreDisplay}>
            {/* Large score display */}
            <div style={{
              fontSize: '64px',
              fontWeight: 'bold',
              color: passed ? '#10b981' : '#ef4444',
              marginBottom: '10px'
            }}>
              {score}%
            </div>
            
            {/* Pass/fail message */}
            <p style={{ 
              fontSize: '20px', 
              marginBottom: '20px',
              color: '#374151'
            }}>
              {passed 
                ? '🎉 Congratulations! You passed!' 
                : '😔 Keep learning and try again'}
            </p>

            {/* Detailed feedback */}
            <div style={{
              padding: '20px',
              backgroundColor: passed ? '#f0fdf4' : '#fef2f2',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ 
                fontSize: '16px', 
                color: passed ? '#166534' : '#991b1b',
                marginBottom: '10px'
              }}>
                You got {Math.round((score / 100) * quiz.questions.length)} out of {quiz.questions.length} questions correct.
              </p>
              
              {!passed && (
                <p style={{ fontSize: '14px', color: '#6b7280' }}>
                  Review the learning resources and try again. You need 70% to pass.
                </p>
              )}
            </div>
          </div>

          <button onClick={onClose} style={styles.button}>
            Close
          </button>
        </div>
      </div>
    );
  }

  // Show quiz questions
  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        {/* Quiz header */}
        <h2 style={{ marginBottom: '10px' }}>
          📝 {skill.skill_name} Quiz
        </h2>
        
        {/* Progress indicator */}
        <p style={styles.quizProgress}>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </p>

        {/* Progress bar */}
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: '#e5e7eb',
          borderRadius: '3px',
          marginBottom: '30px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%`,
            height: '100%',
            backgroundColor: '#6366f1',
            transition: 'width 0.3s ease'
          }} />
        </div>

        {/* Question container */}
        <div style={styles.questionContainer}>
          <h3 style={{ 
            marginBottom: '20px', 
            fontSize: '18px',
            color: '#111827',
            lineHeight: '1.5'
          }}>
            {question.question}
          </h3>

          {/* Answer options */}
          <div style={styles.optionsContainer}>
            {question.options.map((option, index) => (
              <div
                key={index}
                onClick={() => handleAnswerSelect(index)}
                style={{
                  ...styles.optionItem,
                  ...(selectedAnswers[currentQuestion] === index 
                    ? styles.optionSelected 
                    : {}),
                  cursor: 'pointer'
                }}
              >
                <span style={{ marginRight: '10px', fontWeight: 'bold' }}>
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation buttons */}
        <div style={styles.quizNavigation}>
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            style={{
              ...styles.secondaryButton,
              opacity: currentQuestion === 0 ? 0.5 : 1
            }}
          >
            ← Previous
          </button>

          {/* Show Next or Submit based on position */}
          {currentQuestion < quiz.questions.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={selectedAnswers[currentQuestion] === undefined}
              style={{
                ...styles.primaryButton,
                opacity: selectedAnswers[currentQuestion] === undefined ? 0.5 : 1
              }}
            >
              Next →
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={selectedAnswers.length !== quiz.questions.length}
              style={{
                ...styles.successButton,
                opacity: selectedAnswers.length !== quiz.questions.length ? 0.5 : 1
              }}
            >
              Submit Quiz ✓
            </button>
          )}
        </div>

        {/* Close button */}
        <button 
          onClick={onClose}
          style={{
            ...styles.secondaryButton,
            width: '100%',
            marginTop: '15px'
          }}
        >
          Cancel Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizModal;