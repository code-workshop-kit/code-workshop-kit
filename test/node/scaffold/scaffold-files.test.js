import { expect } from 'chai';
import fs from 'fs';
import path from 'path';
import rimraf from 'rimraf';
import { scaffoldFiles } from '../../../src/scaffold-files.js';

const timeout = 500;
const aTimeout = t => new Promise(resolve => setTimeout(() => resolve(), t));
const workshopMockPath = './test/test-utils/workshop-mock';

describe('scaffoldFiles', () => {
  beforeEach(() => {});

  afterEach(async () => {
    rimraf(`${workshopMockPath}/participants`, () => {});
    // TODO: we should be able to use the callback function in rimraf so we can await it :)
    await aTimeout(timeout);
  });

  it('uses an input folder and creates an output folder', async () => {
    scaffoldFiles({
      dir: `${workshopMockPath}`,
    });
    await aTimeout(timeout);

    const stats = fs.statSync(path.resolve(process.cwd(), `${workshopMockPath}/participants`));
    expect(stats.isDirectory()).to.be.true;
  });

  it('creates a participant folder with contents for each participant', async () => {
    scaffoldFiles({
      dir: `${workshopMockPath}`,
    });
    await aTimeout(timeout);

    ['Joren', 'Felix', 'Alex'].forEach(participant => {
      const folder = fs.statSync(
        path.resolve(process.cwd(), `${workshopMockPath}/participants/${participant}`),
      );
      const file = fs.statSync(
        path.resolve(process.cwd(), `${workshopMockPath}/participants/${participant}/index.js`),
      );

      expect(folder.isDirectory()).to.be.true;
      expect(file.isFile()).to.be.true;
    });
  });

  it('allows passing a workshop object imperatively instead of looking for it inside dir', async () => {
    scaffoldFiles({
      dir: `${workshopMockPath}`,
      workshop: {
        participants: ['Joren'],
        templateData: {
          appTitle: 'Cool Frontend App',
          participantNameLowercase() {
            return this.participantName.toLowerCase();
          },
          intro() {
            return `Hi ${this.participantName}, welcome to ${this.appTitle}!`;
          },
        },
      },
    });

    await aTimeout(timeout);

    const folder = fs.statSync(
      path.resolve(process.cwd(), `${workshopMockPath}/participants/Joren`),
    );
    const file = fs.statSync(
      path.resolve(process.cwd(), `${workshopMockPath}/participants/Joren/index.js`),
    );

    expect(folder.isDirectory()).to.be.true;
    expect(file.isFile()).to.be.true;

    const getFelixFolder = () =>
      fs.statSync(path.resolve(process.cwd(), `${workshopMockPath}/participants/Felix`));

    expect(getFelixFolder).to.be.throw();
  });

  it('supports using methods and using current participantName inside templateData', async () => {
    scaffoldFiles({
      dir: `${workshopMockPath}`,
    });

    await aTimeout(timeout);

    const file = fs.readFileSync(
      path.resolve(process.cwd(), `${workshopMockPath}/participants/Joren/main.js`),
      'utf8',
    );

    expect(file).to.equal(`console.log(\`Hi joren, welcome to Cool Frontend App!\`);
console.log(\`Hi Joren, welcome to Cool Frontend App!\`);
`);
  });
});
