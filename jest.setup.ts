// Jest setup file
import '@testing-library/jest-dom';

// Mock environment variables for testing
process.env.RESEND_API_KEY = 'test-api-key';
process.env.EMAIL_FROM = 'test@hackathon.com';
process.env.EMAIL_SUPPORT = 'support@hackathon.com';
process.env.JWT_SECRET = 'test-secret-key-min-32-characters-long';
process.env.SESSION_TOKEN_NAME = 'session_token';

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({
        data: { id: 'test-email-id' },
        error: null,
      }),
    },
  })),
}));

// Suppress console logs during tests (optional)
const originalError = console.error;
const originalWarn = console.warn;
const originalLog = console.log;

beforeAll(() => {
  console.error = jest.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning:') || args[0].includes('act('))
    ) {
      return;
    }
    originalError.call(console, ...args);
  });
  console.warn = jest.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning:')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  });
  console.log = jest.fn((...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('[Email') || args[0].includes('Warning:'))
    ) {
      return;
    }
    originalLog.call(console, ...args);
  });
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
  console.log = originalLog;
});
