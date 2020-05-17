#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import { scaffoldFiles } from './scaffold-files.js';
import { startServer } from './start-server.js';

// Determine if we are in run mode or scaffold mode
const mainDefinitions = [{ name: 'command', defaultOption: true, type: String }];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const argv = mainOptions._unknown || [];

switch (mainOptions.command) {
  case 'run':
    startServer({ argv });
    break;
  case 'scaffold':
    scaffoldFiles({ argv });
    break;
  // no default
}
