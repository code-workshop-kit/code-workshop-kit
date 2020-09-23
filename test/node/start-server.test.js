import { expect } from 'chai';
import { startServer } from '../../src/start-server.js';

describe('start cwk server', () => {
  context('', () => {
    let server;
    let wss;
    let cwkConfig;
    let edsConfig;
    let watcher;

    afterEach(async () => {
      if (wss) {
        wss.close();
      }
      if (watcher) {
        watcher.close();
      }
      if (server) {
        await new Promise(resolve => {
          server.close(() => resolve());
        });
      }
    });

    it('has default settings', async () => {
      ({ cwkConfig, edsConfig, server, wss, watcher } = await startServer({
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
      expect(edsConfig.logStartup).to.be.true;
      expect(edsConfig.watch).to.be.false;
      expect(edsConfig.moduleDirs).to.be.undefined;
      expect(edsConfig.plugins.length).to.equal(10);
      expect(edsConfig.nodeResolve).to.eql({
        customResolveOptions: { moduleDirectory: ['node_modules'], preserveSymlinks: false },
      });
      expect(edsConfig.customMiddlewares.length).to.equal(3);
    });

    it('supports overriding CWK server default settings', async () => {
      const randomNumber = Math.round(Math.random() * 4000);
      ({ cwkConfig, edsConfig, server, wss, watcher } = await startServer({
        port: 5000,
        title: 'Frontend Workshop',
        dir: './test/utils/fixtures/simple',
        target: 'terminal',
        targetOptions: {
          cmd: 'node index.js --port <%= port %>',
          autoReload: false,
          fromParticipantFolder: false,
          args: {
            port: 8000 + randomNumber,
          },
          excludeFromWatch: ['mjs'],

          mode: 'module',
        },
        participantIndexHtmlExists: false,
        logStartup: false,
        open: false,
      }));

      expect(cwkConfig.title).to.equal('Frontend Workshop');
      expect(cwkConfig.participantIndexHtmlExists).to.be.false;
      expect(cwkConfig.target).to.equal('terminal');
      expect(cwkConfig.targetOptions.cmd).to.equal('node index.js --port <%= port %>');
      expect(cwkConfig.targetOptions.autoReload).to.be.false;
      expect(cwkConfig.targetOptions.fromParticipantFolder).to.be.false;
      expect(cwkConfig.targetOptions.args).to.eql({ port: 8000 + randomNumber });
      expect(cwkConfig.targetOptions.excludeFromWatch).to.eql(['mjs']);
      expect(cwkConfig.targetOptions.mode).to.equal('module');
      expect(edsConfig.logStartup).to.be.false;
      // app-shell/file-control turned off
      expect(edsConfig.plugins.length).to.equal(7);
      // caching middleware turned off
      expect(edsConfig.customMiddlewares.length).to.equal(2);
    });

    it('locks watch mode, compatibility, and event stream if mode is iframe, and is not overridable', async () => {
      ({ cwkConfig, edsConfig, server, wss, watcher } = await startServer({
        dir: './test/utils/fixtures/simple',
        watch: true,
        compatibility: 'always',
        eventStream: true,
        open: false,
        logStartup: false,
      }));

      expect(edsConfig.watch).to.be.false;
      expect(edsConfig.eventStream).to.be.false;
      expect(edsConfig.compatibility).to.be.undefined;
    });

    it('allows eventStream for module mode', async () => {
      ({ cwkConfig, edsConfig, server, wss, watcher } = await startServer({
        dir: './test/utils/fixtures/simple',
        watch: true,
        targetOptions: {
          mode: 'module',
        },
        compatibility: 'always',
        open: false,
        logStartup: false,
      }));

      expect(edsConfig.watch).to.be.false;
      expect(edsConfig.eventStream).to.be.true;
      expect(edsConfig.compatibility).to.be.undefined;
    });
  });
});
