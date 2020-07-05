export function followModePlugin(port) {
  // Warning: this script gets inserted as a string, so keep that in mind when adding dynamic JS stuff in there from outside scope
  // I didn't stringify it because this way it's more readable, but I may come to regret that..
  // port works because we replace it later by the actual value of port
  const scriptsToInsert = () => {
    window.__cwkFollowModeWs = new WebSocket(`ws://localhost:${port}`);
    const allCookies = document.cookie.split(';').map(cookie => {
      if (cookie) {
        return { [cookie.split('=')[0].trim()]: cookie.split('=')[1].trim() };
      }
      return {};
    });
    let participantName = null;
    const participantCookie = allCookies.find(cookie => cookie.participant_name);
    if (participantCookie) {
      participantName = participantCookie.participant_name;
    }

    window.__cwkFollowModeWs.addEventListener('open', () => {
      if (participantCookie) {
        window.__cwkFollowModeWs.send(
          JSON.stringify({ type: 'authenticate', username: participantName }),
        );
      }
    });

    window.__cwkFollowModeWs.addEventListener('message', e => {
      const { type, data, byAdmin } = JSON.parse(e.data);
      // Guard against initiator of follow mode's url getting changed. It should not happen, but just in case
      if (type === 'update-url' && byAdmin !== participantName) {
        const url = data;
        window.location.href = `${window.location.protocol}//${window.location.host}${url}`;
      }
    });
  };

  return {
    transform(context) {
      let rewrittenBody = context.body;
      const fromIFrame = context.header['sec-fetch-dest'] === 'iframe';

      if (
        context.status === 200 &&
        context.response.is('html') &&
        !fromIFrame &&
        context.cookies.get('participant_name') // don't make unnamed participants follow yet
      ) {
        const scriptStr = scriptsToInsert.toString();
        const scriptBody = scriptStr
          .substring(scriptStr.indexOf('{') + 1, scriptStr.lastIndexOf('}'))
          .replace(/\${port}/, port);

        rewrittenBody = rewrittenBody.replace(
          '</body>',
          `
              <script>
                ${scriptBody}
              </script>
            </body>
          `,
        );
      }

      return { body: rewrittenBody, transformCache: false };
    },
  };
}
