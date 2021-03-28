import { Context } from 'koa';
import { Plugin } from '@web/dev-server-core';
import { WorkshopConfig } from '../types/CwkConfig';

export function appShellPlugin(cfg: WorkshopConfig): Plugin {
  return {
    name: 'app-shell',
    transform(context: Context) {
      let rewrittenBody = context.body as string;
      if (context.status === 200) {
        // subtract the current working dir from absolute dir to get the dir relative to the server root
        const pathRelativeToServer = cfg.absoluteDir.split(process.cwd())[1];

        // Extra check because the url could be ending with / and then we should be serving /index.html (browser behavior)
        if (
          context.url === `${pathRelativeToServer}/` ||
          context.url === `${pathRelativeToServer}/index.html`
        ) {
          const browserPath = require.resolve('code-workshop-kit/cwk-app-shell-define');
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
