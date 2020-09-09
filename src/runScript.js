import { spawn } from 'child_process';
import path from 'path';
import EventEmitter from 'events';

export const runScript = (cmd, participant, dir) => {
  const processEmitter = new EventEmitter();
  const pathToRunScriptIn = path.resolve(dir, 'participants', participant);
  const script = spawn(cmd, [], {
    cwd: pathToRunScriptIn,
    shell: true,
  });

  script.stdout.on('data', data => {
    processEmitter.emit('out', `${data}`);
  });

  script.stderr.on('data', data => {
    processEmitter.emit('err', `${data}`);
  });

  script.on('close', () => processEmitter.emit('close'));

  return { processEmitter, process: script };
};
