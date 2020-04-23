module.exports = {
  // Put your participants here!
  // Note: This key cannot be used inside templateData, because templateData gets flattened with `this`
  participants: ['Joren', 'Felix'],

  // Put your data here to be used inside your scaffolding template files
  templateData: {
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
