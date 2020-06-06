const {
  puppeteerLauncher,
} = require('web-test-runner/dist/implementations/browser-launchers/puppeteer-launcher.js');

module.exports = {
  browsers: [puppeteerLauncher()],
};
