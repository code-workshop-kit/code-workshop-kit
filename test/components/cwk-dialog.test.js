import { expect, fixture, nextFrame } from '@open-wc/testing';
import { html } from 'lit-html';
import sinon from 'sinon';
import '../../src/components/CwkDialog.js';
import '../../src/components/CwkDialogContent.js';

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

    expect(el._overlayContentNode.shadowRoot.querySelector('.cancel-btn').innerText).to.equal(
      'Cancel',
    );

    el._overlayContentNode.shadowRoot.querySelector('.cancel-btn').click();
    await el.updateComplete;
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

    expect(el._overlayContentNode.shadowRoot.querySelector('.confirm-btn').innerText).to.equal(
      'Confirm',
    );
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

    expect(el._overlayContentNode.shadowRoot.querySelector('.confirm-btn').innerText).to.equal(
      'Confirm',
    );

    el._overlayContentNode.shadowRoot.querySelector('.confirm-btn').click();
    await el.updateComplete;
    await el._overlayCtrl._showComplete;
    expect(el.opened).to.be.false;
    expect(spy.calledOnce).to.be.true;
  });
});
