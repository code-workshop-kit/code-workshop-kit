import { Context } from 'koa';
import { Plugin } from '@web/dev-server-core';

export function wsPortPlugin(port: number): Plugin {
  return {
    name: 'ws-port',
    transform(context: Context) {
      let rewrittenBody = context.body as string;
      if (
        context.path === '/node_modules/code-workshop-kit/dist/components/AdminSidebar.js' ||
        context.path === '/dist/components/AdminSidebar.js' ||
        context.path ===
          '/node_modules/code-workshop-kit/dist/components/ParticipantFrontendCapsule.js' ||
        context.path === '/dist/components/ParticipantFrontendCapsule.js' ||
        context.path ===
          '/node_modules/code-workshop-kit/dist/components/ParticipantTerminalCapsule.js' ||
        context.path === '/dist/components/ParticipantTerminalCapsule.js'
      ) {
        rewrittenBody = rewrittenBody.replace(new RegExp('%websocketport%', 'g'), `${port}`);
      }
      return { body: rewrittenBody };
    },
  };
}
