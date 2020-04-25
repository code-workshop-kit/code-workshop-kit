import { html, LitElement } from 'lit-element';
// Placeholder here, will transform this to resolve to the workshop.js
// in the same folder that the appIndex file is inside of. This is a user-provided file
// eslint-disable-next-line import/no-unresolved
import { workshop } from './workshopImport.js';

const setCookie = e => {
  document.cookie = `participant_name=${e.target.innerText}`;
};

class CwkSelectCookie extends LitElement {
  static get properties() {
    return {
      participants: {
        type: Array,
      },
    };
  }

  connectedCallback() {
    super.connectedCallback();
    this.fetchNames();
  }

  async fetchNames() {
    const { participants } = workshop;
    this.participants = participants;
  }

  render() {
    return html`
      ${this.participants.map(
        name => html`<a href="./index.html"><button @click=${setCookie}>${name}</button></a>`
      )}
    `;
  }
}
customElements.define('cwk-select-cookie', CwkSelectCookie);
