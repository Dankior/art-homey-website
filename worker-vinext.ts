import handler from 'vinext/server/fetch-handler';
import {retryNotifications} from './server/notifications.mjs';

const worker = {
  fetch: handler.fetch,
  scheduled(_event: ScheduledController, env: Cloudflare.Env, ctx: ExecutionContext) {
    ctx.waitUntil(retryNotifications(env.DB, env));
  },
};

export default worker;
