// Jest setup for backend services
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for Node.js environment
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/school_test';
process.env.REDIS_URL = 'redis://localhost:6379';

// Mock console methods in test environment to reduce noise
if (process.env.NODE_ENV === 'test') {
  global.console = {
    ...console,
    // Keep console.error and console.warn for debugging
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  };
}

// Global test timeout
jest.setTimeout(30000);

// Mock external services
jest.mock('twilio', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({ sid: 'test-message-sid' }),
    },
  })),
}));

jest.mock('nodemailer', () => ({
  createTransporter: jest.fn(() => ({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-message-id' }),
  })),
}));

jest.mock('kafkajs', () => ({
  Kafka: jest.fn(() => ({
    producer: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      send: jest.fn().mockResolvedValue({}),
    })),
    consumer: jest.fn(() => ({
      connect: jest.fn(),
      disconnect: jest.fn(),
      subscribe: jest.fn(),
      run: jest.fn(),
    })),
  })),
}));

// Mock AWS SDK
jest.mock('aws-sdk', () => ({
  config: {
    update: jest.fn(),
  },
  S3: jest.fn(() => ({
    upload: jest.fn(() => ({
      promise: jest.fn().mockResolvedValue({
        Location: 'https://test-bucket.s3.amazonaws.com/test-file.pdf',
        Key: 'test-file.pdf',
      }),
    })),
    deleteObject: jest.fn(() => ({
      promise: jest.fn().mockResolvedValue({}),
    })),
  })),
}));

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});