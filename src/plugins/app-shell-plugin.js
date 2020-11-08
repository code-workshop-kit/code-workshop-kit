export function appShellPlugin(cfg) {
  return {
    transform(context) {
      let rewrittenBody = context.body;
      if (context.status === 200) {
        // subtract the current working dir from absolute dir to get the dir relative to the server root
        const pathRelativeToServer = cfg.absoluteDir.split(process.cwd())[1];

        // Extra check because the url could be ending with / and then we should be serving /index.html (browser behavior)
        if (
          context.url === `${pathRelativeToServer}/` ||
          context.url === `${pathRelativeToServer}/index.html`
        ) {
          const browserPath = require.resolve('code-workshop-kit/dist/components/AppShell.js');
          const appShellScript = `
            <script type="module">
              import '${browserPath}';
              const cwkAppShell = document.createElement('cwk-app-shell');
              cwkAppShell.title = '${cfg.title}';
              cwkAppShell.target = '${cfg.target || 'frontend'}';
              document.querySelector('body').appendChild(cwkAppShell);
            </script>
          `;

          rewrittenBody = rewrittenBody.replace('</body>', `${appShellScript}</body>`);
        }
      }

      return {
        body: rewrittenBody,
      };
    },
  };
}
