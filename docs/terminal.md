# Terminal

Backend languages are supported by code-workshop-kit even though its primary focus started as frontend.

You can change the `target` of CWK from the default value `frontend` to `terminal`.
This turns the participant's output to displaying the console of that participant's terminal script that is ran in their root folder.
It even allows for typing and entering terminal input.

As an example, here's compiling a Java file and executing the binary.

```js
export default {
  participants: ['Joren', 'Felix'],
  title: 'Backend Workshop', // Title of the workshop displayed on the main page when launching CWK
  target: 'terminal', // default is 'frontend',
  targetOptions: {
    cmd: 'javac Main.java && java Main',
    excludeFromWatch: ['class'],
  },
}
```

Pass the target `terminal` and provide a script command that you want to run in each participants root folder, which will re-run on file-changes automatically!

You can optionally turn off the auto-reload, and let your users control when the script is reran.
You can also make the script run from the workshop root folder instead of the participant root folder if you need to.

```js
export default {
  targetOptions: {
    autoReload: false,
    fromParticipantFolder: false,
  },
}
```

> Technically it would be possible to run it from any folder instead of just the two choices that are given, but I don't have a use case yet for this.
> Please raise an issue if you have a use case, and I can make that feature available so that you can pass any path.

## Dynamic args

To be written.

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
