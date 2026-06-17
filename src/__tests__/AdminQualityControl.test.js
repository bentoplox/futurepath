import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import AdminQualityControl from '../components/dashboard/admin/AdminQualityControl';

// ============================================================================
// 1. MOCK DATA DEFINITIONS
// ============================================================================
const mockFeedbackData = {
    success: true,
    data: {
        alumni_insights: [
            {
                feedback_id: 1,
                author_name: "Jimmy Alumni",
                feedback_type: "outdated_content",
                target_name: "React Hooks",
                target_type: "skill",
                suggested_alternative_text: "Update to React 19 patterns",
                status: "pending",
                created_at: "2026-06-14T10:00:00Z"
            },
            {
                feedback_id: 2,
                author_name: "Sarah Alumni",
                feedback_type: "better_alternative",
                target_name: "TensorFlow",
                target_type: "skill",
                suggested_alternative_text: "Suggest PyTorch instead",
                status: "reviewed",
                created_at: "2026-06-10T10:00:00Z"
            }
        ],
        student_reports: [
            {
                feedback_id: 3,
                target_name: "Python Basics",
                feedback_type: "broken_link",
                suggested_alternative_text: "Documentation link is 404",
                status: "pending",
                created_at: "2026-06-14T12:00:00Z"
            }
        ]
    }
};

// ============================================================================
// 2. GLOBAL FETCH MOCK
// ============================================================================
global.fetch = jest.fn();

describe('AdminQualityControl Component', () => {
    beforeEach(() => {
        fetch.mockClear();
        // Mock alert to prevent real window popup during tests
        window.alert = jest.fn();
        console.error = jest.fn();
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Happy Path - Initial Load & Display
    // ------------------------------------------------------------------------
    test('renders loading state then displays pending alumni insights by default', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => mockFeedbackData
        });

        render(<AdminQualityControl />);

        // Check loading state
        expect(screen.getByText(/Loading Quality Control Center/i)).toBeInTheDocument();

        // Wait for data to load
        const authorName = await screen.findByText(/Jimmy Alumni/i);
        expect(authorName).toBeInTheDocument();
        expect(screen.getByText(/Update to React 19 patterns/i)).toBeInTheDocument();
        
        // Ensure "reviewed" items are NOT visible in the pending tab
        expect(screen.queryByText(/Sarah Alumni/i)).not.toBeInTheDocument();
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Role Switching (Alumni -> Student)
    // ------------------------------------------------------------------------
    test('switches between Alumni and Student report views', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => mockFeedbackData
        });

        render(<AdminQualityControl />);

        // Wait for alumni load
        await screen.findByText(/Jimmy Alumni/i);

        // Click Student Reports Toggle
        const studentBtn = screen.getByText(/Student Reports/i);
        fireEvent.click(studentBtn);

        // Check for student specific data
        expect(await screen.findByText(/Python Basics/i)).toBeInTheDocument();
        expect(screen.queryByText(/Jimmy Alumni/i)).not.toBeInTheDocument();
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Tab Switching (Pending -> History)
    // ------------------------------------------------------------------------
    test('switches between Pending Review and Reviewed History tabs', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => mockFeedbackData
        });

        render(<AdminQualityControl />);

        // Default: Pending (Jimmy is visible)
        await screen.findByText(/Jimmy Alumni/i);

        // Click History Tab
        const historyTab = screen.getByText(/Reviewed History/i);
        fireEvent.click(historyTab);

        // History: Sarah is visible, Jimmy is hidden
        expect(await screen.findByText(/Sarah Alumni/i)).toBeInTheDocument();
        expect(screen.queryByText(/Jimmy Alumni/i)).not.toBeInTheDocument();
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Resolution Logic (Mark as Complete)
    // ------------------------------------------------------------------------
    test('marking a feedback as complete updates the UI immediately', async () => {
        fetch
            .mockResolvedValueOnce({ json: async () => mockFeedbackData }) // Initial Load
            .mockResolvedValueOnce({ json: async () => ({ success: true }) }); // Resolve Action

        render(<AdminQualityControl />);

        // Find the "Mark as Complete" button for Jimmy
        const completeBtn = await screen.findByRole('button', { name: /Mark as Complete ✓/i });
        
        // Execute Resolve Action
        await act(async () => {
            fireEvent.click(completeBtn);
        });

        // Backend verification: Correct URL and Method
        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/resolve/1'),
            expect.objectContaining({ method: 'POST' })
        );

        // UI verification: Jimmy should vanish from the Pending tab instantly
        await waitFor(() => {
            expect(screen.queryByText(/Jimmy Alumni/i)).not.toBeInTheDocument();
        });

        // Switch to history tab to verify he moved there
        fireEvent.click(screen.getByText(/Reviewed History/i));
        expect(await screen.findByText(/Jimmy Alumni/i)).toBeInTheDocument();
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Edge Case - Empty States
    // ------------------------------------------------------------------------
    test('displays appropriate empty state when no data exists', async () => {
        fetch.mockResolvedValueOnce({
            json: async () => ({ success: true, data: { alumni_insights: [], student_reports: [] } })
        });

        render(<AdminQualityControl />);

        const emptyMsg = await screen.findByText(/No pending alumni insights in the queue/i);
        expect(emptyMsg).toBeInTheDocument();
    });

    // ------------------------------------------------------------------------
    // TEST CASE: Resilience - Fetch Failure
    // ------------------------------------------------------------------------
    test('gracefully handles fetch error', async () => {
        fetch.mockRejectedValueOnce(new Error("API Down"));

        render(<AdminQualityControl />);

        await waitFor(() => {
            expect(console.error).toHaveBeenCalledWith(
                "Failed to fetch QC data",
                expect.any(Error)
            );
        });
    });
});
