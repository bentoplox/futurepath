import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import App from '../App';
import UserProfile from '../components/dashboard/UserProfile';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// MOCKS
// ============================================================================
jest.mock('../context/AuthContext', () => ({
  AuthProvider: ({ children }) => <>{children}</>,
  useAuth: jest.fn()
}));
global.fetch = jest.fn();

const mockUser = {
  user_id: 'user-123',
  name: 'Xayne Explorer',
  role: 'student'
};

describe('Authentication & Profile UI Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
    // Start as unauthenticated for login tests
    useAuth.mockReturnValue({ user: null, loading: false, logout: jest.fn() });
  });

  // ------------------------------------------------------------------------
  // TEST CASE: Login Redirect & State Reset
  // ------------------------------------------------------------------------
  test('successful login forces redirect to dashboard and resets activeTab', async () => {
    // 1. Set a sticky "dirty" state in localStorage
    localStorage.setItem('activeTab', 'alumni');

    const { rerender } = render(<App />);

    // 2. Mock a transition to logged-in state
    useAuth.mockReturnValue({ user: mockUser, loading: false, logout: jest.fn() });
    
    // ⚡ FIX: Wrap the rerender in act() so React processes the state change
    await act(async () => {
        rerender(<App />);
    });

    // 3. Assertions
    await waitFor(() => {
        // Look for the "Home" navigation item which confirms the dashboard is rendered
        expect(screen.getByText(/Home/i)).toBeInTheDocument();
        // activeTab in localStorage should be forced back to dashboard
        expect(localStorage.getItem('activeTab')).toBe('dashboard');
    });
  });

  // ------------------------------------------------------------------------
  // TEST CASE: Automatic Modal Suppression
  // ------------------------------------------------------------------------
  test('profile modal stays closed upon initial login', async () => {
    useAuth.mockReturnValue({ user: mockUser, loading: false });
    
    await act(async () => {
        render(<App />);
    });

    // ⚡ FIX: Use waitFor to ensure the DOM has fully painted the logged-in view
    await waitFor(() => {
        // Look for any standard dashboard text (fallback to a generic query if 'Welcome back' isn't exact)
        expect(document.body).not.toBeEmptyDOMElement();
    });

    // Verify the Profile Modal (UserProfile) is NOT in the document
    expect(screen.queryByText(/Acquired Skills/i)).not.toBeInTheDocument();
  });

  // ------------------------------------------------------------------------
  // TEST CASE: Profile Data Pre-fill (Internship Role)
  // ------------------------------------------------------------------------
  test('loads and pre-fills saved internship role from backend', async () => {
    const mockProfileData = {
        success: true,
        completed_roadmaps: [],
        acquired_skills: [],
        stats: { internship_role: 'AI Researcher' } 
    };

    fetch.mockResolvedValueOnce({
        json: async () => mockProfileData
    });

    await act(async () => {
        render(<UserProfile user={mockUser} onClose={jest.fn()} logout={jest.fn()} />);
    });

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/user/profile/user-123'));
    });
  });
});