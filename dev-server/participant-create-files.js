const path = require('path');
const fs = require('fs');
const glob = require('glob');
const { readFileFromPath, writeFileToPathOnDisk } = require('@open-wc/create/dist/core.js');
const workshop = require('../workshop.js');

// Fork from @open-wc/create to allow functions that return strings inside data obj
function processTemplate(_fileContent, data = {}) {
  let fileContent = _fileContent;

  Object.keys(data).forEach(key => {
    let replacement = data[key];
    if (typeof data[key] === 'function') {
      replacement = data[key]();
    }
    fileContent = fileContent.replace(new RegExp(`<%= ${key} %>`, 'g'), replacement);
  });
  return fileContent;
}

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

function createParticipantFiles(data, opts) {
  const { participants, templateData } = data;
  participants.forEach(name => {
    copyTemplates('template/**/*', path.resolve(process.cwd(), `./participants/${name}`), {
      participantName: name,
      ...templateData,
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

async function createParticipantFilesMiddleware({ override = false }) {
  createParticipantFiles(workshop, { override });
}

module.exports = createParticipantFilesMiddleware;
