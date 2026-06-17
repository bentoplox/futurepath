import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PostComments from '../components/alumnihub/PostComments';

// ============================================================================
// 1. MOCK SETUP
// ============================================================================
const mockUser = {
  user_id: 'user-123',
  name: 'Xayne Explorer'
};

const mockComments = [
  {
    id: 'c1',
    user_id: 'user-456',
    content: 'Great post!',
    users: { name: 'Alumni Alpha', role: 'alumni' }
  },
  {
    id: 'c2',
    user_id: 'user-123',
    content: 'Thanks, Alpha!',
    users: { name: 'Xayne Explorer', role: 'student' }
  }
];

global.fetch = jest.fn();

describe('PostComments Component Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    window.alert = jest.fn();
  });

  test('renders existing comments correctly', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, comments: mockComments })
    });

    render(<PostComments postId="post-1" currentUser={mockUser} />);

    expect(await screen.findByText(/Great post!/i)).toBeInTheDocument();
    expect(screen.getByText(/Alumni Alpha/i)).toBeInTheDocument();
    expect(screen.getByText(/Xayne Explorer/i)).toBeInTheDocument();
    expect(screen.getByText(/^Alumni$/)).toBeInTheDocument();
    expect(screen.getByText(/^Student$/)).toBeInTheDocument();
  });

  test('renders empty state when no comments exist', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, comments: [] })
    });

    render(<PostComments postId="post-1" currentUser={mockUser} />);

    expect(await screen.findByText(/No comments yet/i)).toBeInTheDocument();
  });

  test('allows posting a new comment', async () => {
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, comments: [] }) }); // Initial fetch
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); // POST
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, comments: [{ id: 'c3', user_id: 'user-123', content: 'New Comment', users: { name: 'Xayne', role: 'student' } }] }) }); // Final fetch

    render(<PostComments postId="post-1" currentUser={mockUser} />);

    const input = screen.getByPlaceholderText(/Write a general reply/i);
    fireEvent.change(input, { target: { value: 'New Comment' } });
    fireEvent.click(screen.getByText(/Send/i));

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/discussion/comment'),
            expect.objectContaining({
                method: 'POST',
                body: expect.stringContaining('"content":"New Comment"')
            })
        );
    });

    expect(await screen.findByText(/New Comment/i)).toBeInTheDocument();
  });

  test('handles reply functionality', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, comments: [mockComments[0]] })
    });

    render(<PostComments postId="post-1" currentUser={mockUser} />);
    
    // Find the Reply button for Alumni Alpha
    const replyBtn = await screen.findByText(/Reply/i);
    fireEvent.click(replyBtn);

    // Verify indicator and mention logic
    expect(screen.getByText(/Replying to @Alumni Alpha/i)).toBeInTheDocument();
    
    const input = screen.getByPlaceholderText(/Message @Alumni Alpha/i);
    fireEvent.change(input, { target: { value: 'Got it!' } });
    
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true }) }); // POST
    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, comments: [] }) }); // Reload
    
    fireEvent.click(screen.getByText(/Send/i));

    await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/discussion/comment'),
            expect.objectContaining({
                body: expect.stringContaining('"content":"@Alumni Alpha Got it!"')
            })
        );
    });
  });

  test('hides reply button for own comments', async () => {
    fetch.mockResolvedValueOnce({
      json: async () => ({ success: true, comments: mockComments })
    });

    render(<PostComments postId="post-1" currentUser={mockUser} />);
    
    await screen.findByText(/Great post!/i);

    const replyButtons = screen.getAllByRole('button', { name: /Reply/i });
    
    // There should only be 1 reply button (for user-456), not for user-123 (self)
    expect(replyButtons.length).toBe(1);
  });
});
