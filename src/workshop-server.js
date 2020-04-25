import commandLineArgs from 'command-line-args';
import { createRequire } from 'module';
import {
  createFileControlMiddleware,
  createInsertAppShellMiddleware,
  createWorkshopImportReplaceMiddleware,
  noCacheMiddleware,
} from './middlewares/middlewares.js';

const require = createRequire(import.meta.url);
const {
  createConfig,
  readCommandLineArgs,
  startServer,
  commandLineOptions,
} = require('es-dev-server');

export const workshopServer = (argv, rootFolder) => {
  const cwkServerDefinitions = [
    ...commandLineOptions,
    {
      name: 'cwk-shell',
      type: Boolean,
      description: `If set, inject a cwk-app-shell component into your app index html file,
which gives you a bunch of visual tools for your workshop in the browser`,
    },
  ];
  const cwkServerOptions = commandLineArgs(cwkServerDefinitions, { argv });

  const _config = {
    open: true,
    watch: false, // quite annoying with multiple people making changes to files in VS Code Live Share, better to have everyone refresh manually
    moduleDirs: ['node_modules'],
    nodeResolve: true,
    middlewares: [
      createInsertAppShellMiddleware(
        readCommandLineArgs(argv).appIndex,
        cwkServerOptions['cwk-shell']
      ),
      createWorkshopImportReplaceMiddleware(rootFolder), // rewrite frontend components references to the workshop.js
      noCacheMiddleware, // ensures that we never give back cached response
      createFileControlMiddleware('js', { admin: true }),
      createFileControlMiddleware('html', { admin: true }),
    ],
  };

  const config = createConfig({
    ..._config,
    ...readCommandLineArgs(argv),
    logErrorsToBrowser: true,
  });

  startServer(config);

  ['exit', 'SIGINT'].forEach(event => {
    process.on(event, () => {
      process.exit(0);
    });
  });
};
