import { css, html, LitElement, TemplateResult } from 'lit-element';
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
      participantTemplate: {
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

  get _participantIndexHtmlPath() {
    // Assumes participants folder to be inside the folder which contains app index
    // Create an issue if you need more flexibility here.

    // Take care of implicit index html files.
    // E.g. localhost:8000/demo/demo-nested should return ./demo-nested/participants/name/index.html)
    // whereas localhost:8000/demo/demo-nested/ or localhost:8000/demo/demo-nested/index.html should return ./participants/name/index.html
    // TODO: Check if it's better to transform with nodejs instead of relying on this flaky window.location logic..
    if (!window.location.pathname.endsWith('.html') && !window.location.pathname.endsWith('/')) {
      const folders = window.location.pathname.split('/');
      const lastFolder = folders[folders.length - 1];
      return `./${lastFolder}/participants/${this.name}/index.html`;
    }
    return `./participants/${this.name}/index.html`;
  }

  async _fetchParticipantModule() {
    try {
      const participantModule = await import(`/demo/participants/${this.name}/index.js`);
      this.participantTemplate = participantModule.default;
    } catch (e) {
      //
    }
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this._fetchParticipantModule();
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

  render() {
    // TODO: Support other rendering engines? or let people make their extension app shell / etc.? Probably only React where you have issues..
    return html`
      <div class="container">
        <div class="header">
          <h2 class="header__name">${this.name}</h2>
          ${this.participantIndexHtmlExists
            ? html`<a href="${this._participantIndexHtmlPath}">
                <button class="button__fullscreen">
                  View
                </button>
              </a>`
            : ''}
        </div>
        ${this.participantTemplate
          ? html`<div class="participant-content-container">${this.__participantContent}</div>`
          : html`
              <iframe
                class="participant-content-container"
                id="${this.name}"
                allow="fullscreen"
                src="${this._participantIndexHtmlPath}"
              ></iframe>
            `}
      </div>
    `;
  }
}
customElements.define('cwk-participant-capsule', ParticipantCapsule);
