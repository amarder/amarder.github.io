/**
 * Vitest global setup file
 * Similar to pytest's conftest.py
 */

import { beforeAll, afterAll, beforeEach, afterEach, vi } from 'vitest';

// Global test configuration
beforeAll(() => {
  // Global setup that runs once before all tests
  console.log('🧪 Starting test suite...');
});

afterAll(() => {
  // Global cleanup that runs once after all tests
  console.log('✅ Test suite completed!');
});

// Per-test setup and cleanup
beforeEach(() => {
  // Setup that runs before each test
  // Similar to pytest fixtures with function scope
});

afterEach(() => {
  // Cleanup that runs after each test
});

// Global test utilities (similar to pytest fixtures)
export const testUtils = {
  // Mock fetch for API testing
  mockFetch: (response: any) => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(response),
        text: () => Promise.resolve(JSON.stringify(response)),
        headers: new Headers(),
      } as Response)
    );
  },

  // Restore fetch
  restoreFetch: () => {
    vi.restoreAllMocks();
  },

  // Create a test post object
  createTestPost: (overrides = {}) => ({
    id: 'test-post',
    slug: 'test-post',
    data: {
      title: 'Test Post',
      description: 'A test post',
      publishDate: new Date('2024-01-01'),
      draft: false,
      tags: ['test'],
      ...overrides,
    },
  }),
};

// Make utilities available globally
declare global {
  var testUtils: {
    mockFetch: (response: any) => void;
    restoreFetch: () => void;
    createTestPost: (overrides?: any) => any;
  };
}

globalThis.testUtils = testUtils;
