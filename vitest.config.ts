/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  test: {
    // Enable global test APIs (similar to pytest)
    globals: true,
    
    // Use happy-dom for DOM testing (lightweight alternative to jsdom)
    environment: 'happy-dom',
    
    // Test file patterns
    include: ['tests/**/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],
    
    // Exclude patterns
    exclude: ['node_modules', 'dist', 'tests/**/*.spec.js', 'playwright.config.js'],
    
    // Watch mode configuration
    watch: true,
    
    // Reporter configuration (like pytest's output)
    reporter: process.env.CI ? [['default', { summary: false }]] : ['verbose'],
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{js,ts,astro}'],
      exclude: [
        'src/pages/**', // Page components don't need unit testing
        'src/content/**', // Content files
        'src/types.ts',
        'src/env.d.ts',
      ],
    },
    
    // Test setup
    setupFiles: ['tests/setup.ts'],
    
    // Test timeout (shorter for CI)
    testTimeout: process.env.CI ? 5000 : 10000,
    
    // Pool options for better performance
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },
});
