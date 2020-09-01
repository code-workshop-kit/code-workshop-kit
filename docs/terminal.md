# Terminal

Backend languages are supported by code-workshop-kit even though its primary focus started as frontend.

You can change the `target` of CWK from the default value `frontend` to `terminal`.
This turns the participant's output to displaying the console of that participant's terminal script that is ran in their root folder.
It even allows for typing and entering terminal input.

```js
export default {
  participants: ['Joren', 'Felix'],
  title: 'Backend Workshop', // Title of the workshop displayed on the main page when launching CWK
  target: 'terminal', // default is 'iframe'
  terminalScripit: 'javac Main.java && java Main',
  excludeFromWatch: ['class'],
}
```

Pass the target `terminal` and provide a script that you want to run in each participants root folder, which will re-run on file-changes automatically!

As an example, here's compiling a Java file and executing the binary.

## Index.html entrypoint

You can create an index.html entry point and use the setCapsule util, that way a participant can click `view` on their box and view only their own process.

```html
<head>
  <style>
    body {
      margin: 0;
      padding: 0;
    }
  </style>
</head>
<body>
  <script type="module">
    import { setCapsule } from 'code-workshop-kit/dist/components/setCapsule.js';
    setCapsule('Joren', { target: 'terminal' });
  </script>
</body>
```

Though you would probably replace `'Joren'` with your participantName variable `<%= participantName %>`
