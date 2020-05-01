import path from 'path';

export function createWorkshopImportReplaceMiddleware(rootFolder) {
  return async function workshopImportReplaceMiddleware(ctx, next) {
    await next();

    if (
      ctx.url.indexOf('/components/SelectCookie.js') !== -1 ||
      ctx.url.indexOf('/components/AppShell.js') !== -1
    ) {
      ctx.body = ctx.body.replace(
        new RegExp('./workshopImport.js', 'g'),
        path.resolve('/', `${rootFolder}/workshop.js`),
      );
    }
  };
}
