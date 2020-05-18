import path from 'path';

export function workshopImportPlugin(rootDir) {
  return {
    transform(context) {
      let rewrittenBody = context.body;
      if (context.status === 200) {
        if (
          context.path === '/node_modules/code-workshop-kit/dist/components/SelectCookie.js' ||
          context.path === '/node_modules/code-workshop-kit/dist/components/AppShell.js'
        ) {
          rewrittenBody = rewrittenBody.replace(
            new RegExp('./workshopImport.js', 'g'),
            path.resolve('/', `${rootDir}/workshop.js`),
          );
        }
      }
      return { body: rewrittenBody };
    },
  };
}
