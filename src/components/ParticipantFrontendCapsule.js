import { css, html, TemplateResult } from 'lit-element';
import { render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ParticipantCapsule } from './ParticipantCapsule.js';

class ParticipantFrontendCapsule extends ParticipantCapsule {
  static get properties() {
    return {
      mode: {
        type: String,
        reflect: true,
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
    return [super.styles, css``];
  }

  constructor() {
    super();
    this.loading = true;
  }

  async _fetchParticipantModule(timestamp) {
    this.loadingComplete = new Promise(resolve => {
      this.__loadingResolve = resolve;
    });

    if (this.mode === 'module') {
      try {
        const participantModule = await import(
          this.participantModuleImport ||
            `%dir%/participants/${this.name}/index.js${timestamp ? `?mtime=${timestamp}` : ''}`
        );
        this.participantTemplate = participantModule.default;
      } catch (e) {
        console.error(e);
      }

      if (this.participantTemplate === undefined) {
        this.participantTemplate = `
          <h3 style="font-family: Dank Mono, sans-serif; font-weight: lighter">
            🚧 No default export with template or DOM node found in your index.js 🚧
          </h3>
        `;
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
        JSON.stringify({
          type: 'authenticate',
          participant: this._getParticipantCookie(),
          username: this.name,
          feature: 'reload-module',
        }),
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
    super.connectedCallback();
    this._fetchParticipantModule();
    this.loadingComplete.then(() => {
      if (this.participantTemplate) {
        this.setupWs();
      }
    });
  }

  get _capsuleTemplate() {
    return html`
      ${super._capsuleTemplate}
      ${this.loading
        ? html`<span>Loading....</span>`
        : html`${this.participantTemplate
            ? html`<div class="participant-content-container">${this.__participantContent}</div>`
            : html`
                <iframe
                  class="participant-content-container"
                  id="${this.name}"
                  allow="fullscreen"
                  src="%dir%/participants/${this.name}/index.html"
                ></iframe>
              `}`}
    `;
  }
}
customElements.define('cwk-participant-frontend-capsule', ParticipantFrontendCapsule);
