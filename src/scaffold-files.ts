import { readFileFromPath, writeFileToPathOnDisk } from '@open-wc/create/dist/core.js';
import chalk from 'chalk';
import commandLineArgs from 'command-line-args';
import _esmRequire from 'esm';
import fs from 'fs';
import glob from 'glob';
import * as _module from 'module';
import path from 'path';
import { WorkshopConfig } from './types/CwkConfig';

interface ScaffoldOptions {
  dir?: string;
  force?: boolean;
  logStartup?: boolean;
  workshop?: Partial<WorkshopConfig>;
  argv?: string[];
}

interface CopiedFile {
  toPath: string;
  processed: string;
}
type CopiedFiles = CopiedFile[];

// Fork from @open-wc/create to allow functions that return strings inside data obj. If we add this to @open-wc/create both forks can be deleted here.
function processTemplate(_fileContent: string, data: WorkshopConfig['templateData']) {
  let fileContent = _fileContent;

  if (data) {
    Object.keys(data).forEach((key) => {
      let replacement = '';
      if (typeof data[key] === 'function') {
        replacement = (data[key] as () => string)();
      } else {
        replacement = data[key] as string;
      }
      fileContent = fileContent.replace(new RegExp(`<%= ${key} %>`, 'g'), replacement);
    });
  }
  return fileContent;
}

// Fork from @open-wc/create
export function copyTemplates(
  fromGlob: string,
  toDir: string = process.cwd(),
  data: WorkshopConfig['templateData'],
): Promise<CopiedFiles> {
  return new Promise((resolve) => {
    glob(fromGlob, { dot: true }, (err, files) => {
      const copiedFiles: CopiedFiles = [];
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

export const scaffold = async (_opts: ScaffoldOptions): Promise<void> => {
  const opts = {
    force: false,
    logStartup: true,
    dir: '/',
    ..._opts,
  };

  const logger = (str: string) => {
    if (opts.logStartup !== false) {
      // eslint-disable-next-line no-console
      console.log(str);
    }
  };
  logger(chalk.bold('code-workshop-kit scaffold started...'));
  logger('');

  if (opts.dir && opts.dir.startsWith('/')) {
    // eslint-disable-next-line no-param-reassign
    opts.dir = `.${opts.dir}`;
  }

  const pathToWorkshop = path.resolve(process.cwd(), opts.dir, 'cwk.config.js');
  const pathToOutputDir = path.resolve(pathToWorkshop, '../', 'participants');
  const pathToInputDir = path.resolve(pathToWorkshop, '../', 'template');

  if (opts.workshop || fs.existsSync(pathToWorkshop)) {
    let workshop: Partial<WorkshopConfig>;
    if (opts.workshop) {
      ({ workshop } = opts);
    } else {
      // We know we are in NodeJS so force module typecast to NodeModule
      const _mod = (_module as unknown) as NodeModule;
      const esmRequire = _esmRequire(_mod);
      workshop = esmRequire(pathToWorkshop).default;
    }

    const { participants = [], templateData } = workshop;

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

export const scaffoldFiles = (opts: ScaffoldOptions = {}): void => {
  let cliConfig = {};
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

    cliConfig = commandLineArgs(scaffoldDefinitions, { argv: opts.argv });
  }

  scaffold({
    ...opts,
    ...cliConfig,
  });
};
