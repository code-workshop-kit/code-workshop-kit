import string from './module.js';

console.log('Joren');

class JorenComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h2>${string}</h2>`;
  }
}
customElements.define('joren-component', JorenComponent);

export default `<joren-component><joren-component>`;
