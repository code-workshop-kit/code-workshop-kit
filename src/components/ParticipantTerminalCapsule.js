import { css, html } from 'lit-element';
import { ParticipantCapsule } from './ParticipantCapsule.js';

class ParticipantTerminalCapsule extends ParticipantCapsule {
  static get properties() {
    return { inputDisabled: { attribute: false } };
  }

  static get styles() {
    return [
      super.styles,
      css`
        .entry {
          margin: 0;
        }

        /* Create offset from the clear button */
        .entry:nth-child(2) {
          margin-top: 40px;
        }

        .entry--error {
          background-color: #ffdada;
        }

        .participant-content-container {
          position: relative;
        }

        .participant-terminal-input-container {
          display: flex;
          position: absolute;
          bottom: 0;
        }

        .terminal-input-form label::before {
          content: '⬤';
          color: green;
          margin-right: 5px;
        }

        .terminal-input-form[disabled] label::before {
          color: rgba(0, 0, 0, 0);
        }

        .terminal-buttons {
          position: absolute;
          top: 3px;
        }

        .terminal-buttons > button {
          margin-right: 5px;
        }
      `,
    ];
  }

  constructor() {
    super();
    this.inputDisabled = true;
  }

  connectedCallback() {
    super.connectedCallback();
    this.setupWs();
  }

  setupWs() {
    // %websocketport% gets replaced by CWK server
    this.ws = new WebSocket(`ws://localhost:${this.websocketPort || '%websocketport%'}`);

    this.ws.addEventListener('open', () => {
      this.ws.send(
        JSON.stringify({
          type: 'authenticate',
          participant: this._getParticipantCookie(),
          username: this.name,
          feature: 'terminal-process',
        }),
      );
    });

    this.ws.addEventListener('message', e => {
      const parsedData = JSON.parse(e.data);
      const { type } = parsedData;
      if (type.startsWith('terminal-process')) {
        const { data } = parsedData;
        this.addEntry(data, type);
      }
      if (type.startsWith('terminal-input')) {
        this.toggleDisabled(type.split('terminal-input-')[1]);
      }
    });
  }

  get _capsuleTemplate() {
    return html`
      ${super._capsuleTemplate}
      <div class="participant-content-container">
        <div class="terminal-buttons">
          <button class="action-button" @click=${this.clearTerminal}>Clear</button>
          <button class="action-button" @click=${this.rerunScript}>Rerun</button>
        </div>
        ${this.__participantContent}
        <div class="participant-terminal-input-container">
          <form
            class="terminal-input-form"
            ?disabled=${this.inputDisabled}
            @submit=${this.handleTerminalInput}
          >
            <label for="terminal-input">Terminal Input</label>
            <input id="terminal-input" ?disabled=${this.inputDisabled} />
          </form>
        </div>
      </div>
    `;
  }

  addEntry(entry, type) {
    if (entry.trim() === '') {
      return;
    }
    const entryNode = document.createElement('p');
    entryNode.innerText = entry;
    entryNode.classList.add('entry');
    if (type === 'terminal-process-error') {
      entryNode.classList.add('entry--error');
    }

    const container = this.shadowRoot.querySelector('.participant-terminal-input-container');
    container.insertAdjacentElement('beforebegin', entryNode);
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  }

  toggleDisabled(state) {
    this.inputDisabled = state === 'disable';
  }

  handleTerminalInput(e) {
    e.preventDefault();
    const input = e.target.querySelector('input');
    this.addEntry(input.value);

    if (this.ws) {
      this.ws.send(
        JSON.stringify({
          type: 'terminal-process-input',
          input: input.value,
          participantName: this.name,
        }),
      );
    }
    input.value = '';
  }

  clearTerminal() {
    const container = this.shadowRoot.querySelector('.participant-content-container');
    Array.from(container.children)
      .filter(child => child.classList.contains('entry'))
      .forEach(child => child.remove());
  }

  rerunScript() {
    if (this.ws) {
      this.ws.send(
        JSON.stringify({
          type: 'terminal-rerun',
          participantName: this.name,
        }),
      );
    }
  }
}
customElements.define('cwk-participant-terminal-capsule', ParticipantTerminalCapsule);
