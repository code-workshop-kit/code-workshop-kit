module.exports = {
  nodeResolve: true,
  coverageConfig: {
    report: true,
    reportDir: 'test-coverage',
    thresholds: {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
};
