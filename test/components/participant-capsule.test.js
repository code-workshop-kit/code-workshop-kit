import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import '../../src/components/ParticipantCapsule.js';

describe('Participant Capsule Component', () => {
  it('it has a getter for the participant index html file path from root of server', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule .name=${'Joren'}></cwk-participant-capsule>`,
    );

    expect(el._participantIndexHtmlPath).to.equal('./participants/Joren/index.html');
  });

  it('displays the name of the participant', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule .name=${'Joren'}></cwk-participant-capsule>`,
    );

    expect(el.shadowRoot.querySelector('h2').innerText).to.equal('Joren');
  });
});
