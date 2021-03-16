#!/usr/bin/env node
import commandLineArgs from 'command-line-args';
import { generateKey } from './generate-key';
import { scaffoldFiles } from './scaffold-files';
import { startServer } from './start-server';

// Determine if we are in run mode or scaffold mode
const mainDefinitions = [{ name: 'command', defaultOption: true, type: String }];
const mainOptions = commandLineArgs(mainDefinitions, { stopAtFirstUnknown: true });
const { command } = mainOptions;
const argv = mainOptions._unknown || [];

switch (command) {
  case 'run':
    startServer({ argv });
    break;
  case 'scaffold':
    scaffoldFiles({ argv });
    break;
  case 'generate-key':
    generateKey({ argv });
    break;
  // no default
}
