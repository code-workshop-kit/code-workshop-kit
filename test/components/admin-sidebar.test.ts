import { expect, fixture as _fixture } from '@open-wc/testing';
import { html, TemplateResult } from 'lit-html';
import { AdminSidebar } from '../../src/components/AdminSidebar';
import '../../src/components/cwk-admin-sidebar';

const fixture = _fixture as (arg: TemplateResult) => Promise<AdminSidebar>;

describe('Admin Sidebar Component', () => {
  const websocketPort = 5000;

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

    const openBtn = el.shadowRoot?.querySelector('.open-button') as HTMLElement;
    openBtn.click();

    expect(el.opened).to.be.true;

    await el.updateComplete;
    const closeBtn = el.shadowRoot?.querySelector('.close-button') as HTMLElement;
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
