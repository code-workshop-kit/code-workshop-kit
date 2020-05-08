const scriptsToInsert = () => {
  const ws = new WebSocket('ws://localhost:8083');

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

export const insertFollowModeScriptMiddleware = async (ctx, next) => {
  const fromIFrame = ctx.header['sec-fetch-dest'] === 'iframe';
  await next();
  if (ctx.status === 200 && ctx.response.is('html') && ctx.ip !== '::1' && !fromIFrame) {
    const scriptStr = scriptsToInsert.toString();
    const scriptBody = scriptStr.substring(scriptStr.indexOf('{') + 1, scriptStr.lastIndexOf('}'));

    ctx.body = ctx.body.replace(
      '</body>',
      `
        <script>
          ${scriptBody}
        </script>
      </body>
    `,
    );
  }
};
