module.exports = {
  nodeResolve: true,
  coverageConfig: {
    report: true,
    reportDir: 'test-coverage',
    threshold: {
      statements: 80,
      branches: 70,
      functions: 85,
      lines: 85,
    },
  },
};
