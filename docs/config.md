# Configuration

This section will explain some more advanced configuration.

## Admins configuration

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
npx cwk generate-key
```

## Advanced server config

Below there are some more configuration settings for cwk that you can specify. Some of these can be changed on the fly in the admin sidebar, if you've got admins enabled.

```js
export default {
  mode: 'module', // if you want to use HMR (Hot Module Reload), set this to module and make sure participant index.js exports a template or DOM node.
};
```

## Directory

There is also a `--dir` flag for all `cwk` CLI commands. This is useful if you have your CWK files in a different directory, for example `demo` or `dist`. Keep in mind however that the folder structure that is  inside `--dir` is the same:

- `cwk.config.js` --> config file CWK
- `template` --> scaffolder input
- `participants/<name>` --> scaffolder output

This is not configurable right now.
