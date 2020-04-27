#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import { createRequire } from 'module';
import path from 'path';
import { scaffoldFiles } from './scaffold-files.js';
import { workshopServer } from './workshop-server.js';

const require = createRequire(import.meta.url);
const { readCommandLineArgs } = require('es-dev-server');

// Determine if we are in run mode or scaffold mode
const mainDefinitions = [{ name: 'command', defaultOption: true, type: String }];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

// Find the user supplied root path where they run cwk from.
// Here we need to look for template folder and workshop.js
const rootFolder = path.resolve('/', path.dirname(readCommandLineArgs(argv).appIndex));

switch (mainOptions.command) {
  case 'run':
    workshopServer(argv, rootFolder);
    break;
  case 'scaffold':
    scaffoldFiles(argv, rootFolder);
    break;
  // no default
}
