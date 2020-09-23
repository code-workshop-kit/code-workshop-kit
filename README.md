# code-workshop-kit

[![npm version](https://badge.fury.io/js/code-workshop-kit.svg)](https://badge.fury.io/js/code-workshop-kit)
![Publish NPM](https://github.com/code-workshop-kit/cwk-frontend/workflows/Publish%20NPM/badge.svg)

A **remote workshop environment** for frontend workshops. Get the classroom experience & interaction, in a remote session!

Leveraging Visual Studio Live Share and [es-dev-server](https://www.npmjs.com/package/es-dev-server).

## Features

- 🔨 **Scaffolder**: Generate files for all your participants, from a given template directory.
- 🖥️ **Dev Server**: A development server that can be shared through VS Live Share, to create a *shared output* for your workshop participants. Change config/settings on the fly without having to restart!
- 📟 **Terminal Interaction**: Backend languages supported by porting terminal output and input. Control the script that runs for your participant, which re-runs on file changes.
- 🔒 **Authentication**: Authenticate your participants and workshop admins.
- 👀 **Follow Mode**: Know follow-mode in VS Live Share? Get the same thing but in the browser! Participants will follow you in the browser when you change URLs.
- 🔥 **Hot Module Reload**: Never reload the browser again! If your participants edit their files, their content will reload automatically! Supports custom-elements. (Experimental!)

> 🚧 **Loader**: Load/serve only files that belong to the participant. Currently no proper use case, so this has been removed. Please raise an issue if you need this.

## Usage

> For prerequisites, check out our [prerequisite docs](https://github.com/code-workshop-kit/cwk-frontend/blob/master/docs/prerequisites.md)

Install the package

```sh
npm install code-workshop-kit
```

Or with yarn

```sh
yarn add code-workshop-kit
```

It may make sense to install it globally, so you can run it in any project without needing a `package.json`!

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

> To run a locally installed npm binary (`cwk` in this case), either use `package.json` scripts property, or run it directly using `yarn cwk` or `(npm bin)/cwk`.

## Configuration

First of all, you will need a `cwk.config.js` file in your workshop root directory.

This will need to include a default export which contains a JavaScript Object with configuration options.

Most importantly, you should add the `participants` key which accepts an array of participant names. Also, add a title for you workshop if you like :)!

If you are the host of the workshop, you can add yourself too, this is easy if you want to demonstrate code during your workshop in your own folder.

```js
export default {
  participants: ['Joren', 'Felix'],
  title: 'Frontend Workshop', // Title of the workshop displayed on the main page when launching CWK
  targetOptions: {
    mode: 'module', // default is 'iframe'
  }
}
```

When the target is `'frontend'` which is the default setting meant for frontend workshops, you can choose between `iframe` and `module` mode. `iframe` is the default, but generally speaking `module` is a way better experience, but the prerequisite is that your participant `index.js` contains a default export with an HTML string, DOM Node or similar.

For more information about `mode` option for using `module` and enabling the HMR feature, see [detailed explanation module mode](https://github.com/code-workshop-kit/cwk-frontend/tree/master/docs/module-mode.md)

There are also a lot of other advanced configuration, like adding admins or disaling the CWK app shell altogether. [See full config docs](https://github.com/code-workshop-kit/cwk-frontend/tree/master/docs/config.md)

Backend languages are supported in the sense that you can control the script that is ran in each participant's root folder. This will re-run on file-changes, for example compiling a Java file and executing the binary. The terminal output is displayed for that participant in the app shell, and you can even do terminal input through the app shell. [See how to use terminal target](https://github.com/code-workshop-kit/cwk-frontend/tree/master/docs/terminal.md)

## Scaffolding

Next, you should generate some starting files for your participants in their own dedicated folder, using `templateData`.

This accepts an object which accepts any data which can be used inside your template files to fill in variables.

```js
export default {
  participants: ['Joren', 'Felix'],
  title: 'Frontend Workshop',
  templateData: {
    appTitle: 'Cool Frontend App',
  },
};
```

Create a folder in your project root called `template` and create whatever files you want for your participants. They will be copied to their folder.

You can use templateData as follows, using the special tags `<%=  %>` (spaces are important):

```js
console.log('Hello <%= participantName %>, welcome to <%= appTitle %>!');
```

> Note: participantName is always available by default, it is the current participant name for which we are scaffolding.

Then run:

```sh
cwk scaffold
```

> [More on templating and scaffolds here](https://github.com/code-workshop-kit/cwk-frontend/tree/master/docs/scaffold.md)

## VS Live Share

This project leverages [VS Code Live Share](https://marketplace.visualstudio.com/items?itemName=MS-vsliveshare.vsliveshare) plugin. It allows you collaborate in the VS Code editor, for workshops this is quite handy because you can see what your participants are doing, and do code demonstrations live. It also allows for shared server, meaning you get to share your output with everyone else. By default the CWK server runs on port 8000.

### File permissions

See [VS Code Live Share Security docs](https://docs.microsoft.com/en-us/visualstudio/liveshare/reference/security).

Inside your repo, you should include a .vsls.json file, you can use this to add control over excluding or including files for your participants.

> Important: if you exclude files e.g. your index.html, and you scaffold an index.html for your participants, you will need to add a .vsls.json file inside your participant folder that unexcludes index.html. See the [demo folder](https://github.com/code-workshop-kit/cwk-frontend/tree/master/demo/basic) for example.

## Frequently Asked Questions

Please refer to the [FAQ docs](https://github.com/code-workshop-kit/cwk-frontend/tree/master/docs/faq.md)