import { expect } from 'chai';
import path from 'path';
import { noCacheMiddleware } from '../../src/middlewares/middlewares.js';
import { appShellPlugin, fileControlPlugin } from '../../src/plugins/plugins.js';
import { startServer } from '../../src/start-server.js';

describe('start cwk server', () => {
  context('', () => {
    let server;
    let wss;
    let cwkConfig;
    let edsConfig;

    afterEach(async () => {
      if (wss) {
        wss.close();
      }
      if (server) {
        await new Promise(resolve => {
          server.close(() => resolve());
        });
      }
    });

    it('has default settings', async () => {
      ({ cwkConfig, edsConfig, server, wss } = await startServer({
        dir: './test/utils/fixtures/simple',
      }));

      expect(cwkConfig.withoutAppShell).to.be.false;
      expect(cwkConfig.enableCaching).to.be.false;
      expect(cwkConfig.alwaysServeFiles).to.be.false;
      expect(cwkConfig.usingParticipantIframes).to.be.false;
      expect(cwkConfig.participantIndexHtmlExists).to.be.true;
      expect(cwkConfig.title).to.equal('');
      expect(edsConfig.logStartup).to.be.true;
      expect(edsConfig.watch).to.be.false;
      expect(edsConfig.moduleDirs).to.be.undefined;
      expect(edsConfig.plugins.length).to.equal(9);
      expect(edsConfig.nodeResolve).to.eql({
        customResolveOptions: { moduleDirectory: ['node_modules'], preserveSymlinks: false },
      });
      expect(edsConfig.customMiddlewares.length).to.equal(3);
    });

    it('supports overriding CWK server default settings', async () => {
      ({ cwkConfig, edsConfig, server, wss } = await startServer({
        port: 5000,
        title: 'Frontend Workshop',
        dir: './test/utils/fixtures/simple',
        withoutAppShell: true,
        enableCaching: true,
        alwaysServeFiles: true,
        usingParticipantIframes: true,
        participantIndexHtmlExists: false,
        logStartup: false,
        watch: true,
        rootDir: path.resolve(__dirname, '../utils', 'fixtures', 'simple'),
        open: false,
      }));

      expect(cwkConfig.title).to.equal('Frontend Workshop');
      expect(cwkConfig.withoutAppShell).to.be.true;
      expect(cwkConfig.enableCaching).to.be.true;
      expect(cwkConfig.alwaysServeFiles).to.be.true;
      expect(cwkConfig.usingParticipantIframes).to.be.true;
      expect(cwkConfig.participantIndexHtmlExists).to.be.false;
      expect(edsConfig.logStartup).to.be.false;
      expect(edsConfig.watch).to.be.true;
      // app-shell/file-control turned off
      expect(edsConfig.plugins.length).to.equal(7);
      // caching middleware turned off
      expect(edsConfig.customMiddlewares.length).to.equal(2);
    });

    it('supports preventing certain plugins and middlewares from being added', async () => {
      ({ cwkConfig, edsConfig, server, wss } = await startServer({
        port: 5000,
        withoutAppShell: true,
        enableCaching: true,
        alwaysServeFiles: true,
        logStartup: false,
        dir: './test/utils/fixtures/simple',
        rootDir: path.resolve(__dirname, '../utils', 'fixtures', 'simple'),
        open: false,
      }));

      const appShellPluginFound = edsConfig.plugins.find(plugin => {
        if (plugin.transform) {
          return plugin.transform.toString() === appShellPlugin().transform.toString();
        }
        return false;
      });

      const fileControlPluginFound = edsConfig.plugins.find(plugin => {
        if (plugin.transform) {
          return (
            plugin.transform.toString() ===
            fileControlPlugin('./test/utils/fixtures/simple', []).transform.toString()
          );
        }
        return false;
      });

      let noCachingMiddlewareFound;
      if (edsConfig.customMiddlewares) {
        noCachingMiddlewareFound = edsConfig.customMiddlewares.find(middleware => {
          if (middleware.name === noCacheMiddleware.name) {
            return true;
          }
          return false;
        });
      }

      expect(cwkConfig.withoutAppShell).to.be.true;
      expect(appShellPluginFound).to.be.undefined;

      expect(cwkConfig.alwaysServeFiles).to.be.true;
      expect(fileControlPluginFound).to.be.undefined;

      expect(cwkConfig.enableCaching).to.be.true;
      expect(noCachingMiddlewareFound).to.be.undefined;
    });
  });
});
