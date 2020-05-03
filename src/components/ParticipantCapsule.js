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
customElements.define('cwk-participant-capsule', ParticipantCapsule);
