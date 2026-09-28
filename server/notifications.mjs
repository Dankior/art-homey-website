export async function notifyRequest(db, id, env, send = fetch) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return false;
  const now = Date.now();
  const row = await db.prepare(`UPDATE requests SET notification_locked_until = ?, notification_attempts = notification_attempts + 1
    WHERE id = ? AND notified_at IS NULL AND notification_next_at <= ? AND notification_locked_until <= ? RETURNING *`)
    .bind(now + 30000, id, now, now).first();
  if (!row) return false;
  const labels = {kitchen: 'Кухня', storage: 'Шкаф / гардеробная', apartment: 'Мебель для квартиры', other: 'Другой проект'};
  const text = [`Новая заявка ART HOMEY · ${row.id.slice(0,8).toUpperCase()}`, `Имя: ${row.name || 'Не указано'}`, `Телефон: ${row.contact}`, `Мебель: ${labels[row.category] || row.category}`, `Бюджет: ${row.budget}`, row.message, `Дата (UTC): ${row.created_at}`].join('\n');
  let retryAfter = 0;
  try {
    const response = await send(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: {'Content-Type': 'application/json'}, signal: AbortSignal.timeout(5000),
      body: JSON.stringify({chat_id: env.TELEGRAM_CHAT_ID, text: [...text].slice(0,4000).join(''), link_preview_options: {is_disabled:true}, allow_paid_broadcast: false}),
    });
    const result = await response.json();
    if (!response.ok || result.ok !== true) {
      retryAfter = Math.min(86400, Math.max(0, Number(result.parameters?.retry_after) || 0));
      throw new Error('Telegram rejected notification');
    }
    await db.prepare('UPDATE requests SET notified_at = ?, notification_locked_until = 0 WHERE id = ?').bind(new Date().toISOString(), id).run();
    return true;
  } catch {
    const delay = Math.max(retryAfter * 1000, Math.min(3600000, 60000 * 2 ** Math.min(row.notification_attempts - 1, 6)));
    await db.prepare('UPDATE requests SET notification_next_at = ?, notification_locked_until = 0 WHERE id = ?').bind(Date.now() + delay, id).run();
    return false;
  }
}

export async function retryNotifications(db, env) {
  if (!db || !env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  const now = Date.now();
  const {results} = await db.prepare(`SELECT id FROM requests WHERE notified_at IS NULL AND notification_next_at <= ? AND notification_locked_until <= ? ORDER BY created_at LIMIT 5`).bind(now, now).all();
  for (const [index, row] of results.entries()) {
    if (index) await new Promise(resolve => setTimeout(resolve, 1100));
    await notifyRequest(db, row.id, env);
  }
}
