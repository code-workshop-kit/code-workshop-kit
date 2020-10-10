import { expect } from 'chai';
import { startServer } from '../../../src/start-server.js';

describe('start cwk server', () => {
  context('', () => {
    let server;
    let cwkConfig;
    let wdsConfig;
    let watcher;

    afterEach(async () => {
      if (watcher) {
        watcher.close();
      }
      if (server) {
        await server.stop();
      }
    });

    it('has default settings', async () => {
      ({ cwkConfig, wdsConfig, server, watcher } = await startServer({
        dir: './test/test-utils/fixtures/simple',
        logStartup: false,
      }));

      expect(cwkConfig.title).to.equal('');
      expect(cwkConfig.target).to.equal('frontend');
      expect(cwkConfig.targetOptions.mode).to.equal('iframe');
      expect(cwkConfig.targetOptions.cmd).to.equal('');
      expect(cwkConfig.targetOptions.autoReload).to.be.true;
      expect(cwkConfig.targetOptions.fromParticipantFolder).to.be.true;
      expect(cwkConfig.targetOptions.args).to.be.undefined;
      expect(cwkConfig.targetOptions.excludeFromWatch).to.eql([]);
      expect(server.config.watch).to.be.false;
      expect(server.config.plugins.length).to.equal(9);
      expect(server.config.nodeResolve).to.be.true;
      expect(server.config.middleware.length).to.equal(4);
    });

    it('supports overriding CWK server default settings', async () => {
      ({ cwkConfig, wdsConfig, server, watcher } = await startServer({
        port: 5000,
        title: 'Frontend Workshop',
        dir: './test/test-utils/fixtures/simple',
        logStartup: false,
        target: 'terminal',
        targetOptions: {
          cmd: 'node index.js',
          autoReload: false,
          fromParticipantFolder: false,
          excludeFromWatch: ['mjs'],
          mode: 'module',
        },
        open: false,
      }));

      expect(cwkConfig.title).to.equal('Frontend Workshop');
      expect(cwkConfig.target).to.equal('terminal');
      expect(cwkConfig.targetOptions.cmd).to.equal('node index.js');
      expect(cwkConfig.targetOptions.autoReload).to.be.false;
      expect(cwkConfig.targetOptions.fromParticipantFolder).to.be.false;
      expect(cwkConfig.targetOptions.excludeFromWatch).to.eql(['mjs']);
      expect(cwkConfig.targetOptions.mode).to.equal('module');
      expect(wdsConfig.plugins.length).to.equal(6);
      expect(wdsConfig.middleware.length).to.equal(4);
    });

    it('locks watch mode clearTerminalOnReload, and is not overridable', async () => {
      ({ cwkConfig, wdsConfig, server, watcher } = await startServer({
        dir: './test/test-utils/fixtures/simple',
        logStartup: false,
        watch: true,
        clearTerminalOnReload: true,
      }));
      expect(server.config.watch).to.be.false;
      expect(server.config.clearTerminalOnReload).to.be.false;
    });
  });
});
