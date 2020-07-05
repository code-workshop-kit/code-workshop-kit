import commandLineArgs from 'command-line-args';
import path from 'path';
import { generateAppKey } from './app-key/generateAppKey.js';

export const generateKey = (opts = {}) => {
  let generateConfig = {
    dir: '/',
    length: 28,
    ...opts,
  };

  if (opts.argv) {
    const scaffoldDefinitions = [
      {
        name: 'dir',
        alias: 'd',
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

    generateConfig = {
      ...generateConfig,
      ...cliConfig,
    };

    generateAppKey(path.resolve(process.cwd(), generateConfig.dir), generateConfig.length);
  }
};
