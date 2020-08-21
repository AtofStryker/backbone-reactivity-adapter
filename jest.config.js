module.exports = {
  preset: "ts-jest",
  collectCoverage: true,
  collectCoverageFrom: [
    "packages/**/src/**/*.ts",
    "!packages/backbone-custom-mocks/src/**/*.ts",
  ],
  testEnvironment: "node",
  testPathIgnorePatterns: ["node_modules/", "packages/*/dist"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testResultsProcessor: "<rootDir>/node_modules/jest-html-reporter",
  collectCoverage: true,
  coverageReporters: ["text", "lcov"],
  coverageDirectory: "<rootDir>/test/reports/coverage",
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
