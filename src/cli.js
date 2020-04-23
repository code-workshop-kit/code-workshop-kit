#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import { createRequire } from 'module';
import { createBabelWorkshopMiddleware } from './dev-server/babel-middleware.js';
import { createFileControlMiddleware } from './dev-server/file-control-middleware.js';
import { noCacheMiddleware } from './dev-server/no-cache-middleware.js';
import { participantCreateFiles } from './participant-create-files.js';

const require = createRequire(import.meta.url);
const { createConfig, readCommandLineArgs, startServer } = require('es-dev-server');

const runWorkshopServer = (argv, rootPath) => {
  const _config = {
    open: true,
    babel: true,
    watch: false, // quite annoying with multiple people making changes to files in VS Code Live Share, better to have everyone refresh manually
    moduleDirs: ['node_modules'],
    nodeResolve: true,
    middlewares: [
      noCacheMiddleware, // ensures that we never give back cached response
      createBabelWorkshopMiddleware(rootPath), // rewrite frontend components references to the workshop.js
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

const scaffoldParticipantFiles = (argv, rootPath) => {
  const scaffoldDefinitions = [
    {
      name: 'force',
      alias: 'f',
      type: Boolean,
      description:
        'If set, it will (re-)scaffold for the participants and overwrite the current files without warning',
    },

    // Used for es-dev-server run, but also for getting rootPath for scaffold, so we "redefine" it here as well
    // otherwise it throws for unknown option
    {
      name: 'app-index',
      alias: 'a',
      type: String,
      description:
        "The app's index.html file. Will take its parent folder to search for a workshop.js and template folder for scaffolding files",
    },
  ];

  participantCreateFiles({
    force: false,
    ...commandLineArgs(scaffoldDefinitions, { argv }),
    rootPath,
  });
};

const mainDefinitions = [{ name: 'command', defaultOption: true }];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

// Find the user supplied root path where they run cwk from.
// Here we need to look for template folder and workshop.js
let rootPath = '/';
const suppliedIndex = readCommandLineArgs(argv).appIndex;
if (suppliedIndex && suppliedIndex.indexOf('/') !== -1) {
  rootPath += suppliedIndex.slice(0, suppliedIndex.lastIndexOf('/') + 1);
}

switch (mainOptions.command) {
  case 'run':
    runWorkshopServer(argv, rootPath);
    break;
  case 'scaffold':
    scaffoldParticipantFiles(argv, rootPath);
    break;
  // no default
}
