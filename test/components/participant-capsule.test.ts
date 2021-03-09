import { expect, fixture as _fixture } from '@open-wc/testing';
import { html, TemplateResult } from 'lit-html';
import { ParticipantFrontendCapsule } from '../../src/components/ParticipantFrontendCapsule';
import '../../src/components/cwk-participant-frontend-capsule';

const fixture = _fixture as (arg: TemplateResult) => Promise<ParticipantFrontendCapsule>;

describe('Participant Capsule Component', () => {
  it('displays the name of the participant', async () => {
    const el = await fixture(
      html`<cwk-participant-frontend-capsule
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
        .websocketPort=${8000}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-frontend-capsule>`,
    );

    expect(el.shadowRoot?.querySelector('h2')?.innerText).to.equal('Joren');
  });

  it('tries importing participant index.js as module by default, supports unsafe string', async () => {
    const el = await fixture(
      html`<cwk-participant-frontend-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
        mode="module"
      ></cwk-participant-frontend-capsule>`,
    );

    // Await loading complete and the consecutive re-render that happens
    await el.loadingComplete;
    await el.updateComplete;
    expect(
      (el.shadowRoot?.querySelector('.participant-content-container') as HTMLElement).innerText,
    ).to.equal('Hello');
  });

  it('renders iframes if module import fails or if mode is set to iframe', async () => {
    const el = await fixture(
      html`<cwk-participant-frontend-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
      ></cwk-participant-frontend-capsule>`,
    );

    expect(el.shadowRoot?.querySelector('.participant-content-container')?.tagName).to.equal(
      'IFRAME',
    );
  });

  it('supports DOM Nodes as participant template import', async () => {
    const el = await fixture(
      html`<cwk-participant-frontend-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/test-utils/template-modules/DOMNode.js'}
        mode="module"
      ></cwk-participant-frontend-capsule>`,
    );

    // Await loading complete and the consecutive re-render that happens
    await el.loadingComplete;
    await el.updateComplete;
    expect(
      (el.shadowRoot?.querySelector('.participant-content-container') as HTMLElement).innerText,
    ).to.equal('Hi');
  });

  it('supports Lit TemplateResult as participant template import', async () => {
    const el = await fixture(
      html`<cwk-participant-frontend-capsule
        .name=${'Joren'}
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/test-utils/template-modules/lit.js'}
        mode="module"
      ></cwk-participant-frontend-capsule>`,
    );

    // Await loading complete and the consecutive re-render that happens
    await el.loadingComplete;
    await el.updateComplete;
    expect(
      (el.shadowRoot?.querySelector('.participant-content-container') as HTMLElement).innerText,
    ).to.equal('Hoi');
  });

  it('has an error message participant template if the participant module does not exist', async () => {
    const el = await fixture(
      html`<cwk-participant-frontend-capsule
        participant-index-html-exists
        .websocketPort=${8000}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-frontend-capsule>`,
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
      html`<cwk-participant-frontend-capsule
        participant-index-html-exists
        no-container
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-frontend-capsule>`,
    );
    expect(el.shadowRoot?.querySelector('.container')).to.be.null;
  });

  it('renders without a header div if no-header is set to true', async () => {
    const el = await fixture(
      html`<cwk-participant-frontend-capsule
        participant-index-html-exists
        no-header
        .websocketPort=${8000}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
        .name=${'Joren'}
        mode="module"
      ></cwk-participant-frontend-capsule>`,
    );
    expect(el.shadowRoot?.querySelector('.header')).to.be.null;
  });
});
