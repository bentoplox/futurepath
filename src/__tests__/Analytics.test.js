import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import EmployabilityDashboard from '../components/dashboard/EmployabilityDashboard';
import AIFacultyAdvisor from '../components/dashboard/admin/AIFacultyAdvisor';

// ============================================================================
// MOCKS
// ============================================================================
global.fetch = jest.fn();

describe('Analytics & Market Intelligence UI Tests', () => {
  beforeEach(() => {
    fetch.mockClear();
    
    // ⚡ FIX: We must return an object with a "document" property so .write() doesn't crash!
    window.open = jest.fn().mockReturnValue({
        document: {
            write: jest.fn(),
            close: jest.fn()
        }
    });
  });

  // ------------------------------------------------------------------------
  // TEST CASE: Internship Role Stats Rendering
  // ------------------------------------------------------------------------
  test('renders the "Most Common Internship Roles" card with data', async () => {
    const mockMarketInsights = {
        success: true,
        insights: {
            "OVERALL FACULTY (FSKTM)": {
                top_employers: [],
                top_roles: [],
                top_internships: [],
                top_intern_roles: [
                    { name: "Frontend Intern", count: 12 },
                    { name: "Data Analyst Intern", count: 8 }
                ]
            }
        }
    };

    fetch.mockResolvedValueOnce({ json: async () => ({ success: true, stats: [] }) }); // SKPG stats
    fetch.mockResolvedValueOnce({ json: async () => mockMarketInsights }); // Alumni insights

    render(<EmployabilityDashboard />);

    // Wait for the specific new metric header
    expect(await screen.findByText(/Most Common Internship Roles/i)).toBeInTheDocument();

    // Verify the data rows are rendered
    expect(screen.getByText('Frontend Intern')).toBeInTheDocument();
    expect(screen.getByText('12 Grads')).toBeInTheDocument();
  });

  // ------------------------------------------------------------------------
  // TEST CASE: AI Report Export Trigger
  // ------------------------------------------------------------------------
  test('clicking Download Report opens a new tab for PDF printing', async () => {
    const mockRecs = [{
        title: "Test Hackathon",
        urgency_level: "High",
        target_track: "AI",
        justification: "Score low",
        agenda: ["Point 1"]
    }];

    render(<AIFacultyAdvisor recommendations={mockRecs} setRecommendations={jest.fn()} />);

    const downloadBtn = screen.getByText(/Download Report/i);
    fireEvent.click(downloadBtn);

    // Verify window.open was called (triggering the HTML-to-PDF flow)
    expect(window.open).toHaveBeenCalledWith('', '_blank');
  });
});