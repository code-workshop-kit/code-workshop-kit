import { expect } from 'chai';
import { cwkState } from '../../../src/utils/CwkStateSingleton';

describe('CwkStateSingleton', () => {
  beforeEach(() => {
    cwkState.clear();
    cwkState.state = { previousAdminUrl: 'bar' };
  });

  it('returns state', async () => {
    expect(cwkState.state).to.eql({ previousAdminUrl: 'bar' });
  });

  it('allows writing state to it', async () => {
    cwkState.state = { previousAdminUrl: 'rawr' };
    expect(cwkState.state.previousAdminUrl).to.equal('rawr');
  });

  it('uses merges new state with old state', async () => {
    cwkState.state = { followModeInitiatedBy: 'rawr' };
    expect(cwkState.state).to.eql({ previousAdminUrl: 'bar', followModeInitiatedBy: 'rawr' });
  });
});
