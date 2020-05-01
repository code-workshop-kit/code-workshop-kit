import { createRequire } from 'module';
import path from 'path';

const require = createRequire(import.meta.url);

const findBrowserPath = appIndex => {
  const absolutePath = require.resolve('code-workshop-kit/src/components/AppShell.js');

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

export function createInsertAppShellMiddleware(appIndex) {
  return async function insertAppShellMiddleware(ctx, next) {
    await next();

    const pathRelativeToServer = path.resolve('/', appIndex);

    // Extra check because the url could be ending with / and then we should be serving /index.html
    // TODO: Support other .html files than `index` (be smart here and use appIndex)
    if (ctx.url === pathRelativeToServer || `${ctx.url}index.html` === pathRelativeToServer) {
      const browserPath = findBrowserPath(appIndex);

      const appShellScript = `
          <script type="module">
            import '${browserPath}';
            document.querySelector('body').appendChild(document.createElement('cwk-app-shell'));
          </script>
        `;

      ctx.body = ctx.body.replace('</body>', `${appShellScript}</body>`);
    }
  };
}
