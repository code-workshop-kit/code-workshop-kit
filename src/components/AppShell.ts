import { applyPolyfill } from 'custom-elements-hmr-polyfill';
import { css, CSSResult, html, LitElement, PropertyDeclarations } from 'lit-element';
import { nothing, TemplateResult } from 'lit-html';
import { CwkWindow } from '../types/CwkWindow';
import { getParticipantCookie } from './getParticipantCookie';
import { setCustomCSSProps } from './setCustomCSSProps';
import { WorkshopConfig } from '../types/CwkConfig';
import './loadAndSetDankMonoFont';
import './cwk-admin-sidebar';
import './cwk-participant-frontend-capsule';
import './cwk-participant-terminal-capsule';
import './cwk-select-cookie';

setCustomCSSProps();

export class AppShell extends LitElement {
  public mode: 'iframe' | 'module' = 'iframe';

  public target: 'frontend' | 'terminal' = 'frontend';

  public title = '';

  public fetchConfigComplete: Promise<void>;

  public fetchConfigResolve?: () => void;

  public currentParticipantName: string | null = null;

  public workshopImport?: string;

  public workshop?: WorkshopConfig;

  public participants: string[] = [];

  public websocketPort?: number;

  public participantModuleImport?: string;

  static get styles(): CSSResult {
    return css`
      :host {
        display: block;
        height: 100vh;
        background-color: #fcfcfc;
      }

      .header {
        width: 100%;
        display: inline-block;
        margin-bottom: 50px;
      }

      h1 {
        margin-top: 0;
        margin-bottom: 50px;
        text-align: center;
        font-weight: lighter;
      }

      .participants-container {
        margin: 0 30px 30px 30px;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        column-gap: 40px;
        row-gap: 30px;
      }

      .change-name {
        font-family: Dank Mono, sans-serif;
        float: right;
        padding: 8px;
        margin: 15px;
        border: none;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        color: var(--cwk-color-white);
        background: linear-gradient(0.1turn, var(--cwk-color-primary), var(--cwk-color-secondary));
      }

      .current-name {
        float: right;
        padding-top: 5px;
      }

      .change-name:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        transition: all 0.15s ease;
      }

      @media (min-width: 600px) {
        .participants-container {
          grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        }
      }

      @media (min-width: 1200px) {
        .participants-container {
          grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
        }
      }
    `;
  }

  static get properties(): PropertyDeclarations {
    return {
      title: {
        type: String,
        reflect: true,
      },
      participants: {
        attribute: false,
      },
      currentParticipantName: {
        attribute: false,
      },
      mode: {
        type: String,
        reflect: true,
      },
      target: {
        attribute: false,
      },
    };
  }

  constructor() {
    super();
    (window as CwkWindow).HMR_SKIP_DEEP_PATCH = true;
    applyPolyfill();
    setCustomCSSProps();
    this.fetchConfigComplete = new Promise((resolve) => {
      this.fetchConfigResolve = resolve;
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.fetchWorkshopConfig();
    this.currentParticipantName = getParticipantCookie();
  }

  async fetchWorkshopConfig(): Promise<WorkshopConfig | undefined> {
    const workshop = await import(this.workshopImport || 'placeholder-import.js');
    this.workshop = workshop.default;
    if (this.workshop) {
      const { title, participants } = this.workshop;
      this.participants = participants;
      this.title = title || this.title;
    }
    if (this.fetchConfigResolve) {
      this.fetchConfigResolve();
    }
    return this.workshop;
  }

  changeName(): void {
    document.cookie = 'participant_name=;path=/;max-age=0';
    document.cookie = 'cwk_auth_token=;path=/;max-age=0';
    this.currentParticipantName = null;
  }

  render(): TemplateResult {
    return html`
      ${this.currentParticipantName
        ? html`
            <div class="header">
              <cwk-admin-sidebar .websocketPort=${this.websocketPort}></cwk-admin-sidebar>
              <button class="change-name" @click=${this.changeName}>Change your name</button>
              <p class="current-name">Hi ${this.currentParticipantName}!</p>
            </div>

            ${this.title ? html`<h1>${this.title}</h1>` : nothing}

            <div>
              <div class="participants-container">
                ${this.participants
                  ? this.participants.map((name) =>
                      this.target === 'terminal'
                        ? html`<cwk-participant-terminal-capsule
                            .name="${name}"
                          ></cwk-participant-terminal-capsule>`
                        : html`<cwk-participant-frontend-capsule
                            .participantModuleImport=${this.participantModuleImport || ''}
                            .mode=${this.mode}
                            .name="${name}"
                          ></cwk-participant-frontend-capsule>`,
                    )
                  : html``}
              </div>
            </div>
          `
        : html`<cwk-select-cookie
            .workshopImport=${this.workshopImport || ''}
          ></cwk-select-cookie>`}
    `;
  }
}
