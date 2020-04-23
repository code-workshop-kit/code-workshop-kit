import babel from '@babel/core';
import babelWorkshop from './babel-plugin-workshop.js';

export function createBabelWorkshopMiddleware(rootPath) {
  return async function babelWorkshopMiddleware(ctx, next) {
    await next();

    // TODO: Check for existing workshop.js in root folder (appIndex)
    // and throw if it cannot find one. User must provide this.
    // Nice to have: analyze and validate workshop.js structure

    if (
      ctx.url.indexOf('/components/SelectCookie.js') !== -1 ||
      ctx.url.indexOf('/components/AppShell.js') !== -1
    ) {
      ctx.body = babel.transformSync(ctx.body, {
        sourceType: 'module',
        plugins: [[babelWorkshop, { rootPath }]],
      }).code;
    }
  };
}
