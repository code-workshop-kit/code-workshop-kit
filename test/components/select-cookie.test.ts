import { expect, fixture as _fixture } from '@open-wc/testing';
import { html, TemplateResult } from 'lit-html';
import sinon from 'sinon';
import { SelectCookie } from '../../src/components/SelectCookie';
import '../../src/components/cwk-select-cookie';

const workshopImport = '/test/test-utils/workshop-mock/cwk.config.js';
const workshopAdminImport = '/test/test-utils/fixtures/admins/cwk.config.js';

const fixture = _fixture as (arg: TemplateResult) => Promise<SelectCookie>;

describe('Select Cookie Component', () => {
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
    const spy = sinon.spy(el);
    await el.fetchConfigComplete;

    const felixItem = Array.from(
      el.shadowRoot?.querySelectorAll('.name__item') || [],
    )[1] as HTMLElement;
    felixItem.click();

    expect(spy.setCookie.calledOnce).to.be.true;
  });

  // TODO: mock /api/login and provide the pw, and assert that cookie gets changed..
  it.skip('supports selecting an admin cookie', async () => {
    const el = await fixture(
      html`<cwk-select-cookie
        ._noReload=${true}
        .workshopImport=${workshopAdminImport}
      ></cwk-select-cookie>`,
    );
    await el.fetchConfigComplete;

    const jorenItem = Array.from(
      el.shadowRoot?.querySelectorAll('.name__item') || [],
    )[0] as HTMLElement;

    await el.fetchDialogComplete;
    jorenItem.click();
  });
});
