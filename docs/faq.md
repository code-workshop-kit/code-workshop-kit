# FAQ

## What if I don't use a JavaScript single entry-point file with a module export

It is also possible to use plain old HTML for your participant workshop and not bother them too much with JavaScript and ES Modules, but in modern frontend most HTML is written inside a JavaScript template language, so a `.js` entrypoint file is pretty common. This is what `module` mode assumes.

If you use plain old vanilla HTML/CSS/JS everywhere, that is fine, but then Hot Module Reload won't work, and you will require your participants to manually reload their page to see their file changes reflected. This is fine of course for beginner workshops :)!
CWK will render the `index.html` through an iframe and not try to load and render `index.js` as a module.

> Please refer to the [demo folder](https://github.com/code-workshop-kit/cwk-frontend/tree/master/demo) which shows both basic and spa (which is module mode).

## I want to use the font of the app shell in my files

In the app shell (main page) it is available and already loaded under the name `Dank mono`.

To see it also in your `index.html` page itself, you may need to load the font first.

Luckily, you can simply reuse the helper that CWK uses for that:

```js
import 'code-workshop-kit/dist/components/loadAndSetDankMonoFont.js';
```

or

```html
<script type="module">
  import 'code-workshop-kit/dist/components/loadAndSetDankMonoFont.js';
</script>
```