export const workshop = {
  participants: ['Joren', 'Felix', 'Alex'],
  appKey: '(=]#bYS940q)T8S*dX1g;Sey)X3YhN|98B>4hwE:c2ew8QrN3);hQN?x"5#yUS',
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
