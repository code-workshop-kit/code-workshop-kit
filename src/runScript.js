import { spawn } from 'child_process';
import path from 'path';
import EventEmitter from 'events';

export const runScript = ({
  cmd,
  dir,
  participant,
  participantIndex,
  fromParticipantFolder = true,
} = {}) => {
  const processEmitter = new EventEmitter();
  let pathToRunScriptIn = path.resolve(dir);
  if (fromParticipantFolder) {
    pathToRunScriptIn = path.resolve(dir, 'participants', participant);
  }

  const _cmd = typeof cmd === 'function' ? cmd.call(participant, participantIndex) : cmd;
  const script = spawn(_cmd, [], {
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
