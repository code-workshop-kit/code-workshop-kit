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
    enableCaching: false,
    alwaysServeFiles: false,
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
      {
        name: 'enable-caching',
        type: Boolean,
        description: `
          If set, re-enable caching. By default it is turned off, since it's more often a hassle than a help in a workshop dev server
          This also means that the file control middleware only has effect the upon first load, because the server serves cached responses.
        `,
      },
      {
        name: 'always-serve-files',
        type: Boolean,
        description:
          'If set, disables the .html and .js file control middlewares that only serve files for the current participant',
      },
    ];

    cwkConfig = {
      ...cwkConfig,
      ...commandLineArgs(cwkServerDefinitions, { argv: opts.argv }),
      ...readCommandLineArgs(opts.argv),
    };

    // TODO: reuse logic that eds readCommandLineUses to camelCase the cwk flags instead of syncing them here
    cwkConfig.withoutAppShell = cwkConfig['without-app-shell'] || cwkConfig.withoutAppShell;
    cwkConfig.enableCaching = cwkConfig['enable-caching'] || cwkConfig.enableCaching;
    cwkConfig.alwaysServeFiles = cwkConfig['always-serve-files'] || cwkConfig.alwaysServeFiles;
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
      ...(cwkConfig.enableCaching ? [] : [noCacheMiddleware]),
      ...(cwkConfig.alwaysServeFiles
        ? []
        : [
            createFileControlMiddleware({
              ext: 'js',
              admin: true,
              rootDir: absoluteRootDir,
            }),
            createFileControlMiddleware({
              ext: 'html',
              admin: true,
              rootDir: absoluteRootDir,
            }),
          ]),
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
