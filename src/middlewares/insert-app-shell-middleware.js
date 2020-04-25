import path from 'path';

export function createInsertAppShellMiddleware(appIndex, cwkShell = false) {
  return async function insertAppShellMiddleware(ctx, next) {
    await next();

    const pathRelativeToServer = path.resolve('/', appIndex);
    // Extra check because the url could be ending with / and then we should be serving /index.html
    if (ctx.url === pathRelativeToServer || `${ctx.url}index.html` === pathRelativeToServer) {
      // When in local development, there will not be an install of code-workshop-kit in node modules
      // so we should not insert this script. It will error with status code 500... and crash the app
      // Inserting the app index is handled in the demo folder index file manually.
      if (cwkShell) {
        // Find how deep we are compared to root, -1 to exclude root '/'
        const indexFolderDepth = [...pathRelativeToServer.match(new RegExp('/', 'g'))].length - 1;
        const appShellPath = path.normalize(
          `${'../'.repeat(indexFolderDepth)}./node_modules/code-workshop-kit/components/AppShell.js`
        );

        console.log('appShellPath', appShellPath);

        const appShellScript = `
          <script type="module">
            import '${appShellPath}';
            document.querySelector('body').appendChild(document.createElement('cwk-app-shell'));
          </script>
        `;

        ctx.body = ctx.body.replace('</body>', `${appShellScript}</body>`);
      }
    }
  };
}
