import { expect } from 'chai';
import path from 'path';
import WebSocket from 'ws';
import { startServer } from '../../../src/start-server.js';

describe('websocket server', () => {
  context('', () => {
    let server;
    let ws;
    let watcher;
    const serverPort = 5000;
    const wsHost = `ws://localhost:${serverPort}/`;

    beforeEach(async () => {
      ({ server, watcher } = await startServer({
        port: serverPort,
        dir: './test/test-utils/fixtures/simple',
        logStartup: false,
        rootDir: path.resolve(__dirname, 'test-utils', 'fixtures', 'simple'),
        open: false,
      }));
    });

    afterEach(async () => {
      if (ws) {
        ws.send(JSON.stringify({ type: 'reset-state' }));
        ws.close();
      }
      if (watcher) {
        watcher.close();
      }
      if (server) {
        await server.stop();
      }
    });

    it('responds with admin UI defaults via WS on config-init', async () => {
      ws = new WebSocket(wsHost);

      let wsResolve;
      const wsComplete = new Promise(resolve => {
        wsResolve = resolve;
      });

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'config-init' }));
      });

      ws.on('message', data => {
        wsResolve(JSON.parse(data));
      });

      const response = await wsComplete;
      expect(response.type).to.equal('config-init');
      expect(response.config.enableCaching).to.be.false;
      expect(response.config.followMode).to.be.false;
    });

    it('allows authenticating by WS with a user name', async () => {
      ws = new WebSocket(wsHost);

      let wsResolve;
      const wsComplete = new Promise(resolve => {
        wsResolve = resolve;
      });

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'authenticate', username: 'Joren' }));
      });

      ws.on('message', data => {
        wsResolve(JSON.parse(data));
      });

      const response = await wsComplete;
      expect(response.type).to.equal('authenticate-completed');
      expect(response.user).to.equal('Joren');
    });

    it('allows updating admin config by WS on config-updated', async () => {
      ws = new WebSocket(wsHost);

      let wsResolve;
      const wsComplete = new Promise(resolve => {
        wsResolve = resolve;
      });

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'config-updated', config: { enableCaching: true } }));
      });

      ws.on('message', data => {
        wsResolve(JSON.parse(data));
      });

      const response = await wsComplete;
      expect(response.type).to.equal('config-update-completed');
      expect(response.config).to.eql({
        followMode: false,
        enableCaching: true,
      });
    });
  });
});
