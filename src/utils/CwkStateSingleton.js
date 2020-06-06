import deepmerge from 'deepmerge';
import isPlainObject from 'is-plain-object';

class CwkStateSingleton {
  constructor() {
    this.__data = {};
  }

  get state() {
    return this.__data;
  }

  set state(value) {
    this.__data = deepmerge(this.__data, value, { isMergeableObject: isPlainObject });
  }

  clear() {
    this.__data = {};
  }
}

const cwkState = new CwkStateSingleton();

export { cwkState };
