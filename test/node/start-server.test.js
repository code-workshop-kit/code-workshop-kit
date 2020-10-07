import { expect } from 'chai';
import { startServer } from '../../src/start-server.js';

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
        dir: './test/utils/fixtures/simple',
      }));

      expect(cwkConfig.title).to.equal('');
      expect(cwkConfig.target).to.equal('frontend');
      expect(cwkConfig.targetOptions.mode).to.equal('iframe');
      expect(cwkConfig.targetOptions.cmd).to.equal('');
      expect(cwkConfig.targetOptions.autoReload).to.be.true;
      expect(cwkConfig.targetOptions.fromParticipantFolder).to.be.true;
      expect(cwkConfig.targetOptions.args).to.eql({});
      expect(cwkConfig.targetOptions.excludeFromWatch).to.eql([]);
      expect(cwkConfig.participantIndexHtmlExists).to.be.true;
      expect(wdsConfig.watch).to.be.false;
      expect(wdsConfig.plugins.length).to.equal(10);
      expect(wdsConfig.nodeResolve).to.eql({
        customResolveOptions: { moduleDirectory: ['node_modules'], preserveSymlinks: false },
      });
      expect(wdsConfig.middleware.length).to.equal(3);
    });

    it('supports overriding CWK server default settings', async () => {
      ({ cwkConfig, wdsConfig, server, watcher } = await startServer({
        port: 5000,
        title: 'Frontend Workshop',
        dir: './test/utils/fixtures/simple',
        target: 'terminal',
        targetOptions: {
          cmd: 'node index.js --port <%= port %>',
          autoReload: false,
          fromParticipantFolder: false,
          excludeFromWatch: ['mjs'],
          mode: 'module',
        },
        participantIndexHtmlExists: false,
        open: false,
      }));

      expect(cwkConfig.title).to.equal('Frontend Workshop');
      expect(cwkConfig.participantIndexHtmlExists).to.be.false;
      expect(cwkConfig.target).to.equal('terminal');
      expect(cwkConfig.targetOptions.cmd).to.equal('node index.js --port <%= port %>');
      expect(cwkConfig.targetOptions.autoReload).to.be.false;
      expect(cwkConfig.targetOptions.fromParticipantFolder).to.be.false;
      expect(cwkConfig.targetOptions.excludeFromWatch).to.eql(['mjs']);
      expect(cwkConfig.targetOptions.mode).to.equal('module');
      // app-shell/file-control turned off
      expect(wdsConfig.plugins.length).to.equal(7);
      // caching middleware turned off
      expect(wdsConfig.middleware.length).to.equal(2);
    });

    it('locks watch mode clearTerminalOnReload, and is not overridable', async () => {
      ({ cwkConfig, wdsConfig, server, watcher } = await startServer({
        dir: './test/utils/fixtures/simple',
        watch: true,
        open: false,
        clearTerminalOnReload: true,
      }));
      expect(wdsConfig.watch).to.be.false;
      expect(wdsConfig.clearTerminalOnReload).to.be.false;
    });
  });
});
