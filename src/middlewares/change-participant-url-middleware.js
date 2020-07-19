import { cwkState } from '../utils/CwkStateSingleton.js';
import { verifyJWT } from '../utils/verifyJWT.js';

export const changeParticipantUrlMiddleware = dir => async (ctx, next) => {
  const fromIFrame = ctx.header['sec-fetch-dest'] === 'iframe';

  await next();

  if (ctx.status === 200 && ctx.response.is('html') && !fromIFrame) {
    const { state } = cwkState;
    const authToken = ctx.cookies.get('cwk_auth_token');
    const authed = verifyJWT(dir, authToken, ctx);

    if (authed && authed.username === cwkState.state.followModeInitiatedBy) {
      if (state.adminConfig.followMode && state.wss && state.wsConnections) {
        // Send URL update message to all connections, which excludes follow mode initiator that changes the url
        // The websocket message is sent before the follow mode intiator has loaded the new page and established a new WS connection
        for (const entry of state.wsConnections) {
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

    state.previousAdminUrl = ctx.url;
    cwkState.state = state;
  }
};
