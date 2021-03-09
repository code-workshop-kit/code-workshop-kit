import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { clearAppKey, generateAppKey } from '../../../src/app-key/generateAppKey';

const workshopMockPath = './test/test-utils/workshop-mock';

describe('generateAppKey', () => {
  afterEach(() => {
    clearAppKey(workshopMockPath);
  });

  it('by default returns an app key with 28 bytes (stringified --> 56 chars)', async () => {
    expect(generateAppKey(path.resolve(workshopMockPath)).length).to.equal(56);
  });

  it('adds the generated app key to the workshop config file when it is missing', async () => {
    generateAppKey(path.resolve(workshopMockPath));
    const cwkCfg = fs.readFileSync(path.resolve(workshopMockPath, 'cwk.config.js'), 'utf8');
    const cwkCfgMatch = cwkCfg.match(/appKey: "(.{56})"/);

    let cfgHasAppKey = '';
    if (cwkCfgMatch && cwkCfgMatch.length >= 1) {
      [, cfgHasAppKey] = cwkCfgMatch;
    }
    expect(cfgHasAppKey.length).to.equal(56);
  });

  it('replaces existing app key in the workshop config file', async () => {
    // Generate initial
    generateAppKey(path.resolve(workshopMockPath));
    const cwkCfgOne = fs.readFileSync(path.resolve(workshopMockPath, 'cwk.config.js'), 'utf8');
    const cwkCfgOneMatch = cwkCfgOne.match(/appKey: "(.{56})"/);

    let cfgHasAppKeyOne = '';
    if (cwkCfgOneMatch && cwkCfgOneMatch.length >= 1) {
      [, cfgHasAppKeyOne] = cwkCfgOneMatch;
    }
    expect(cfgHasAppKeyOne.length).to.equal(56);

    // Regenerate
    generateAppKey(path.resolve(workshopMockPath));
    const cwkCfgTwo = fs.readFileSync(path.resolve(workshopMockPath, 'cwk.config.js'), 'utf8');
    const cwkCfgTwoMatch = cwkCfgTwo.match(/appKey: "(.{56})"/);

    let cfgHasAppKeyTwo = '';
    if (cwkCfgTwoMatch && cwkCfgTwoMatch.length >= 1) {
      [, cfgHasAppKeyTwo] = cwkCfgTwoMatch;
    }

    expect(cfgHasAppKeyOne.length).to.equal(56);
    expect(cfgHasAppKeyTwo.length).to.equal(56);
    // Compare
    expect(cfgHasAppKeyOne).to.not.equal(cfgHasAppKeyTwo);
  });
});
