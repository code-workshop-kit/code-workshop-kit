import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const deepmerge = require('deepmerge');

class CwkStateSingleton {
  constructor() {
    this.__data = {};
  }

  get state() {
    return this.__data;
  }

  set state(value) {
    this.__data = deepmerge(this.__data, value);
  }
}

const cwkState = new CwkStateSingleton();

export { cwkState };
