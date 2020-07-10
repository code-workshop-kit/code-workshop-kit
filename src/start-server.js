import chokidar from 'chokidar';
import commandLineArgs from 'command-line-args';
import {
  commandLineOptions,
  createConfig,
  readCommandLineArgs,
  startServer as startEdsServer,
} from 'es-dev-server';
import path from 'path';
import portfinder from 'portfinder';
import WebSocket from 'ws';
import {
  changeParticipantUrlMiddleware,
  jwtMiddleware,
  noCacheMiddleware,
} from './middlewares/middlewares.js';
import {
  adminUIPlugin,
  appShellPlugin,
  componentReplacersPlugin,
  fileControlPlugin,
  followModePlugin,
  queryTimestampModulesPlugin,
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
      const { config, key, byAdmin } = parsedMessage;
      cwkState.state = { adminConfig: config };

      if (key === 'followMode') {
        cwkState.state = { followModeInitiatedBy: byAdmin };
      }

      ws.send(
        JSON.stringify({
          type: 'config-update-completed',
          config: cwkState.state.adminConfig,
        }),
      );
      break;
    }
    case 'authenticate': {
      const { username, feature } = parsedMessage;
      const { state } = cwkState;
      if (username) {
        if (!state.wsConnections) {
          state.wsConnections = {};
        }

        if (!state.wsConnections[feature]) {
          state.wsConnections[feature] = new Map();
        }
        // Store the websocket connection for this user
        state.wsConnections[feature].set(username, ws);
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

const setupWebSocket = () => {
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', ws => {
    ws.on('message', message => handleWsMessage(message, ws));
  });

  return wss;
};

const addPluginsAndMiddlewares = (edsConfig, cwkConfig, absoluteDir) => {
  const newEdsConfig = edsConfig;
  newEdsConfig.plugins = [...edsConfig.plugins];
  newEdsConfig.middlewares = [...edsConfig.middlewares];

  newEdsConfig.middlewares.push(changeParticipantUrlMiddleware(absoluteDir));
  newEdsConfig.middlewares.push(jwtMiddleware(absoluteDir));

  newEdsConfig.plugins.push(queryTimestampModulesPlugin(absoluteDir));
  newEdsConfig.plugins.push(wsPortPlugin(edsConfig.port));
  newEdsConfig.plugins.push(
    componentReplacersPlugin({
      dir: absoluteDir,
      usingParticipantIframes: cwkConfig.usingParticipantIframes,
      participantIndexHtmlExists: cwkConfig.participantIndexHtmlExists,
    }),
  );
  // Plugins & middlewares that can be turned off completely from the start through cwk flags
  if (!cwkConfig.alwaysServeFiles) {
    newEdsConfig.plugins.push(fileControlPlugin(absoluteDir, ['js', 'html']));
  }
  // Important that we place insert plugins after file control, if we want them to apply scripts to files that should be served empty to the user
  newEdsConfig.plugins.push(followModePlugin(edsConfig.port));
  if (!cwkConfig.withoutAppShell) {
    newEdsConfig.plugins.push(appShellPlugin(absoluteDir, cwkConfig.title));
    newEdsConfig.plugins.push(adminUIPlugin(absoluteDir));
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
    usingParticipantIframes: false,
    participantIndexHtmlExists: true,
    dir: '/',
    title: '',
    ...opts,
  };

  // If cli was used, read flags, both for cwk and eds flags
  if (opts.argv) {
    const cwkServerDefinitions = [
      ...commandLineOptions,
      {
        name: 'dir',
        type: String,
        description:
          'The directory to read the cwk.config.js from, the index.html for the app shell and the template folder for scaffolding',
      },
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
        This also means that the file control middleware only has effect the upon first load, because the server serves cached responses
      `,
      },
      {
        name: 'always-serve-files',
        type: Boolean,
        description:
          'If set, disables the .html and .js file control middlewares that only serve files for the current participant',
      },
      {
        name: 'using-participant-iframes',
        type: Boolean,
        description: `
          If set, ensures the app shell will not try to load participant index.js files as modules, which gets rid of duplicate console logs.
          Use this when using iframes instead of having your participants export templates or nodes in their index.js for showing in the app shell participant capsules.
        `,
      },
      {
        name: 'no-participant-index-html',
        type: Boolean,
        description:
          "If set to true, disables the app shell participant view buttons, useful when you don't scaffold index.html files for your participants to be shown in the overview",
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
    cwkConfig.usingParticipantIframes =
      cwkConfig['using-participant-iframes'] || cwkConfig.usingParticipantIframes;
    cwkConfig.participantIndexHtmlExists =
      !cwkConfig['no-participant-index-html'] || cwkConfig.participantIndexHtmlExists;
  }

  return cwkConfig;
};

const getEdsConfig = (opts, cwkConfig, defaultPort, absoluteDir) => {
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

  if (opts.argv) {
    edsConfig = {
      ...edsConfig,
      ...readCommandLineArgs(opts.argv),
    };
  }

  edsConfig.port = edsConfig.port || defaultPort;
  edsConfig = addPluginsAndMiddlewares(edsConfig, cwkConfig, absoluteDir);
  edsConfig = createConfig(edsConfig);
  return edsConfig;
};

const setupHMR = absoluteDir => {
  const moduleWatcher = chokidar.watch(path.resolve(absoluteDir, 'participants'));
  moduleWatcher.on('change', filePath => {
    // Get participant name from file path
    const participantFolder = path.join(absoluteDir, 'participants/');

    // Cancel out the participant folder from the filepath (Bob/index.js or Bob/nested/style.css),
    // and get the top most dir name
    const participantName = filePath.split(participantFolder)[1].split(path.sep).shift();

    // Find websocket connection with that name
    if (cwkState.state.wsConnections && cwkState.state.wsConnections['reload-module']) {
      cwkState.state.wsConnections['reload-module'].forEach((connection, name) => {
        if (name === participantName) {
          // Store revalidation timestamp for the name, so that when re-imported (reloaded) modules import modules themselves,
          // that we also ensure they are re-imported by changing the import path with the queryTimestamp.
          const { state } = cwkState;
          const queryTimestamp = Date.now();
          if (!state.queryTimestamps) {
            state.queryTimestamps = {};
          }
          state.queryTimestamps[name] = queryTimestamp;
          cwkState.state = state;

          // Send module-changed message to that connection so it reload the main module
          connection.send(
            JSON.stringify({ type: 'reload-module', name, timestamp: queryTimestamp }),
          );
        }
      });
    }
  });
  return moduleWatcher;
};

export const startServer = async (opts = {}) => {
  const cwkConfig = getCwkConfig(opts);
  const defaultPort = await portfinder.getPortPromise();

  if (cwkConfig.dir.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    cwkConfig.dir = `.${cwkConfig.dir}`;
  }
  const absoluteDir = path.resolve(process.cwd(), cwkConfig.dir);

  const edsConfig = getEdsConfig(opts, cwkConfig, defaultPort, absoluteDir);
  const moduleWatcher = setupHMR(absoluteDir);

  const { server } = await startEdsServer(edsConfig);
  const wss = setupWebSocket();

  server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });

  cwkState.state = { wss };
  setDefaultAdminConfig();

  ['exit', 'SIGINT'].forEach(event => {
    process.on(event, () => {
      moduleWatcher.close();
      wss.close();
    });
  });

  return { server, edsConfig, cwkConfig, wss, moduleWatcher };
};
