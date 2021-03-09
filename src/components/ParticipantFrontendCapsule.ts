import { css, CSSResultArray, html, PropertyDeclarations, TemplateResult } from 'lit-element';
import { Part, render } from 'lit-html';
import { unsafeHTML } from 'lit-html/directives/unsafe-html.js';
import { ParticipantCapsule } from './ParticipantCapsule';
import { getParticipantCookie } from './getParticipantCookie';

export class ParticipantFrontendCapsule extends ParticipantCapsule {
  public loading = true;

  public mode: 'iframe' | 'module' = 'iframe';

  public participantModuleImport = '';

  public participantTemplate: string | HTMLElement | TemplateResult = '';

  public loadingComplete = new Promise(() => {
    //
  });

  private __loadingResolve?: (value?: unknown) => void;

  static get properties(): PropertyDeclarations {
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

  static get styles(): CSSResultArray {
    return [super.styles, css``];
  }

  async _fetchParticipantModule(timestamp?: number): Promise<void> {
    this.loadingComplete = new Promise((resolve) => {
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

      if (!this.participantTemplate) {
        this.participantTemplate = `
          <h3 style="font-family: Dank Mono, sans-serif; font-weight: lighter">
            🚧 No default export with template or DOM node found in your index.js 🚧
          </h3>
        `;
      }
    }
    this.loading = false;
    if (this.__loadingResolve) {
      this.__loadingResolve();
    }
    const container = this.shadowRoot?.querySelector('.participant-content-container');
    if (timestamp && container) {
      render(html``, container);
      render(html`${this.__participantContent}`, container);
    }
  }

  get __participantContent(): ((part: Part) => void) | HTMLElement | TemplateResult {
    if (
      this.participantTemplate instanceof HTMLElement ||
      this.participantTemplate instanceof TemplateResult
    ) {
      return this.participantTemplate;
    }
    return unsafeHTML(this.participantTemplate);
  }

  setupWs(): void {
    // %websocketport% gets replaced by CWK server
    this.ws = new WebSocket(`ws://localhost:${this.websocketPort || '%websocketport%'}/wds`);

    this.ws.addEventListener('open', () => {
      if (this.ws) {
        this.ws.send(
          JSON.stringify({
            type: 'authenticate',
            participant: getParticipantCookie(),
            username: this.name,
            feature: 'reload-module',
          }),
        );
      }
    });

    this.ws.addEventListener('message', (e) => {
      const { type, name, timestamp } = JSON.parse(e.data);
      if (type === 'reload-module' && name === this.name) {
        this._fetchParticipantModule(timestamp);
      }
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this._fetchParticipantModule();
    this.loadingComplete.then(() => {
      if (this.participantTemplate) {
        this.setupWs();
      }
    });
  }

  get _capsuleTemplate(): TemplateResult {
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
                  title="${this.name}-iframe"
                  allow="fullscreen"
                  src="%dir%/participants/${this.name}/index.html"
                ></iframe>
              `}`}
    `;
  }
}
