import _esmRequire from 'esm';
import jwt from 'jsonwebtoken';
import * as module from 'module';
import path from 'path';

export const verifyJWT = (appIndexDir, authToken) => {
  const workshopFolder = path.resolve(process.cwd(), `.${appIndexDir}`);
  const esmRequire = _esmRequire(module);
  const workshop = esmRequire(`${workshopFolder}/cwk.config.js`).default;

  let authed;
  if (authToken) {
    try {
      authed = jwt.verify(authToken, workshop.appKey);
    } catch (e) {
      // TODO: handle expired?
      throw new Error(e);
    }
  }
  return authed;
};
