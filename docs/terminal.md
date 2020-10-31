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
    excludeFromWatch: ['**/*.class'],
  },
}
```

Pass the target `terminal` and provide a script command that you want to run in each participants root folder, which will re-run on file-changes automatically!

You can optionally turn off the auto-reload, and let your users control when the script is reran.

You can also exclude files from being watched, e.g. Java `.class` files, since you don't want your compiled output "file-changes" to re-compile output and end in an infinite loop.
It accepts an array of glob patterns and starts the glob search from the participant root folder.

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

## Advanced script

It is possible to pass dynamic arguments to your `cmd` by providing a function that returns a string instead of just providing a string.

```js
export default {
  participants: ['Joren', 'Felix'],
  targetOptions: {
    cmd: (name, index) => {
      if (index < 10) {
        index = `0${index}`;
      }
      return `web-dev-server --port 90${index}`
    },
  },
}
```

In the parameters, the participant name and index are passed in case you need those.
This may be useful, for example if your command actually needs the participant name or the participant index (as counted from 0, referencing the `participants` array in your `cwk.config.js`).

For example, if your participants are starting a process on a certain port which has to be unique, in the above snippet.

> Note: If you have your participants starting a process on ports, you will also need to add those ports to your Live Share session's shared servers, otherwise only the host has access. This has to be done manually.

Another example is when you need to pass in a randomly generated number that is different on each reload.
I don't expect many people will actually need this, but this is something I ran into myself so I added it.
