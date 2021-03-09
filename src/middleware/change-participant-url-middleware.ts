import { Context, Next } from 'koa';
import { cwkState } from '../utils/CwkStateSingleton';
import { verifyJWT } from '../utils/verifyJWT';

export const changeParticipantUrlMiddleware = (dir: string) => async (
  ctx: Context,
  next: Next,
): Promise<void> => {
  const fromIFrame = ctx.header['sec-fetch-dest'] === 'iframe';

  await next();

  if (ctx.status === 200 && ctx.response.is('html') && !fromIFrame) {
    const { state } = cwkState;
    const authToken = ctx.cookies.get('cwk_auth_token');

    if (authToken) {
      const authed = verifyJWT(dir, authToken, ctx);
      const followModeConnections = state.wsConnections && state.wsConnections['follow-mode'];

      if (
        authed &&
        typeof authed !== 'string' &&
        authed.username === cwkState.state.followModeInitiatedBy
      ) {
        if (
          state.adminConfig &&
          state.adminConfig.followMode &&
          state.wss &&
          state.wsConnections &&
          followModeConnections
        ) {
          // Send URL update message to all connections, which excludes follow mode initiator that changes the url
          // The websocket message is sent before the follow mode intiator has loaded the new page and established a new WS connection
          for (const entry of followModeConnections) {
            const [, connection] = entry;
            connection.send(
              JSON.stringify({
                type: 'update-url',
                data: ctx.url,
                byAdmin: cwkState.state.followModeInitiatedBy,
              }),
            );
          }
        }
      }
    }
    state.previousAdminUrl = ctx.url;
    cwkState.state = state;
  }
};
