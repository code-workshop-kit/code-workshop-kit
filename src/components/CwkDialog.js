import { LionDialog } from '@lion/dialog';

class CwkDialog extends LionDialog {
  __onConfirm(e) {
    this.dispatchEvent(
      new CustomEvent('cwk-confirm-pw', { detail: e.detail, bubbles: true, composed: true }),
    );
  }

  connectedCallback() {
    if (super.connectedCallback) {
      super.connectedCallback();
    }
    this.__boundConfirm = this.__onConfirm.bind(this);
    this._overlayContentNode.addEventListener('cwk-confirm-pw', this.__boundConfirm);
  }

  disconnectedCallback() {
    if (super.disconnectedCallback) {
      super.disconnectedCallback();
    }
    this._overlayContentNode.removeEventListener('cwk-confirm-pw', this.__boundConfirm);
  }
}
customElements.define('cwk-dialog', CwkDialog);
