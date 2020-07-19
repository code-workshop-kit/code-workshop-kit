import { transformSync } from '@babel/core';
import crypto from 'crypto';
import fs from 'fs';
import babelPluginAppKey from './babel-plugin-app-key.js';

export const generateAppKey = (dir, len = 28) => {
  const workshopCfg = `${dir}/cwk.config.js`;
  let key;
  if (fs.existsSync(workshopCfg)) {
    key = crypto.randomBytes(len).toString('hex');
    const cfgCode = fs.readFileSync(workshopCfg, 'utf8');

    const newCfgCode = transformSync(cfgCode, {
      plugins: [[babelPluginAppKey, { key }]],
    }).code;

    fs.writeFileSync(workshopCfg, newCfgCode);
  }
  return key;
};

export const clearAppKey = dir => {
  const workshopCfg = `${dir}/cwk.config.js`;
  if (fs.existsSync(workshopCfg)) {
    const cfgCode = fs.readFileSync(workshopCfg, 'utf8');

    const newCfgCode = transformSync(cfgCode, {
      plugins: [[babelPluginAppKey, { clear: true }]],
    }).code;

    fs.writeFileSync(workshopCfg, newCfgCode);
  }
};
