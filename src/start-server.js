import commandLineArgs from 'command-line-args';
import { commandLineOptions, createConfig, startServer as startEdsServer } from 'es-dev-server';
import path from 'path';
import WebSocket from 'ws';
import {
  changeParticipantUrlMiddleware,
  jwtMiddleware,
  noCacheMiddleware,
} from './middlewares/middlewares.js';
import {
  adminUIPlugin,
  appShellPlugin,
  fileControlPlugin,
  followModePlugin,
  workshopImportPlugin,
  wsPortPlugin,
} from './plugins/plugins.js';
import { cwkState } from './utils/CwkStateSingleton.js';

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

const setDefaultAdminConfig = () => {
  cwkState.state = { adminConfig: getAdminUIDefaults() };
};

const handleWsMessage = (message, ws) => {
  const parsedMessage = JSON.parse(message);
  const { type } = parsedMessage;

  switch (type) {
    case 'config-init': {
      sendAdminConfig(ws);
      break;
    }
    case 'reset-state': {
      setDefaultAdminConfig();
      break;
    }
    case 'clear-state': {
      cwkState.clear();
      break;
    }
    case 'config-updated': {
      const { config } = parsedMessage;
      cwkState.state = { adminConfig: config };
      ws.send(
        JSON.stringify({
          type: 'config-update-completed',
          config: cwkState.state.adminConfig,
        }),
      );
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
        ws.send(
          JSON.stringify({
            type: 'authenticate-completed',
            user: username,
          }),
        );
      }
    }
    // no default
  }
};

const setupWebSocket = wsPort => {
  const wss = new WebSocket.Server({ port: wsPort });

  wss.on('connection', ws => {
    ws.on('message', message => handleWsMessage(message, ws));
  });

  return wss;
};

const addPluginsAndMiddlewares = (edsConfig, cwkConfig) => {
  const newEdsConfig = edsConfig;
  newEdsConfig.plugins = [...edsConfig.plugins];
  newEdsConfig.middlewares = [...edsConfig.middlewares];

  /**
   * Right now, we assume that your workshop.js is in the same folder as your app index.
   * TODO: allow override.
   */
  let absoluteRootDir = path.resolve('/', path.dirname(cwkConfig.appIndex));
  if (absoluteRootDir === '/') {
    absoluteRootDir = '';
  }

  newEdsConfig.plugins.push(wsPortPlugin(cwkConfig.wsPort));
  newEdsConfig.plugins.push(workshopImportPlugin(absoluteRootDir));
  newEdsConfig.plugins.push(followModePlugin(absoluteRootDir, cwkConfig.wsPort));
  newEdsConfig.middlewares.push(changeParticipantUrlMiddleware(absoluteRootDir));
  newEdsConfig.middlewares.push(jwtMiddleware(absoluteRootDir));

  // Plugins & middlewares that can be turned off completely from the start through cwk flags
  if (!cwkConfig.alwaysServeFiles) {
    newEdsConfig.plugins.push(
      fileControlPlugin({ exts: ['js', 'html'], rootDir: absoluteRootDir }),
    );
  }

  if (!cwkConfig.withoutAppShell) {
    newEdsConfig.plugins.push(appShellPlugin(cwkConfig.appIndex, cwkConfig.title));
    newEdsConfig.plugins.push(adminUIPlugin(absoluteRootDir));
  }

  if (!cwkConfig.enableCaching) {
    newEdsConfig.middlewares.push(noCacheMiddleware);
  }

  return newEdsConfig;
};

const getCwkConfig = opts => {
  // cwk defaults
  let cwkConfig = {
    withoutAppShell: false,
    enableCaching: false,
    alwaysServeFiles: false,
    appIndex: './index.html',
    wsPort: 8001,
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
      {
        name: 'ws-port',
        type: Number,
        description: 'Port to run the WebSocket server on',
      },
    ];

    cwkConfig = {
      ...cwkConfig,
      ...commandLineArgs(cwkServerDefinitions, { argv: opts.argv }),
    };

    // TODO: auto camelCase these kebab cased flags
    cwkConfig.withoutAppShell = cwkConfig['without-app-shell'] || cwkConfig.withoutAppShell;
    cwkConfig.enableCaching = cwkConfig['enable-caching'] || cwkConfig.enableCaching;
    cwkConfig.alwaysServeFiles = cwkConfig['always-serve-files'] || cwkConfig.alwaysServeFiles;
    cwkConfig.wsPort = cwkConfig['ws-port'] || cwkConfig.wsPort;
    cwkConfig.appIndex = cwkConfig['app-index'] || cwkConfig.appIndex;
  }

  return cwkConfig;
};

const getEdsConfig = (opts, cwkConfig) => {
  // eds defaults & middlewares
  let edsConfig = {
    open: false,
    logStartup: true,
    watch: false,
    moduleDirs: ['node_modules'],
    nodeResolve: true,
    logErrorsToBrowser: true,
    compatibility: 'none',
    plugins: [],
    middlewares: [],
    ...opts,
  };

  edsConfig = addPluginsAndMiddlewares(edsConfig, cwkConfig);
  edsConfig = createConfig(edsConfig);
  return edsConfig;
};

export const startServer = async (opts = {}) => {
  const cwkConfig = getCwkConfig(opts);
  const edsConfig = getEdsConfig(opts, cwkConfig);

  const { server } = await startEdsServer(edsConfig);
  const wss = setupWebSocket(cwkConfig.wsPort);

  cwkState.state = { wss };
  setDefaultAdminConfig();

  ['exit', 'SIGINT'].forEach(event => {
    process.on(event, () => {
      wss.close();
    });
  });

  return { server, edsConfig, cwkConfig, wss };
};
