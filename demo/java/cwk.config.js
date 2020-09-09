import base from '../cwk.config.js';

export default {
  ...base,
  title: 'Backend Workshop',
  target: 'terminal',
  terminalScript: 'javac Foo.java && java Foo',
  excludeFromWatch: ['class'],
};