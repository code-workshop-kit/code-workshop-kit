import { applyPolyfill } from 'custom-elements-hmr-polyfill';
import './ParticipantFrontendCapsule.js';
import './ParticipantTerminalCapsule.js';
import { setCustomCSSProps } from './setCustomCSSProps.js';

export const setCapsule = (name, { module = true, target = 'frontend' } = {}) => {
  setCustomCSSProps();

  if (target === 'frontend') {
    window.HMR_SKIP_DEEP_PATCH = true;
    applyPolyfill();
  }

  if (target === 'terminal') {
    document.body.style.setProperty('margin', '20px');
  }

  const capsule = document.createElement(`cwk-participant-${target}-capsule`);
  capsule.name = name;
  capsule.noHeader = true;
  capsule.noContainer = true;
  capsule.mode = module ? 'module' : 'iframe';
  document.body.appendChild(capsule);
};
