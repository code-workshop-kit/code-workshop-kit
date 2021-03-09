import chalk from 'chalk';
import commandLineArgs from 'command-line-args';
import path from 'path';
import { generateAppKey } from './app-key/generateAppKey';

export const generateKey = (opts: { argv: string[] }): void => {
  console.log(chalk.bold('code-workshop-kit generate-key started...'));
  console.log('');

  let generateConfig = {
    dir: '/',
    logStartup: true,
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
  }

  if (generateConfig.dir.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    generateConfig.dir = `.${generateConfig.dir}`;
  }
  const absoluteDir = path.resolve(process.cwd(), generateConfig.dir);
  generateAppKey(absoluteDir, generateConfig.length);
  console.log(
    `${chalk.white('Key generated, pasted in:')} ${chalk.cyanBright(
      path.resolve(process.cwd(), absoluteDir, 'cwk.config.js'),
    )}`,
  );
  console.log('');
};
