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
      }

      .container {
        border-radius: 4px;
        box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.4);
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      h2 {
        padding-left: 20px;
        margin: 10px 0;
        font-weight: lighter;
      }

      .header a {
        margin-right: 20px;
      }

      iframe {
        min-width: 300px;
        width: 100%;
        height: 400px;
        overflow: auto;
        border: none;
      }

      .button__fullscreen {
        font-family: Dank mono, sans-serif;
        color: white;
        background: linear-gradient(0.1turn, var(--cwk-color-primary), var(--cwk-color-secondary));
        border: none;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
        padding: 5px 15px;
        border-radius: 4px;
      }

      .button__fullscreen:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
        transition: all 0.15s ease;
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
      <div class="container">
        <div class="header">
          <h2>${this.name}</h2>
          <a href="${this.participantIndexHtmlPath}">
            <button class="button__fullscreen">
              View
            </button>
          </a>
        </div>
        <iframe
          id="${this.name}"
          allow="fullscreen"
          src="${this.participantIndexHtmlPath}"
        ></iframe>
      </div>
    `;
  }
}
customElements.define('cwk-participant-capsule', ParticipantCapsule);
