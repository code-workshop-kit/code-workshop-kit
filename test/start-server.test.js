import { expect } from 'chai';
import fetch from 'node-fetch';
import path from 'path';
import { startServer } from '../src/start-server.js';
import { userAgents } from './utils/user-agents.js';

const host = 'http://localhost:5000/';
// const wsHost = 'ws://localhost:5001/';

describe('cwk server', () => {
  context('', () => {
    let server;
    beforeEach(async () => {
      server = await startServer({
        port: 5000,
        wsPort: 5001,
        rootDir: path.resolve(__dirname, 'fixtures', 'simple'),
        open: false,
      });
    });

    afterEach(() => {
      server.close();
    });

    it('returns static files', async () => {
      const response = await fetch(`${host}index.html`, {
        headers: {
          'user-agent': userAgents['Chrome 78'],
          'Content-Type': 'text/html',
        },
      });

      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    });
  });
});
