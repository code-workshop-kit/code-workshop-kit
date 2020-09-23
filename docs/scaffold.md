# Scaffold

There are some more advanced things you can do with `templateData`.

For example, you can also put methods in here, and you can access other templateData variables through `this`.

There is also the special `this.participantName` that can be used, this is the name of the current participant that a file is being scaffolded for.

```js
export default {
  participants: ['Joren', 'Felix'],
  templateData: {
    appTitle: 'Cool Frontend App',

    participantNameLower() {
      return this.participantName.toLowerCase();
    },

    intro() {
      return `Hi ${this.participantName}, welcome to ${this.appTitle}!`;
    },
  },
};
```

## CLI

The `cwk scaffold` command will accept a `--force` or `-f` flag to override already existing participant files completely.

## Rationale

I just went with `@open-wc/create` npm package and hacked some things in to make it useful for this project.

However, in the future, it would be nice to "outsource" these features to a dedicated scaffolder and template engine.

It should also be possible in the future to have multiple templates. For example, it's very useful if you have multiple exercises/assignments in your workshop, that you can switch between templates. The main challenge here is: how do you ensure that your participants don't lose their work when you make them switch.

Ideas for all this are welcome!
