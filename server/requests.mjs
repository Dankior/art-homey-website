import {validateLead} from '../docs/lead-validation.mjs';

const respond = (body, status) => Response.json(body, {status, headers: {'Cache-Control': 'no-store'}});

async function readBody(request) {
  const limit = 16384;
  if (Number(request.headers.get('Content-Length')) > limit) throw new RangeError();
  const reader = request.body?.getReader();
  if (!reader) return '';
  const chunks = []; let size = 0;
  try {
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) {await reader.cancel(); throw new RangeError();}
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const body = new Uint8Array(size); let offset = 0;
  for (const chunk of chunks) {body.set(chunk, offset); offset += chunk.length;}
  return new TextDecoder().decode(body);
}

/**
 * @param {Request} request
 * @param {{getDb: () => D1Database, notify?: (db: D1Database, id: string) => Promise<unknown>}} options
 */
export async function handleRequest(request, {getDb, notify = async () => {}}) {
  const origin = request.headers.get('Origin');
  if ((origin && origin !== new URL(request.url).origin) || request.headers.get('Sec-Fetch-Site') === 'cross-site') {
    return respond({error: 'Отправьте заявку со страницы сайта.'}, 403);
  }
  if (request.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase() !== 'application/json') {
    return respond({error: 'Неверный формат запроса.'}, 415);
  }
  let input;
  try {input = JSON.parse(await readBody(request));}
  catch (error) {return respond({error: error instanceof RangeError ? 'Описание слишком длинное.' : 'Неверный формат данных.'}, error instanceof RangeError ? 413 : 400);}
  const checked = validateLead(input);
  if (checked.error) return respond({error: checked.error}, 400);
  const lead = checked.value;
  const key = input.submissionId ?? crypto.randomUUID();
  if (typeof key !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    return respond({error: 'Обновите страницу и попробуйте снова.'}, 400);
  }
  const hash = [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(lead))))].map(b => b.toString(16).padStart(2,'0')).join('');
  let db, saved;
  try {
    db = getDb();
    const previous = await db.prepare('SELECT id, payload_hash FROM requests WHERE submission_key = ?').bind(key).first();
    if (previous) {
      if (previous.payload_hash !== hash) return respond({error: 'Данные этой отправки изменились. Начните новую заявку.'}, 409);
      return respond({id: previous.id}, 200);
    }
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    const hourAgo = new Date(Date.now() - 3600000).toISOString();
    // The insert and contact limit check execute atomically in one statement.
    await db.prepare(`INSERT INTO requests (id, category, budget, name, contact, message, consent_version, created_at, submission_key, payload_hash)
      SELECT ?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM requests WHERE contact = ? AND created_at >= ?) < 3
      ON CONFLICT(submission_key) DO NOTHING`).bind(id, lead.category, lead.budget, lead.name, lead.contact, lead.message, '2026-09-27', now, key, hash, lead.contact, hourAgo).run();
    saved = await db.prepare('SELECT id, payload_hash FROM requests WHERE submission_key = ?').bind(key).first();
    if (!saved) return respond({error: 'С этого телефона уже отправлено несколько заявок. Попробуйте через час или позвоните нам.'}, 429);
    if (saved.payload_hash !== hash) return respond({error: 'Данные этой отправки изменились. Начните новую заявку.'}, 409);
  } catch {
    console.error('Request storage failed');
    return respond({error: 'Сейчас не удалось сохранить заявку. Попробуйте ещё раз позже.'}, 503);
  }
  // Storage is authoritative: a notification failure must not lose the lead.
  try {await notify(db, saved.id);} catch {console.error('Request notification deferred');}
  return respond({id: saved.id}, 201);
}
