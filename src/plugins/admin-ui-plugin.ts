import { Plugin } from '@web/dev-server-core';
import { Context } from 'koa';
import { verifyJWT } from '../utils/verifyJWT';

export function adminUIPlugin(dir: string): Plugin {
  return {
    name: 'admin-ui',
    transform(context: Context) {
      let rewrittenBody = context.body as string;
      if (context.path === '/node_modules/code-workshop-kit/dist/components/cwk-admin-sidebar.js') {
        const authToken = context.cookies.get('cwk_auth_token');
        if (!authToken || !verifyJWT(dir, authToken, context)) {
          rewrittenBody = '';
        }
      }
      return { body: rewrittenBody, transformCache: false };
    },
  };
}
