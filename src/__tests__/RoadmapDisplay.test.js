import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RoadmapDisplay from '../components/roadmap/RoadmapDisplay';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// 1. MOCK SETUP
// ============================================================================
jest.mock('../context/AuthContext');
jest.mock('../components/roadmap/QuizModal', () => () => <div data-testid="quiz-modal">Quiz Modal Mock</div>);
jest.mock('../components/roadmap/SkillCard', () => ({ stepNumber, skill, status, onUpdateProgress }) => (
  <div data-testid={`skill-card-${stepNumber}`}>
    <div>{skill.skill_name}</div>
    <div>Status: {status}</div>
    <button onClick={onUpdateProgress}>Toggle Progress</button>
  </div>
));

const mockUser = {
  user_id: 'student-123',
  name: 'Xayne Explorer'
};

const mockRoadmapData = {
  success: true,
  career: { career_name: 'AI Engineer', description: 'AI specialist' },
  steps: [
    { step_id: 1, step_order: 1, skill: { skill_id: 's1', skill_name: 'Python', concept_tag: 'python' } },
    { step_id: 2, step_order: 2, skill: { skill_id: 's2', skill_name: 'Calculus', concept_tag: 'calculus' } }
  ],
  completed_steps: [1],
  is_eligible_for_quiz: false,
  is_certified: false
};

// Mock global fetch
global.fetch = jest.fn();

describe('RoadmapDisplay Component Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    useAuth.mockReturnValue({ user: mockUser });
    console.error = jest.fn();
  });

  test('renders loading state initially', () => {
    fetch.mockImplementation(() => new Promise(() => {}));
    render(<RoadmapDisplay careerId={1} onBack={jest.fn()} />);
    expect(screen.getByText(/Loading your personalized learning path/i)).toBeInTheDocument();
  });

  test('renders roadmap data correctly after fetching', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => mockRoadmapData
    });

    render(<RoadmapDisplay careerId={1} onBack={jest.fn()} />);

    // Check header
    expect(await screen.findByText(/AI Engineer Roadmap/i)).toBeInTheDocument();
    
    // Check stats (1/2 completed = 50%)
    expect(screen.getByText(/50%/i)).toBeInTheDocument();
    
    // Check that both "1" values exist (Completed and Left)
    const counts = screen.getAllByText(/^1$/);
    expect(counts.length).toBeGreaterThanOrEqual(2);
    
    // Check SkillCards
    expect(screen.getByTestId('skill-card-1')).toHaveTextContent(/Status: completed/i);
    expect(screen.getByTestId('skill-card-2')).toHaveTextContent(/Status: in-progress/i);
  });

  test('toggles step progress and syncs with backend', async () => {
    fetch.mockResolvedValueOnce({ json: async () => mockRoadmapData }); // Initial load
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); // Sync POST
    fetch.mockResolvedValueOnce({ json: async () => ({ ...mockRoadmapData, completed_steps: [1, 2] }) }); // Reload

    render(<RoadmapDisplay careerId={1} onBack={jest.fn()} />);

    // Toggle Step 2
    const toggleBtn = await screen.findAllByText(/Toggle Progress/i);
    fireEvent.click(toggleBtn[1]);

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/progress'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"step_id":2,"status":"completed"')
            })
        );
    });

    // Check updated UI (now 100%)
    expect(await screen.findByText(/100%/i)).toBeInTheDocument();
  });

  test('shows Capstone Quiz button when eligible', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ ...mockRoadmapData, is_eligible_for_quiz: true })
    });

    render(<RoadmapDisplay careerId={1} onBack={jest.fn()} />);

    const capstoneBtn = await screen.findByRole('button', { name: /Start Capstone Quiz/i });
    expect(capstoneBtn).toBeInTheDocument();
    
    // Click button to open modal
    fireEvent.click(capstoneBtn);
    expect(screen.getByTestId('quiz-modal')).toBeInTheDocument();
  });

  test('shows congratulations message when certified', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ ...mockRoadmapData, is_certified: true })
    });

    render(<RoadmapDisplay careerId={1} onBack={jest.fn()} />);

    expect(await screen.findByText(/Congratulations! You are officially Certified/i)).toBeInTheDocument();
  });
});
