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
        top: 0;
        position: absolute;
        left: 0;
      }

      *,
      *:before,
      *:after {
        box-sizing: border-box;
      }

      .container {
        height: 100vh;
        width: 250px;
        background-color: #efefef;
      }

      .header {
        display: flex;
        align-items: center;
      }

      .header h3 {
        margin: 0;
        text-align: center;
        flex-grow: 1;
        font-weight: lighter;
        font-size: 24px;
      }

      .close-button,
      .open-button {
        cursor: pointer;
        width: 30px;
        margin: 20px 0 20px 20px;
        display: inline-block;
      }

      .open-button {
        height: 22.3px;
      }
      .close-button {
        height: 20px;
        padding: 0 5px;
      }

      .content {
        width: 100%;
        margin: 20px auto;
      }

      .options {
        text-align: right;
        margin-right: 15px;
        font-weight: lighter;
        font-size: 18px;
      }

      /* HTML5 Boilerplate accessible hidden styles */
      .cwk-checkbox {
        border: 0;
        clip: rect(0 0 0 0);
        height: 1px;
        margin: -1px;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
      }

      .cwk-checkbox-wrapper {
        margin-bottom: 12px;
      }

      .cwk-checkbox-wrapper input:checked + label > svg {
        height: 14px;
        animation: draw-checkbox ease-in-out 0.2s forwards;
      }

      .cwk-checkbox-wrapper input:checked + label::after {
        background-color: var(--cwk-color-primary);
      }

      .cwk-checkbox-wrapper label:active::after {
        background-color: #e6e6e6;
      }

      .cwk-checkbox-wrapper label {
        line-height: 20px;
        cursor: pointer;
        position: relative;
        font-size: 18px;
      }

      .cwk-checkbox-wrapper label::after {
        content: '';
        height: 20px;
        width: 20px;
        margin-left: 10px;
        float: right;
        border: 2px solid var(--cwk-color-primary);
        border-radius: 3px;
        transition: 0.15s all ease-out;
        margin-top: 2px;
      }

      .cwk-checkbox-wrapper svg {
        stroke: var(--cwk-color-white);
        stroke-width: 5px;
        height: 0;
        width: 14px;
        position: absolute;
        stroke-dasharray: 33;
        right: -27px;
        top: 4.5px;
      }

      @keyframes draw-checkbox {
        0% {
          stroke-dashoffset: 33;
        }
        100% {
          stroke-dashoffset: 0;
        }
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
    this.ws = new WebSocket('ws://localhost:5051');

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
      ${
        this.opened
          ? nothing
          : html`<div class="open-button" @click=${this.toggleUI}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 39 29">
                <path
                  d="M2.5,0h34A2.5,2.5,0,0,1,39,2.5h0A2.5,2.5,0,0,1,36.5,5H2.5A2.5,2.5,0,0,1,0,2.5H0A2.5,2.5,0,0,1,2.5,0Z"
                />
                <path
                  d="M2.5,12h34A2.5,2.5,0,0,1,39,14.5h0A2.5,2.5,0,0,1,36.5,17H2.5A2.5,2.5,0,0,1,0,14.5H0A2.5,2.5,0,0,1,2.5,12Z"
                />
                <path
                  d="M2.5,24h18A2.5,2.5,0,0,1,23,26.5h0A2.5,2.5,0,0,1,20.5,29H2.5A2.5,2.5,0,0,1,0,26.5H0A2.5,2.5,0,0,1,2.5,24Z"
                />
              </svg>
            </div>`
      }
      ${
        this.opened
          ? html`
              <div class="container">
                <div class="header">
                  <div @click=${this.toggleUI} class="close-button">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 29.042 29.042">
                      <path
                        d="M.733,24.774,24.774.732a2.5,2.5,0,0,1,3.536,0h0a2.5,2.5,0,0,1,0,3.536L4.268,28.309a2.5,2.5,0,0,1-3.535,0h0A2.5,2.5,0,0,1,.733,24.774Z"
                      />
                      <path
                        d="M4.268.732,28.309,24.774a2.5,2.5,0,0,1,0,3.536h0a2.5,2.5,0,0,1-3.535,0L.732,4.268a2.5,2.5,0,0,1,0-3.536h0A2.5,2.5,0,0,1,4.268.732Z"
                      />
                    </svg>
                  </div>
                  <h3>Admin UI</h3>
                </div>
                <div class="content">
                  <div class="options">
                    <svg xmlns="http://www.w3.org/2000/svg" style="display: none">
                      <symbol id="cwk-checkmark" viewBox="0 0 24 24">
                        <path
                          stroke-miterlimit="10"
                          fill="none"
                          d="M22.9 3.7l-15.2 16.6-6.6-7.1"
                        ></path>
                      </symbol>
                    </svg>
                    ${this.options
                      ? html`
                          ${Object.entries(this.options).map(key => {
                            return html`
                              <div class="cwk-checkbox-wrapper">
                                <input
                                  ?checked=${key[1]}
                                  id="${key[0]}"
                                  type="checkbox"
                                  @click=${this.toggleOption}
                                  class="cwk-checkbox"
                                />
                                <label for="${key[0]}">
                                  ${this.keyToStrings[key[0]]}
                                  <svg><use xlink:href="#cwk-checkmark" /></svg>
                                </label>
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
