import { cwkState } from '../CwkStateSingleton.js';

export function createFileControlMiddleware({ ext, admin = false, rootDir }) {
  return async function fileControlMiddleware(ctx, next) {
    await next();
    const participantName = ctx.cookies.get('participant_name');
    const { adminConfig } = cwkState.state;
    /**
     * First we check
     * - Whether admin config hasn't enabled to always serve all files
     * - Whether file is inside participants folder inside rootDir
     * - Whether the file ends with the specified extension (e.g. .json)
     *
     * If that's the case, we check
     * - Whether the file is not inside the current participant's folder
     * - Whether the client is not the host of the session (if admin mode is turned on)
     *
     * If that's also the case, we return empty content
     *
     * This is useful if you don't want participants to see output of other participants' code.
     */
    if (
      !adminConfig.alwaysServeFiles &&
      ctx.status === 200 &&
      ctx.url.startsWith(`${rootDir}/participants/`) &&
      ctx.url.endsWith(ext) &&
      !ctx.url.split(`${rootDir}/participants/`)[1].startsWith(participantName) &&
      !(ctx.ip === '::1' && admin && adminConfig.enableAdmin)
    ) {
      // return empty content
      ctx.body = '';
    }
  };
}
