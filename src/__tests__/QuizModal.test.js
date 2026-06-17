import React from 'react';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import QuizModal from '../components/roadmap/QuizModal';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// 1. MOCKING CONTEXT & EXTERNAL SERVICES
// ============================================================================
jest.mock('../context/AuthContext');

const mockUser = {
  user_id: 'test-user-uuid',
  name: 'Xayne Explorer'
};

const mockQuestions = [
  {
    quiz_id: 1,
    question: "What is 2+2?",
    options: ["3", "4", "5", "6"],
    correct_answer: "4"
  },
  {
    quiz_id: 2,
    question: "What is the capital of France?",
    options: ["London", "Berlin", "Paris", "Madrid"],
    correct_answer: "c" // Testing smart grader (c = Paris)
  },
  {
    quiz_id: 3,
    question: "Which of these is a programming language?",
    options: ["HTML", "CSS", "JavaScript", "Markdown"],
    correct_answer: "JavaScript"
  }
];

// ============================================================================
// 2. GLOBAL FETCH MOCK SETUP
// ============================================================================
global.fetch = jest.fn();

describe('QuizModal Component Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    useAuth.mockReturnValue({ user: mockUser });
    console.error = jest.fn(); 
  });

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
    render(<QuizModal skillId={1} onClose={jest.fn()} onQuizPass={jest.fn()} />);
    expect(screen.getByText(/Loading Certification Exam/i)).toBeInTheDocument();
  });

  test('successfully passes a quiz (3/3 correct)', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, questions: mockQuestions })
    });

    render(<QuizModal skillId={1} onClose={jest.fn()} onQuizPass={jest.fn()} />);

    // Wait for questions to load
    const question1 = await screen.findByText(/What is 2\+2\?/i);
    expect(question1).toBeInTheDocument();

    // Answer Question 1: "4" (Index 1)
    fireEvent.click(screen.getByText(/^4$/));
    fireEvent.click(screen.getByText(/Next →/i));

    // Answer Question 2: "Paris" (Index 2)
    expect(await screen.findByText(/What is the capital of France\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Paris/i));
    fireEvent.click(screen.getByText(/Next →/i));

    // Answer Question 3: "JavaScript" (Index 2)
    expect(await screen.findByText(/Which of these is a programming language\?/i)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/JavaScript/i));
    
    // Submit
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); 
    fireEvent.click(screen.getByText(/Submit ✓/i));

    // Verify Results
    expect(await screen.findByText(/100%/i)).toBeInTheDocument();
    expect(screen.getByText(/Passed!/i)).toBeInTheDocument();
  });

  test('fails a quiz and shows "Keep Learning" (0/3 correct)', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, questions: mockQuestions })
    });

    render(<QuizModal skillId={1} onClose={jest.fn()} onQuizPass={jest.fn()} />);

    // Answer all incorrectly
    await screen.findByText(/What is 2\+2\?/i);
    fireEvent.click(screen.getByText(/^3$/));
    fireEvent.click(screen.getByText(/Next →/i));

    await screen.findByText(/What is the capital of France\?/i);
    fireEvent.click(screen.getByText(/London/i));
    fireEvent.click(screen.getByText(/Next →/i));

    await screen.findByText(/Which of these is a programming language\?/i);
    fireEvent.click(screen.getByText(/HTML/i));
    
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) });
    fireEvent.click(screen.getByText(/Submit ✓/i));

    expect(await screen.findByText(/0%/i)).toBeInTheDocument();
    expect(screen.getByText(/Keep Learning/i)).toBeInTheDocument();
  });

  test('handles voting interaction', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, questions: [mockQuestions[0]] })
    });

    render(<QuizModal skillId={1} onClose={jest.fn()} onQuizPass={jest.fn()} />);
    await screen.findByText(/What is 2\+2\?/i);

    const upvoteBtn = screen.getByTitle(/Upvote Question/i);
    fireEvent.click(upvoteBtn);

    expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/quiz/vote'),
        expect.objectContaining({
            method: 'POST',
            body: expect.stringContaining('"vote_type":"upvote"')
        })
    );
  });

  test('uses capstone URL when careerId is provided', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, questions: mockQuestions })
    });

    render(<QuizModal careerId={101} onClose={jest.fn()} onQuizPass={jest.fn()} />);
    
    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/capstone/101')
        );
    });
  });
});
