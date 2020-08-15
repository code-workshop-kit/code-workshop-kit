import { applyPolyfill } from 'custom-elements-hmr-polyfill';
import './ParticipantCapsule.js';

export const setCapsule = (name, module = true) => {
  window.HMR_SKIP_DEEP_PATCH = true;
  applyPolyfill();

  const capsule = document.createElement('cwk-participant-capsule');
  capsule.name = name;
  capsule.noHeader = true;
  capsule.noContainer = true;
  capsule.mode = module ? 'module' : 'iframe';
  document.body.appendChild(capsule);
};
