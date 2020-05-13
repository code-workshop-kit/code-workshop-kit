import { css, html, LitElement } from 'lit-element';
import { nothing } from 'lit-html';
import './AdminSidebar.js';
import './loadAndSetDankMonoFont.js';
import './ParticipantCapsule.js';
import './SelectCookie.js';
// Placeholder here, we transform this to resolve to the workshop.js
// in the rootDir folder. This is a user-provided file
// eslint-disable-next-line import/no-unresolved
import { workshop } from './workshopImport.js';

class AppShell extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        --cwk-color-primary: #4e88c2;
        --cwk-color-secondary: #34618e;
        --cwk-color-white: #ffffff;
        --cwk-color-primary-transparent: #4e88c230;

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
        margin: 0 30px;
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

  static get properties() {
    return {
      title: {
        type: String,
        reflect: true,
      },
      participants: {
        type: Array,
      },
      currentParticipantName: {
        type: String,
      },
    };
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.getParticipants();
    this.getParticipantName();
    if (workshop.title) {
      this.title = workshop.title;
    }
  }

  getParticipantName() {
    const cookiesSplit = document.cookie.split(';');
    const allCookies = cookiesSplit.map(cookie => {
      if (!cookie) {
        return {};
      }
      return { [cookie.split('=')[0].trim()]: cookie.split('=')[1].trim() };
    });

    const participantCookie = allCookies.find(cookie => cookie.participant_name);
    if (participantCookie) {
      this.currentParticipantName = participantCookie.participant_name;
    }
  }

  async getParticipants() {
    const { participants } = workshop;
    this.participants = participants;
  }

  changeName() {
    document.cookie = 'participant_name=;path=/;max-age=0';
    this.currentParticipantName = null;
  }

  render() {
    return html`
      ${this.currentParticipantName
        ? html`
            <div class="header">
              <cwk-admin-sidebar></cwk-admin-sidebar>
              <button class="change-name" @click=${this.changeName}>Change your name</button>
            </div>

            ${this.title ? html`<h1>${this.title}</h1>` : nothing}

            <div>
              <div class="participants-container">
                ${this.participants.map(
                  name => html`<cwk-participant-capsule .name="${name}"></cwk-participant-capsule>`,
                )}
              </div>
            </div>
          `
        : html`<cwk-select-cookie></cwk-select-cookie>`}
    `;
  }
}
customElements.define('cwk-app-shell', AppShell);
