import { DevServer } from '@web/dev-server-core';
import { expect } from 'chai';
import chokidar from 'chokidar';
import path from 'path';
import WebSocket from 'ws';
import { startServer } from '../../../src/start-server';
import { AdminConfig } from '../../../src/types/State';

describe('websocket server', () => {
  context('', () => {
    let server: DevServer;
    let watcher: chokidar.FSWatcher;
    let ws: WebSocket;
    const serverPort = 5000;
    const wsHost = `ws://localhost:${serverPort}/wds`;

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

      let wsResolve: (value: { type: string; config: AdminConfig }) => void;
      const wsComplete: Promise<{ type: string; config: AdminConfig }> = new Promise((resolve) => {
        wsResolve = resolve;
      });

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'config-init' }));
      });

      ws.on('message', (data: string) => {
        wsResolve(JSON.parse(data));
      });

      const response = await wsComplete;
      expect(response.type).to.equal('config-init');
      expect(response.config.enableCaching).to.be.false;
      expect(response.config.followMode).to.be.false;
    });

    it('allows authenticating by WS with a user name', async () => {
      ws = new WebSocket(wsHost);

      let wsResolve: (value: { type: string; user: 'string' }) => void;
      const wsComplete: Promise<{ type: string; user: 'string' }> = new Promise((resolve) => {
        wsResolve = resolve;
      });

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'authenticate', username: 'Joren' }));
      });

      ws.on('message', (data: string) => {
        wsResolve(JSON.parse(data));
      });

      const response = await wsComplete;
      expect(response.type).to.equal('authenticate-completed');
      expect(response.user).to.equal('Joren');
    });

    it('allows updating admin config by WS on config-updated', async () => {
      ws = new WebSocket(wsHost);

      let wsResolve: (value: { type: string; config: AdminConfig }) => void;
      const wsComplete: Promise<{ type: string; config: AdminConfig }> = new Promise((resolve) => {
        wsResolve = resolve;
      });

      ws.on('open', () => {
        ws.send(JSON.stringify({ type: 'config-updated', config: { enableCaching: true } }));
      });

      ws.on('message', (data: string) => {
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
