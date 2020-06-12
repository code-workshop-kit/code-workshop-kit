import { cwkState } from '../utils/CwkStateSingleton.js';
import { verifyJWT } from '../utils/verifyJWT.js';

export function fileControlPlugin({ exts, rootDir }) {
  return {
    transform(context) {
      let rewrittenBody = context.body;
      const participantName = context.cookies.get('participant_name');
      const authToken = context.cookies.get('cwk_auth_token');
      const authed = verifyJWT(rootDir, authToken);
      const { adminConfig } = cwkState.state;
      /**
       * First we check
       * - status 200
       * - Whether admin config hasn't enabled to always serve all files
       * - Whether file is inside participants folder inside rootDir
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
        context.url.startsWith(`${rootDir}/participants/`) &&
        !context.url.split(`${rootDir}/participants/`)[1].startsWith(participantName) &&
        !(authed && adminConfig.enableAdmin)
      ) {
        const fileExt = context.url.substring(context.url.lastIndexOf('.') + 1, context.url.length);
        exts.forEach(ext => {
          if (ext === fileExt) {
            rewrittenBody = '<body></body>';
          }
        });
      }

      return { body: rewrittenBody, transformCache: false };
    },
  };
}
