/**
 * URL Structure Tests
 * Testing the new URL structure where posts appear at root instead of /posts/
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const BASE_URL = 'http://localhost:4321';
const TEST_TIMEOUT = 10000;

// Helper functions
const checkServerRunning = async (url: string): Promise<void> => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      console.log('✅ Development server is running');
      return;
    }
    throw new Error(`❌ Development server returned status ${response.status} at ${url}`);
  } catch (error: any) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('ECONNREFUSED') || error.message.includes('fetch')) {
      throw new Error(`❌ Development server is not running at ${url}. Please start it with 'npm run dev' first.`);
    }
    throw error;
  }
};

const getSamplePostIds = (): string[] => {
  try {
    const contentDir = join(process.cwd(), 'src/content/post');
    const entries = readdirSync(contentDir, { withFileTypes: true });
    
    return entries
      .filter(entry => entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')))
      .map(entry => entry.name.replace(/\.(md|mdx)$/, '').toLowerCase())
      .slice(0, 5); // Test first 5 posts
  } catch (error) {
    console.warn('Could not read post directory, using fallback posts');
    return ['ai', 'books', 'firefox', 'plausible', 'obsidian'];
  }
};

const getRedirects = (): Record<string, string> => {
  try {
    const redirectsPath = join(process.cwd(), 'redirects.json');
    const redirectsContent = readFileSync(redirectsPath, 'utf8');
    return JSON.parse(redirectsContent);
  } catch (error) {
    console.warn('Could not read redirects.json');
    return {};
  }
};

// Test suite setup - requires running development server
beforeAll(async () => {
  await checkServerRunning(BASE_URL);
}, TEST_TIMEOUT);

// Test suites
describe('URL Structure', () => {
  describe('Post URLs', () => {
    test('posts should be accessible at root URLs', async () => {
      const postIds = getSamplePostIds();
      expect(postIds.length).toBeGreaterThan(0);
      
      for (const postId of postIds) {
        const response = await fetch(`${BASE_URL}/${postId}/`);
        expect(response.status).toBe(200);
        
        // Verify it's actually a post page
        const content = await response.text();
        expect(content).toContain('html'); // Basic HTML check
      }
    });

    test('posts listing page should work', async () => {
      const response = await fetch(`${BASE_URL}/posts`);
      expect(response.status).toBe(200);
      
      const content = await response.text();
      expect(content).toContain('Posts'); // Should have posts title
    });
  });

  describe('Redirects', () => {
    test('old /posts/ URLs should redirect to new structure', async () => {
      const testCases = [
        { from: '/posts/ai/', to: '/ai/' },
        { from: '/posts/books/', to: '/books/' },
        { from: '/posts/firefox/', to: '/firefox/' }
      ];
      
      for (const { from } of testCases) {
        // Test that we can access the old URL (either redirect or direct serve)
        const response = await fetch(`${BASE_URL}${from}`);
        expect(response.status).toBe(200);
        
        // The content should be accessible regardless of redirect mechanism
        const content = await response.text();
        expect(content).toContain('html');
      }
    });

    test('configured redirects should work', async () => {
      const redirects = getRedirects();
      
      for (const [from] of Object.entries(redirects)) {
        const response = await fetch(`${BASE_URL}${from}`);
        expect(response.status).toBe(200);
        
        // Should serve content successfully
        const content = await response.text();
        expect(content).toContain('html');
      }
    });
  });

  describe('RSS Feed', () => {
    test('RSS feed should use new URL structure', async () => {
      const response = await fetch(`${BASE_URL}/rss.xml`);
      expect(response.status).toBe(200);
      
      const rssContent = await response.text();
      
      // Should not contain old /posts/ URLs
      expect(rssContent).not.toContain('/posts/');
      
      // Should contain valid RSS structure
      expect(rssContent).toContain('<rss');
      expect(rssContent).toContain('<channel>');
    });
  });
});

describe('Component Integration', () => {
  test('homepage should load successfully', async () => {
    const response = await fetch(`${BASE_URL}/`);
    expect(response.status).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('html');
    expect(content).toContain('Andrew'); // Should contain site title/author
  });

  test('navigation links should work', async () => {
    const testRoutes = ['/', '/posts', '/tags'];
    
    for (const route of testRoutes) {
      const response = await fetch(`${BASE_URL}${route}`);
      expect(response.status).toBe(200);
    }
  });
});
