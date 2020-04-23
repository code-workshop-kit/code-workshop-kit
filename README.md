# remote-workshop

Using some es-dev-server and webcomponent magic to create a nice environment for remote frontend workshops.
I am leveraging VS Code Live Share, es-dev-server (+ koa middlewares) and open-wc's create scaffold package, to do this.

The idea is that you set up a Live Share collaboration session with your participants to facilitate the workshop.
The dev-server and its middlewares ensure that each participant gets a scaffolded folder + files that you as a facilitator defined, and through cookies it ensures that only files for the respective participants are loaded, whereas for the host, all files are loaded.

> This package is very much a work in progress. Eventually I want to release it as an NPM package, so there will be no need for cloning this repo.

## Usage

Clone this repo.

Install dependencies (use yarn or npm install)
```sh
yarn
```

Edit the `participants.json` file to have a list of the names of your participants that will be joining for the workshop.

Edit the es-dev-server.config.js if you want to turn off or reconfigure certain middlewares.

Start a VS Code Live Share session, and have your participants join. 

Run the server (use yarn or npm run)
```sh
yarn start
```

Make sure the server (by default localhost:8081) is shared with your participants, so they see the output in their browser

## File permissions

See [VS Code Live Share Security docs](https://docs.microsoft.com/en-us/visualstudio/liveshare/reference/security).

Inside the participants folder is a .vsls.json file, you can use this to gain more control over excluding or including files.
For example, we "unexclude" `index.html`, `index.js` inside the participants folder, because they are common files to be used for participants, but at the root level we want them excluded, since those are used for the workshop environment and not relevant to participants.
