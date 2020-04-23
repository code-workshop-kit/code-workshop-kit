module.exports = async function noCacheMiddleware(ctx, next) {
  await next();
  ctx.response.set('cache-control', 'no-store');
};
