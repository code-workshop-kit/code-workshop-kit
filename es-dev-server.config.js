const noCacheMiddleware = require('./dev-server/no-cache-middleware.js');
const createFileControlMiddleware = require('./dev-server/file-control-middleware.js');
const participantCreateFiles = require('./dev-server/participant-create-files.js');

const port = 8081;

participantCreateFiles(port, { override: true });

module.exports = {
  port,
  open: true,
  appIndex: './index.html',
  watch: false, // quite annoying with multiple people making changes to files in VS Code Live Share, better to have everyone refresh manually
  moduleDirs: ['node_modules'],
  nodeResolve: true,
  middlewares: [
    noCacheMiddleware, // ensures that we never give back cached responses
    createFileControlMiddleware('js', { admin: true }),
    createFileControlMiddleware('html', { admin: true }),
  ],
};
