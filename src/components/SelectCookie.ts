import {
  css,
  html,
  LitElement,
  CSSResult,
  PropertyDeclarations,
  TemplateResult,
} from 'lit-element';
import { CwkDialog } from './CwkDialog';

export class SelectCookie extends LitElement {
  public dialogLoading = true;

  public fetchConfigComplete: Promise<void>;

  public fetchConfigResolve?: () => void;

  public fetchDialogComplete: Promise<void>;

  public fetchDialogResolve?: () => void;

  public participants: string[] = [];

  public workshopImport = '';

  public admins: string[] = [];

  private _noReload = false;

  private resolvePwPromise?: (detail: CustomEvent['detail']) => void;

  static get styles(): CSSResult {
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

  static get properties(): PropertyDeclarations {
    return {
      participants: {
        type: Array,
      },
      dialogLoading: {
        attribute: false,
      },
    };
  }

  constructor() {
    super();
    this.fetchConfigComplete = new Promise((resolve) => {
      this.fetchConfigResolve = resolve;
    });
    this.fetchDialogComplete = new Promise((resolve) => {
      this.fetchDialogResolve = resolve;
    });
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.fetchNames();
    this.fetchDialogComponents();
  }

  async fetchNames(): Promise<string[]> {
    const workshop = await import(this.workshopImport || 'placeholder-import.js');
    this.participants = workshop.default.participants;
    this.admins = workshop.default.admins;
    if (this.fetchConfigResolve) {
      this.fetchConfigResolve();
    }
    return this.participants;
  }

  animateDone(): Promise<void> {
    return new Promise((resolve) => {
      const checkmark = this.shadowRoot?.querySelector('svg');
      if (checkmark) {
        checkmark.style.display = 'block';
      }
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  }

  async setCookie(e: Event): Promise<void> {
    const { target: _t } = e;
    const target = _t as HTMLElement;
    const participant = target.innerText;
    let isAdmin = false;
    let providedPw;

    const changeCookie = async (
      _target: HTMLElement,
      _participant: string,
      _authToken?: string,
    ) => {
      _target.setAttribute('selected', '');
      document.cookie = `participant_name=${_participant};path=/`;
      if (_authToken) {
        document.cookie = `cwk_auth_token=${_authToken};path=/`;
      }
      await this.animateDone();
      if (!this._noReload) {
        window.location.reload();
      }
    };

    if (this.admins && this.admins.includes(participant)) {
      isAdmin = true;
    }

    if (!isAdmin) {
      changeCookie(target, participant);
    } else {
      const confirmDialog = this.shadowRoot?.querySelector('cwk-dialog') as CwkDialog;
      confirmDialog.opened = true;

      const receivePw = (pwEvent: Event) => {
        pwEvent.stopPropagation();
        if (this.resolvePwPromise) {
          this.resolvePwPromise((pwEvent as CustomEvent).detail as string);
        }
        this.removeEventListener('cwk-confirm-pw', receivePw);
      };
      this.addEventListener('cwk-confirm-pw', receivePw);

      providedPw = (await new Promise((resolve) => {
        this.resolvePwPromise = resolve;
      })) as string;
    }

    if (isAdmin && typeof providedPw === 'string') {
      // verify pw and store token
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'cwk-admin-password': providedPw,
          'cwk-user': participant,
        },
      });

      if (response.status === 200) {
        const result = await response.json();
        const authToken = result.token;
        changeCookie(target, participant, authToken);
      }
    }
  }

  // Fetch these components after first render
  // So that we don't load them unnecessarily if component is loaded but not rendered,
  // and don't make it block first paint..
  async fetchDialogComponents(): Promise<void> {
    // TODO: Look into TSC to see if we can make these paths somehow
    // resolvable
    /* eslint-disable import/no-unresolved */
    await import('./cwk-dialog-content.js');
    await import('./cwk-dialog.js');
    /* eslint-enable import/no-unresolved */

    this.dialogLoading = false;
    await this.updateComplete;
    if (this.fetchDialogResolve) {
      this.fetchDialogResolve();
    }
  }

  render(): TemplateResult {
    return html`
      <div class="wrapper">
        <h1>Who are you?</h1>
        ${this.dialogLoading
          ? ''
          : html`
              <cwk-dialog>
                <cwk-dialog-content slot="content"></cwk-dialog-content>
              </cwk-dialog>
            `}
        <ul class="name__list">
          ${this.participants
            ? this.participants.map(
                (name) =>
                  html`<li class="name__item" @keydown=${this.setCookie} @click=${this.setCookie}>
                    ${name}
                  </li>`,
              )
            : html``}
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
