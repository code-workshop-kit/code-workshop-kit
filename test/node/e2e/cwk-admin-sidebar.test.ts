import { expect } from 'chai';
import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import puppeteer, { Browser } from 'puppeteer';
import { DevServer } from '@web/dev-server-core';
import chokidar from 'chokidar';

import { startServer } from '../../../src/start-server';
import { aTimeout } from '../../test-utils/helpers';
import { SelectCookie } from '../../../src/components/SelectCookie';
import { AdminSidebar } from '../../../src/components/AdminSidebar';

const hostPort = 5000;
const host = `http://localhost:${hostPort}/`;
const testTimeout = 20000;
const baseCfg = {
  port: hostPort,
  open: false,
  logStartup: false,
};

describe('e2e: Admin UI Sidebar', () => {
  context('', () => {
    let wss: WebSocket.Server;
    let browser: Browser;
    let server: DevServer;
    let watcher: chokidar.FSWatcher;

    afterEach(async () => {
      // This may or may not alleviate premature close in CI?
      await aTimeout(100);
      if (browser) {
        await browser.close();
      }
      if (watcher) {
        watcher.close();
      }
      if (server) {
        await server.stop();
      }
    });

    it('inserts admin ui sidebar component for admins', async () => {
      ({ server, watcher } = await startServer({
        ...baseCfg,
        dir: './test/test-utils/fixtures/admins',
      }));

      browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(`${host}test/test-utils/fixtures/admins/index.html`);

      await page.evaluate(async () => {
        const cookieElem = document
          ?.querySelector('cwk-app-shell')
          ?.shadowRoot?.querySelector('cwk-select-cookie') as SelectCookie;

        await cookieElem.fetchDialogComplete;
        (cookieElem.shadowRoot?.querySelector('.name__item') as HTMLElement).click();
      });

      await aTimeout(100);
      await page.evaluate(() => {
        const dialogContent = document.querySelector('cwk-dialog-content');
        const input = dialogContent?.shadowRoot?.querySelector('input') as HTMLInputElement;
        input.value = 'pineapples';
        (dialogContent?.shadowRoot?.querySelector('.confirm-btn') as HTMLElement).click();
      });

      // animation for cookie selection takes 1000ms and then reloads the page and renders app shell with admin bar
      await aTimeout(3000);
      const { tagName, opened } = await page.evaluate(() => {
        const queryAdminBar = () =>
          document
            .querySelector('cwk-app-shell')
            ?.shadowRoot?.querySelector('cwk-admin-sidebar') as AdminSidebar;

        const adminSidebar = queryAdminBar();
        return {
          tagName: adminSidebar.tagName,
          opened: adminSidebar.opened,
        };
      });

      expect(tagName).to.equal('CWK-ADMIN-SIDEBAR');
      expect(opened).to.be.false;
    }).timeout(testTimeout); // this test gets a little too close to 2000ms... so let's make the limit a bit higher

    it('can enable caching which enables the server to send cached responses', async () => {
      let lastWsMsg = { type: '' };
      ({ server, wss, watcher } = await startServer({
        ...baseCfg,
        dir: './test/test-utils/fixtures/admins',
        plugins: [
          {
            name: 'cache-test',
            transform(context) {
              let rewrittenBody = context.body as string;

              if (context.url === '/test/test-utils/fixtures/admins/index.html') {
                rewrittenBody = rewrittenBody.replace(
                  '<body>',
                  `<body><p id="unixTimestamp">${Date.now()}</p>`,
                );
              }
              return {
                body: rewrittenBody,
                transformCache: false,
              };
            },
          },
        ],
      }));

      wss.on('connection', (ws) => {
        ws.on('message', (message: string) => {
          lastWsMsg = JSON.parse(message);
        });
      });

      browser = await puppeteer.launch();
      const page = await browser.newPage();
      await page.goto(`${host}test/test-utils/fixtures/admins/index.html`);

      const timestamps = [];
      let timestamp;

      const token = jwt.sign(
        { username: 'Joren' },
        '(=]#bYS940q)T8S*dX1g;Sey)X3YhN|98B>4hwE:c2ew8QrN3);hQN?x"5#yUS',
        { expiresIn: '12h' },
      );

      timestamp = await page.evaluate((tok) => {
        document.cookie = `participant_name=Joren;path=/`;
        document.cookie = `cwk_auth_token=${tok};path=/`;
        return document.getElementById('unixTimestamp')?.innerText;
      }, token);
      timestamps.push(timestamp);

      await page.reload();

      timestamp = await page.evaluate(() => {
        (
          document
            .querySelector('cwk-app-shell')
            ?.shadowRoot?.querySelector('cwk-admin-sidebar')
            ?.shadowRoot?.querySelector('.open-button') as HTMLElement
        ).click();

        return document.getElementById('unixTimestamp')?.innerText;
      });
      timestamps.push(timestamp);

      // Websocket config init + rerender takes some time
      await aTimeout(50);

      await page.evaluate(() => {
        (
          document
            .querySelector('cwk-app-shell')
            ?.shadowRoot?.querySelector('cwk-admin-sidebar')
            ?.shadowRoot?.querySelector('#enableCaching') as HTMLElement
        ).click();
      });

      // Websocket message takes some time
      await aTimeout(50);

      expect(lastWsMsg.type).to.equal('config-updated');

      await page.reload();
      timestamp = await page.evaluate(() => document.getElementById('unixTimestamp')?.innerText);
      timestamps.push(timestamp);

      timestamp = await page.evaluate(() => document.getElementById('unixTimestamp')?.innerText);
      timestamps.push(timestamp);

      timestamp = await page.evaluate(() => document.getElementById('unixTimestamp')?.innerText);
      timestamps.push(timestamp);

      // First two timestamps, cache was still off
      expect(timestamps[0]).to.not.equal(timestamps[1]);
      expect(timestamps[1]).to.not.equal(timestamps[2]);

      // Last 3 timestamps, cache was enabled by admin sidebar
      expect(timestamps[2]).to.equal(timestamps[3]);
      expect(timestamps[2]).to.equal(timestamps[4]);
    }).timeout(testTimeout); // this test gets a little too close to 2000ms... so let's make the limit a bit higher;
  });
});
