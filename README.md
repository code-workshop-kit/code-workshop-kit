# code-workshop-kit

[![npm version](https://badge.fury.io/js/code-workshop-kit.svg)](https://badge.fury.io/js/code-workshop-kit)
![Publish NPM](https://github.com/code-workshop-kit/cwk-frontend/workflows/Publish%20NPM/badge.svg)

A **remote workshop environment** for frontend workshops. Get the classroom experience & interaction, in a remote session!

Leveraging Visual Studio Live Share and [es-dev-server](https://www.npmjs.com/package/es-dev-server).

## Features

- 🔨 **Scaffolder**: Generate files for all your participants, from a given template directory.
- 🖥️ **Dev Server**: A development server that can be shared through VS Live Share, to create a *shared output* for your workshop participants. Change config/settings on the fly without having to restart!
- 🔒 **Authentication**: Authenticate your participants and workshop admins.
- 🚧 **Loader**: Load only files that belong to the participant. So you don't get your output bloated by your peers' console logs.
- 👀 **Follow Mode**: Know follow-mode in VS Live Share? Get the same thing but in the browser! Participants will follow you in the browser when you change URLs.
- 🔥 **Hot Module Reload**: Never reload the browser again! If your participants edit their files, their content will reload automatically! Supports custom-elements. (Experimental!)

## Usage

Install the package

```sh
yarn add code-workshop-kit
```

Or with npm

```sh
npm install code-workshop-kit
```

It may make sense to install it globally, so you can run it in any project without needing a package.json!

### Run it

> You will need a configuration file first, see [Configuration](https://github.com/code-workshop-kit/cwk-frontend#configuration)

Scaffolder:

```sh
cwk scaffold
```

Server:

```sh
cwk run
```

If you have admins, generate an app key for JWT authentication first:

```sh
cwk generate-key
```

> To run a locally installed npm binary (cwk in this case), either use package.json scripts property, or run it directly using `yarn cwk` or `(npm bin)/cwk`.

## Configuration

First of all, you will need a `cwk.config.js` file in your workshop root directory.

This will need to include a default export which contains a JavaScript Object with configuration options.

### Participants

Most importantly, you should add the `participants` key which accepts an array of participant names. Also, add a title for you workshop if you like :)!

```js
export default {
  participants: ['Joren', 'Felix'],
  title: 'Frontend Workshop', // Title of the workshop displayed on the main page when launching CWK
}
```

If you are the host of the workshop, you can add yourself too, this is easy if you want to demonstrate code during your workshop in your own folder.

### Scaffolding data

If you want to generate some starting files for your participants in their own dedicated folder, use `templateData`.

This accepts an object which accepts any data which can be used inside your template files to fill in variables. You can also put methods in here, and you can access other templateData variables through `this` directly.

There is also the special `this.participantName` that can be used, this is the name of the current participant that a file is being scaffolded for.

Small note: templateData properties get flattened to the same level as `participants` property, so be careful of duplicate keys.

```js
export default {
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

> More on how to use this `templateData` further down in the Scaffold section.

### Admins configuration

You can also add `admins`, `adminPassword`, and `appKey`, to add admin users and authentication inside your workshop environment.

This will allow admins to control some of the server's settings live, on the fly! It also allows the usage of in-browser follow mode, which mimicks VS Code Live Share's follow feature.

```js
export default {
  participants: ['Joren', 'Felix'],
  admins: ['Joren'],
  adminPassword: 'pineapples',
  appKey: 'some-secret-key-here',
};
```

You can generate an app key which places it automatically for you.

```sh
yarn cwk generate-key
```

### Advanced server config

Below there are some more configuration settings for cwk that you can specify.

```js
export default {
  withoutAppShell: true, // Will not insert CWK app shell, disables most CWK features. Default false
  enableCaching: true, // Will re-enable browser caching, discouraged for workshops, and can break some of the CWK features like the file loader
  alwaysServeFiles: true, // overrides the file loader to always serve files to everyone
  usingParticipantIframes: true, // if you don't use module exports for your participants index.js file and use index.html instead, set this to true. Helps prevent duplicate console logs because app shell is trying to import the file as a module and additionally also loads it through iframe.
  participantIndexHtmlExists: false, // Set this to false if there's no index.html for the participants. Will remove the "View" button in the participant views, because there is nothing to href to.
};
```

The boolean settings are all false by default, which is the encouraged setting.

## Scaffolding participant files

```sh
yarn cwk scaffold
```

This will accept a `--dir` flag if you want to pass a different directly than the current working directory that you run it from.

It expects a `cwk.config.js` file inside this directory, as well as a folder called `template` which is where you will store the file system that you want to scaffold for your participants.

Optionally pass `--force` to override already existing participant files.

You can create hooks for templateData properties by using the syntax: `<%= myVar %>`. The spaces are important here.

Example templateData:

```js
export default {
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

## Recommended scaffold

The CWK app shell will render an overview of all the views of your participants.

It is recommended to scaffold:

- An `index.js` file in the root of the participant folder; the main entrypoint.
- An `index.html` file in the root of the participant folder, to render and view the main entrypoint on its own.

`index.js`

```js
export default `<p>Hello World!</p>`;
```

This means that the app shell will load this file as a module, and render the HTML string. This allows for the HMR (Hot Module Reload) feature to work, and means that whenever the file is changed, or other `.js` files that are imported, that the app shell will reload the module and re-render automatically.

The following exports are supported:

- String, just a JavaScript string that has (unsanitized) html in it
- DOM Node/Element, will simply be appended and rendered that way
- TemplateResult from `lit-html`

Ultimately, it is `lit-html` that does the rendering work in the CWK app shell, but it's rather easy to create wrappers for other engines. Feel free to create an issue for other framework/library templates, and I'm happy to collaborate to add support!

If you want your users to also be able to click on "View" for their own page, you need an `index.html` entrypoint as well.

`index.html`

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
    setCapsule('Joren');
  </script>
</body>
```

This `setCapsule` helper imports the `index.js` for `Joren` and sets it in a capsule which enables the HMR feature, in a custom-elements friendly way as well.

If you don't scaffold an `index.html`, you may want to disable `participantIndexHtmlExists` option in `cwk.config.js`, so there's no "View" button that tries to link people to it.

### What if I don't use a JavaScript single entry-point file

It is also possible to use plain old HTML for your participant workshop and not bother them too much with JavaScript, but in modern frontend most HTML is written inside a JavaScript template language, so a `.js` entrypoint file is the default in CWK.

If you use plain old vanilla HTML/CSS/JS everywhere, that is fine, but then Hot Module Reload won't work, and you will require your participants to manually reload their page to see their file changes reflected. This is fine of course for beginner workshops :)!
CWK will render the `index.html` through an iframe and not try to load and render `index.js` as a module. You should enable `usingParticipantIframes` option in `cwk.config.js`.

> In the future, there will be a video showcasing both a super vanilla HTML CSS JS setup where we just use anchors with `href`, as well as a vanilla webcomponent/templating setup which assumes a single JS entrypoint. For now, please refer to the [demo folder](https://github.com/code-workshop-kit/cwk-frontend/tree/master/demo) which shows both.

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

## VS Live Share

This project leverages [VS Code Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare) plugin. It allows you collaborate in the VS Code editor, for workshops this is quite handy because you can see what your participants are doing, and do code demonstrations live. It also allows for shared server, meaning you get to share your output with everyone else. By default the CWK server runs on port 8000.

### File permissions

See [VS Code Live Share Security docs](https://docs.microsoft.com/en-us/visualstudio/liveshare/reference/security).

Inside your repo, you should include a .vsls.json file, you can use this to add control over excluding or including files for your participants.

> Important: if you exclude files e.g. your index.html, and you scaffold an index.html for your participants, you will need to add a .vsls.json file inside your participant folder that unexcludes index.html. See the [demo folder](https://github.com/code-workshop-kit/cwk-frontend/tree/master/demo) for example.
