import path from 'path';

const findBrowserPath = appIndex => {
  const absolutePath = require.resolve('code-workshop-kit/dist/components/AppShell.js');

  // Subtract working directory and resolve to root of the es-dev-server
  const componentPath = path.resolve('/', path.relative(process.cwd(), absolutePath));

  // Relative to the appIndex folder (usually root, but can be nested somewhere as well) and resolved again
  let relativeComponentPath = path.relative(
    path.resolve('/', path.dirname(appIndex)),
    componentPath,
  );

  // Check if the relative component path is bare... this can happen with path.relative
  // Then we just assume we can resolve it to root
  if (!relativeComponentPath.startsWith('.') && !relativeComponentPath.startsWith('/')) {
    relativeComponentPath = path.resolve('/', relativeComponentPath);
  }
  // Normalize for Windows
  const normalizedForWindows = relativeComponentPath.replace(
    new RegExp(path.sep === '\\' ? '\\\\' : path.sep, 'g'),
    '/',
  );

  return normalizedForWindows;
};

export function createInsertAppShellMiddleware(appIndex, title) {
  return async function insertAppShellMiddleware(ctx, next) {
    await next();
    if (ctx.status === 200) {
      const pathRelativeToServer = path.resolve('/', appIndex);

      // Extra check because the url could be ending with / and then we should be serving /index.html (browser behavior)
      if (ctx.url === pathRelativeToServer || `${ctx.url}index.html` === pathRelativeToServer) {
        const browserPath = findBrowserPath(appIndex);

        const appShellScript = `
          <script type="module">
            import '${browserPath}';
            const cwkAppShell = document.createElement('cwk-app-shell');
            cwkAppShell.title = '${title}';
            document.querySelector('body').appendChild(cwkAppShell);
          </script>
        `;

        if (typeof ctx.body === 'string') {
          ctx.body = ctx.body.replace('</body>', `${appShellScript}</body>`);
        } else {
          console.warn(
            'CWK Warning: Could not insert app shell because ctx.body is not of type string.',
          );
        }
      }
    }
  };
}
