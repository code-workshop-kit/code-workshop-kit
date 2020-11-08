import path from 'path';
import fs from 'fs';

export function missingIndexHtmlPlugin(cfg) {
  return {
    name: 'missing-index-html-plugin',
    serve(ctx) {
      let rewrittenBody = ctx.body;

      if (ctx.path.endsWith('/index.html') || ctx.path.endsWith('/')) {
        const normalizedPath = ctx.path.endsWith('/') ? `${ctx.path}index.html` : ctx.path;

        // Case 1: root index.html
        if (
          (cfg.absoluteDir.split(process.cwd())[1] === path.dirname(normalizedPath) ||
            path.dirname(normalizedPath) === '/') &&
          !fs.existsSync(path.resolve(cfg.absoluteDir, 'index.html'))
        ) {
          rewrittenBody = `
            <head>
              <style>
                html, body {
                  padding: 0;
                  margin: 0;
                }
              </style>
            </head>
            <body></body>
          `;
        } else if (
          // Case 2: participant root index.html
          path.posix.resolve(`${cfg.absoluteDir.split(process.cwd())[1]}/`, 'participants') ===
          path.dirname(path.dirname(normalizedPath))
        ) {
          const participantFolder = path.basename(path.dirname(decodeURI(normalizedPath)));

          /**
           * For basic frontend with iframes, don't insert anything.
           *
           * Also don't insert anything if the file already exists
           * Checking for 404 status won't work, as this plugin is ran before static file middleware
           */
          if (
            !(cfg.target === 'frontend' && cfg.targetOptions.mode === 'iframe') &&
            !fs.existsSync(
              path.resolve(cfg.absoluteDir, 'participants', participantFolder, 'index.html'),
            )
          ) {
            rewrittenBody = `
              <head>
                <style>
                  html, body {
                    margin: 0;
                    padding: 0;
                  }
                </style>
              </head>
              <body>
                <script type="module">
                  import { setCapsule } from 'code-workshop-kit/dist/components/setCapsule.js';
                  setCapsule('${participantFolder}', { target: '${cfg.target}' });
                </script>
              </body>
            `;
          }
        }
      }
      return rewrittenBody;
    },
  };
}
