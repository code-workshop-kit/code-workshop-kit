import {
  css,
  CSSResultArray,
  html,
  PropertyDeclarations,
  PropertyValues,
  TemplateResult,
} from 'lit-element';
import { ParticipantCapsule } from './ParticipantCapsule';
import { getParticipantCookie } from './getParticipantCookie';

export class ParticipantTerminalCapsule extends ParticipantCapsule {
  public inputDisabled = true;

  static get properties(): PropertyDeclarations {
    return { inputDisabled: { attribute: false } };
  }

  static get styles(): CSSResultArray {
    return [
      super.styles,
      css`
        :host {
          --input-form-offset: 0;
          --terminal-entries-offset: 70px;
        }

        .entry {
          margin: 0;
        }

        .entry--error {
          background-color: #ffdada;
        }

        .participant-content-container {
          position: relative;
          overflow: hidden;
        }

        .participant-terminal-entries {
          overflow-y: auto;
          margin-top: 40px;
          height: calc(100% - var(--terminal-entries-offset));
        }

        .participant-terminal-input-container {
          display: flex;
          position: absolute;
          bottom: var(--input-form-offset);
        }

        .terminal-input-form {
          margin: 0;
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

  connectedCallback(): void {
    super.connectedCallback();
    this.setupWs();
  }

  updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('noContainer')) {
      if (this.noContainer) {
        this.style.setProperty('--input-form-offset', '40px');
        this.style.setProperty('--terminal-entries-offset', '120px');
      } else {
        this.style.setProperty('--input-form-offset', '0');
        this.style.setProperty('--terminal-entries-offset', '70px');
      }
    }
  }

  setupWs(): void {
    // %websocketport% gets replaced by CWK server
    this.ws = new WebSocket(`ws://localhost:${this.websocketPort || '%websocketport%'}/wds`);

    this.ws.addEventListener('open', () => {
      if (this.ws) {
        this.ws.send(
          JSON.stringify({
            type: 'authenticate',
            participant: getParticipantCookie(),
            username: this.name,
            feature: 'terminal-process',
          }),
        );
      }
    });

    this.ws.addEventListener('message', (e) => {
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

  get _capsuleTemplate(): TemplateResult {
    return html`
      ${super._capsuleTemplate}
      <div class="participant-content-container">
        <div class="terminal-buttons">
          <button class="action-button" @click=${this.clearTerminal}>Clear</button>
          <button class="action-button" @click=${this.rerunScript}>Rerun</button>
        </div>
        <div class="participant-terminal-entries"></div>
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

  addEntry(entry: string, type?: string): void {
    if (entry.trim() === '') {
      return;
    }
    const entryNode = document.createElement('p');
    entryNode.innerText = entry;
    entryNode.classList.add('entry');
    if (type === 'terminal-process-error') {
      entryNode.classList.add('entry--error');
    }

    const container = this.shadowRoot?.querySelector('.participant-terminal-entries');
    if (container) {
      container.appendChild(entryNode);
      container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }
  }

  toggleDisabled(state: string): void {
    this.inputDisabled = state === 'disable';
  }

  handleTerminalInput(e: Event): void {
    e.preventDefault();
    const input = (e.target as HTMLElement).querySelector('input');

    if (input) {
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
  }

  clearTerminal(): void {
    const container = this.shadowRoot?.querySelector('.participant-terminal-entries');
    if (container) {
      Array.from(container.children)
        .filter((child) => child.classList.contains('entry'))
        .forEach((child) => child.remove());
    }
  }

  rerunScript(): void {
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
