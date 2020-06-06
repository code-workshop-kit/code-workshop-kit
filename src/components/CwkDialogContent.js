import { css, html, LitElement } from 'lit-element';

class CwkDialogContent extends LitElement {
  static get styles() {
    return css`
      .container {
        background-color: var(--cwk-color-white);
        padding: 20px 40px;
        border-radius: 4px;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
      }

      .password-wrapper {
        margin-bottom: 12px;
      }

      .password-wrapper label {
        margin-bottom: 5px;
      }

      .password-wrapper input,
      .password-wrapper label {
        display: block;
      }

      .button-wrapper {
        overflow: hidden;
        width: 140px;
      }

      input {
        width: 132px;
      }

      button {
        font-family: Dank Mono, sans-serif;
        padding: 8px;
        float: right;
        border: none;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.4);
        border-radius: 4px;
        color: var(--cwk-color-white);
        background: linear-gradient(0.1turn, var(--cwk-color-primary), var(--cwk-color-secondary));
      }

      .cancel-btn {
        float: left;
        background: linear-gradient(0.1turn, #2e2e2e, #000000);
      }
    `;
  }

  // eslint-disable-next-line class-methods-use-this
  __onConfirm(e) {
    let pw = '';
    if (e.target.innerText !== 'Cancel') {
      pw = this.shadowRoot.querySelector('input').value;
    }
    this.dispatchEvent(new Event('close-overlay'));
    this.dispatchEvent(new CustomEvent('cwk-confirm-pw', { detail: pw }));
  }

  render() {
    return html`
      <div class="container">
        <div class="password-wrapper">
        <label for="cwkPw">Enter Password</label>
        <input id="cwkPw"></input>
        </div>
        <div class="button-wrapper">
          <button
            @click=${this.__onConfirm}
            class="confirm-btn"
          >Confirm</button>
          <button
            @click=${this.__onConfirm}
            class="cancel-btn"
          >Cancel</button>
        </div>
      </div>
    `;
  }
}
customElements.define('cwk-dialog-content', CwkDialogContent);
