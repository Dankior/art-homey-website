const token = process.env.TELEGRAM_BOT_TOKEN;
if (!token) {console.error('Заполните TELEGRAM_BOT_TOKEN в локальном .dev.vars. Токен не нужно отправлять в чат.');process.exitCode=1;}
else {
  try {
    const response=await fetch(`https://api.telegram.org/bot${token}/getUpdates`, {signal:AbortSignal.timeout(10000)});
    const body=await response.json();
    if (!response.ok || !body.ok) throw new Error();
    const chats=new Map();
    for(const update of body.result) {
      const chat=(update.message || update.channel_post || update.my_chat_member)?.chat;
      if(chat) chats.set(chat.id,chat.title || chat.username || chat.first_name || 'Чат');
    }
    if (!chats.size) console.log('Напишите /start вашему боту (или /start@имя_бота в рабочей группе), затем повторите команду.');
    for(const [id,title] of chats) console.log(`${title}: TELEGRAM_CHAT_ID="${id}"`);
  } catch {console.error('Не удалось получить ID чата. Проверьте токен, доступ к Telegram и отсутствие webhook у нового бота.');process.exitCode=1;}
}
