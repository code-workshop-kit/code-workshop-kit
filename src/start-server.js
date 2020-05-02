import commandLineArgs from 'command-line-args';
import { createRequire } from 'module';
import path from 'path';
import {
  createFileControlMiddleware,
  createInsertAppShellMiddleware,
  createWorkshopImportReplaceMiddleware,
  noCacheMiddleware,
} from './middlewares/middlewares.js';

const require = createRequire(import.meta.url);
const { createConfig, readCommandLineArgs, commandLineOptions } = require('es-dev-server');
const startEdsServer = require('es-dev-server').startServer;

export const startServer = (opts = {}) => {
  // cwk defaults
  let cwkConfig = {
    withoutAppShell: false,
    appIndex: './index.html',
    ...opts,
  };

  // If cli was used, read flags, both for cwk and eds flags
  if (opts.argv) {
    const cwkServerDefinitions = [
      ...commandLineOptions,
      {
        name: 'without-app-shell',
        type: Boolean,
        description: `If set, do not inject the cwk-app-shell component into your app index html file`,
      },
    ];

    cwkConfig = {
      ...cwkConfig,
      ...commandLineArgs(cwkServerDefinitions, { argv: opts.argv }),
      ...readCommandLineArgs(opts.argv),
    };

    // TODO: reuse logic that eds readCommandLineUses to camelCase the cwk flags instead of syncing them here
    cwkConfig.withoutAppShell = cwkConfig['without-app-shell'] || cwkConfig.withoutAppShell;
  }

  /**
   * Right now, we assume that your workshop.js is in the same folder as your app index.
   * TODO: allow override.
   */
  const absoluteRootDir = path.resolve('/', path.dirname(cwkConfig.appIndex));

  // eds defaults & middlewares
  const edsConfig = {
    open: true,
    watch: false,
    moduleDirs: ['node_modules'],
    nodeResolve: true,
    logErrorsToBrowser: true,
    middlewares: [
      ...(cwkConfig.withoutAppShell ? [] : [createInsertAppShellMiddleware(cwkConfig.appIndex)]),
      createWorkshopImportReplaceMiddleware(absoluteRootDir),
      noCacheMiddleware,
      createFileControlMiddleware('js', { admin: true }),
      createFileControlMiddleware('html', { admin: true }),
    ],
  };

  const config = createConfig({
    ...edsConfig,
    ...cwkConfig,
  });

  startEdsServer(config);

  ['exit', 'SIGINT'].forEach(event => {
    process.on(event, () => {
      process.exit(0);
    });
  });
};
