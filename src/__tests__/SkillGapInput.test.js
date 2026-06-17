import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SkillGapInput from '../components/feedback/SkillGapInput';

// ============================================================================
// 1. MOCK SETUP
// ============================================================================
const mockUser = {
  user_id: 'test-user-123',
  name: 'Xayne Explorer'
};

const mockOnBack = jest.fn();

// Mock global fetch
global.fetch = jest.fn();

describe('SkillGapInput Component Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    mockOnBack.mockClear();
    // Mock window.alert
    window.alert = jest.fn();
  });

  test('renders the feedback form correctly', () => {
    render(<SkillGapInput user={mockUser} onBack={mockOnBack} />);
    
    expect(screen.getByText(/Report a Missing Skill/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Flutter, Advanced SQL, Public Speaking/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Feedback/i })).toBeInTheDocument();
  });

  test('handles user input and successful submission', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true })
    });

    render(<SkillGapInput user={mockUser} onBack={mockOnBack} />);

    // Fill the form
    fireEvent.change(screen.getByPlaceholderText(/e.g. Flutter, Advanced SQL, Public Speaking/i), {
      target: { value: 'Rust Programming' }
    });
    fireEvent.change(screen.getByRole('combobox'), {
      target: { value: 'Technical' }
    });
    fireEvent.change(screen.getByPlaceholderText(/e.g. I see this in many job descriptions/i), {
      target: { value: 'Highly requested in system programming jobs.' }
    });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit Feedback/i }));

    // Verify loading state
    expect(screen.getByText(/Submitting.../i)).toBeInTheDocument();

    // Wait for success message
    expect(await screen.findByText(/Received!/i)).toBeInTheDocument();

    // Verify fetch call
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/user/skill-gap'),
      expect.objectContaining({
        method: 'POST',
        body: expect.stringContaining('"skill_name":"Rust Programming"')
      })
    );
  });

  test('handles API error state', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: false, error: 'Database timeout' })
    });

    render(<SkillGapInput user={mockUser} onBack={mockOnBack} />);

    // Fill minimum required
    fireEvent.change(screen.getByPlaceholderText(/e.g. Flutter, Advanced SQL, Public Speaking/i), {
      target: { value: 'Broken Skill' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Submit Feedback/i }));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(expect.stringContaining('Error submitting feedback: Database timeout'));
    });
  });

  test('triggers onBack when the back button is clicked', () => {
    render(<SkillGapInput user={mockUser} onBack={mockOnBack} />);
    
    const backBtn = screen.getByText(/Back to Home/i);
    fireEvent.click(backBtn);
    
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });
});
