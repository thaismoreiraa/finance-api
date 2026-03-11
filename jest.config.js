/** @type {import('jest').Config} */
module.exports = {
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.js"],
      testEnvironment: "node",
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.js"],
      testEnvironment: "node",
      globalSetup: "<rootDir>/tests/integration/setup.js",
    },
    {
      displayName: "e2e",
      testMatch: ["<rootDir>/tests/e2e/**/*.test.js"],
      testEnvironment: "node",
      globalSetup: "<rootDir>/tests/setup.js",
    },
  ],
  collectCoverageFrom: ["src/**/*.js"],
};
