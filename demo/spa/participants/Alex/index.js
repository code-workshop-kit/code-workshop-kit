console.log('Hi Alex, welcome to Cool Frontend App!');

class AlexComponent extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h2>Hello, World! :)</h2>';
  }
}

customElements.define('alex-component', AlexComponent);

export default `<alex-component></alex-component>`;
