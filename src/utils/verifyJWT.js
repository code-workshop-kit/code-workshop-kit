import _esmRequire from 'esm';
import jwt from 'jsonwebtoken';
import * as module from 'module';
import path from 'path';

export const verifyJWT = (rootDir, authToken) => {
  const workshopFolder = path.resolve(process.cwd(), `.${rootDir}`);
  const esmRequire = _esmRequire(module);
  const { workshop } = esmRequire(`${workshopFolder}/workshop.js`);

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
