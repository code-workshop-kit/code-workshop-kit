// Base cwk config
export default {
  // Put your participants here!
  participants: ['Joren', 'Felix', 'Alex'],
  admins: ['Joren'],
  adminPassword: 'pineapples',
  appKey: "3d70850323dd58bf9a6feb6ceefa5c651301e80061891c7fef9bb8e2",
  title: 'Frontend Workshop',
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
    }

  }
};