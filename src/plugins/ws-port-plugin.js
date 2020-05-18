export function wsPortPlugin(wsPort) {
  return {
    transform(context) {
      let rewrittenBody = context.body;
      if (context.path === '/node_modules/code-workshop-kit/dist/components/AdminSidebar.js') {
        rewrittenBody = rewrittenBody.replace(new RegExp('%websocketport%', 'g'), wsPort);
      }
      return { body: rewrittenBody };
    },
  };
}
