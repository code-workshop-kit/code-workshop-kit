import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import '../../src/components/ParticipantCapsule.js';

describe('Participant Capsule Component', () => {
  it('displays the name of the participant', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        .participantModuleImport=${'../../test/utils/template-modules/string.js'}
        .websocketPort=${8000}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-capsule>`,
    );

    expect(el.shadowRoot.querySelector('h2').innerText).to.equal('Joren');
  });

  it('tries importing participant index.js as module by default, supports unsafe string', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/utils/template-modules/string.js'}
        mode="module"
      ></cwk-participant-capsule>`,
    );

    // Await loading complete and the consecutive re-render that happens
    await el.loadingComplete;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.participant-content-container').innerText).to.equal(
      'Hello',
    );
  });

  it('renders iframes if module import fails or if mode is set to iframe', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
      ></cwk-participant-capsule>`,
    );

    expect(el.shadowRoot.querySelector('.participant-content-container').tagName).to.equal(
      'IFRAME',
    );
  });

  it('supports DOM Nodes as participant template import', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/utils/template-modules/DOMNode.js'}
        mode="module"
      ></cwk-participant-capsule>`,
    );

    // Await loading complete and the consecutive re-render that happens
    await el.loadingComplete;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.participant-content-container').innerText).to.equal('Hi');
  });

  it('supports Lit TemplateResult as participant template import', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/utils/template-modules/lit.js'}
        mode="module"
      ></cwk-participant-capsule>`,
    );

    // Await loading complete and the consecutive re-render that happens
    await el.loadingComplete;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.participant-content-container').innerText).to.equal('Hoi');
  });

  it('does not render a view button if participantIndexHtmlExists is set to false', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        participant-index-html-exists
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/utils/template-modules/string.js'}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-capsule>`,
    );

    expect(el.shadowRoot.querySelector('.button__fullscreen').innerText).to.equal('View');

    el.participantIndexHtmlExists = false;
    await el.updateComplete;
    expect(el.shadowRoot.querySelector('.button__fullscreen')).to.be.null;
  });

  it('has an error message participant template if the participant module does not exist', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        participant-index-html-exists
        .websocketPort=${8000}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-capsule>`,
    );
    expect(el.participantTemplate).to.equal(
      `
          <h3 style="font-family: Dank Mono, sans-serif; font-weight: lighter">
            🚧 No default export with template or DOM node found in your index.js 🚧
          </h3>
        `,
    );
  });

  it('renders without a container div if no-container is set to true', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        participant-index-html-exists
        no-container
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/utils/template-modules/string.js'}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-capsule>`,
    );
    expect(el.shadowRoot.querySelector('.container')).to.be.null;
  });

  it('renders without a header div if no-header is set to true', async () => {
    const el = await fixture(
      html`<cwk-participant-capsule
        participant-index-html-exists
        no-header
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/utils/template-modules/string.js'}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-capsule>`,
    );
    expect(el.shadowRoot.querySelector('.header')).to.be.null;
  });
});
