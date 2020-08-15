import path from 'path';

export function componentReplacersPlugin(opts) {
  // subtract the current working dir from absolute dir to get the dir relative to the server root
  const pathRelativeToServer = opts.dir.split(process.cwd())[1];
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
            path.resolve('/', `${pathRelativeToServer}/cwk.config.js`),
          );
        }

        if (
          context.path === '/node_modules/code-workshop-kit/dist/components/ParticipantCapsule.js'
        ) {
          let replacement = `${path.resolve('/', pathRelativeToServer)}`;
          // remove trailing slash
          if (replacement.endsWith('/') || replacement.endsWith('\\')) {
            replacement = replacement.substring(0, replacement.length - 1);
          }
          rewrittenBody = rewrittenBody.replace(new RegExp('%dir%', 'g'), replacement);
        }

        if (context.path === '/node_modules/code-workshop-kit/dist/components/AppShell.js') {
          if (!opts.participantIndexHtmlExists) {
            rewrittenBody = rewrittenBody.replace(
              new RegExp('this.participantIndexHtmlExists = true;', 'g'),
              'this.participantIndexHtmlExists = false;',
            );
          }

          rewrittenBody = rewrittenBody.replace(
            new RegExp("this.mode = 'iframe';", 'g'),
            `this.mode = '${opts.mode}';`,
          );
        }
      }
      return { body: rewrittenBody };
    },
  };
}
