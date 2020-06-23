import _esmRequire from 'esm';
import jwt from 'jsonwebtoken';
import * as module from 'module';
import path from 'path';

export const verifyJWT = (appIndexDir, authToken, ctx) => {
  const workshopFolder = path.resolve(process.cwd(), `.${appIndexDir}`);
  const esmRequire = _esmRequire(module);
  const workshop = esmRequire(`${workshopFolder}/cwk.config.js`).default;

  let authed;
  if (authToken) {
    try {
      authed = jwt.verify(authToken, workshop.appKey);
    } catch (e) {
      ctx.cookies.set('cwk_auth_token', '', { maxAge: 0 });
      ctx.cookies.set('participant_name', '', { maxAge: 0 });
      return null;
    }
  }
  return authed;
};
