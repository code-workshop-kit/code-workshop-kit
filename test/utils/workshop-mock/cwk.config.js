export default {
  participants: ['Joren', 'Felix', 'Alex'],
  templateData: {
    appTitle: 'Cool Frontend App',
    participantNameLowercase() {
      return this.participantName.toLowerCase();
    },
    intro() {
      return `Hi ${this.participantName}, welcome to ${this.appTitle}!`;
    },
  },
};
