import { spawn, ChildProcessWithoutNullStreams } from 'child_process';
import path from 'path';
import EventEmitter from 'events';
import { ScriptCommand } from './types/CwkConfig';

interface ScriptOptions {
  cmd: ScriptCommand;
  dir: string;
  participant: string;
  participantIndex: number;
  fromParticipantFolder?: boolean;
}

export const runScript = (
  opts: ScriptOptions,
): { processEmitter: EventEmitter; script: ChildProcessWithoutNullStreams } => {
  const { cmd, dir, participant, participantIndex, fromParticipantFolder = true } = opts;

  const processEmitter = new EventEmitter();
  let pathToRunScriptIn = path.resolve(dir);
  if (fromParticipantFolder) {
    pathToRunScriptIn = path.resolve(dir, 'participants', participant);
  }

  const _cmd = typeof cmd === 'function' ? cmd.call(null, participant, participantIndex) : cmd;
  const script = spawn(_cmd, [], {
    cwd: pathToRunScriptIn,
    shell: true,
    detached: true,
  });

  script.stdout.on('data', (data: string) => {
    processEmitter.emit('out', `${data}`);
  });

  script.stderr.on('data', (data: string) => {
    processEmitter.emit('err', `${data}`);
  });

  script.on('close', () => processEmitter.emit('close'));

  return { processEmitter, script };
};
