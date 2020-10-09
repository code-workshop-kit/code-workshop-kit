import { expect } from 'chai';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { startServer } from '../../../src/start-server.js';
import { aTimeout } from '../../test-utils/helpers.js';

const hostPort = 5000;
const host = `http://localhost:${hostPort}/`;
const testTimeout = 20000;
const baseCfg = {
  port: hostPort,
  open: false,
};

describe('e2e: Participant Capsule Frontend', () => {
  context('', () => {
    let server;
    let watcher;
    let browser;

    beforeEach(async () => {});

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

    it('makes use of HMR when a participant file changes, which supports nested modules and custom elements', async () => {
      ({ server, watcher } = await startServer({
        ...baseCfg,
        dir: './test/test-utils/fixtures/simple',
        targetOptions: {
          mode: 'module',
        },
      }));

      browser = await puppeteer.launch();
      const page = await browser.newPage();

      await page.goto(`${host}test/test-utils/fixtures/simple/index.html`);
      await page.evaluate(async () => {
        const cookieElem = document
          .querySelector('cwk-app-shell')
          .shadowRoot.querySelector('cwk-select-cookie');

        await cookieElem.fetchDialogComplete;
        cookieElem.shadowRoot.querySelector('.name__item').click();
      });

      await aTimeout(6000);

      let headingText = await page.evaluate(async () => {
        const jorenCapsule = document
          .querySelector('cwk-app-shell')
          .shadowRoot.querySelector('cwk-participant-frontend-capsule');

        return jorenCapsule.shadowRoot.querySelector('joren-component').innerText;
      });

      expect(headingText).to.equal('Hello, World!');

      const jorenIndexFile = path.resolve(
        process.cwd(),
        path.join('test', 'test-utils', 'fixtures', 'simple', 'participants', 'Joren', 'module.js'),
      );

      if (fs.existsSync(jorenIndexFile)) {
        const content = fs
          .readFileSync(jorenIndexFile, 'utf8')
          .replace('Hello, World!', 'Hi, Planet!');
        fs.writeFileSync(jorenIndexFile, content, 'utf8');
      }

      // small timeout to make the module reload :)
      await aTimeout(200);

      headingText = await page.evaluate(async () => {
        const jorenCapsule = document
          .querySelector('cwk-app-shell')
          .shadowRoot.querySelector('cwk-participant-frontend-capsule');

        return jorenCapsule.shadowRoot.querySelector('joren-component').innerText;
      });

      expect(headingText).to.equal('Hi, Planet!');

      if (fs.existsSync(jorenIndexFile)) {
        const content = fs
          .readFileSync(jorenIndexFile, 'utf8')
          .replace('Hi, Planet!', 'Hello, World!');
        fs.writeFileSync(jorenIndexFile, content, 'utf8');
      }
    }).timeout(testTimeout);
  });
});
