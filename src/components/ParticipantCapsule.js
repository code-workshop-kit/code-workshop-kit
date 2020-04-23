import { css, html, LitElement } from 'lit-element';

class ParticipantCapsule extends LitElement {
  static get properties() {
    return {
      name: {
        type: String,
        reflect: true,
      },
    };
  }

  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        margin: 10px 50px;
      }

      iframe {
        width: calc(33vw - 110px);
        height: calc(50vh - 110px);
        overflow: auto;
        border: none;
        border: 2px solid black;
        box-sizing: border-box;
      }

      .button__fullscreen {
        position: absolute;
        right: 0;
        color: white;
        background-color: black;
        border: none;
        padding: 5px;
      }
    `;
  }

  get participantIndexHtmlPath() {
    return `./participants/${this.name}/index.html`;
  }

  render() {
    return html`
      <h2>${this.name.charAt(0).toUpperCase() + this.name.slice(1)}</h2>
      <iframe id="${this.name}" allow="fullscreen" src="${this.participantIndexHtmlPath}"></iframe>
      <a href="${this.participantIndexHtmlPath}">
        <button @click=${this.goFullscreen} class="button__fullscreen">
          View
        </button>
      </a>
    `;
  }
}
customElements.define('participant-capsule', ParticipantCapsule);
