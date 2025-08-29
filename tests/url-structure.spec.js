import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:4321';

// Helper to get sample post IDs
function getSamplePostIds() {
  try {
    const contentDir = path.join(process.cwd(), 'src/content/post');
    const entries = fs.readdirSync(contentDir, { withFileTypes: true });
    
    return entries
      .filter(entry => entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx')))
      .map(entry => entry.name.replace(/\.(md|mdx)$/, ''))
      .slice(0, 5); // Test first 5 posts
  } catch (error) {
    console.warn('Could not read post directory, using fallback posts');
    return ['ai', 'books', 'firefox', 'plausible', 'obsidian'];
  }
}

// Helper to get redirects
function getRedirects() {
  try {
    const redirectsPath = path.join(process.cwd(), 'redirects.json');
    const redirectsContent = fs.readFileSync(redirectsPath, 'utf8');
    return JSON.parse(redirectsContent);
  } catch (error) {
    console.warn('Could not read redirects.json');
    return {};
  }
}

test.describe('URL Structure Tests', () => {
  
  test('posts are accessible at root URLs', async ({ page }) => {
    const postIds = getSamplePostIds();
    
    for (const postId of postIds) {
      // Test the post page loads
      const response = await page.goto(`${BASE_URL}/${postId}/`);
      expect(response.status()).toBe(200);
      
      // Check that it's actually a post page (should have blog post layout elements)
      await expect(page.locator('article, main, [data-pagefind-body]')).toBeVisible();
      
      console.log(`✅ Post accessible: /${postId}/`);
    }
  });

  test('posts listing page works', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/posts`);
    expect(response.status()).toBe(200);
    
    // Should have the posts title
    await expect(page.locator('h1')).toContainText('Posts');
    
    // Should have some post previews
    await expect(page.locator('a[href*="/"]')).toHaveCount({ min: 1 });
    
    console.log('✅ Posts listing page accessible');
  });

  test('RSS feed uses new URL structure', async ({ page }) => {
    const response = await page.goto(`${BASE_URL}/rss.xml`);
    expect(response.status()).toBe(200);
    
    const rssContent = await page.content();
    
    // Should not contain old /posts/ URLs
    expect(rssContent).not.toContain('/posts/');
    
    // Should contain post links at root level
    const postIds = getSamplePostIds();
    for (const postId of postIds.slice(0, 2)) { // Check first 2
      expect(rssContent).toContain(`/${postId}/`);
    }
    
    console.log('✅ RSS feed uses new URL structure');
  });

  test('redirects work properly', async ({ page, context }) => {
    const redirects = getRedirects();
    
    for (const [from, to] of Object.entries(redirects)) {
      // Navigate to the old URL
      const response = await page.goto(`${BASE_URL}${from}`, { 
        waitUntil: 'networkidle' 
      });
      
      // Should either redirect (status 200 after redirect) or be accessible
      expect(response.status()).toBe(200);
      
      // Check final URL matches expected destination
      const finalUrl = page.url();
      expect(finalUrl).toContain(to.replace(/\/$/, '')); // Remove trailing slash for comparison
      
      console.log(`✅ Redirect works: ${from} → ${to}`);
    }
  });

  test('old /posts/ URLs redirect to new structure', async ({ page }) => {
    const postIds = getSamplePostIds().slice(0, 3); // Test first 3
    
    for (const postId of postIds) {
      // Try to access old URL
      const response = await page.goto(`${BASE_URL}/posts/${postId}/`, {
        waitUntil: 'networkidle'
      });
      
      // Should be accessible (either redirected or served directly)
      expect(response.status()).toBe(200);
      
      // Final URL should be the new structure
      const finalUrl = page.url();
      expect(finalUrl).toMatch(new RegExp(`/${postId}/?$`));
      
      console.log(`✅ Old URL redirects: /posts/${postId}/ → /${postId}/`);
    }
  });

  test('post links in components use new structure', async ({ page }) => {
    // Go to homepage which should have post previews
    await page.goto(`${BASE_URL}/`);
    
    // Find post links
    const postLinks = await page.locator('a[href^="/"][href$="/"]').all();
    
    for (const link of postLinks.slice(0, 3)) { // Check first 3 links
      const href = await link.getAttribute('href');
      
      // Should not contain /posts/ prefix
      expect(href).not.toContain('/posts/');
      
      // Should be a direct path like /post-slug/
      expect(href).toMatch(/^\/[^\/]+\/?$/);
    }
    
    console.log('✅ Post links use new structure');
  });

  test('navigation and internal links work', async ({ page }) => {
    // Start at homepage
    await page.goto(`${BASE_URL}/`);
    
    // Click on "Posts" navigation link
    await page.click('a[href="/posts"]');
    
    // Should be on posts page
    await expect(page.locator('h1')).toContainText('Posts');
    
    // Click on a post link
    const firstPostLink = page.locator('a[href^="/"][href$="/"]').first();
    await firstPostLink.click();
    
    // Should be on a post page
    await expect(page.locator('article, main, [data-pagefind-body]')).toBeVisible();
    
    console.log('✅ Navigation and internal links work');
  });

});
