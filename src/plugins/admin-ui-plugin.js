import { cwkState } from '../utils/CwkStateSingleton.js';

export function adminUIPlugin() {
  return {
    transform(context) {
      let rewrittenBody = context.body;

      const { state } = cwkState;
      const participantName = context.cookies.get('participant_name');

      if (participantName) {
        // Make sure the host is added as an admin
        // (but only once, so that after they can switch names without automatically making those names admins)
        if (context.ip === '::1' && !state.hostAdminSet) {
          cwkState.state = {
            admins: [...(state.admins || []), participantName],
            hostAdminSet: true,
          };
        }

        if (context.path === '/node_modules/code-workshop-kit/dist/components/AdminSidebar.js') {
          // if current user is not amongst the admins (or there are no admins yet), do not serve
          if (
            !cwkState.state.admins ||
            !cwkState.state.admins.find(admin => admin === participantName)
          ) {
            rewrittenBody = '';
          }
        }
      }

      return {
        body: rewrittenBody,
        transformCache: false,
      };
    },
  };
}
