import { html, LitElement } from 'lit-element';

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

  setCookie(e) {
    document.cookie = `participant_name=${e.target.innerText}`;
  }

  render() {
    return html`
      ${this.participants.map(
        name =>
          html`
            <a href="./index.html"
              ><button @click=${this.setCookie}>${name}</button></a
            >
          `,
      )}
    `;
  }
}
customElements.define('select-cookie', SelectCookie);
