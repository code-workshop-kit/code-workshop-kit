console.log('Hi Joren, welcome to Cool Frontend App!');

class JorenComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h2>Hello, World! :)</h2>';
  }
}

customElements.define('joren-component', JorenComponent);

export default `<joren-component></joren-component>`;
