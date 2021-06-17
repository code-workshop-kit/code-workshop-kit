import { esbuildPlugin } from '@web/dev-server-esbuild';

export default {
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true, target: 'auto' })],
  coverageConfig: {
    report: true,
    reportDir: 'test-coverage',
    threshold: {
      statements: 80,
      branches: 60,
      functions: 70,
      lines: 85,
    },
  },
};
