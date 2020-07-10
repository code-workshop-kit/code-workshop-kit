import { css, html, LitElement, TemplateResult } from 'lit-element';
import { render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';

class ParticipantCapsule extends LitElement {
  static get properties() {
    return {
      name: {
        type: String,
        reflect: true,
      },
      participantIndexHtmlExists: {
        type: Boolean,
        reflect: true,
        attribute: 'participant-index-html-exists',
      },
      usingParticipantIframes: {
        type: Boolean,
        reflect: true,
        attribute: 'using-participant-iframes',
      },
      participantTemplate: {
        attribute: false,
      },
      loading: {
        attribute: false,
      },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
      }

      .container {
        padding: 10px 20px;
        border-radius: 4px;
        box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.4);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 5px;
      }

      .header__name {
        margin: 10px 0;
        font-weight: lighter;
      }

      .participant-content-container {
        min-width: 300px;
        width: 100%;
        height: 400px;
        overflow: auto;
        border: none;
      }

      .button__fullscreen {
        font-family: Dank mono, sans-serif;
        color: white;
        background: linear-gradient(0.1turn, var(--cwk-color-primary), var(--cwk-color-secondary));
        border: none;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
        padding: 5px 15px;
        border-radius: 4px;
      }

      .button__fullscreen:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        transition: all 0.15s ease;
      }
    `;
  }

  constructor() {
    super();
    this.loading = true;
  }

  async _fetchParticipantModule(timestamp) {
    this.loadingComplete = new Promise(resolve => {
      this.__loadingResolve = resolve;
    });

    if (!this.usingParticipantIframes) {
      try {
        const participantModule = await import(
          this.participantModuleImport ||
            `/%dir%/participants/${this.name}/index.js${timestamp ? `?mtime=${timestamp}` : ''}`
        );
        this.participantTemplate = participantModule.default;
      } catch (e) {
        throw new Error(e);
      }
    }
    this.loading = false;
    this.__loadingResolve();
    if (timestamp) {
      render(html``, this.shadowRoot.querySelector('.participant-content-container'));
      render(
        html`${this.__participantContent}`,
        this.shadowRoot.querySelector('.participant-content-container'),
      );
    }
  }

  get __participantContent() {
    if (
      this.participantTemplate instanceof HTMLElement ||
      this.participantTemplate instanceof TemplateResult
    ) {
      return this.participantTemplate;
    }
    return unsafeHTML(this.participantTemplate);
  }

  setupWs() {
    // %websocketport% gets replaced by CWK server
    this.ws = new WebSocket(`ws://localhost:${this.websocketPort || '%websocketport%'}`);

    this.ws.addEventListener('open', () => {
      this.ws.send(
        JSON.stringify({ type: 'authenticate', username: this.name, feature: 'reload-module' }),
      );
    });

    this.ws.addEventListener('message', e => {
      const { type, name, timestamp } = JSON.parse(e.data);
      if (type === 'reload-module' && name === this.name) {
        this._fetchParticipantModule(timestamp);
      }
    });
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this._fetchParticipantModule();
    this.loadingComplete.then(() => {
      if (this.participantTemplate) {
        this.setupWs();
      }
    });
  }

  render() {
    // TODO: Support other rendering engines? or let people make their extension app shell / etc.? Probably only React where you have issues..
    return html`
      <div class="container">
        <div class="header">
          <h2 class="header__name">${this.name}</h2>
          ${this.participantIndexHtmlExists
            ? html`<a href="/%dir%/participants/${this.name}/index.html">
                <button class="button__fullscreen">
                  View
                </button>
              </a>`
            : ''}
        </div>
        ${this.loading
          ? html`<span>Loading....</span>`
          : html`${this.participantTemplate
              ? html`<div class="participant-content-container">${this.__participantContent}</div>`
              : html`
                  <iframe
                    class="participant-content-container"
                    id="${this.name}"
                    allow="fullscreen"
                    src="/%dir%/participants/${this.name}/index.html"
                  ></iframe>
                `}`}
      </div>
    `;
  }
}
customElements.define('cwk-participant-capsule', ParticipantCapsule);
