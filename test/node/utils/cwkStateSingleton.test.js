import { expect } from 'chai';
import { cwkState } from '../../../src/utils/CwkStateSingleton.js';

describe('CwkStateSingleton', () => {
  beforeEach(() => {
    cwkState.clear();
    cwkState.state = { foo: 'bar' };
  });

  it('returns state', async () => {
    expect(cwkState.state).to.eql({ foo: 'bar' });
  });

  it('allows writing state to it', async () => {
    cwkState.state = { woof: 'rawr' };
    expect(cwkState.state.woof).to.equal('rawr');
  });

  it('uses merges new state with old state', async () => {
    cwkState.state = { woof: 'rawr' };
    expect(cwkState.state).to.eql({ foo: 'bar', woof: 'rawr' });
  });
});
