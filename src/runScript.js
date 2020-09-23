import { spawn, spawnSync } from 'child_process';
import path from 'path';
import EventEmitter from 'events';

export const runScript = ({
  cmd,
  dir,
  participant,
  participantIndex,
  fromParticipantFolder = true,
  sync = false,
} = {}) => {
  const processEmitter = new EventEmitter();
  let pathToRunScriptIn = path.resolve(dir);
  if (fromParticipantFolder) {
    pathToRunScriptIn = path.resolve(dir, 'participants', participant);
  }

  const _cmd = typeof cmd === 'function' ? cmd.call(null, participant, participantIndex) : cmd;

  const script = sync
    ? spawnSync(_cmd, [], {
        shell: true,
      })
    : spawn(_cmd, [], {
        cwd: pathToRunScriptIn,
        shell: true,
      });

  if (!sync) {
    script.stdout.on('data', data => {
      processEmitter.emit('out', `${data}`);
    });

    script.stderr.on('data', data => {
      processEmitter.emit('err', `${data}`);
    });

    script.on('close', () => {
      processEmitter.emit('close');
    });
  }

  return { processEmitter, process: script };
};
