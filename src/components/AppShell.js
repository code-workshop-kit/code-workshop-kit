import { css, html, LitElement } from 'lit-element';
import './ParticipantCapsule.js';
import './SelectCookie.js';
// Placeholder here, we transform this to resolve to the workshop.js
// in the same folder that the appIndex file is inside of. This is a user-provided file
// eslint-disable-next-line import/no-unresolved
import { workshop } from './workshopImport.js';

class CwkAppShell extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
      }

      .participants-container {
        display: flex;
        flex-wrap: wrap;
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
    document.cookie = 'participant_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    this.currentParticipantName = null;
  }

  render() {
    return html`
      ${this.currentParticipantName
        ? html`
            <button @click=${this.changeName}>Change your name</button>
            <div class="participants-container">
              ${this.participants.map(
                name => html`<cwk-participant-capsule .name="${name}"></cwk-participant-capsule>`,
              )}
            </div>
          `
        : html`<cwk-select-cookie></cwk-select-cookie>`}
    `;
  }
}
customElements.define('cwk-app-shell', CwkAppShell);
