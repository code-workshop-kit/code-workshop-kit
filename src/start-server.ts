import { startDevServer, DevServerConfig } from '@web/dev-server';
import { DevServer } from '@web/dev-server-core';
import chalk from 'chalk';
import chokidar from 'chokidar';
import commandLineArgs from 'command-line-args';
import _esmRequire from 'esm';
import glob from 'glob';
import path from 'path';
import portfinder from 'portfinder';
import WebSocket from 'ws';
import {
  changeParticipantUrlMiddleware,
  jwtMiddleware,
  noCacheMiddleware,
} from './middleware/middleware';
import {
  adminUIPlugin,
  appShellPlugin,
  componentReplacersPlugin,
  followModePlugin,
  queryTimestampModulesPlugin,
  wsPortPlugin,
  missingIndexHtmlPlugin,
} from './plugins/plugins';
import { cwkState } from './utils/CwkStateSingleton';
import { runScript } from './runScript';
import { AdminConfig } from './types/State';
import { WorkshopConfig } from './types/CwkConfig';

const logger = (str: string, opts: { logStartup?: boolean }) => {
  if (opts.logStartup !== false) {
    // eslint-disable-next-line no-console
    console.log(str);
  }
};

const getAdminUIDefaults = (): AdminConfig => ({
  enableCaching: false,
  followMode: false,
});

