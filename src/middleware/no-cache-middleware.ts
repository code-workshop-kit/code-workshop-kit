import { Context, Next } from 'koa';
import { cwkState } from '../utils/CwkStateSingleton';

export const noCacheMiddleware = async (ctx: Context, next: Next): Promise<void> => {
  await next();

  const { adminConfig } = cwkState.state;

  if (adminConfig && !adminConfig.enableCaching) {
    ctx.response.set('cache-control', 'no-store');
  }
};
