import _esmRequire from 'esm';
import jwt from 'jsonwebtoken';
import * as _module from 'module';
import { Context } from 'koa';

export const verifyJWT = (
  dir: string,
  authToken: string,
  ctx: Context,
): string | Record<string, unknown> => {
  const _mod = (_module as unknown) as NodeModule;
  const esmRequire = _esmRequire(_mod);
  const workshop = esmRequire(`${dir}/cwk.config.js`).default;

  let authed;
  if (authToken) {
    try {
      authed = jwt.verify(authToken, workshop.appKey) as string | Record<string, unknown>;
    } catch (e) {
      ctx.cookies.set('cwk_auth_token', '', { maxAge: 0 });
      ctx.cookies.set('participant_name', '', { maxAge: 0 });
    }
  }
  return authed || '';
};
