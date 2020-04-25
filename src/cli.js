#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import { createRequire } from 'module';
import path from 'path';
import { createFileControlMiddleware } from './dev-server/file-control-middleware.js';
import { noCacheMiddleware } from './dev-server/no-cache-middleware.js';
import { createWorkshopImportReplaceMiddleware } from './dev-server/workshop-import-replace-middleware.js';
import { participantCreateFiles } from './participant-create-files.js';

const require = createRequire(import.meta.url);
const { createConfig, readCommandLineArgs, startServer } = require('es-dev-server');

const runWorkshopServer = (argv, rootFolder) => {
  const _config = {
    open: true,
    babel: true,
    watch: false, // quite annoying with multiple people making changes to files in VS Code Live Share, better to have everyone refresh manually
    moduleDirs: ['node_modules'],
    nodeResolve: true,
    middlewares: [
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

const scaffoldParticipantFiles = (argv, rootFolder) => {
  const scaffoldDefinitions = [
    {
      name: 'force',
      alias: 'f',
      type: Boolean,
      description:
        'If set, it will (re-)scaffold for the participants and overwrite the current files without warning',
    },

    // Used for es-dev-server run, but also for getting rootFolder for scaffold, so we "redefine" it here as well
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
    rootFolder,
  });
};

const mainDefinitions = [{ name: 'command', defaultOption: true }];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

// Find the user supplied root path where they run cwk from.
// Here we need to look for template folder and workshop.js
let rootFolder = '/';
const suppliedIndex = readCommandLineArgs(argv).appIndex;
if (suppliedIndex && suppliedIndex.indexOf('/') !== -1) {
  const suppliedFolder = suppliedIndex.slice(0, suppliedIndex.lastIndexOf('/') + 1);

  // actual root path that we will use is the root of the server + the folder of the supplied app index
  rootFolder = `${path.resolve('/', suppliedFolder)}/`;
}

switch (mainOptions.command) {
  case 'run':
    runWorkshopServer(argv, rootFolder);
    break;
  case 'scaffold':
    scaffoldParticipantFiles(argv, rootFolder);
    break;
  // no default
}
