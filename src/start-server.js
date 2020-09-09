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
import { runScript } from './runScript.js';

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
    case 'terminal-process-input': {
      const { input, participantName } = parsedMessage;

      if (cwkState.state.terminalScripts) {
        const script = cwkState.state.terminalScripts.get(participantName);
        if (script) {
          script.stdin.write(`${input}\n`, err => {
            if (err) {
              throw new Error(`stdin error: ${err}`);
            }
          });
        }
      }
      break;
    }
    case 'authenticate': {
      const { username, feature, participant } = parsedMessage;
      const { state } = cwkState;
      if (username) {
        if (!state.wsConnections) {
          state.wsConnections = {};
        }

        if (!state.wsConnections[feature]) {
          state.wsConnections[feature] = new Map();
        }
        // Store the websocket connection for this user
        state.wsConnections[feature].set(`${participant}-${username}`, ws);
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

const getWsConnection = (participantName, feature, all = false) => {
  let connection;

  if (!cwkState.state.wsConnections[feature]) {
    return null;
  }

  if (all) {
    return Array.from(cwkState.state.wsConnections[feature].entries())
      .filter(entry => entry[0].endsWith(participantName))
      .map(entry => entry[1]);
  }

  if (cwkState.state.wsConnections && cwkState.state.wsConnections[feature]) {
    connection = cwkState.state.wsConnections[feature].get(`${participantName}-${participantName}`);
  }
  return connection;
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
    newEdsConfig.plugins.push(appShellPlugin(absoluteDir, cwkConfig.title, cwkConfig.target));
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
    target: 'frontend',
    terminalScript: undefined,
    excludeFromWatch: [],
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

const setupParticipantWatcher = absoluteDir => {
  return chokidar.watch(path.resolve(absoluteDir, 'participants'));
};

const setupWatcherForTerminalProcess = (watcher, absoluteDir, terminalScript, excludeFromWatch) => {
  const sendData = (data, type, participantName) => {
    const connections = getWsConnection(participantName, 'terminal-process', true);
    if (connections) {
      connections.forEach(connection =>
        connection.send(JSON.stringify({ type: `terminal-process-${type}`, data })),
      );
    }
  };

  watcher.on('change', filePath => {
    // Get participant name from file path
    const participantFolder = path.join(absoluteDir, 'participants/');

    // Cancel out the participant folder from the filepath (Bob/index.js or Bob/nested/style.css),
    // and get the top most dir name
    const participantName = filePath.split(participantFolder)[1].split(path.sep).shift();

    // If the file that was changed is not within exclude-list for file extensions
    if (excludeFromWatch.every(ext => !filePath.endsWith(`.${ext}`))) {
      const { processEmitter, process } = runScript(terminalScript, participantName, absoluteDir);

      // Save the current running script for participant
      const { state } = cwkState;
      if (!state.terminalScripts) {
        state.terminalScripts = new Map();
      }
      state.terminalScripts.set(participantName, process);
      cwkState.state = state;

      // Open terminal input on the frontend.
      const connections = getWsConnection(participantName, 'terminal-process', true);
      if (connections) {
        connections.forEach(connection => {
          if (connection) {
            connection.send(JSON.stringify({ type: 'terminal-input-enable' }));
          }

          // Close terminal input on the frontend
          process.on('close', () => {
            if (connection) {
              connection.send(JSON.stringify({ type: 'terminal-input-disable' }));
            }
          });
        });
      }

      processEmitter.on('out', data => {
        sendData(data, 'output', participantName);
      });

      processEmitter.on('err', data => {
        sendData(data, 'error', participantName);
      });
    }
  });
};

const setupHMR = (watcher, absoluteDir) => {
  watcher.on('change', filePath => {
    // Get participant name from file path
    const participantFolder = path.join(absoluteDir, 'participants/');

    // Cancel out the participant folder from the filepath (Bob/index.js or Bob/nested/style.css),
    // and get the top most dir name
    const participantName = filePath.split(participantFolder)[1].split(path.sep).shift();

    const connections = getWsConnection(participantName, 'reload-module', true);
    const queryTimestamp = Date.now();
    const { state } = cwkState;
    if (!state.queryTimestamps) {
      state.queryTimestamps = {};
    }
    state.queryTimestamps[participantName] = queryTimestamp;
    cwkState.state = state;

    if (connections) {
      connections.forEach(connection => {
        if (connection) {
          // Send module-changed message to all participants for the folder that changed
          connection.send(
            JSON.stringify({
              type: 'reload-module',
              name: participantName,
              timestamp: queryTimestamp,
            }),
          );
        }
      });
    }
  });
};

export const startServer = async (opts = {}) => {
  const cwkConfig = getCwkConfig(opts);
  const defaultPort = await portfinder.getPortPromise();
  const edsConfig = getEdsConfig(opts, cwkConfig, defaultPort, cwkConfig.absoluteDir);

  const watcher = setupParticipantWatcher(cwkConfig.absoluteDir);
  if (cwkConfig.target === 'frontend') {
    setupHMR(watcher, cwkConfig.absoluteDir);
  } else if (cwkConfig.target === 'terminal') {
    setupWatcherForTerminalProcess(
      watcher,
      cwkConfig.absoluteDir,
      cwkConfig.terminalScript,
      cwkConfig.excludeFromWatch,
    );
  }

  const { server } = await startEdsServer(edsConfig);
  const wss = setupWebSocket();
  cwkState.state = { wss };
  setDefaultAdminConfig();

  server.on('upgrade', function upgrade(request, socket, head) {
    wss.handleUpgrade(request, socket, head, function done(ws) {
      wss.emit('connection', ws, request);
    });
  });

  ['exit', 'SIGINT'].forEach(event => {
    process.on(event, () => {
      watcher.close();
      wss.close();
    });
  });

  return { server, edsConfig, cwkConfig, wss, watcher };
};
