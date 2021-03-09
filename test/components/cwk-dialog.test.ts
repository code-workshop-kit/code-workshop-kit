import { expect, fixture as _fixture, nextFrame } from '@open-wc/testing';
import { html, TemplateResult } from 'lit-html';
import sinon from 'sinon';
import { CwkDialog } from '../../src/components/CwkDialog';
import '../../src/components/cwk-dialog';
import '../../src/components/cwk-dialog-content';

const fixture = _fixture as (arg: TemplateResult) => Promise<CwkDialog>;

describe('App Shell Component', () => {
  it('has a cancel button which closes the overlay', async () => {
    const el = await fixture(html`
      <cwk-dialog>
        <cwk-dialog-content slot="content"></cwk-dialog-content>
      </cwk-dialog>
    `);

    el.opened = true;
    await el.updateComplete;
    await nextFrame();

    expect(
      // @ts-expect-error accessing protected property for testing purposes
      (el._overlayContentNode?.shadowRoot?.querySelector('.cancel-btn') as HTMLElement).innerText,
    ).to.equal('Cancel');

    // @ts-expect-error accessing protected property for testing purposes
    (el._overlayContentNode.shadowRoot?.querySelector('.cancel-btn') as HTMLElement).click();
    await el.updateComplete;
    // @ts-expect-error accessing protected property for testing purposes
    await el._overlayCtrl._showComplete;
    expect(el.opened).to.be.false;
  });

  it('has a confirm button', async () => {
    const el = await fixture(html`
      <cwk-dialog>
        <cwk-dialog-content slot="content"></cwk-dialog-content>
      </cwk-dialog>
    `);

    el.opened = true;
    await el.updateComplete;
    await nextFrame();

    expect(
      // @ts-expect-error accessing protected property for testing purposes
      (el._overlayContentNode.shadowRoot?.querySelector('.confirm-btn') as HTMLElement).innerText,
    ).to.equal('Confirm');
  });

  it('sends a cwk-confirm-pw event on confirm', async () => {
    const spy = sinon.spy();
    const el = await fixture(html`
      <cwk-dialog @cwk-confirm-pw=${spy}>
        <cwk-dialog-content slot="content"></cwk-dialog-content>
      </cwk-dialog>
    `);

    el.opened = true;
    await el.updateComplete;
    await nextFrame();

    expect(
      // @ts-expect-error accessing protected property for testing purposes
      (el._overlayContentNode.shadowRoot?.querySelector('.confirm-btn') as HTMLElement).innerText,
    ).to.equal('Confirm');

    // @ts-expect-error accessing protected property for testing purposes
    (el._overlayContentNode.shadowRoot?.querySelector('.confirm-btn') as HTMLElement).click();
    await el.updateComplete;
    // @ts-expect-error accessing protected property for testing purposes
    await el._overlayCtrl._showComplete;
    expect(el.opened).to.be.false;
    expect(spy.calledOnce).to.be.true;
  });
});
