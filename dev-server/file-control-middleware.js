module.exports = function createFileControlMiddleware(ext, { admin = false }) {
  return async function fileControlMiddleware(ctx, next) {
    await next();

    const participantName = ctx.cookies.get('participant_name');

    /**
     * First we check
     * - Whether file is inside /participants/ folder
     * - Whether the file ends with the specified extension (e.g. .json)
     *
     * If that's the case, we check
     * - Whether the file is not inside the participant's folder
     * - Whether the client is not the host of the session (if admin mode is turned on)
     *
     * If that's also the case, we return empty content
     *
     * This is useful if you don't want participants to see output of other participants' code.
     */
    if (
      ctx.url.startsWith('/participants/') &&
      ctx.url.endsWith(ext) &&
      !ctx.url.split('/participants/')[1].startsWith(participantName) &&
      !(admin && ctx.ip === '::1')
    ) {
      // return empty content
      ctx.body = '';
    }
  };
};
