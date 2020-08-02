# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.8.2](https://github.com/code-workshop-kit/cwk-frontend/compare/0.8.1...0.8.2) (2020-08-02)


### Bug Fixes

* generate-key to handle cwk config in root dir properly ([2bccefe](https://github.com/code-workshop-kit/cwk-frontend/commit/2bccefe3259065d8581f7ca914d1398c50be7797))

### [0.8.1](https://github.com/code-workshop-kit/cwk-frontend/compare/0.8.0...0.8.1) (2020-07-19)


### Bug Fixes

* remove trailing slash on dir replacer ([f1f923d](https://github.com/code-workshop-kit/cwk-frontend/commit/f1f923d5f47ebbd5956461e3043a8d3cf5f0cebc))

## [0.8.0](https://github.com/code-workshop-kit/cwk-frontend/compare/0.7.4...0.8.0) (2020-07-19)


### ⚠ BREAKING CHANGES

* removes the flags --without-app-shell, --enable-caching, --always-serve-files, they are available now as options inside cwk.config.js
* For a short time, specifying app-index through appIndex (--app-index) was allowed, but to keep things simple, you are only allowed to specify the directory to run CWK on, which should contain the index.html if you want a CWK App Shell, as well as the cwk.config.js. The option is called 'dir' or --dir in the CLI.
* To keep things simpler, the --output-dir, --input-dir and --config-dir options have been removed from the scaffold command. To keep things simple, just specify --dir to your directory which should contain a template folder, and the output is always a participants folder. This keeps things a lot simpler than they were before, and prevents having to solve a bunch of problems that showed up when this was flexible.
* wsPort option (--ws-port in CLI) is now removed from cwk server (cwk run command)

### Features

* add docs and reduce CLI flags, use cwk instead ([1d5df88](https://github.com/code-workshop-kit/cwk-frontend/commit/1d5df8817e464a6ff255f4b775a566e14096286e))
* hot module reload on runtime for participant files/modules ([cf9c97d](https://github.com/code-workshop-kit/cwk-frontend/commit/cf9c97dd8279573484fd933dc41126ef0e2c1640))
* load participant code as JS modules instead of iframe html ([e1d7a81](https://github.com/code-workshop-kit/cwk-frontend/commit/e1d7a81910102ade14e78e977680a6587b5e26e3))
* no longer need to run websocket server on separate port ([2e4e357](https://github.com/code-workshop-kit/cwk-frontend/commit/2e4e357df4ad3df0780d2be13109e2ce5715f403))
* supports only a single 'dir' arg, support iframe configurations now that we allow modules ([7e0f493](https://github.com/code-workshop-kit/cwk-frontend/commit/7e0f493a2055f7820ffe7a96839bdc6059165fb9))

### [0.7.4](https://github.com/code-workshop-kit/cwk-frontend/compare/0.7.3...0.7.4) (2020-07-14)

### [0.7.3](https://github.com/code-workshop-kit/cwk-frontend/compare/0.7.2...0.7.3) (2020-06-26)


### Features

* add cli generate-key command to generate app key ([c4f6696](https://github.com/code-workshop-kit/cwk-frontend/commit/c4f6696cca7570ae4d1991ea32ef4731177f1a8a))

### [0.7.2](https://github.com/code-workshop-kit/cwk-frontend/compare/0.7.1...0.7.2) (2020-06-25)


### Bug Fixes

* admins now also follow the initiator of follow-mode ([3ad4783](https://github.com/code-workshop-kit/cwk-frontend/commit/3ad4783a0aafdfdc5f98e77c2d8fd514683d4b42))

### [0.7.1](https://github.com/code-workshop-kit/cwk-frontend/compare/0.7.0...0.7.1) (2020-06-23)


### Bug Fixes

* pass context from plugins to verifyJWT ([7ba972c](https://github.com/code-workshop-kit/cwk-frontend/commit/7ba972c321eef3f98bed66bcf3b9151e87c98430))

## [0.7.0](https://github.com/code-workshop-kit/cwk-frontend/compare/0.6.2...0.7.0) (2020-06-23)


### ⚠ BREAKING CHANGES

* for fileControlPlugin, the rootDir property that is passed in the config is now renamed to appIndexDir, which is more clear. rootDir has a special, different meaning inside the cwk server (see es-dev-server docs about rootDir)
* instead of using workshop.js, you should now use cwk.config.js. Instead of exporting a named const "workshop", you should export default {}
* rootDir is no longer supported for cwk scaffold. If you need to override, use inputDir, outputDir, and workshopDir (or its CLI kebab-cased equivalents)

### Features

* allow more flexible scaffold, change config file main API ([9ed6b5b](https://github.com/code-workshop-kit/cwk-frontend/commit/9ed6b5bb14416f289db4f9aa0c182fc47abf8398))
* rename rootDir to appIndexDir to be more clear ([214d7fc](https://github.com/code-workshop-kit/cwk-frontend/commit/214d7fc84317d7505d2c0a62d31cc385300d6b75))


### Bug Fixes

* expire participant_name and cwk_auth_token cookies when JWT auth fails ([c715ca6](https://github.com/code-workshop-kit/cwk-frontend/commit/c715ca6e54e4549bff578fae1ac348b9f9df0551))

### [0.6.2](https://github.com/code-workshop-kit/cwk-frontend/compare/0.6.1...0.6.2) (2020-06-12)


### Features

* **app-shell:** add fetchDialogComplete hook for cookie select ([7b4093f](https://github.com/code-workshop-kit/cwk-frontend/commit/7b4093f4e3474c67fa583b134b2557667006f9d5))
* **cwk-server:** return 'content hidden' body instead of nothing ([f1524a1](https://github.com/code-workshop-kit/cwk-frontend/commit/f1524a11f929f6fda1e5a2cd9bc285feb988af8f))


### Bug Fixes

* **cwk-server:** insert follow mode after file control middleware replaces body ([ccf5d3e](https://github.com/code-workshop-kit/cwk-frontend/commit/ccf5d3e922d99713d5bfc7c914bb042c7bc94006))

### [0.6.1](https://github.com/code-workshop-kit/cwk-frontend/compare/0.6.0...0.6.1) (2020-06-08)


### Bug Fixes

* **app-shell:** reset cwk_auth_token cookie on change name button ([0455dd5](https://github.com/code-workshop-kit/cwk-frontend/commit/0455dd5387e213d0cfab26d6219657e9b555cce7))
* **cwk-server:** accommodate root dir of '/' ([dc642a9](https://github.com/code-workshop-kit/cwk-frontend/commit/dc642a9eee688dea06c58dea38002fde130dc381))

## [0.6.0](https://github.com/code-workshop-kit/cwk-frontend/compare/0.4.0...0.6.0) (2020-06-06)


### ⚠ BREAKING CHANGES

* A couple of plugins and middlewares now require passing the rootDir as an argument, in order to get the application key from the workshop.js to verify admin authentication with JWT
* all middlewares with the exception of no-cache and change-participant-url are now EDS plugins which can be imported from index.js. adminUIMiddleware is now adminUIPlugin, createFileControlMiddleware is now fileControlPlugin, createInsertAppShellMiddleware is now appShellPlugin, insertFollowModeScriptMiddleware is now followModePlugin, createWsPortReplaceMiddleware is now wsPortPlugin and createWorkshopImportReplaceMiddleware is now workshopImportPlugin
* fileControlPlugin (previously createFileControlMiddleware) config object now accepts an array of extensions "exts" and no longer uses the "admin" property

### Features

* add admin login with JWT ([dd2bc56](https://github.com/code-workshop-kit/cwk-frontend/commit/dd2bc564115a50b592c7935d1d99d75c71446860))
* migrate to EDS plugin system as much as possible ([1f0aa43](https://github.com/code-workshop-kit/cwk-frontend/commit/1f0aa43497fd797a86a1b270a0c14246a9b5ab15))
* return edsConfig and cwkConfig in start-server ([23abe18](https://github.com/code-workshop-kit/cwk-frontend/commit/23abe1824cb14af23c25e3e8b8d5179dedfbae5b))


### Bug Fixes

* build dist folder before publish ([67f5fe8](https://github.com/code-workshop-kit/cwk-frontend/commit/67f5fe8e4f904fb920167a105f858f4551360b07))

## [0.5.0](https://github.com/code-workshop-kit/cwk-frontend/compare/0.4.0...0.5.0) (2020-06-05)


### ⚠ BREAKING CHANGES

* all middlewares with the exception of no-cache and change-participant-url are now EDS plugins which can be imported from index.js. adminUIMiddleware is now adminUIPlugin, createFileControlMiddleware is now fileControlPlugin, createInsertAppShellMiddleware is now appShellPlugin, insertFollowModeScriptMiddleware is now followModePlugin, createWsPortReplaceMiddleware is now wsPortPlugin and createWorkshopImportReplaceMiddleware is now workshopImportPlugin
* fileControlPlugin (previously createFileControlMiddleware) config object now accepts an array of extensions "exts" and no longer uses the "admin" property

### Features

* migrate to EDS plugin system as much as possible ([1f0aa43](https://github.com/code-workshop-kit/cwk-frontend/commit/1f0aa43497fd797a86a1b270a0c14246a9b5ab15))
* return edsConfig and cwkConfig in start-server ([23abe18](https://github.com/code-workshop-kit/cwk-frontend/commit/23abe1824cb14af23c25e3e8b8d5179dedfbae5b))


### Bug Fixes

* build dist folder before publish ([67f5fe8](https://github.com/code-workshop-kit/cwk-frontend/commit/67f5fe8e4f904fb920167a105f858f4551360b07))


## [0.4.0](https://github.com/code-workshop-kit/cwk-frontend/compare/0.3.1...0.4.0) (2020-05-17)


### ⚠ BREAKING CHANGES

* change default port back to 8000 for cwk and 8001 for websockets. Previously this was set to 5050 and 5051 but this is unconventional.

### Features

* support old nodejs versions by compiling to CommonJS ([1df6558](https://github.com/code-workshop-kit/cwk-frontend/commit/1df655816e602313f868835ea75f317823ee5eda))

### [0.3.1](https://github.com/code-workshop-kit/cwk-frontend/compare/0.3.0...0.3.1) (2020-05-16)


### Bug Fixes

* upgrade @open-wc/create from 0.30.0 to 0.31.0 ([#17](https://github.com/code-workshop-kit/cwk-frontend/issues/17)) ([017cac5](https://github.com/code-workshop-kit/cwk-frontend/commit/017cac5f435846fcedd18205d0f42e2101d28e3c))

## [0.3.0](https://github.com/code-workshop-kit/cwk-frontend/compare/0.2.3...0.3.0) (2020-05-16)


### ⚠ BREAKING CHANGES

* Added an admin UI bar that cannot be opted out of if the user opts into the app shell.

### Features

* add admin UI bar to change dev-server settings ([84bb73c](https://github.com/code-workshop-kit/cwk-frontend/commit/84bb73cff9a0a9a0e8d33aace46c4f85b95d949a))
* add in-browser follow mode feature ([cab61d0](https://github.com/code-workshop-kit/cwk-frontend/commit/cab61d0cced5dfaa6aca3c3999ef2fc7008382cf))
* allow changing websocket port, set default cwk port ([dffc256](https://github.com/code-workshop-kit/cwk-frontend/commit/dffc256ae9590b50c1218971f925773a3b60b181))
* allow overriding default middlewares through cli ([a0cd972](https://github.com/code-workshop-kit/cwk-frontend/commit/a0cd972b14cef21157612cc198d13658d2849739))
* export middlewares in our entrypoint ([3e70676](https://github.com/code-workshop-kit/cwk-frontend/commit/3e70676b00bfbb1afc73c54d0fd2ee991eb6b846))
* provide app shell title through CLI or workshop.js ([23736a7](https://github.com/code-workshop-kit/cwk-frontend/commit/23736a7727a1c13a6f98b7e831e23a6587c1ea68))
* redesign app shell, admin bar and capsules ([aaf4e8e](https://github.com/code-workshop-kit/cwk-frontend/commit/aaf4e8e2f5eb0d3faac5213b933e6ae8f902a2d4))
* redesign cookie selector and add dank mono font ([1a84c5c](https://github.com/code-workshop-kit/cwk-frontend/commit/1a84c5c0739a19cd12cd944617b31da5e3c6e756))


### Bug Fixes

* upgrade @open-wc/create from 0.28.4 to 0.30.0 ([8deaad6](https://github.com/code-workshop-kit/cwk-frontend/commit/8deaad66c214ac21b14374a5b61910b72875c3ba))

### 0.2.3 (2020-05-15)

### 0.2.2 (2020-05-03)

### 0.2.1 (2020-05-02)

## [0.2.0](https://github.com/code-workshop-kit/cwk-frontend/compare/0.1.4...0.2.0) (2020-05-02)


### ⚠ BREAKING CHANGES

* for scaffold, root-dir must be used instead of app-index
* --cwk-shell / cwkShell option no longer works. It has a reversed equivalent now: --without-app-shell / withoutAppShell

### 0.1.4 (2020-05-02)

### 0.1.3 (2020-05-02)

### 0.1.2 (2020-05-01)


### Features

* enable programmatic use of cwk server, cleanup ([2c69008](https://github.com/code-workshop-kit/cwk-frontend/commit/2c69008efc35018abcf4f3fed75a4c272f689bbe))
* insert app shell dynamically, major refactor/restructure, no more babel ([9f6eb76](https://github.com/code-workshop-kit/cwk-frontend/commit/9f6eb76e24ce2439953129f87965584e97509ad1))


### Bug Fixes

* remove extension cwk binary ([27efd0b](https://github.com/code-workshop-kit/cwk-frontend/commit/27efd0b62317221346735a5dcf1a1231eacc121c))
* resolve multiple bugs with pathing ([c7d0787](https://github.com/code-workshop-kit/cwk-frontend/commit/c7d0787dd9de2d1cfd71d377b1e06bb973ed3c4c))

### 0.1.1 (2020-05-01)


### Bug Fixes

* remove extension cwk binary ([27efd0b](https://github.com/code-workshop-kit/cwk-frontend/commit/27efd0b62317221346735a5dcf1a1231eacc121c))

## 0.1.0 (2020-05-01)


### Features

* first release of code-workshop-kit, featuring the cwk CLI, and exporting a way to programmatically run the server and scaffold
