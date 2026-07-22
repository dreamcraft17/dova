module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }] },
  roots: ['<rootDir>/apps/backend/src', '<rootDir>/apps/frontend/src', '<rootDir>/shared/src'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: { '^dova-shared$': '<rootDir>/shared/src/index.ts' },
  collectCoverageFrom: [
    'apps/backend/src/**/*.ts',
    'apps/frontend/src/lib/**/*.ts',
    'shared/src/**/*.ts',
    '!**/*.d.ts',
    '!**/main.ts',
  ],
  coverageDirectory: '<rootDir>/coverage',
  clearMocks: true,
};
