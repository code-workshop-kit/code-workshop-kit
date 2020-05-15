export function createWsPortReplaceMiddleware(wsPort) {
  return async function wsPortReplaceMiddleware(ctx, next) {
    await next();
    if (ctx.status === 200) {
      if (ctx.url.indexOf('/components/AdminSidebar.js') !== -1) {
        ctx.body = ctx.body.replace(new RegExp('%websocketport%', 'g'), wsPort);
      }
    }
  };
}
