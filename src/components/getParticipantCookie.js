export const getParticipantCookie = () => {
  const cookiesSplit = document.cookie.split(';');
  const allCookies = cookiesSplit.map(cookie => {
    if (!cookie) {
      return {};
    }
    return { [cookie.split('=')[0].trim()]: cookie.split('=')[1].trim() };
  });

  return allCookies.find(cookie => cookie.participant_name);
};
