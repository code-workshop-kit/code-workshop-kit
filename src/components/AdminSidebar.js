import { css, html, LitElement } from 'lit-element';
import { nothing } from 'lit-html';

class AdminSidebar extends LitElement {
  static get properties() {
    return {
      opened: {
        type: Boolean,
        reflect: true,
      },
      options: {},
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        z-index: 1;
        position: absolute;
      }

      .container {
        height: 100vh;
        width: 200px;
        background-color: #efefef;
      }

      .header {
        display: flex;
        align-items: center;
      }

      .header h3 {
        margin: 0;
        display: inline-block;
        text-align: center;
        flex-grow: 1;
      }

      .close-button,
      .open-button {
        margin: 10px 0 10px 10px;
        display: inline-block;
      }

      .content {
        width: 100%;
        margin: 20px auto;
      }

      .options {
        text-align: right;
        margin-right: 15px;
      }

      .input-wrapper {
        display: block;
      }
    `;
  }

  constructor() {
    super();
    this.opened = false;

    this.keyToStrings = {
      enableCaching: 'Caching',
      alwaysServeFiles: 'Always Serve Files',
      enableAdmin: 'Admin Mode',
      followMode: 'Follow Mode',
    };
  }

  connectedCallback() {
    super.connectedCallback();
    // TODO: Port should be taken from the dev server wsPort
    this.setupWs();
  }

  setupWs() {
    this.ws = new WebSocket('ws://localhost:8083');

    this.websocketOpen = new Promise(resolve => {
      this.resolveWebsocketOpen = resolve;
    });

    this.ws.addEventListener('open', () => {
      this.resolveWebsocketOpen();
      this.ws.send(JSON.stringify({ type: 'config-init' }));
    });

    this.ws.addEventListener('message', e => {
      const { type, config } = JSON.parse(e.data);
      if (type === 'config-init') {
        this.options = {
          ...config,
        };
      }
    });
  }

  toggleUI() {
    this.opened = !this.opened;
  }

  async toggleOption(e) {
    const newOpts = this.options;
    newOpts[e.target.getAttribute('id')] = e.target.checked;
    this.options = newOpts;
    // sync to server
    await this.websocketOpen;
    this.ws.send(JSON.stringify({ type: 'config-updated', config: this.options }));
  }

  render() {
    return html`
      ${this.opened ? nothing : html`<div class="open-button" @click=${this.toggleUI}>></div>`}
      ${
        this.opened
          ? html`
              <div class="container">
                <div class="header">
                  <div @click=${this.toggleUI} class="close-button">x</div>
                  <h3>Admin UI</h3>
                </div>
                <div class="content">
                  <div class="options">
                    ${this.options
                      ? html`
                          ${Object.entries(this.options).map(key => {
                            return html`
                              <div class="input-wrapper">
                                <label>${this.keyToStrings[key[0]]}</label>
                                <input
                                  id="${key[0]}"
                                  @click=${this.toggleOption}
                                  type="checkbox"
                                  ?checked=${key[1]}
                                />
                              </div>
                            `;
                          })}
                        `
                      : nothing}
                  </div>
                </div>
              </div>
            `
          : nothing
      }
      </div>
    `;
  }
}
customElements.define('cwk-admin-sidebar', AdminSidebar);
