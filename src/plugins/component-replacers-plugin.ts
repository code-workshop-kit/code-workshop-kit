import path from 'path';
import { Context } from 'koa';
import { Plugin } from '@web/dev-server-core';
import { WorkshopConfig } from '../types/CwkConfig';

export function componentReplacersPlugin(cfg: WorkshopConfig): Plugin {
  // subtract the current working dir from absolute dir to get the dir relative to the server root
  const pathRelativeToServer = cfg.absoluteDir.split(process.cwd())[1];
  return {
    name: 'component-replacers',
    transform(context: Context) {
      let rewrittenBody = context.body as string;
      if (context.status === 200) {
        if (
          context.path === '/node_modules/code-workshop-kit/dist/components/SelectCookie.js' ||
          context.path === '/node_modules/code-workshop-kit/dist/components/AppShell.js'
        ) {
          rewrittenBody = rewrittenBody.replace(
            new RegExp('placeholder-import.js', 'g'),
            path.posix.resolve('/', `${pathRelativeToServer}/cwk.config.js`),
          );
        }

        if (
          context.path ===
            '/node_modules/code-workshop-kit/dist/components/ParticipantFrontendCapsule.js' ||
          context.path ===
            '/node_modules/code-workshop-kit/dist/components/ParticipantTerminalCapsule.js' ||
          context.path === '/node_modules/code-workshop-kit/dist/components/ParticipantCapsule.js'
        ) {
          let replacement = `${path.posix.resolve('/', pathRelativeToServer)}`;
          // remove trailing slash
          if (replacement.endsWith('/') || replacement.endsWith('\\')) {
            replacement = replacement.substring(0, replacement.length - 1);
          }
          rewrittenBody = rewrittenBody.replace(new RegExp('%dir%', 'g'), replacement);
        }

        if (context.path === '/node_modules/code-workshop-kit/dist/components/AppShell.js') {
          rewrittenBody = rewrittenBody.replace(
            new RegExp("this.mode = 'iframe';", 'g'),
            `this.mode = '${cfg.targetOptions?.mode || 'iframe'}';`,
          );
        }
      }
      return { body: rewrittenBody };
    },
  };
}
