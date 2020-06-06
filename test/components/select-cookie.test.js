import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import '../../src/components/SelectCookie.js';

const workshopImport = '/test/utils/workshop-mock/workshop.js';

describe('Select Cookie Component', () => {
  afterEach(() => {
    document.cookie = 'participant_name=;path=/;max-age=0';
  });

  it('it has a method fetchNames that returns participants from the workshop config file', async () => {
    const el = await fixture(
      html`<cwk-select-cookie .workshopImport=${workshopImport}></cwk-select-cookie>`,
    );

    const participants = await el.fetchNames();

    expect(participants).to.eql(['Joren', 'Felix', 'Alex']);
  });

  it('it stores participants from the workshop config file', async () => {
    const el = await fixture(
      html`<cwk-select-cookie .workshopImport=${workshopImport}></cwk-select-cookie>`,
    );

    await el.fetchConfigComplete;

    expect(el.participants).to.eql(['Joren', 'Felix', 'Alex']);
  });

  it('sets cookie when selecting a name', async () => {
    const el = await fixture(
      html`<cwk-select-cookie
        ._noReload=${true}
        .workshopImport=${workshopImport}
      ></cwk-select-cookie>`,
    );
    await el.fetchConfigComplete;

    const felixItem = Array.from(el.shadowRoot.querySelectorAll('.name__item'))[1];

    felixItem.click();

    // check for cookie here
  });
});
