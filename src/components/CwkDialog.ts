import { LionDialog } from '@lion/dialog';

export class CwkDialog extends LionDialog {
  private __boundConfirm?: (e: Event) => void;

  __onConfirm(e: Event): void {
    const _e = e as CustomEvent;
    this.dispatchEvent(
      new CustomEvent('cwk-confirm-pw', { detail: _e.detail, bubbles: true, composed: true }),
    );
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.__boundConfirm = this.__onConfirm.bind(this);
    this._overlayContentNode.addEventListener('cwk-confirm-pw', this.__boundConfirm);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.__boundConfirm) {
      this._overlayContentNode.removeEventListener('cwk-confirm-pw', this.__boundConfirm);
    }
  }
}
