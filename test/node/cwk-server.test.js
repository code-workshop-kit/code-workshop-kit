import { expect } from 'chai';
import jwt from 'jsonwebtoken';
import fetch from 'node-fetch';
import path from 'path';
import puppeteer from 'puppeteer';
import { startServer } from '../../src/start-server.js';
import { aTimeout } from '../utils/helpers.js';
import { userAgents } from '../utils/user-agents.js';

const hostPort = 5000;
const host = `http://localhost:${hostPort}/`;
const testTimeout = 20000;
const baseCfg = {
  port: hostPort,
  logStartup: false,
  open: false,
};

describe('CWK Server e2e', () => {
  context('', () => {
    let server;
    let wss;
    let browser;

    beforeEach(async () => {});

    afterEach(async () => {
      // This may or may not alleviate premature close in CI?
      await aTimeout(100);
      if (browser) {
        await browser.close();
      }
      if (wss) {
        wss.close();
      }
      if (server) {
        await new Promise(resolve => {
          server.close(() => resolve());
        });
      }
    });

    // smoke test
    it('returns static files', async () => {
      ({ server, wss } = await startServer({
        ...baseCfg,
        appIndex: './test/utils/fixtures/simple/index.html',
        rootDir: path.resolve(__dirname, '../utils', 'fixtures', 'simple'),
      }));

      const response = await fetch(`${host}index.html`, {
        headers: { 'user-agent': userAgents['Chrome 78'] },
      });
      const responseText = await response.text();

      expect(response.status).to.equal(200);
      expect(responseText).to.include('<title>My app</title>');
    }).timeout(testTimeout);

    it('returns Content Hidden body for files that are in other participant folders', async () => {
      ({ server, wss } = await startServer({
        ...baseCfg,
        appIndex: './test/utils/fixtures/simple/index.html',
      }));

      browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(`${host}test/utils/fixtures/simple/participants/Alex/index.html`);
      await page.evaluate(() => {
        document.cookie = `participant_name=Joren;path=/`;
      });
      await page.reload();
      const { content } = await page.evaluate(() => {
        return {
          content: document.body.innerText,
        };
      });

      expect(content).to.equal('🚧 Content hidden 🚧');
    }).timeout(testTimeout);

    it('inserts the app shell component by default', async () => {
      ({ server, wss } = await startServer({
        ...baseCfg,
        appIndex: './test/utils/fixtures/simple/index.html',
      }));

      browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(`${host}test/utils/fixtures/simple/index.html`);

      await page.evaluate(() => {
        document.cookie = `participant_name=Joren;path=/`;
      });
      await page.reload();
      const { tagName } = await page.evaluate(() => {
        return {
          tagName: document.querySelector('cwk-app-shell').tagName,
        };
      });

      expect(tagName).to.equal('CWK-APP-SHELL');
    }).timeout(testTimeout);

    it('applies follow-mode websocket hooks by default', async () => {
      ({ server, wss } = await startServer({
        ...baseCfg,
        appIndex: './test/utils/fixtures/simple/index.html',
      }));

      browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(`${host}test/utils/fixtures/simple/index.html`);
      await page.evaluate(() => {
        document.cookie = `participant_name=Joren;path=/`;
      });
      await page.reload();
      const { url } = await page.evaluate(() => {
        return {
          url: window.__cwkFollowModeWs.url,
        };
      });

      expect(url).to.equal('ws://localhost:5000/');
    }).timeout(testTimeout);

    it('can select admin user using password', async () => {
      ({ server, wss } = await startServer({
        ...baseCfg,
        appIndex: './test/utils/fixtures/admins/index.html',
      }));

      browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(`${host}test/utils/fixtures/admins/index.html`);
      await page.evaluate(async () => {
        const cookieElem = document
          .querySelector('cwk-app-shell')
          .shadowRoot.querySelector('cwk-select-cookie');

        await cookieElem.fetchDialogComplete;
        cookieElem.shadowRoot.querySelector('.name__item').click();
      });

      await aTimeout(100);

      await page.evaluate(() => {
        const dialogContent = document.querySelector('cwk-dialog-content');
        dialogContent.shadowRoot.querySelector('input').value = 'pineapples';
        dialogContent.shadowRoot.querySelector('.confirm-btn').click();
      });

      await aTimeout(3000);

      const { tagName, adminSidebarTagName } = await page.evaluate(() => {
        return {
          tagName: document.querySelector('cwk-app-shell').tagName,
          adminSidebarTagName: document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-admin-sidebar').tagName,
        };
      });

      expect(tagName).to.equal('CWK-APP-SHELL');
      expect(adminSidebarTagName).to.equal('CWK-ADMIN-SIDEBAR');
    }).timeout(testTimeout);

    describe('Admin UI Sidebar', () => {
      it('inserts admin ui sidebar component for admins', async () => {
        ({ server, wss } = await startServer({
          ...baseCfg,
          appIndex: './test/utils/fixtures/admins/index.html',
        }));

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.goto(`${host}test/utils/fixtures/admins/index.html`);

        await page.evaluate(async () => {
          const cookieElem = document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-select-cookie');

          await cookieElem.fetchDialogComplete;
          cookieElem.shadowRoot.querySelector('.name__item').click();
        });

        await aTimeout(100);
        await page.evaluate(() => {
          const dialogContent = document.querySelector('cwk-dialog-content');
          dialogContent.shadowRoot.querySelector('input').value = 'pineapples';
          dialogContent.shadowRoot.querySelector('.confirm-btn').click();
        });

        // animation for cookie selection takes 1000ms and then reloads the page and renders app shell with admin bar
        await aTimeout(3000);
        const { tagName, opened } = await page.evaluate(() => {
          const queryAdminBar = () =>
            document.querySelector('cwk-app-shell').shadowRoot.querySelector('cwk-admin-sidebar');

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
        let lastWsMsg = '';
        ({ server, wss } = await startServer({
          ...baseCfg,
          compatibility:
            'none' /* TODO: Troubleshoot why this test only if compatibility is 'none'... */,
          appIndex: './test/utils/fixtures/admins/index.html',
          plugins: [
            {
              transform(context) {
                let rewrittenBody = context.body;

                if (context.url === '/test/utils/fixtures/admins/index.html') {
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

        wss.on('connection', ws => {
          ws.on('message', message => {
            lastWsMsg = JSON.parse(message);
          });
        });

        browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`${host}test/utils/fixtures/admins/index.html`);

        const timestamps = [];
        let timestamp;

        const token = jwt.sign(
          { username: 'Joren' },
          '(=]#bYS940q)T8S*dX1g;Sey)X3YhN|98B>4hwE:c2ew8QrN3);hQN?x"5#yUS',
          { expiresIn: '12h' },
        );

        timestamp = await page.evaluate(tok => {
          document.cookie = `participant_name=Joren;path=/`;
          document.cookie = `cwk_auth_token=${tok};path=/`;
          return document.getElementById('unixTimestamp').innerText;
        }, token);
        timestamps.push(timestamp);

        await page.reload();

        timestamp = await page.evaluate(() => {
          document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-admin-sidebar')
            .shadowRoot.querySelector('.open-button')
            .click();

          return document.getElementById('unixTimestamp').innerText;
        });
        timestamps.push(timestamp);

        // Websocket config init + rerender takes some time
        await aTimeout(50);

        await page.evaluate(() => {
          document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-admin-sidebar')
            .shadowRoot.querySelector('#enableCaching')
            .click();
        });

        // Websocket message takes some time
        await aTimeout(50);

        expect(lastWsMsg.type).to.equal('config-updated');

        await page.reload();
        timestamp = await page.evaluate(() => {
          return document.getElementById('unixTimestamp').innerText;
        });
        timestamps.push(timestamp);

        timestamp = await page.evaluate(() => {
          return document.getElementById('unixTimestamp').innerText;
        });
        timestamps.push(timestamp);

        timestamp = await page.evaluate(() => {
          return document.getElementById('unixTimestamp').innerText;
        });
        timestamps.push(timestamp);

        // First two timestamps, cache was still off
        expect(timestamps[0]).to.not.equal(timestamps[1]);
        expect(timestamps[1]).to.not.equal(timestamps[2]);

        // Last 3 timestamps, cache was enabled by admin sidebar
        expect(timestamps[2]).to.equal(timestamps[3]);
        expect(timestamps[2]).to.equal(timestamps[4]);
      }).timeout(testTimeout); // this test gets a little too close to 2000ms... so let's make the limit a bit higher;

      it('can disable admin mode ensures only current participant files are loaded', async () => {
        let lastWsMsg = '';
        ({ server, wss } = await startServer({
          ...baseCfg,
          compatibility: 'none',
          appIndex: './test/utils/fixtures/admins/index.html',
        }));

        wss.on('connection', ws => {
          ws.on('message', message => {
            lastWsMsg = JSON.parse(message);
          });
        });

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        let felixCalled = 0;
        page.on('console', msg => {
          if (msg.text() === 'Felix') {
            felixCalled += 1;
          }
        });

        await page.goto(`${host}test/utils/fixtures/admins/index.html`);

        const token = jwt.sign(
          { username: 'Joren' },
          '(=]#bYS940q)T8S*dX1g;Sey)X3YhN|98B>4hwE:c2ew8QrN3);hQN?x"5#yUS',
          { expiresIn: '12h' },
        );
        await page.evaluate(tok => {
          document.cookie = `participant_name=Joren;path=/`;
          document.cookie = `cwk_auth_token=${tok};path=/`;
        }, token);

        await page.reload();
        await aTimeout(100);

        await page.evaluate(() => {
          document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-admin-sidebar')
            .shadowRoot.querySelector('.open-button')
            .click();
        });

        // Websocket config init + rerender takes some time
        await aTimeout(50);

        await page.evaluate(() => {
          document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-admin-sidebar')
            .shadowRoot.querySelector('#enableAdmin')
            .click();
        });

        // Websocket message takes some time
        await aTimeout(50);

        expect(lastWsMsg.type).to.equal('config-updated');

        await page.reload();
        // The first time felix script was called. The second time it wasn't because we disabled adminMode, which means only joren script gets called now
        expect(felixCalled).to.equal(1);
      }).timeout(testTimeout); // this test gets a little too close to 2000ms... so let's make the limit a bit higher;

      it('can enable always serve files which ensures all participant files are loaded', async () => {
        let lastWsMsg = '';
        ({ server, wss } = await startServer({
          ...baseCfg,
          compatibility: 'none',
          appIndex: './test/utils/fixtures/admins/index.html',
        }));

        wss.on('connection', ws => {
          ws.on('message', message => {
            lastWsMsg = JSON.parse(message);
          });
        });

        browser = await puppeteer.launch();
        const page = await browser.newPage();

        let felixCalled = 0;
        page.on('console', msg => {
          if (msg.text() === 'Felix') {
            felixCalled += 1;
          }
        });

        await page.goto(`${host}test/utils/fixtures/admins/index.html`);

        const token = jwt.sign(
          { username: 'Joren' },
          '(=]#bYS940q)T8S*dX1g;Sey)X3YhN|98B>4hwE:c2ew8QrN3);hQN?x"5#yUS',
          { expiresIn: '12h' },
        );
        await page.evaluate(tok => {
          document.cookie = `participant_name=Joren;path=/`;
          document.cookie = `cwk_auth_token=${tok};path=/`;
        }, token);
        await page.reload();
        await aTimeout(300);
        expect(felixCalled).to.equal(1);
        await page.evaluate(() => {
          document.cookie = 'participant_name=;path=/;max-age=0';
          document.cookie = `cwk_auth_token=;path=/;max-age=0`;
          document.cookie = 'participant_name=Alex;path=/';
        });
        await page.reload();
        await aTimeout(300);
        expect(felixCalled).to.equal(1);
        await page.evaluate(tok => {
          document.cookie = 'participant_name=;path=/;max-age=0';
          document.cookie = 'participant_name=Joren;path=/';
          document.cookie = `cwk_auth_token=${tok};path=/`;
        }, token);
        await page.reload();
        await aTimeout(300);
        expect(felixCalled).to.equal(2);
        await page.evaluate(() => {
          document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-admin-sidebar')
            .shadowRoot.querySelector('.open-button')
            .click();
        });

        // Websocket config init + rerender takes some time
        await aTimeout(50);

        await page.evaluate(() => {
          document
            .querySelector('cwk-app-shell')
            .shadowRoot.querySelector('cwk-admin-sidebar')
            .shadowRoot.querySelector('#alwaysServeFiles')
            .click();
        });

        // Websocket message takes some time
        await aTimeout(50);

        expect(lastWsMsg.type).to.equal('config-updated');

        await page.evaluate(() => {
          document.cookie = 'participant_name=;path=/;max-age=0';
          document.cookie = `cwk_auth_token=;path=/;max-age=0`;
          document.cookie = 'participant_name=Alex;path=/';
        });
        await page.reload();
        await aTimeout(300);

        // The first time felix script was called. The second time it wasn't because we disabled adminMode, which means only joren script gets called now
        expect(felixCalled).to.equal(3);
      }).timeout(testTimeout * 2);
    });
  });
});
