import { transformSync } from '@babel/core';
import crypto from 'crypto';
import fs from 'fs';
import babelPluginAppKey from './babel-plugin-app-key';

export const generateAppKey = (dir: string, len = 28): string => {
  const workshopCfg = `${dir}/cwk.config.js`;
  let key = '';
  if (fs.existsSync(workshopCfg)) {
    key = crypto.randomBytes(len).toString('hex');
    const cfgCode = fs.readFileSync(workshopCfg, 'utf8');

    const newCfgCode = transformSync(cfgCode, {
      plugins: [[babelPluginAppKey, { key }]],
    })?.code;

    if (newCfgCode) {
      fs.writeFileSync(workshopCfg, newCfgCode);
    }
  }
  return key;
};

export const clearAppKey = (dir: string): void => {
  const workshopCfg = `${dir}/cwk.config.js`;
  if (fs.existsSync(workshopCfg)) {
    const cfgCode = fs.readFileSync(workshopCfg, 'utf8');

    const newCfgCode = transformSync(cfgCode, {
      plugins: [[babelPluginAppKey, { clear: true }]],
    })?.code;

    if (newCfgCode) {
      fs.writeFileSync(workshopCfg, newCfgCode);
    }
  }
};
