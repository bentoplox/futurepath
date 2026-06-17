// react-testing-library renders your components to document.body,
// this adds custom jest matchers for asserting on DOM nodes.
import '@testing-library/jest-dom';

// Mocking the window.open for the AI Report Export test
window.open = jest.fn();

// Mocking scrollIntoView which isn't implemented in JSDOM
Element.prototype.scrollIntoView = jest.fn();

// Global setup for Supabase mock to prevent real network calls during tests
jest.mock('./supabaseClient', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      execute: jest.fn().mockReturnValue(Promise.resolve({ data: [], error: null })),
    })),
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn().mockResolvedValue({ data: {}, error: null }),
        getPublicUrl: jest.fn().mockReturnValue({ data: { publicUrl: 'http://mock-url.com' } }),
      })),
    },
  },
}));