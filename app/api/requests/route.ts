import {env} from 'cloudflare:workers';
import {requestDb} from '@/db/requests';
import {handleRequest} from '@/server/requests.mjs';
import {notifyRequest} from '@/server/notifications.mjs';

export async function POST(request: Request) {
  return handleRequest(request, {
    getDb: requestDb,
    notify: (db: D1Database, id: string) => notifyRequest(db, id, env),
  });
}
