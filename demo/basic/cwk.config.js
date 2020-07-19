export default {
  participants: ['Joren', 'Felix', 'Alex'],
  admins: ['Joren'],
  adminPassword: 'pineapples',
  appKey: "99829a5965082bf93980e8fd29f2e82d5a908fb201a1f16b7ec3cafa",
  title: 'Frontend Workshop',
  usingParticipantIframes: true,
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