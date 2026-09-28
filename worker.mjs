import {handleRequest} from './server/requests.mjs';
import {notifyRequest, retryNotifications} from './server/notifications.mjs';

const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/requests') {
      if (request.method !== 'POST') return new Response('Method not allowed', {status:405, headers:{Allow:'POST'}});
      return handleRequest(request, {
        getDb: () => {if (!env.DB) throw new Error('Storage unavailable'); return env.DB;},
        notify: (db, id) => notifyRequest(db, id, env),
      });
    }
    if (url.pathname.startsWith('/api/')) return new Response('Not found', {status:404});
    if (url.pathname === '/') return Response.redirect(new URL('/index.html' + url.search, url), 308);
    return env.ASSETS.fetch(request);
  },
  async scheduled(_event, env, ctx) {ctx.waitUntil(retryNotifications(env.DB, env));},
};

export default worker;
