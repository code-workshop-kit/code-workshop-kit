console.log('<%= intro %>');

class <%= participantName %>Component extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<h2>Hello, World! :)</h2>';
  }
}

customElements.define('<%= participantNameLowercase %>-component', <%= participantName %>Component);

export default `<<%= participantNameLowercase %>-component></<%= participantNameLowercase %>-component>`;
