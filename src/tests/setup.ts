// Jest setup file for RLS Guard Dog tests
import '@testing-library/jest-dom';

// Mock environment variables
process.env.NODE_ENV = 'test';

// Global test timeout
jest.setTimeout(30000);

// Mock fetch for tests
global.fetch = jest.fn();

// Console suppression for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});