import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AIFacultyAdvisor from '../components/dashboard/admin/AIFacultyAdvisor';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// MOCKS
// ============================================================================
jest.mock('../context/AuthContext');
global.fetch = jest.fn();

describe('System Resilience & Failure Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    useAuth.mockReturnValue({ user: { user_id: '123', name: 'Test' } });
  });

  // ------------------------------------------------------------------------
  // TEST CASE: LLM Timeout / Error 413 handling
  // ------------------------------------------------------------------------
  test('displays friendly error message when AI service fails', async () => {
    // Mock the initial empty state
    render(<AIFacultyAdvisor recommendations={[]} setRecommendations={jest.fn()} />);

    // Mock a 413 Request Too Large error from Flask
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Request too large for model' })
    });

    const analyzeBtn = screen.getByText(/Analyze Cohort/i);
    fireEvent.click(analyzeBtn);

    // Assert UI catches the failure and shows the warning badge
    expect(await screen.findByText(/AI Advisor Error: Request too large for model/i)).toBeInTheDocument();
  });

  // ------------------------------------------------------------------------
  // TEST CASE: Network Disconnect on Dashboard
  // ------------------------------------------------------------------------
  test('gracefully handles network disconnect during dashboard fetch', async () => {
    // Simulate fetch throwing a network error (TypeError: failed to fetch)
    fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));

    render(<Dashboard onContinueRoadmap={jest.fn()} onStartNew={jest.fn()} />);

    // Dashboard should catch the error and log it (we check if it doesn't crash to white screen)
    await waitFor(() => {
      // The loading state should resolve
      expect(screen.queryByText(/Loading your personalized dashboard/i)).not.toBeInTheDocument();
    });
    
    // Ensure the header still renders at minimum
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
  });

  // ------------------------------------------------------------------------
  // TEST CASE: LLM Malformed JSON Resiliency
  // ------------------------------------------------------------------------
  test('handles malformed AI response without crashing', async () => {
    render(<AIFacultyAdvisor recommendations={[]} setRecommendations={jest.fn()} />);

    // Mock backend returning success but recommendations is an unexpected string
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, recommendations: "Not an array" })
    });

    const analyzeBtn = screen.getByText(/Analyze Cohort/i);
    fireEvent.click(analyzeBtn);

    // Verify it doesn't crash and ideally handles the array mapping safely
    await waitFor(() => {
        expect(screen.queryByText(/Analyze Cohort/i)).toBeInTheDocument();
    });
  });
});
