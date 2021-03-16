import { applyPolyfill } from 'custom-elements-hmr-polyfill';
import { setCustomCSSProps } from './setCustomCSSProps';
import { ParticipantCapsule } from './ParticipantCapsule';
import { ParticipantFrontendCapsule } from './ParticipantFrontendCapsule';
import { CwkWindow } from '../types/CwkWindow';
import './cwk-participant-terminal-capsule';
import './cwk-participant-frontend-capsule';

export const setCapsule = (
  name: string,
  opts: { module: boolean; target: 'frontend' | 'terminal' },
): void => {
  const { module = true, target = 'frontend' } = opts;
  setCustomCSSProps();

  if (target === 'frontend') {
    (window as CwkWindow).HMR_SKIP_DEEP_PATCH = true;
    applyPolyfill();
  }

  if (target === 'terminal') {
    document.body.style.setProperty('margin', '20px');
  }

  const capsule = document.createElement(`cwk-participant-${target}-capsule`) as ParticipantCapsule;
  capsule.name = name;
  capsule.noHeader = true;
  capsule.noContainer = true;
  if (capsule instanceof ParticipantFrontendCapsule) {
    capsule.mode = module ? 'module' : 'iframe';
  }
  document.body.appendChild(capsule);
};
