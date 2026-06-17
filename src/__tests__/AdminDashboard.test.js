import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import { supabase } from '../supabaseClient'; 

// ============================================================================
// 1. MOCK DATA DEFINITIONS
// ============================================================================
const mockUser = { name: 'Dr. Erma Rahayu', role: 'admin' };

const mockSummaryStats = {
    success: true,
    stats: {
        total_students: 400,
        verified_alumni: 180,
        pending_moderation: 2,
        unread_alumni_insights: 5,
        unread_student_reports: 3
    }
};

const mockHeatmapData = {
    success: true,
    heatmap: [
        {
            career_name: 'AI Engineer',
            skill: 'Python Basics',
            y1: 0,
            y1_count: 1, // ⚡ CASE: Scored 0, but attempted
            y2: 0,
            y2_count: 0, // ⚡ CASE: Unattempted
            y3: 85,
            y3_count: 5,
            y4: 0,
            y4_count: 0
        }
    ]
};

const mockPendingPosts = [
    { id: 1, title: 'AI Intern', post_type: 'internship', content: 'Apply now', users: { name: 'Jimmy' } },
    { id: 2, title: 'Backend Dev', post_type: 'job', content: 'Looking for dev', users: { name: 'Sarah' } }
];

// ============================================================================
// 2. GLOBAL MOCKS
// ============================================================================
global.fetch = jest.fn();

// Mock Supabase to handle the "thenable" query chain (awaiting without .execute())
const createMockQuery = (data, count = 0) => {
  const query = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    // Make the object thenable so "await" works
    then: jest.fn((onFullfilled) => Promise.resolve({ data, count, error: null }).then(onFullfilled))
  };
  return query;
};

jest.mock('../supabaseClient', () => ({
  supabase: {
    from: jest.fn()
  }
}));

describe('AdminDashboard Integration & Heatmap Logic', () => {
    beforeEach(() => {
        fetch.mockClear();
        window.confirm = jest.fn(() => true);
        
        // Mock all Flask API endpoints
        fetch.mockImplementation((url) => {
            if (url.includes('summary-stats')) return Promise.resolve({ json: async () => mockSummaryStats });
            if (url.includes('heatmap')) return Promise.resolve({ json: async () => mockHeatmapData });
            if (url.includes('feedback')) return Promise.resolve({ json: async () => ({ success: true, reports: [] }) });
            if (url.includes('curriculum-health')) return Promise.resolve({ json: async () => ({ success: true, alerts: [] }) });
            if (url.includes('asset-coverage')) return Promise.resolve({ json: async () => ({ success: true, data: {} }) });
            return Promise.resolve({ json: async () => ({ success: true }) });
        });

        // Mock Supabase to return different data based on the table
        supabase.from.mockImplementation((table) => {
            if (table === 'alumni_posts') return createMockQuery(mockPendingPosts);
            if (table === 'users') return createMockQuery([], 400);
            return createMockQuery([]);
        });
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Heatmap Logic Verification
    // ------------------------------------------------------------------------
    test('renders heatmap cells correctly (0% vs Dash)', async () => {
        render(<AdminDashboard user={mockUser} onLogout={jest.fn()} />);

        // Wait for dashboard to load (Using role to avoid ambiguous text matches)
        expect(await screen.findByRole('heading', { name: /Executive Analytics/i, level: 1 })).toBeInTheDocument();

        // Switch to Heatmap Tab
        const heatmapTabBtn = screen.getByText(/Skills Gap Heatmap/i);
        fireEvent.click(heatmapTabBtn);

        // Verify "Python Basics" row exists
        expect(await screen.findByText('Python Basics')).toBeInTheDocument();

        // ⚡ ASSERTION 1: Y1 should show "0%" because count = 1
        const zeroCell = screen.getByText('0%');
        expect(zeroCell).toBeInTheDocument();

        // ⚡ ASSERTION 2: Y2 should show "-" because count = 0
        // We find all dashes and check their count
        const dashCells = screen.getAllByText('-');
        expect(dashCells.length).toBeGreaterThan(0);
        
        // Check tooltip content for the 0% cell
        expect(zeroCell.closest('div')).toHaveAttribute('title', '📊 1 students attempted this quiz');
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Post Moderation Queue Verification
    // ------------------------------------------------------------------------
    test('displays correct moderation queue count and cards', async () => {
        render(<AdminDashboard user={mockUser} onLogout={jest.fn()} />);

        // Wait for summary stats to load so the badge count (2) is visible
        const moderationTabBtn = await screen.findByText(/Job Screening \(2\)/i);
        
        // Click the tab
        fireEvent.click(moderationTabBtn);

        // Assert cards are rendered
        expect(await screen.findByText('AI Intern')).toBeInTheDocument();
        expect(screen.getByText('Backend Dev')).toBeInTheDocument();
        
        // Verify sub-header count
        expect(screen.getByText(/2 Pending Reviews/i)).toBeInTheDocument();
    });
});
