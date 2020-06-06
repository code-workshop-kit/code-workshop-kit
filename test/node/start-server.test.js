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

    it('supports overriding CWK server default settings', async () => {
      ({ cwkConfig, edsConfig, server, wss } = await startServer({
        port: 5000,
        wsPort: 5002,
        title: 'Frontend Workshop',
        appIndex: './test/utils/fixtures/simple/index.html',
        logStartup: false,
        rootDir: path.resolve(__dirname, '../utils', 'fixtures', 'simple'),
        open: false,
      }));

      expect(cwkConfig.wsPort).to.equal(5002);
      expect(edsConfig.appIndex).to.equal('/./test/utils/fixtures/simple/index.html');
      expect(cwkConfig.title).to.equal('Frontend Workshop');
    });

    it('supports preventing certain plugins and middlewares from being added', async () => {
      ({ cwkConfig, edsConfig, server, wss } = await startServer({
        port: 5000,
        wsPort: 5001,
        withoutAppShell: true,
        enableCaching: true,
        alwaysServeFiles: true,
        logStartup: false,
        appIndex: './test/utils/fixtures/simple/index.html',
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
          return plugin.transform.toString() === fileControlPlugin([]).transform.toString();
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
