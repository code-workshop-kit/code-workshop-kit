console.log('Hi Felix, welcome to Cool Frontend App!');

class FelixComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h2>Hello, World! :)</h2>';
  }
}

customElements.define('felix-component', FelixComponent);

export default `<felix-component></felix-component>`;
