# Module mode

It is possible to set `mode` to `'module'` in the `cwk.config.js`:

```js
export default {
  participants: ['Joren', 'Felix'],
  title: 'Frontend Workshop',
  targetOptions: {
    mode: 'module',
  },
  templateData: {
    appTitle: 'Cool Frontend App',
  },
};
```

This will enable Hot Module Reload feature, and expect the participant `index.js` to have a default export that is either:

- String, usually you'll want this to be valid HTML
- DOM Node (`document.createElement('div')`)
- TemplateResult (from lit-html):

  ```js
  html`<div></div>`
  ```

> Ultimately, it is `lit-html` that does the rendering work in the CWK app shell, but it's rather easy to create wrappers for other engines. Feel free to create an issue for other framework/library templates, and I'm happy to collaborate to add support!

Example `participants/Joren/index.js`:

```js
class JorenElement extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<h3>Hello, World!</h3>`;
  }
}
customElements.define('joren-element', JorenElement);
export default `<joren-element></joren-element>`;
```

The main benefit of module mode is that the filewatcher will instruct the app to reload the participant default exported module whenever files are changed.
This works recursively in the sense that other imported modules will also be reloaded.
It even works for `custom elements` because the app shell adds a [ponyfill](https://github.com/vegarringdal/custom-elements-hmr-polyfill/) that allows for redefining custom elements to the `Custom Elements Registry`!

Even better, no more iframes! This will help with performance both on the server end, as well as for sharing resources like libraries/frameworks. This is a must if you are doing a workshop where your participants import 3rd party resources.

If a default export is not found, it will render an error.
