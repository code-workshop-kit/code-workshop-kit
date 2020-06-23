import path from 'path';

export function workshopImportPlugin(appIndexDir) {
  return {
    transform(context) {
      let rewrittenBody = context.body;
      if (context.status === 200) {
        if (
          context.path === '/node_modules/code-workshop-kit/dist/components/SelectCookie.js' ||
          context.path === '/node_modules/code-workshop-kit/dist/components/AppShell.js'
        ) {
          rewrittenBody = rewrittenBody.replace(
            new RegExp('placeholder-import.js', 'g'),
            path.resolve('/', `${appIndexDir}/cwk.config.js`),
          );
        }
      }
      return { body: rewrittenBody };
    },
  };
}
