import { cwkState } from '../CwkStateSingleton.js';

export const adminUIMiddleware = async (ctx, next) => {
  await next();
  const { state } = cwkState;
  const participantName = ctx.cookies.get('participant_name');

  if (participantName) {
    // Make sure the host is added as an admin
    // (but only once, so that after they can switch names without automatically making those names admins)
    if (ctx.ip === '::1' && !state.hostAdminSet) {
      state.admins = [...(state.admins || []), participantName];
      state.hostAdminSet = true;
      cwkState.state = state;
    }

    if (ctx.url.endsWith('node_modules/code-workshop-kit/src/components/AdminSidebar.js')) {
      // if current user is not amongst the admins, do not serve
      if (!cwkState.state.admins.find(admin => admin === participantName)) {
        ctx.body = '';
      }
    }
  }
};