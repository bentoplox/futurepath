import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AlumniDashboard from '../components/alumnihub/AlumniDashboard';

// ============================================================================
// 1. MOCK SETUP
// ============================================================================
const mockUser = {
  user_id: 'user-alumni-123',
  name: 'Alumni Alpha'
};

const mockPosts = [
  {
    id: 'p1',
    author_id: 'user-alumni-123',
    title: 'My Job Posting',
    content: 'Details here',
    post_type: 'job',
    created_at: new Date().toISOString(),
    users: { name: 'Alumni Alpha', show_workplace: false }
  },
  {
    id: 'p2',
    author_id: 'other-user-456',
    title: 'Someone Else Post',
    content: 'Other details',
    post_type: 'job',
    created_at: new Date().toISOString(),
    users: { name: 'Alumni Beta', show_workplace: false }
  }
];

global.fetch = jest.fn();

// Mock Supabase client
jest.mock('../supabaseClient', () => ({
  supabase: {
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(),
        getPublicUrl: jest.fn(() => ({ data: { publicUrl: 'http://test.com/img.jpg' } }))
      }))
    }
  }
}));

describe('AlumniDashboard Filter Toggle Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.confirm = jest.fn(() => true);
    window.alert = jest.fn();
  });

  test('filters posts correctly when "Showing Mine" toggle is clicked', async () => {
    // Mock successful fetch for posts and profile stats
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, posts: mockPosts }) }); // fetchPosts
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, stats: null }) }); // fetchCareerStats

    render(<AlumniDashboard user={mockUser} onLogout={jest.fn()} />);

    // Initially should show both posts
    expect(await screen.findByText(/My Job Posting/i)).toBeInTheDocument();
    expect(screen.getByText(/Someone Else Post/i)).toBeInTheDocument();

    // Find and click the toggle
    const toggleBtn = screen.getByText(/Show All Posts/i);
    fireEvent.click(toggleBtn);

    // Now button text should change and only "My Job Posting" should be visible
    expect(screen.getByText(/Showing Mine ✓/i)).toBeInTheDocument();
    expect(screen.getByText(/My Job Posting/i)).toBeInTheDocument();
    expect(screen.queryByText(/Someone Else Post/i)).not.toBeInTheDocument();

    // Toggle back
    fireEvent.click(screen.getByText(/Showing Mine ✓/i));
    expect(screen.getByText(/Show All Posts/i)).toBeInTheDocument();
    expect(screen.getByText(/Someone Else Post/i)).toBeInTheDocument();
  });

  test('search works in conjunction with the personal filter', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, posts: mockPosts }) });
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, stats: null }) });

    render(<AlumniDashboard user={mockUser} onLogout={jest.fn()} />);

    // Toggle to "Mine"
    const toggleBtn = await screen.findByText(/Show All Posts/i);
    fireEvent.click(toggleBtn);

    // Search for something that doesn't exist in my posts
    const searchInput = screen.getByPlaceholderText(/Search your opportunities/i);
    fireEvent.change(searchInput, { target: { value: 'Beta' } });

    // Should show "No matches"
    expect(screen.getByText(/No matches for "Beta"/i)).toBeInTheDocument();
    expect(screen.queryByText(/My Job Posting/i)).not.toBeInTheDocument();
  });
});
