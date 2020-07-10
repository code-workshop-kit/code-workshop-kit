import path from 'path';
import { cwkState } from '../utils/CwkStateSingleton.js';
import { verifyJWT } from '../utils/verifyJWT.js';

export function fileControlPlugin(dir, exts) {
  // subtract the current working dir from absolute dir to get the dir relative to the server root
  const pathRelativeToServer = dir.split(process.cwd())[1];
  return {
    transform(context) {
      let rewrittenBody = context.body;
      const participantName = context.cookies.get('participant_name');
      const authToken = context.cookies.get('cwk_auth_token');
      const authed = verifyJWT(dir, authToken, context);
      const { adminConfig } = cwkState.state;
      /**
       * First we check
       * - status 200
       * - Whether admin config hasn't enabled to always serve all files
       * - Whether file is inside participants folder inside dir
       * - Whether the file is not inside the current participant's folder
       * - Whether the current requester is not the host & admin mode turned on
       *
       * If that's the case, we check
       *
       * - Whether the file ends with the one of the specified extensions (e.g. .json & .js)
       *
       * If that's also the case, we return empty content
       *
       * This is useful if you don't want participants to see output of other participants' code.
       */
      if (
        context.status === 200 &&
        !(adminConfig && adminConfig.alwaysServeFiles) &&
        context.url.startsWith(`${pathRelativeToServer}/participants/`) &&
        !context.url
          .split(`${pathRelativeToServer}/participants/`)[1]
          .startsWith(participantName) &&
        !(authed && adminConfig.enableAdmin)
      ) {
        const fileExt = path.extname(context.url).split('?')[0].replace('.', '');
        exts.forEach(ext => {
          if (ext === fileExt) {
            if (ext === 'html') {
              rewrittenBody = `
                <body style="margin: 0; padding: 0">
                  <h3 style="font-family: Dank Mono, sans-serif; font-weight: lighter">
                    🚧 Content hidden 🚧
                  </h3>
                </body>
              `;
            } else {
              rewrittenBody = ``;
            }
          }
        });
      }

      return { body: rewrittenBody, transformCache: false };
    },
  };
}
