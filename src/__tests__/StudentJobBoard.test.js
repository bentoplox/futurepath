import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import StudentJobBoard from '../components/alumnihub/StudentJobBoard';
import { useAuth } from '../context/AuthContext';

// ============================================================================
// 1. MOCKING CONTEXT & COMPONENTS
// ============================================================================
jest.mock('../context/AuthContext');
jest.mock('../components/alumnihub/PostComments', () => () => <div data-testid="mock-comments" />);

const mockUser = {
  user_id: 'student-123',
  name: 'Test Student'
};

const mockPosts = [
  {
    id: 'post-1',
    title: 'Python Developer at Grab',
    content: 'Looking for a Python dev.',
    post_type: 'job',
    company_name: 'Grab',
    created_at: new Date().toISOString(),
    users: { name: 'Jimmy', show_workplace: true, current_role: 'Engineer' }
  },
  {
    id: 'post-2',
    title: 'Marketing Intern at Shopee',
    content: 'Join our marketing team.',
    post_type: 'internship',
    company_name: 'Shopee',
    created_at: new Date().toISOString(),
    users: { name: 'Sarah', show_workplace: true, current_role: 'Lead' }
  }
];

// ============================================================================
// 2. GLOBAL FETCH MOCK
// ============================================================================
global.fetch = jest.fn();

describe('StudentJobBoard Integration Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    useAuth.mockReturnValue({ user: mockUser });
    console.error = jest.fn(); // Suppress errors in console during tests
  });

  // ------------------------------------------------------------------------
  // TEST CASE 1: Real-time Search
  // ------------------------------------------------------------------------
  test('filters posts in real-time when typing in search bar', async () => {
    // Initial fetch for posts
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, posts: mockPosts })
    });
    // Fetch for favorites
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, favorites: [] })
    });

    render(<StudentJobBoard onBack={jest.fn()} />);

    // Wait for posts to load
    expect(await screen.findByText(/Python Developer at Grab/i)).toBeInTheDocument();
    expect(screen.getByText(/Marketing Intern at Shopee/i)).toBeInTheDocument();

    // Type "Python" in the search bar
    const searchInput = screen.getByPlaceholderText(/Search jobs & internships/i);
    fireEvent.change(searchInput, { target: { value: 'Python' } });

    // Assert "Marketing" is gone, "Python" remains
    await waitFor(() => {
      expect(screen.queryByText(/Marketing Intern at Shopee/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Python Developer at Grab/i)).toBeInTheDocument();
    });
  });

  // ------------------------------------------------------------------------
  // TEST CASE 2: Bookmarking Integration
  // ------------------------------------------------------------------------
  test('toggles bookmark state and calls backend when clicking star icon', async () => {
    // Initial fetch for posts
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, posts: mockPosts })
    });
    // Fetch for favorites (initially empty)
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, favorites: [] })
    });
    // Mock the toggle POST response
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, favorited: true })
    });

    render(<StudentJobBoard onBack={jest.fn()} />);

    // Wait for posts to load
    const pythonPost = await screen.findByText(/Python Developer at Grab/i);
    expect(pythonPost).toBeInTheDocument();

    // Find the bookmark button for the first post (Python)
    // The button has a title "Save this Post"
    const starBtn = screen.getAllByTitle(/Save this Post/i)[0];
    
    // Click the button
    fireEvent.click(starBtn);

    // Verify backend call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        'http://127.0.0.1:5000/api/discussion/favorite',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ user_id: mockUser.user_id, post_id: 'post-1' })
        })
      );
    });

    // Verify UI updates icon (from empty star to filled star)
    // The text content changes from ☆ to ⭐
    expect(await screen.findByText('⭐')).toBeInTheDocument();
  });
});
