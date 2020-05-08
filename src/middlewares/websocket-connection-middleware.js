export const websocketConnectionMiddleware = async (ctx, next) => {
  await next();
};