const sendAdminConfig = (ws: WebSocket) => {
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

const getWsConnection = (participantName: string, feature: string, all = false) => {
  let connection;

  if (!cwkState.state.wsConnections || !cwkState.state.wsConnections[feature]) {
    return null;
  }

  if (all) {
    return Array.from(cwkState.state.wsConnections[feature].entries())
      .filter((entry) => entry[0].endsWith(participantName))
      .map((entry) => entry[1]);
  }

  if (cwkState.state.wsConnections && cwkState.state.wsConnections[feature]) {
    connection = cwkState.state.wsConnections[feature].get(`${participantName}-${participantName}`);
  }
  return connection;
};

const runScriptForParticipant = async (
  participantName: string,
  cfg: WorkshopConfig | undefined,
  opts: { logStartup?: boolean },
) => {
  const { state } = cwkState;

  if (state.terminalScripts) {
    const oldScript = state.terminalScripts.get(participantName);
    if (oldScript && oldScript.script && oldScript.script.pid) {
      try {
        process.kill(-oldScript.script.pid);
        await oldScript.hasClosed;
      } catch (e) {
        logger(
          `
          Error: problem killing a participant terminal script, this could be related to a bug on Windows where the wrong PID is given.
          CWK is working on a fix or workaround.. In the meantime, we advise using WSL for windows users hosting CWK workshops,
          or only doing participant scripts that are self-terminating.
        `,
          opts,
        );
      }
    }
  }

  if (!cfg || !cfg.targetOptions || !cfg.targetOptions.cmd) {
    return;
  }

  const { processEmitter, script } = runScript({
    cmd: cfg.targetOptions.cmd,
    participant: participantName,
    participantIndex: cfg.participants.indexOf(participantName),
    dir: cfg.absoluteDir,
  });

  if (!state.terminalScripts) {
    state.terminalScripts = new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  let closeResolve = () => {};
  const hasClosed = new Promise((resolve) => {
    if (!state.terminalScripts) {
      return;
    }
    closeResolve = resolve as () => void;
  });

  // Save the current running script for participant
  state.terminalScripts.set(participantName, { script, closeResolve, hasClosed });

  // We will set a close listener for each participant, which can easily exceed 10.
  script.setMaxListeners(0);
  script.on('close', () => {
    if (!state.terminalScripts) {
      return;
    }
    const scriptData = state.terminalScripts.get(participantName);
    if (scriptData) {
      scriptData.closeResolve();
      state.terminalScripts.delete(participantName);
    }
  });

  // Open terminal input on the frontend
  const connections = getWsConnection(participantName, 'terminal-process', true);
  if (Array.isArray(connections)) {
    connections.forEach((connection) => {
      if (connection) {
        connection.send(JSON.stringify({ type: 'terminal-input-enable' }));
      }

      // Close terminal input on the frontend
      script.on('close', () => {
        if (connection) {
          connection.send(JSON.stringify({ type: 'terminal-input-disable' }));
        }
      });
    });
  }

  const sendData = (data: string, type: 'output' | 'error') => {
    // Check connections again, as they may have changed since checking at the start of running the script
    const _connections = getWsConnection(participantName, 'terminal-process', true);
    if (Array.isArray(_connections)) {
      _connections.forEach((connection) =>
        connection.send(JSON.stringify({ type: `terminal-process-${type}`, data })),
      );
    }
  };

  processEmitter.on('out', (data) => {
    sendData(data, 'output');
  });

  processEmitter.on('err', (data) => {
    sendData(data, 'error');
  });

  cwkState.state = state;
};

const handleWsMessage = (message: string, ws: WebSocket, opts: { logStartup?: boolean }) => {
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
        const scriptData = cwkState.state.terminalScripts.get(participantName);
        if (scriptData && scriptData.script) {
          scriptData.script.stdin.write(`${input}\n`, (err) => {
            if (err) {
              throw new Error(`stdin error: ${err}`);
            }
          });
        }
      }
      break;
    }
    case 'terminal-rerun': {
      const { participantName } = parsedMessage;
      runScriptForParticipant(participantName, cwkState.state.cwkConfig, opts);
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

const addPluginsAndMiddleware = (
  wdsConfig: DevServerConfig & { port: number },
  cwkConfig: WorkshopConfig,
) => {
  const newWdsConfig = wdsConfig;

  newWdsConfig.middleware = [
    ...(wdsConfig.middleware || []),
    changeParticipantUrlMiddleware(cwkConfig.absoluteDir),
    jwtMiddleware(cwkConfig.absoluteDir),
    noCacheMiddleware,
  ];

  newWdsConfig.plugins = [
    ...(wdsConfig.plugins || []),
    queryTimestampModulesPlugin(cwkConfig.absoluteDir),
    missingIndexHtmlPlugin(cwkConfig),
    wsPortPlugin(wdsConfig.port),
    componentReplacersPlugin(cwkConfig),
    followModePlugin(wdsConfig.port),
    appShellPlugin(cwkConfig),
    adminUIPlugin(cwkConfig.absoluteDir),
  ];

  return newWdsConfig;
};

const getCwkConfig = (opts: Partial<WorkshopConfig>) => {
  // cwk defaults
  let cwkConfig: Required<WorkshopConfig> = {
    participants: [],
    admins: [],
    adminPassword: '',
    appKey: '',
    absoluteDir: '/',
    dir: '/',
    title: '',
    logStartup: true,
    target: 'frontend',
    argv: [],
    _unknown: [],
    ...opts,

    targetOptions: {
      // terminal
      cmd: '',
      autoReload: true,
      fromParticipantFolder: true,
      excludeFromWatch: [],

      // frontend
      mode: 'iframe',

      ...(opts && opts.targetOptions),
    },
    templateData: {
      ...(opts && opts.templateData),
    },
  };

  // If cli was used, read flags, both for cwk and wds flags
  if (opts.argv) {
    const cwkServerDefinitions = [
      {
        name: 'dir',
        type: String,
        description:
          'The directory to read the cwk.config.js from, the index.html for the app shell and the template folder for scaffolding',
      },
    ];

    cwkConfig = {
      ...cwkConfig,
      ...commandLineArgs(cwkServerDefinitions, { argv: opts.argv, partial: true }),
    };
  }

  if (cwkConfig.dir?.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    cwkConfig.dir = `.${cwkConfig.dir}`;
  }
  cwkConfig.absoluteDir = path.resolve(process.cwd(), cwkConfig.dir);

  const esmRequire = _esmRequire(module);
  const workshop = esmRequire(`${cwkConfig.absoluteDir}/cwk.config.js`).default;

  // TODO: use deepmerge
  cwkConfig = {
    ...cwkConfig,
    ...workshop,
    targetOptions: {
      ...(cwkConfig && cwkConfig.targetOptions),
      ...(workshop && workshop.targetOptions),
    },
  };
  return cwkConfig;
};

const getWdsConfig = (opts: DevServerConfig, cwkConfig: WorkshopConfig, port: number) => {
  // wds defaults & middleware
  let wdsConfig: DevServerConfig = {
    open: false,
    nodeResolve: true,
    plugins: [],
    middleware: [],
    ...opts,
  };

  wdsConfig.port = port;
  const wdsConfigWithPort = wdsConfig as DevServerConfig & { port: number };
  wdsConfig = addPluginsAndMiddleware(wdsConfigWithPort, cwkConfig);
  return wdsConfig;
};

const setupParticipantWatcher = (absoluteDir: string) =>
  chokidar.watch(path.resolve(absoluteDir, 'participants'));

const setupWatcherForTerminalProcess = (
  watcher: chokidar.FSWatcher,
  cfg: WorkshopConfig,
  opts: DevServerConfig & { logStartup?: boolean },
) => {
  if (cfg.targetOptions && cfg.targetOptions.autoReload) {
    watcher.on('change', (filePath: string) => {
      // Get participant name from file path
      // Cancel out the participant folder from the filepath (Bob/index.js or Bob/nested/style.css),
      // and get the top most dir name
      const participantFolder = path.join(cfg.absoluteDir, 'participants/');
      const participantName = filePath.split(participantFolder)[1].split(path.sep).shift();

      if (participantName) {
        const excludeFilesArr = [
          ...new Set(
            cfg.targetOptions?.excludeFromWatch
              ?.flatMap((pattern: string) =>
                glob.sync(pattern, {
                  cwd: path.resolve(cfg.absoluteDir, 'participants', participantName),
                  dot: true,
                }),
              )
              .map((file: string) =>
                path.resolve(cfg.absoluteDir, 'participants', participantName, file),
              ),
          ),
        ];

        // If the file that was changed is not within exclude-list
        if (!excludeFilesArr.includes(filePath)) {
          runScriptForParticipant(participantName, cfg, opts);
        }
      }
    });
  }
};

const setupHMR = (watcher: chokidar.FSWatcher, absoluteDir: string) => {
  watcher.on('change', (filePath) => {
    // Get participant name from file path
    // Cancel out the participant folder from the filepath (Bob/index.js or Bob/nested/style.css),
    // and get the top most dir name
    const participantFolder = path.join(absoluteDir, 'participants/');
    const participantName = filePath.split(participantFolder)[1].split(path.sep).shift();

    if (participantName) {
      const connections = getWsConnection(participantName, 'reload-module', true);
      const queryTimestamp = Date.now();
      const { state } = cwkState;
      if (!state.queryTimestamps) {
        state.queryTimestamps = {};
      }
      state.queryTimestamps[participantName] = queryTimestamp;
      cwkState.state = state;

      if (Array.isArray(connections)) {
        connections.forEach((connection) => {
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
    }
  });
};

const getPort = async (opts: { port?: number; argv?: string[] }): Promise<number> => {
  /**
   * Pre-determine the port, since we have to pass it to our middleware and plugins before
   * the dev server is instantiated. We either take the CLI flag port, the Node API's port
   * property, or as a fallback, portfinder's default first found port.
   */
  const defaultPort = await portfinder.getPortPromise();
  const port =
    commandLineArgs(
      [
        {
          alias: 'p',
          name: 'port',
          type: Number,
        },
      ],
      { argv: opts.argv, partial: true },
    ).port ||
    opts.port ||
    defaultPort;

  return port;
};

export const startServer = async (
  opts: DevServerConfig & Partial<WorkshopConfig> & { argv?: string[] } & { logStartup?: boolean },
): Promise<{
  server: DevServer;
  wdsConfig: DevServerConfig;
  cwkConfig: WorkshopConfig;
  wss: WebSocket.Server;
  watcher: chokidar.FSWatcher;
}> => {
  const port = await getPort(opts);
  const cwkConfig = getCwkConfig(opts);
  const wdsConfig = getWdsConfig(opts, cwkConfig, port);

  const watcher = setupParticipantWatcher(cwkConfig.absoluteDir);
  if (cwkConfig.target === 'frontend' && cwkConfig.targetOptions.mode === 'module') {
    setupHMR(watcher, cwkConfig.absoluteDir);
  } else if (cwkConfig.target === 'terminal') {
    setupWatcherForTerminalProcess(watcher, cwkConfig, opts);
  }

  const server = await startDevServer({
    config: {
      ...wdsConfig,
      watch: false,
      clearTerminalOnReload: false,
    },
    logStartMessage: false,
    argv: cwkConfig._unknown, // pass those options that were unknown to CWK definitions
  });

  const wss = server.webSockets.webSocketServer;

  wss.on('connection', (ws) => {
    ws.on('message', (message: string) => handleWsMessage(message, ws, opts));
  });

  cwkState.state = { wss, cwkConfig };
  setDefaultAdminConfig();

  if (cwkConfig.logStartup !== false) {
    logger(chalk.bold('code-workshop-kit server started...'), opts);
    logger('', opts);
    let url = `http://localhost:${server.config.port}/${path.relative(
      process.cwd(),
      cwkConfig.absoluteDir,
    )}`;
    if (!url.endsWith('/')) {
      url += '/';
    }
    logger(`${chalk.white('Visit:')}    ${chalk.cyanBright(url)}`, opts);
    logger('', opts);
  }

  ['exit', 'SIGINT'].forEach((event) => {
    process.on(event, () => {
      // ensure that when we close CWK, terminal script subchildren are killed off too
      if (cwkState.state.terminalScripts) {
        cwkState.state.terminalScripts.forEach((script) => {
          if (script && script.script && script.script.pid) {
            try {
              process.kill(-script.script.pid);
            } catch (e) {
              logger(
                `
                Error: problem killing a participant terminal script, this could be related to a bug on Windows where the wrong PID is given.
                CWK is working on a fix or workaround.. In the meantime, we advise using WSL for windows users hosting CWK workshops,
                or only doing participant scripts that are self-terminating.
              `,
                opts,
              );
            }
          }
        });
      }

      watcher.close();
    });
  });

  return { server, wdsConfig, cwkConfig, wss, watcher };
};
