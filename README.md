# code-workshop-kit

Using [es-dev-server](https://github.com/open-wc/open-wc/tree/master/packages/es-dev-server) and Web Component magic to create a nice environment for remote frontend workshops.
Leverage VS Code Live Share, by creating a session with your workshop participants, and adding the port to your cwk server.

The cwk scaffold command ensures that each participant gets a scaffolded folder + files that you as a facilitator defined.

The cwk run command starts a development server for your workshop and through the middlewares and cookies, it ensures that only files for the respective participants are loaded, whereas for the host, all files are loaded.

Make sure the server (by default localhost:8000) is shared with your participants, so they see the output in their browser.

## Usage

> NodeJS version 13 or higher is required. This means that you have to make sure you put `"type":"module"`, in your `package.json` of your module!

Install the package

```sh
yarn add code-workshop-kit
```

Or with npm

```sh
npm install code-workshop-kit
```

Run the cwk executable that is installed in your node_modules .bin folder

### Configuration

First of all, you will need a `workshop.js` file in your project root directory.

This will need to export a `workshop` JavaScript Object with configuration options.

Most important config keys are:

- `participants`, which is an array of participant names that you want to add in your workshop. If you are the host of the workshop, you can add yourself too, this is easy if you want to demonstrate code during your workshop in your own folder
- `templateData`, an object which accepts any data which can be used inside your template files to fill in variables. You can also put methods in here, and you can access other templateData variables through `this` directly.

There is also the special `this.participantName` that can be used, this is the name of the current participant that a file is being scaffolded for.

> Usage of these templateData variables and methods can be found below in the Scaffolding participant files section

```js
export const workshop = {
  // Put your participant names here!
  participants: ['Joren', 'Felix'],

  // Put any data here to be used inside your scaffolding template files
  templateData: {
    // Note: 'participants' key cannot be used inside templateData, because templateData gets flattened
    appTitle: 'Cool Frontend App',

    // It is possible to have dynamic data where you can run JS that returns a String
    participantNameLowercase() {
      // participantName is a special value that represents the name of the current participant
      // that we are scaffolding files for.
      return this.participantName.toLowerCase();
    },

    intro() {
      // participantName is a special value that represents the name of the current participant
      // that we are scaffolding files for.
      return `Hi ${this.participantName}, welcome to ${this.appTitle}!`;
    },
  },
};
```

### Scaffolding participant files

```sh
cwk.mjs scaffold
```

Optionally pass `--force` to override already existing files. Also accepts `--root-dir` to change the location of the scaffold. This is the current working directory by default.

The CLI will look for a `template` folder in the root dir. In this `template` you can put in any files or folders, and they will be copied for each of your participants.

You can create hooks for templateData properties by using the syntax: `<%= myVar %>`. The spaces are important here.

Example templateData:

```js
export const workshop = {
  participants: ['Joren'],

  templateData: {
    appTitle: 'Cool Frontend App',
    intro() {
      return `Hi ${this.participantName}, welcome to ${this.appTitle}!`;
    },
  },
};
```

Example template file:

```js
console.log('<%= intro %>');
```

Which outputs for participant `Joren`:

```js
console.log('Hi Joren, welcome to Cool Frontend App!');
```

### Running the server

```sh
cwk run
```

Which accepts any flag that [es-dev-server](https://github.com/open-wc/open-wc/tree/master/packages/es-dev-server) accepts, and additionally:

- `--without-app-shell`, if passed, will prevent injection of the cwk-shell component into your app index.html file.
- `--always-serve-files`, if passed, will disable the default file control middlewares for `.js` and `.html` files inside participant folders.
  This middleware ensures a participant is only served with their own files inside their own folder, in case you want the hide the output of the other participants.
- `--enable-caching`, if passed, will re-enable the caching of EDS.
  It is by default disabled because it interferes with the file control middlewares which try to conditionally return empty content rather than cached content.
  Additionally, caching is not a great experience during development and debugging, when you are trying to debug an updated response.

Make sure you have some HTML index file. By default the server will look for `./index.html`, but you can override this by passing the `--app-index` flag.

> Note: do not change the root directory (es-dev-server --root-dir flag) if you plan on using the CWK app shell. If you want to insert it into a custom entry file, use --app-index flag.
> The components for this app shell are located inside your node_modules, which the dev server can only access if node_modules is nested somewhere inside the root directory that it serves from.

#### App Shell

The app shell will render an admin UI to toggle settings on the dev server.

It will also render an overview of all the views of your participants through iframes.
In order for this to work properly, make sure to scaffold an `index.html` file for your participants, as the entry point for these iframes.

## Using locally

Clone the repo.

Install dependencies (use yarn or npm install)

```sh
yarn
```

Edit the `participants.json` file to have a list of the names of your participants that will be joining for the workshop.

Edit the es-dev-server.config.js if you want to turn off or reconfigure certain middlewares.

Start a VS Code Live Share session, and have your participants join. 

Run the server (use yarn or npm run):

```sh
yarn start
```

Scaffold files:

```sh
yarn start:scaffold
```

## File permissions

See [VS Code Live Share Security docs](https://docs.microsoft.com/en-us/visualstudio/liveshare/reference/security).

Inside your repo, you should include a .vsls.json file, you can use this to add control over excluding or including files for your participants.

> Important: if you exclude files e.g. your index.html, and you scaffold an index.html for your participants, you will need to add a .vsls.json file inside your participant folder that unexcludes index.html
