import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// 1. MOCKING CONTEXT & EXTERNAL SERVICES
// ============================================================================
jest.mock('../context/AuthContext');

const mockUser = {
  user_id: 'test-user-uuid',
  name: 'Xayne Explorer'
};

const mockStats = {
  total_skills: 15,
  total_paths: 2
};

// ============================================================================
// 2. GLOBAL FETCH MOCK SETUP
// ============================================================================
global.fetch = jest.fn();

describe('Dashboard Component Integration Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    useAuth.mockReturnValue({ user: mockUser, loading: false });
    console.error = jest.fn(); // Suppress expected console errors in tests
  });

  // ------------------------------------------------------------------------
  // TEST CASE 1: Horizontal Stepper Math (100% Progress)
  // ------------------------------------------------------------------------
  test('renders "Take Capstone Quiz" button when roadmap is 100% complete', async () => {
    const mockData = {
      success: true,
      stats: mockStats,
      roadmaps: [{
        roadmap_id: 'rm-1',
        career_id: 101,
        career: { career_name: 'AI Engineer' },
        progress_percent: 100,
        status: 'active',
        total_steps: 4,
        completed_steps_count: 4,
        detailed_steps: [
            { step_id: 1, skill: { skill_name: 'Python' }, step_order: 1 },
            { step_id: 2, skill: { skill_name: 'Calculus' }, step_order: 2 },
            { step_id: 3, skill: { skill_name: 'PyTorch' }, step_order: 3 },
            { step_id: 4, skill: { skill_name: 'ML Ops' }, step_order: 4 }
        ],
        completed_steps: [1, 2, 3, 4],
        is_eligible: true
      }]
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockData
    });

    render(<Dashboard onContinueRoadmap={jest.fn()} onStartNew={jest.fn()} />);

    // Wait for the specific Capstone button to appear
    const capstoneBtn = await screen.findByText(/Take Capstone Quiz 🚀/i);
    expect(capstoneBtn).toBeInTheDocument();
  });

  // ------------------------------------------------------------------------
  // TEST CASE 2: Horizontal Stepper Math (< 100% Progress)
  // ------------------------------------------------------------------------
  test('renders "Continue Learning" button when roadmap is partially complete', async () => {
    const mockData = {
      success: true,
      stats: mockStats,
      roadmaps: [{
        roadmap_id: 'rm-2',
        career_id: 102,
        career: { career_name: 'Data Scientist' },
        progress_percent: 50,
        status: 'active',
        total_steps: 2,
        completed_steps_count: 1,
        detailed_steps: [
            { step_id: 5, skill: { skill_name: 'SQL' }, step_order: 1 },
            { step_id: 6, skill: { skill_name: 'Statistics' }, step_order: 2 }
        ],
        completed_steps: [5],
        is_eligible: false
      }]
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockData
    });

    render(<Dashboard onContinueRoadmap={jest.fn()} onStartNew={jest.fn()} />);

    const continueBtn = await screen.findByText(/Continue Learning →/i);
    expect(continueBtn).toBeInTheDocument();
  });

  // ------------------------------------------------------------------------
  // TEST CASE 3: State-Loss Prevention (Fallback Logic)
  // ------------------------------------------------------------------------
  test('gracefully degrades to "Module X" nodes if detailed_steps are missing', async () => {
    // Simulate data missing the "detailed_steps" array but providing "total_steps"
    const mockData = {
      success: true,
      stats: mockStats,
      roadmaps: [{
        roadmap_id: 'rm-3',
        career_id: 103,
        career: { career_name: 'Cloud Solution Architect' },
        progress_percent: 50,
        status: 'active',
        total_steps: 2,
        completed_steps_count: 1,
        detailed_steps: null, // ⚡ SIMULATED FETCH FAILURE / STATE LOSS
        completed_steps: null,
        is_eligible: undefined 
      }]
    };

    fetch.mockResolvedValueOnce({
      json: async () => mockData
    });

    render(<Dashboard onContinueRoadmap={jest.fn()} onStartNew={jest.fn()} />);

    // Wait for fallback nodes to generate
    // Since total_steps = 2, we expect "Module 1" and "Module 2"
    expect(await screen.findByText(/Module 1/i)).toBeInTheDocument();
    expect(await screen.findByText(/Module 2/i)).toBeInTheDocument();
    
    // Ensure the track didn't crash and still rendered the header
    expect(screen.getByText(/Your Roadmap: Cloud Solution Architect/i)).toBeInTheDocument();
  });

  // ------------------------------------------------------------------------
  // TEST CASE 4: Empty State Rendering
  // ------------------------------------------------------------------------
  test('renders empty state when no active roadmaps exist', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, roadmaps: [], stats: { total_skills: 0, total_paths: 0 } })
    });

    render(<Dashboard onContinueRoadmap={jest.fn()} onStartNew={jest.fn()} />);

    const emptyMsg = await screen.findByText(/No active roadmaps. Start a new one/i);
    expect(emptyMsg).toBeInTheDocument();
  });
});
