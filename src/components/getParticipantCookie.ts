export const getParticipantCookie = (): string | null => {
  const cookiesSplit = document.cookie.split(';');
  const allCookies = cookiesSplit.map((cookie) => {
    if (!cookie) {
      return {};
    }
    return { [cookie.split('=')[0].trim()]: cookie.split('=')[1].trim() };
  });

  const participantCookie = allCookies.find((cookie) => cookie.participant_name);

  return participantCookie?.participant_name || null;
};
