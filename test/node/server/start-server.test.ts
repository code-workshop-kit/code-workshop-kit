import { DevServerConfig } from '@web/dev-server';
import { DevServer } from '@web/dev-server-core';
import chokidar from 'chokidar';
import { expect } from 'chai';
import { startServer } from '../../../src/start-server';
import { WorkshopConfig } from '../../../src/types/CwkConfig';

describe('start cwk server', () => {
  context('', () => {
    let server: DevServer;
    let cwkConfig: Partial<WorkshopConfig>;
    let wdsConfig: DevServerConfig;
    let watcher: chokidar.FSWatcher;

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
      expect(cwkConfig.targetOptions?.mode).to.equal('iframe');
      expect(cwkConfig.targetOptions?.cmd).to.equal('');
      expect(cwkConfig.targetOptions?.autoReload).to.be.true;
      expect(cwkConfig.targetOptions?.fromParticipantFolder).to.be.true;
      // @ts-expect-error testing unknown property to be undefined
      expect(cwkConfig.targetOptions?.args).to.be.undefined;
      expect(cwkConfig.targetOptions?.excludeFromWatch).to.eql([]);
      // @ts-expect-error according to typescript server.config only has DevServerConfigCore?
      expect(server.config.watch).to.be.false;
      expect(server.config.plugins?.length).to.equal(10);
      // @ts-expect-error according to typescript server.config only has DevServerConfigCore?
      expect(server.config.nodeResolve).to.be.true;
      expect(server.config.middleware?.length).to.equal(3);
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
      expect(cwkConfig.targetOptions?.cmd).to.equal('node index.js');
      expect(cwkConfig.targetOptions?.autoReload).to.be.false;
      expect(cwkConfig.targetOptions?.fromParticipantFolder).to.be.false;
      expect(cwkConfig.targetOptions?.excludeFromWatch).to.eql(['mjs']);
      expect(cwkConfig.targetOptions?.mode).to.equal('module');
      expect(wdsConfig.plugins?.length).to.equal(7);
      expect(wdsConfig.middleware?.length).to.equal(3);
    });

    it('locks watch mode clearTerminalOnReload, and is not overridable', async () => {
      ({ cwkConfig, wdsConfig, server, watcher } = await startServer({
        dir: './test/test-utils/fixtures/simple',
        logStartup: false,
        watch: true,
        clearTerminalOnReload: true,
      }));
      // @ts-expect-error according to typescript server.config only has DevServerConfigCore?
      expect(server.config.watch).to.be.false;
      // @ts-expect-error according to typescript server.config only has DevServerConfigCore?
      expect(server.config.clearTerminalOnReload).to.be.false;
    });
  });
});
