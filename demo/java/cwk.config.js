import base from '../cwk.config.js';

export default {
  ...base,
  title: 'Backend Workshop',
  target: 'terminal',
  targetOptions: {
    cmd: (participant, index) => `es-dev-server --port 900${index}`,
    cmdBeforeRerun: (participant, index) => `lsof -ti :900${index} | xargs kill`,
    excludeFromWatch: ['*.class'],
  },
};