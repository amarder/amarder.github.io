# Testing Guide

This project uses **Vitest** as the main test runner, providing a pytest-like experience for JavaScript/TypeScript testing.

## 🧪 **Test Structure**

```
tests/
├── setup.ts              # Global test setup (like pytest's conftest.py)
├── url-structure.test.ts  # URL structure integration tests
├── utils.test.ts          # Utility function tests
└── README.md             # This file
```

## 🚀 **Running Tests**

### Basic Commands (pytest equivalents)

```bash
# Run all tests (like `pytest`)
npm test

# Run tests in watch mode (like `pytest --watch`)
npm run test:watch

# Run with UI (interactive test runner)
npm run test:ui

# Run with coverage (like `pytest --cov`)
npm run test:coverage

# Quick run with verbose output (like `pytest -v`)
npm run test:quick
```

### Specific Test Running

```bash
# Run specific test file (like `pytest tests/test_specific.py`)
npx vitest run tests/url-structure.test.ts

# Run tests matching pattern (like `pytest -k "test_pattern"`)
npx vitest run --reporter=verbose --grep="URL Structure"

# Run only changed tests
npx vitest related
```

## 📝 **Writing Tests**

### Basic Test Structure (similar to pytest)

```typescript
import { describe, test, expect, beforeAll, afterAll } from 'vitest';

describe('Feature Name', () => {
  beforeAll(() => {
    // Setup before all tests in this describe block
    // Similar to pytest's @pytest.fixture(scope="module")
  });

  test('should do something specific', () => {
    // Test implementation
    expect(actual).toBe(expected);
  });

  test.skip('skipped test', () => {
    // Like @pytest.mark.skip
  });

  test.only('run only this test', () => {
    // Like pytest -k "specific_test"
  });
});
```

### Fixtures and Setup (like pytest fixtures)

```typescript
// In tests/setup.ts - global fixtures
export const testUtils = {
  createTestPost: (overrides = {}) => ({
    // Factory function similar to pytest fixtures
  }),
};

// In individual test files
import { beforeEach } from 'vitest';

beforeEach(() => {
  // Setup before each test (like pytest fixtures with function scope)
});
```

### Assertions (similar to pytest's assert)

```typescript
// Basic assertions
expect(value).toBe(expected);           // Like assert value == expected
expect(value).toBeNull();               // Like assert value is None
expect(value).toBeTruthy();             // Like assert value
expect(array).toContain(item);          // Like assert item in array
expect(array).toHaveLength(3);          // Like assert len(array) == 3

// Async assertions
await expect(promise).resolves.toBe(value);
await expect(promise).rejects.toThrow();
```

### Mocking (like pytest monkeypatch)

```typescript
import { vi } from 'vitest';

test('with mocked fetch', () => {
  // Mock a function (like monkeypatch)
  const mockFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: 'test' })
  });
  
  global.fetch = mockFetch;
  
  // Test code that uses fetch
  
  expect(mockFetch).toHaveBeenCalledWith('/api/endpoint');
});
```

## 🔍 **Test Categories**

### Unit Tests
Test individual functions and components in isolation.

```typescript
// tests/utils.test.ts
describe('String Utilities', () => {
  test('should generate correct slug', () => {
    expect(generateSlug('Test Post!')).toBe('test-post');
  });
});
```

### Integration Tests
Test how different parts work together.

```typescript
// tests/url-structure.test.ts
describe('URL Structure', () => {
  test('posts should be accessible at root URLs', async () => {
    const response = await fetch(`${BASE_URL}/ai/`);
    expect(response.status).toBe(200);
  });
});
```

### End-to-End Tests
Use Playwright for full browser testing.

```bash
npm run test:e2e        # Run E2E tests
npm run test:e2e:ui     # Run E2E tests with UI
```

## 📊 **Coverage Reports**

```bash
npm run test:coverage
```

Coverage reports are generated in `coverage/` directory:
- `coverage/index.html` - HTML report
- `coverage/lcov.info` - LCOV format for CI

## 🐛 **Debugging Tests**

### Debug in VS Code
1. Set breakpoints in test files
2. Run "Debug Vitest" configuration
3. Or use `debugger;` statements

### Debug with Console
```typescript
test('debug example', () => {
  console.log('Debug info:', someVariable);
  expect(someVariable).toBe(expected);
});
```

### Verbose Output
```bash
npm run test:quick  # Verbose reporter
```

## 🔧 **Configuration**

Test configuration is in `vitest.config.ts`:
- Test patterns and exclusions
- Global setup and teardown
- Coverage settings
- Environment configuration

## 💡 **Best Practices**

1. **Descriptive test names**: Use "should" statements
2. **One assertion per test**: Keep tests focused
3. **Use beforeEach/afterEach**: Clean setup and teardown
4. **Mock external dependencies**: Use `vi.mock()` for APIs
5. **Test edge cases**: Empty arrays, null values, etc.
6. **Use factories**: Create test data with `testUtils.createTestPost()`

## 🔗 **Resources**

- [Vitest Documentation](https://vitest.dev/)
- [Vitest API Reference](https://vitest.dev/api/)
- [Testing Best Practices](https://testing-library.com/docs/guiding-principles)
