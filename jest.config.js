module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }] },
  roots: ['<rootDir>/apps/backend/src', '<rootDir>/apps/frontend/src', '<rootDir>/shared/src'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: { '^dova-shared$': '<rootDir>/shared/src/index.ts' },
  setupFiles: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: [
    'apps/backend/src/**/*.ts',
    'apps/frontend/src/lib/**/*.ts',
    'shared/src/**/*.ts',
    '!**/*.d.ts',
    '!**/main.ts',
    '!**/*.spec.ts',
    '!**/*.test-doubles.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  // Ratchet: set just under current coverage (2026-10-29) so it cannot silently
  // drop. Raise these as tests are added; paystack.service (62%) is the next gap.
  coverageThreshold: {
    global: { statements: 44, branches: 31, functions: 38, lines: 47 },
    './apps/backend/src/commission.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './apps/backend/src/jwt-auth.guard.ts': { statements: 90, branches: 90, functions: 90, lines: 90 },
    './apps/backend/src/roles.guard.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './apps/backend/src/mock-payments.ts': { statements: 100, branches: 100, functions: 100, lines: 100 },
    './apps/backend/src/reimbursement.service.ts': { statements: 75, branches: 75, functions: 60, lines: 75 },
  },
  clearMocks: true,
};
