# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

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
