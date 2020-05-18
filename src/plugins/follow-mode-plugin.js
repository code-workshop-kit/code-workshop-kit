export function followModePlugin(wsPort) {
  const scriptsToInsert = () => {
    const ws = new WebSocket(`ws://localhost:${wsPort}`);

    ws.addEventListener('open', () => {
      const allCookies = document.cookie
        .split(';')
        .map(cookie => ({ [cookie.split('=')[0].trim()]: cookie.split('=')[1].trim() }));
      const participantCookie = allCookies.find(cookie => cookie.participant_name);

      if (participantCookie) {
        ws.send(
          JSON.stringify({ type: 'authenticate', username: participantCookie.participant_name }),
        );
      }
    });

    ws.addEventListener('message', e => {
      const { type, data } = JSON.parse(e.data);
      if (type === 'update-url') {
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
        context.ip !== '::1' &&
        !fromIFrame
      ) {
        const scriptStr = scriptsToInsert.toString();
        const scriptBody = scriptStr.substring(
          scriptStr.indexOf('{') + 1,
          scriptStr.lastIndexOf('}'),
        );

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

      return { body: rewrittenBody };
    },
  };
}
