import { expect, fixture } from '@open-wc/testing';
import { html } from 'lit-html';
import '../../src/components/AdminSidebar.js';

describe('Admin Sidebar Component', () => {
  const websocketPort = 5001;

  it('is closed by default', async () => {
    const el = await fixture(
      html`<cwk-admin-sidebar .websocketPort=${websocketPort}></cwk-admin-sidebar>`,
    );
    expect(el.opened).to.be.false;
  });

  it('can be opened and closed by clicking the menu button', async () => {
    const el = await fixture(
      html`<cwk-admin-sidebar .websocketPort=${websocketPort}></cwk-admin-sidebar>`,
    );

    const openBtn = el.shadowRoot.querySelector('.open-button');
    openBtn.click();

    expect(el.opened).to.be.true;

    await el.updateComplete;
    const closeBtn = el.shadowRoot.querySelector('.close-button');
    closeBtn.click();

    expect(el.opened).to.be.false;
  });

  it('can be toggled programmatically', async () => {
    const el = await fixture(
      html`<cwk-admin-sidebar .websocketPort=${websocketPort}></cwk-admin-sidebar>`,
    );

    expect(el.opened).to.be.false;
    el.toggleUI();
    expect(el.opened).to.be.true;
    el.toggleUI();
    expect(el.opened).to.be.false;
  });
});
