import { css, html, LitElement } from 'lit-element';
import './AdminSidebar.js';
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
      }

      .app-container {
        display: flex;
      }

      .participants-container {
        margin-top: 20px;
        display: flex;
        flex-wrap: wrap;
      }

      .change-name {
        position: absolute;
        right: 50%;
        transform: translateX(50%);
        padding: 5px;
        margin: 5px;
      }
    `;
  }

  static get properties() {
    return {
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
  }

  getParticipantName() {
    const allCookies = document.cookie
      .split(';')
      .map(cookie => ({ [cookie.split('=')[0]]: cookie.split('=')[1] }));

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
            <div class="app-container">
              <cwk-admin-sidebar></cwk-admin-sidebar>
              <div>
                <button class="change-name" @click=${this.changeName}>Change your name</button>
                <div class="participants-container">
                  ${this.participants.map(
                    name =>
                      html`<cwk-participant-capsule .name="${name}"></cwk-participant-capsule>`,
                  )}
                </div>
              </div>
            </div>
          `
        : html`<cwk-select-cookie></cwk-select-cookie>`}
    `;
  }
}
customElements.define('cwk-app-shell', AppShell);
