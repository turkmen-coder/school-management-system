const { pathsToModuleNameMapper } = require('ts-jest');

/** @type {import('jest').Config} */
module.exports = {
  projects: [
    // Backend services
    {
      displayName: 'iam-service',
      preset: '@nestjs/testing',
      testMatch: ['<rootDir>/services/iam/**/*.spec.ts', '<rootDir>/services/iam/**/*.e2e-spec.ts'],
      collectCoverageFrom: [
        'services/iam/src/**/*.(t|j)s',
        '!services/iam/src/**/*.spec.ts',
        '!services/iam/src/**/*.e2e-spec.ts',
        '!services/iam/src/**/index.ts',
        '!services/iam/src/main.ts',
      ],
      coverageDirectory: '<rootDir>/coverage/iam',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapping: pathsToModuleNameMapper(
        {
          '@school/*': ['packages/*/src'],
        },
        { prefix: '<rootDir>/' }
      ),
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'enrollment-service',
      preset: '@nestjs/testing',
      testMatch: ['<rootDir>/services/enrollment/**/*.spec.ts', '<rootDir>/services/enrollment/**/*.e2e-spec.ts'],
      collectCoverageFrom: [
        'services/enrollment/src/**/*.(t|j)s',
        '!services/enrollment/src/**/*.spec.ts',
        '!services/enrollment/src/**/*.e2e-spec.ts',
        '!services/enrollment/src/**/index.ts',
        '!services/enrollment/src/main.ts',
      ],
      coverageDirectory: '<rootDir>/coverage/enrollment',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapping: pathsToModuleNameMapper(
        {
          '@school/*': ['packages/*/src'],
        },
        { prefix: '<rootDir>/' }
      ),
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'crm-service',
      preset: '@nestjs/testing',
      testMatch: ['<rootDir>/services/crm/**/*.spec.ts', '<rootDir>/services/crm/**/*.e2e-spec.ts'],
      collectCoverageFrom: [
        'services/crm/src/**/*.(t|j)s',
        '!services/crm/src/**/*.spec.ts',
        '!services/crm/src/**/*.e2e-spec.ts',
        '!services/crm/src/**/index.ts',
        '!services/crm/src/main.ts',
      ],
      coverageDirectory: '<rootDir>/coverage/crm',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapping: pathsToModuleNameMapper(
        {
          '@school/*': ['packages/*/src'],
        },
        { prefix: '<rootDir>/' }
      ),
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    {
      displayName: 'exam-service',
      preset: '@nestjs/testing',
      testMatch: ['<rootDir>/services/exam/**/*.spec.ts', '<rootDir>/services/exam/**/*.e2e-spec.ts'],
      collectCoverageFrom: [
        'services/exam/src/**/*.(t|j)s',
        '!services/exam/src/**/*.spec.ts',
        '!services/exam/src/**/*.e2e-spec.ts',
        '!services/exam/src/**/index.ts',
        '!services/exam/src/main.ts',
      ],
      coverageDirectory: '<rootDir>/coverage/exam',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapping: pathsToModuleNameMapper(
        {
          '@school/*': ['packages/*/src'],
        },
        { prefix: '<rootDir>/' }
      ),
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
    // Frontend applications
    {
      displayName: 'admin-web',
      preset: 'next/jest',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/apps/admin-web/**/*.test.{ts,tsx}'],
      collectCoverageFrom: [
        'apps/admin-web/src/**/*.{ts,tsx}',
        '!apps/admin-web/src/**/*.test.{ts,tsx}',
        '!apps/admin-web/src/**/*.spec.{ts,tsx}',
        '!apps/admin-web/src/**/*.d.ts',
        '!apps/admin-web/src/**/index.{ts,tsx}',
      ],
      coverageDirectory: '<rootDir>/coverage/admin-web',
      coverageReporters: ['text', 'lcov', 'html'],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.react.js'],
      moduleNameMapping: {
        '^@/(.*)$': '<rootDir>/apps/admin-web/src/$1',
      },
    },
    // Packages
    {
      displayName: 'packages',
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/packages/**/*.spec.ts'],
      collectCoverageFrom: [
        'packages/*/src/**/*.(t|j)s',
        '!packages/*/src/**/*.spec.ts',
        '!packages/*/src/**/index.ts',
      ],
      coverageDirectory: '<rootDir>/coverage/packages',
      coverageReporters: ['text', 'lcov', 'html'],
      moduleNameMapping: pathsToModuleNameMapper(
        {
          '@school/*': ['packages/*/src'],
        },
        { prefix: '<rootDir>/' }
      ),
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    },
  ],
  // Global settings
  collectCoverageFrom: [
    'services/**/*.(t|j)s',
    'packages/**/*.(t|j)s',
    'apps/**/*.{ts,tsx}',
    '!**/*.spec.ts',
    '!**/*.e2e-spec.ts',
    '!**/*.test.{ts,tsx}',
    '!**/*.d.ts',
    '!**/index.{ts,tsx}',
    '!**/main.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/.next/**',
  ],
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};