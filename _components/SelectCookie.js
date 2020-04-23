import { html, LitElement } from 'lit-element';

const setCookie = e => {
  document.cookie = `participant_name=${e.target.innerText}`;
};

class SelectCookie extends LitElement {
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
    const { participants } = await (await fetch('./participants.json')).json();
    this.participants = participants;
  }

  render() {
    return html`
      ${this.participants.map(
        name =>
          html`
            <a href="./index.html"><button @click=${setCookie}>${name}</button></a>
          `,
      )}
    `;
  }
}
customElements.define('select-cookie', SelectCookie);
