import { readFileFromPath, writeFileToPathOnDisk } from '@open-wc/create/dist/core.js';
import chalk from 'chalk';
import commandLineArgs from 'command-line-args';
import _esmRequire from 'esm';
import fs from 'fs';
import glob from 'glob';
import * as module from 'module';
import path from 'path';

// Fork from @open-wc/create to allow functions that return strings inside data obj. If we add this to @open-wc/create both forks can be deleted here.
function processTemplate(_fileContent, data = {}) {
  let fileContent = _fileContent;

  Object.keys(data).forEach((key) => {
    let replacement = data[key];
    if (typeof data[key] === 'function') {
      replacement = data[key]();
    }
    fileContent = fileContent.replace(new RegExp(`<%= ${key} %>`, 'g'), replacement);
  });
  return fileContent;
}

// Fork from @open-wc/create
function copyTemplates(fromGlob, toDir = process.cwd(), data = {}) {
  return new Promise((resolve) => {
    glob(fromGlob, { dot: true }, (err, files) => {
      const copiedFiles = [];
      files.forEach((filePath) => {
        if (!fs.lstatSync(filePath).isDirectory()) {
          const fileContent = readFileFromPath(filePath);
          if (fileContent !== false) {
            const processed = processTemplate(fileContent, data);

            // find path write to (force / also on windows)
            const replace = path.join(fromGlob.replace(/\*/g, '')).replace(/\\(?! )/g, '/');
            const toPath = filePath.replace(replace, `${toDir}/`);

            // write file to path?
            copiedFiles.push({ toPath, processed });
          }
        }
      });
      resolve(copiedFiles);
    });
  });
}

export const scaffold = async (opts) => {
  const logger = (str) => {
    if (opts.logStartup !== false) {
      // eslint-disable-next-line no-console
      console.log(str);
    }
  };

  logger(chalk.bold('code-workshop-kit scaffold started...'));
  logger('');

  if (opts.dir.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    opts.dir = `.${opts.dir}`;
  }
  const pathToWorkshop = path.resolve(process.cwd(), opts.dir, 'cwk.config.js');
  const pathToOutputDir = path.resolve(pathToWorkshop, '../', 'participants');
  const pathToInputDir = path.resolve(pathToWorkshop, '../', 'template');

  if (opts.workshop || fs.existsSync(pathToWorkshop)) {
    let workshop = {};
    if (opts.workshop) {
      ({ workshop } = opts);
    } else {
      const esmRequire = _esmRequire(module);
      workshop = esmRequire(pathToWorkshop).default;
    }

    const { participants, templateData } = workshop;

    participants.forEach((name) => {
      logger(`${chalk.white('Scaffolding for:')} ${chalk.cyanBright(name)}`);
      copyTemplates(
        path.resolve(process.cwd(), `${pathToInputDir}/**/*`),
        path.resolve(process.cwd(), `${pathToOutputDir}/${name}`),
        {
          participantName: name,
          ...templateData,
        },
      ).then((files) => {
        files.forEach((file) => {
          writeFileToPathOnDisk(file.toPath, file.processed, {
            override: opts.force,
            ask: false,
          });
        });
      });
    });
  } else {
    throw new Error(`Error: Cannot find cwk.config.js at ${pathToWorkshop}`);
  }
  if (opts.logStartup !== false) {
    logger('');
  }
};

export const scaffoldFiles = (opts = {}) => {
  let scaffoldConfig = {
    dir: '/',
    force: false,
    logStartup: true,
    ...opts,
  };

  if (opts.argv) {
    const scaffoldDefinitions = [
      {
        name: 'force',
        alias: 'f',
        type: Boolean,
        description:
          'If set, it will (re-)scaffold for the participants and overwrite the current files without warning',
      },
      {
        name: 'dir',
        alias: 'd',
        type: String,
        description: 'If set, will search for cwk.config.js in this directory',
      },
    ];

    const cliConfig = commandLineArgs(scaffoldDefinitions, { argv: opts.argv });

    scaffoldConfig = {
      ...scaffoldConfig,
      ...cliConfig,
    };
  }

  scaffold(scaffoldConfig);
};
