import chokidar from 'chokidar';
import commandLineArgs from 'command-line-args';
import {
  commandLineOptions,
  createConfig,
  readCommandLineArgs,
  startServer as startEdsServer,
} from 'es-dev-server';
import _esmRequire from 'esm';
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
      mode: cwkConfig.mode,
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
    mode: 'iframe',
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
    ];

    cwkConfig = {
      ...cwkConfig,
      ...commandLineArgs(cwkServerDefinitions, { argv: opts.argv }),
    };
  }

  if (cwkConfig.dir.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    cwkConfig.dir = `.${cwkConfig.dir}`;
  }
  cwkConfig.absoluteDir = path.resolve(process.cwd(), cwkConfig.dir);

  const esmRequire = _esmRequire(module);
  const workshop = esmRequire(`${cwkConfig.absoluteDir}/cwk.config.js`).default;

  cwkConfig = {
    ...cwkConfig,
    ...workshop,
  };
  return cwkConfig;
};

const getEdsConfig = (opts, cwkConfig, defaultPort, absoluteDir) => {
  // eds defaults & middlewares
  let edsConfig = {
    open: false,
    logStartup: true,
    moduleDirs: ['node_modules'],
    nodeResolve: true,
    logErrorsToBrowser: true,
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

  edsConfig = {
    ...edsConfig,
    // don't insert event stream as it crashes pages with lots of iframes, for modules it's ok
    eventStream: cwkConfig.mode === 'iframe' ? false : edsConfig.eventStream,
    watch: false, // watch will not work with HMR
    compatibility: 'none', // won't work without eventStream
  };

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
          const queryTimestamp = Date.now();
          const { state } = cwkState;
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

  const edsConfig = getEdsConfig(opts, cwkConfig, defaultPort, cwkConfig.absoluteDir);

  const moduleWatcher = setupHMR(cwkConfig.absoluteDir);

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
