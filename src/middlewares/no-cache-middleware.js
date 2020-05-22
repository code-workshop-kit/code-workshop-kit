import { cwkState } from '../utils/CwkStateSingleton.js';

export const noCacheMiddleware = async (ctx, next) => {
  await next();

  const { adminConfig } = cwkState.state;

  if (adminConfig && !adminConfig.enableCaching) {
    ctx.response.set('cache-control', 'no-store');
  }
};
