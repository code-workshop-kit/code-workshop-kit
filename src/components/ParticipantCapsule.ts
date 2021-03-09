import {
  css,
  html,
  LitElement,
  CSSResultArray,
  PropertyDeclarations,
  PropertyValues,
  TemplateResult,
} from 'lit-element';

export class ParticipantCapsule extends LitElement {
  public noHeader = false;

  public noContainer = false;

  public name = '';

  public websocketPort?: number;

  public ws?: WebSocket;

  static get properties(): PropertyDeclarations {
    return {
      name: {
        type: String,
        reflect: true,
      },
      noHeader: {
        type: Boolean,
        reflect: true,
        attribute: 'no-header',
      },
      noContainer: {
        type: Boolean,
        reflect: true,
        attribute: 'no-container',
      },
    };
  }

  static get styles(): CSSResultArray {
    return [
      css`
        :host {
          --container-height: 400px;
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
          font-family: initial;
          min-width: 300px;
          width: 100%;
          height: var(--container-height);
          overflow: auto;
          border: none;
        }

        .action-button {
          font-family: Dank mono, sans-serif;
          color: white;
          background: linear-gradient(
            0.1turn,
            var(--cwk-color-primary),
            var(--cwk-color-secondary)
          );
          border: none;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
          padding: 5px 15px;
          border-radius: 4px;
        }

        .action-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          transition: all 0.15s ease;
        }
      `,
    ];
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('noContainer')) {
      if (this.noContainer) {
        this.style.setProperty('--container-height', '100vh');
      } else {
        this.style.setProperty('--container-height', '400px');
      }
    }
  }

  get _capsuleTemplate(): TemplateResult {
    return html`
      ${this.noHeader
        ? ''
        : html`<div class="header">
            <h2 class="header__name">${this.name}</h2>
            <a href="%dir%/participants/${this.name}/index.html">
              <button class="action-button">View</button>
            </a>
          </div>`}
    `;
  }

  render(): TemplateResult {
    return html`
      ${this.noContainer
        ? html`${this._capsuleTemplate}`
        : html`<div class="container">${this._capsuleTemplate}</div>`}
    `;
  }
}
