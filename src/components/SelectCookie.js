import { css, html, LitElement } from 'lit-element';
// Placeholder here, will transform this to resolve to the workshop.js
// in the rootDir folder. This is a user-provided file
// eslint-disable-next-line import/no-unresolved
import { workshop } from './workshopImport.js';

class SelectCookie extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        text-align: center;
      }

      .wrapper {
        padding-top: 50px;
        display: inline-block;
      }

      h1 {
        margin-bottom: 100px;
      }

      .name__list {
        max-height: 333px;
        overflow: auto;
        padding: 0;
        text-align: left;
        list-style: none;
        width: 400px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
        border-radius: 4px;
      }

      .name__item {
        padding: 15px;
      }

      .name__item:hover,
      .name__item[selected] {
        cursor: pointer;
        background-color: var(--cwk-color-primary-transparent);
      }

      svg {
        display: none;
        width: 50px;
        margin: 100px auto;
      }

      .checkmark {
        stroke-dashoffset: 120;
        stroke-dasharray: 120;
        animation: dash 0.6s forwards;
      }

      #stop-color-1 {
        stop-color: var(--cwk-color-primary);
      }

      #stop-color-2 {
        stop-color: var(--cwk-color-secondary);
      }

      @keyframes dash {
        0% {
          stroke-dashoffset: 120;
        }
        100% {
          stroke-dashoffset: 0;
        }
      }
    `;
  }

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

  animateDone() {
    return new Promise(resolve => {
      const checkmark = this.shadowRoot.querySelector('svg');
      checkmark.style.display = 'block';
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  async setCookie(e) {
    e.target.setAttribute('selected', true);
    document.cookie = `participant_name=${e.target.innerText};path=/`;
    await this.animateDone();
    window.location.reload();
  }

  render() {
    return html`
      <div class="wrapper">
        <h1>Who are you?</h1>
        <ul class="name__list">
          ${this.participants.map(
            name => html`<li class="name__item" @click=${this.setCookie}>${name}</li>`,
          )}
        </ul>
        <svg
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          viewBox="0 0 90 80"
        >
          <defs>
            <linearGradient id="gradient" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop id="stop-color-1" offset="0%" />
              <stop id="stop-color-2" offset="100%" />
            </linearGradient>
          </defs>
          <path
            class="checkmark"
            fill="none"
            stroke="url(#gradient)"
            stroke-width="16"
            d="M7,40L35,68L82,10"
          />
        </svg>
      </div>
    `;
  }
}
customElements.define('cwk-select-cookie', SelectCookie);
