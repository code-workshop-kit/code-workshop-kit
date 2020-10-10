import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import { clearAppKey, generateAppKey } from '../../../src/app-key/generateAppKey.js';

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
    const cfgHasAppKey = cwkCfg.match(/appKey: "(.{56})"/)[1];
    expect(cfgHasAppKey.length).to.equal(56);
  });

  it('replaces existing app key in the workshop config file', async () => {
    // Generate initial
    generateAppKey(path.resolve(workshopMockPath));
    const cwkCfgOne = fs.readFileSync(path.resolve(workshopMockPath, 'cwk.config.js'), 'utf8');
    const appKeyOne = cwkCfgOne.match(/appKey: "(.{56})"/)[1];

    // Regenerate
    generateAppKey(path.resolve(workshopMockPath));
    const cwkCfgTwo = fs.readFileSync(path.resolve(workshopMockPath, 'cwk.config.js'), 'utf8');
    const appKeyTwo = cwkCfgTwo.match(/appKey: "(.{56})"/)[1];

    expect(appKeyOne.length).to.equal(56);
    expect(appKeyTwo.length).to.equal(56);
    // Compare
    expect(appKeyOne).to.not.equal(appKeyTwo);
  });
});
