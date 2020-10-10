import path from 'path';

export const missingIndexHtmlMiddleware = (dir, target, mode) => {
  return async (ctx, next) => {
    let rewrittenBody = ctx.body;
    const participantName = ctx.cookies.get('participant_name');

    if (
      (ctx.path.endsWith('/index.html') || ctx.path.endsWith('/')) &&
      ctx.status === 404 &&
      participantName
    ) {
      const normalizedPath = ctx.path.endsWith('/') ? `${ctx.path}index.html` : ctx.path;

      // root index.html
      if (dir.split(process.cwd())[1] === path.dirname(normalizedPath)) {
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
        ctx.body = rewrittenBody;
        ctx.status = 200;
      } else if (
        // participant root index.html
        path.resolve(dir.split(process.cwd())[1], 'participants') ===
        path.dirname(path.dirname(normalizedPath))
      ) {
        // for basic frontend with iframes, don't insert anything
        if (!(target === 'frontend' && mode === 'iframe')) {
          const participantFolder = path.basename(path.dirname(normalizedPath));
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
                setCapsule('${participantFolder}', { target: '${target}' });
              </script>
            </body>
          `;
          ctx.body = rewrittenBody;
          ctx.status = 200;
        }
      }
    }

    await next();
  };
};
