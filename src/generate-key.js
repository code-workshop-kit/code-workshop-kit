import commandLineArgs from 'command-line-args';
import path from 'path';
import { generateAppKey } from './app-key/generateAppKey.js';

export const generateKey = (opts = {}) => {
  let generateConfig = {
    configDir: '/',
    length: 28,
    ...opts,
  };

  if (opts.argv) {
    const scaffoldDefinitions = [
      {
        name: 'config-dir',
        alias: 'w',
        type: String,
        description: 'If set, will search for cwk.config.js in this directory',
      },
      {
        name: 'length',
        alias: 'l',
        type: Number,
        description: 'Key length',
      },
    ];

    const cliConfig = commandLineArgs(scaffoldDefinitions, { argv: opts.argv });

    // Convert these to camelCase props
    ['config-dir'].forEach(param => {
      if (cliConfig[param]) {
        const camelize = s => s.replace(/-./g, x => x.toUpperCase()[1]);
        cliConfig[camelize(param)] = cliConfig[param];
        delete cliConfig[param];
      }
    });

    generateConfig = {
      ...generateConfig,
      ...cliConfig,
    };

    generateAppKey(path.resolve(process.cwd(), generateConfig.configDir), generateConfig.length);
  }
};
