const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const glob = require('glob');
const {
  readFileFromPath,
  processTemplate,
  writeFileToPathOnDisk,
} = require('@open-wc/create/dist/core.js');

// Fork from @open-wc/create
// TODO: Use open-wc directly when https://github.com/open-wc/open-wc/pull/1469 is merged
function copyTemplates(fromGlob, toDir = process.cwd(), data = {}) {
  return new Promise(resolve => {
    glob(fromGlob, { dot: true }, (er, files) => {
      const resultFiles = [];
      files.forEach(filePath => {
        if (!fs.lstatSync(filePath).isDirectory()) {
          const fileContent = readFileFromPath(filePath);
          if (fileContent !== false) {
            const processed = processTemplate(fileContent, data);

            // find path write to (force / also on windows)
            const replace = path.join(fromGlob.replace(/\*/g, '')).replace(/\\(?! )/g, '/');
            const toPath = filePath.replace(replace, `${toDir}/`);

            // write file to path?
            resultFiles.push({ toPath, processed });
          }
        }
      });
      resolve(resultFiles);
    });
  });
}

function createParticipantFiles(participants, opts) {
  participants.forEach(name => {
    copyTemplates('templates/**/*', path.resolve(process.cwd(), `./participants/${name}`), {
      participantName: name,
    }).then(files => {
      files.forEach(file => {
        writeFileToPathOnDisk(file.toPath, file.processed, {
          override: opts.override,
          ask: false,
        });
      });
    });
  });
}

async function createParticipantFilesMiddleware(port, { override = false }) {
  const response = await fetch(`http://localhost:${port}/participants.json`);

  if (response.status === 200) {
    const { participants } = await response.json();
    createParticipantFiles(participants, { override });
  }
}

module.exports = createParticipantFilesMiddleware;
