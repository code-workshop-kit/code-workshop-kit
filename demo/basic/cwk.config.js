export default {
  participants: ['Joren', 'Felix', 'Alex'],
  admins: ['Joren'],
  adminPassword: 'pineapples',
  appKey: "e123493f6645f6d0319d32736b6d892d13e5dd4e1b1c0d1b915ca49b",
  title: 'Frontend Workshop',
  templateData: {
    appTitle: 'Cool Frontend App',

    participantNameLowercase() {
      return this.participantName.toLowerCase();
    },

    intro() {
      return `Hi ${this.participantName}, welcome to ${this.appTitle}!`;
    }

  }
};