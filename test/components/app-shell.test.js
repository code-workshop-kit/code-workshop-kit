import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import '../../src/components/AppShell.js';

/**
 * We mock the following things
 * 1) websocket port, which normally would be set by the server middleware
 * 2) workshop import, which normally would be set by the server which knows where the 'dir' is
 */

const workshopImport = '/test/test-utils/workshop-mock/cwk.config.js';

describe('App Shell Component', () => {
  beforeEach(() => {
    document.cookie = `participant_name=Joren;path=/`;
  });

  afterEach(() => {
    document.cookie = 'participant_name=;path=/;max-age=0';
  });

  it('has configurable a title attribute/prop', async () => {
    const el = await fixture(
      html`<cwk-app-shell
        .websocketPort=${5000}
        .workshopImport=${workshopImport}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
        title="Hello, World!"
      ></cwk-app-shell>`,
    );

    expect(el.title).to.equal('Hello, World!');
    expect(el.shadowRoot.querySelector('h1').innerText).to.equal('Hello, World!');
  });

  it('renders cookie selection if no currentParticipantName can be fetched from cookies', async () => {
    const el = await fixture(
      html`<cwk-app-shell
        .workshopImport=${workshopImport}
        .websocketPort=${5000}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
      ></cwk-app-shell>`,
    );
    el.currentParticipantName = null;
    await el.updateComplete;
    expect(el).shadowDom.to.equal(`<cwk-select-cookie></cwk-select-cookie>`);
  });

  it('supports changing name to someone else which will on re-render show the cookie selection again', async () => {
    const el = await fixture(
      html`<cwk-app-shell
        .workshopImport=${workshopImport}
        .websocketPort=${5000}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
      ></cwk-app-shell>`,
    );

    expect(el).shadowDom.to.not.equal(`<cwk-select-cookie></cwk-select-cookie>`);

    el.changeName();
    await el.updateComplete;
    expect(el).shadowDom.to.equal(`<cwk-select-cookie></cwk-select-cookie>`);
  });

  it('can fetch the workshop config if workshopImport is passed, or resolved by server', async () => {
    const el = await fixture(html`
      <cwk-app-shell
        .websocketPort=${5000}
        .workshopImport=${workshopImport}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
      ></cwk-app-shell>
    `);

    const cfg = await el.fetchWorkshopConfig();
    expect(cfg.participants).to.eql(['Joren', 'Felix', 'Alex']);
    expect(cfg.templateData.appTitle).to.equal('Cool Frontend App');
  });

  it('renders a list of participant capsules for all participants', async () => {
    const el = await fixture(html`
      <cwk-app-shell
        .websocketPort=${5000}
        .workshopImport=${workshopImport}
        .participantModuleImport=${'../../test/test-utils/template-modules/string.js'}
      ></cwk-app-shell>
    `);

    await el.fetchConfigComplete;
    await el.updateComplete;
    const capsules = Array.from(el.shadowRoot.querySelectorAll('cwk-participant-frontend-capsule'));

    expect(capsules.length).to.equal(3);
    expect(capsules[0].name).to.equal('Joren');
  });
});
