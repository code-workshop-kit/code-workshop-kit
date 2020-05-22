import { expect } from 'chai';
import path from 'path';
import WebSocket from 'ws';
import { startServer } from '../../src/start-server.js';

describe('websocket server', () => {
  context('', () => {
    let server;
    let wss;
    let ws;
    const serverPort = 5000;
    const wsServerPort = 5001;
    const wsHost = `ws://localhost:${wsServerPort}/`;

    beforeEach(async () => {
      ({ server, wss } = await startServer({
        port: serverPort,
        wsPort: wsServerPort,
        rootDir: path.resolve(__dirname, 'utils', 'fixtures', 'simple'),
        logStartup: false,
        open: false,
      }));
    });

    afterEach(() => {
      server.close();
      wss.close();
      if (ws) {
        ws.send(JSON.stringify({ type: 'reset-state' }));
        ws.close();
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
      expect(response.config.alwaysServeFiles).to.be.false;
      expect(response.config.enableAdmin).to.be.true;
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
        enableAdmin: true,
        alwaysServeFiles: false,
        followMode: false,
        enableCaching: true,
      });
    });
  });
});
