import commandLineArgs from 'command-line-args';
import { createRequire } from 'module';
import path from 'path';
import { cwkState } from './CwkStateSingleton.js';
import {
  adminUIMiddleware,
  changeParticipantUrlMiddleware,
  createFileControlMiddleware,
  createInsertAppShellMiddleware,
  createWorkshopImportReplaceMiddleware,
  insertFollowModeScriptMiddleware,
  noCacheMiddleware,
  websocketConnectionMiddleware,
} from './middlewares/middlewares.js';

const require = createRequire(import.meta.url);
const { createConfig, readCommandLineArgs, commandLineOptions } = require('es-dev-server');
const startEdsServer = require('es-dev-server').startServer;
const WebSocket = require('ws');

const getAdminUIDefaults = () => {
  return {
    enableCaching: false,
    alwaysServeFiles: false,
    enableAdmin: true,
    followMode: false,
  };
};

const sendAdminConfig = ws => {
  ws.send(
    JSON.stringify({
      type: 'config-init',
      config: cwkState.state.adminConfig,
    }),
  );
};

const handleWsMessage = (message, ws) => {
  const parsedMessage = JSON.parse(message);
  const { type } = parsedMessage;

  switch (type) {
    case 'config-init': {
      sendAdminConfig(ws);
      break;
    }
    case 'config-updated': {
      const { config } = parsedMessage;
      cwkState.state = { adminConfig: config };
      break;
    }
    case 'authenticate': {
      const { username } = parsedMessage;
      const { state } = cwkState;
      if (username) {
        if (!state.wsConnections) {
          state.wsConnections = new Map();
        }
        // Store the websocket connection for this user
        state.wsConnections.set(username, ws);
        cwkState.state = state;
      }
    }
    // no default
  }
};

const setupWebSocket = (wsPort = 8083) => {
  const wss = new WebSocket.Server({ port: wsPort });

  wss.on('connection', ws => {
    ws.on('message', message => handleWsMessage(message, ws));
  });

  cwkState.state = { wss };
  return wss;
};

export const startServer = async (opts = {}) => {
  // cwk defaults
  let cwkConfig = {
    withoutAppShell: false,
    enableCaching: false,
    alwaysServeFiles: false,
    appIndex: './index.html',
    title: '',
    ...opts,
  };

  // If cli was used, read flags, both for cwk and eds flags
  if (opts.argv) {
    const cwkServerDefinitions = [
      ...commandLineOptions,
      {
        name: 'title',
        type: String,
        description: 'App Shell title that will be displayed',
      },
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
      websocketConnectionMiddleware,
      insertFollowModeScriptMiddleware,
      ...(cwkConfig.withoutAppShell
        ? []
        : [createInsertAppShellMiddleware(cwkConfig.appIndex, cwkConfig.title)]),
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

      createWorkshopImportReplaceMiddleware(absoluteRootDir),
      adminUIMiddleware,
      changeParticipantUrlMiddleware,
    ],
  };

  const config = createConfig({
    ...edsConfig,
    ...cwkConfig,
  });

  await startEdsServer(config);
  const wss = setupWebSocket(config.wsPort);

  cwkState.state = { adminConfig: getAdminUIDefaults() };

  ['exit', 'SIGINT'].forEach(event => {
    process.on(event, () => {
      wss.close();
      process.exit(0);
    });
  });
};
