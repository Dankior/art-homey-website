export function normalizePhone(value) {
  if (typeof value !== 'string' || !/^\+?[\d\s()\-]+$/.test(value.trim())) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.length === 10 && !value.trim().startsWith('+')) digits = '7' + digits;
  else if (digits.length === 11 && digits.startsWith('8')) digits = '7' + digits.slice(1);
  return /^7\d{10}$/.test(digits) ? '+' + digits : null;
}

export const categories = ['kitchen', 'storage', 'apartment', 'other'];
export const budgets = ['350–650 тыс. ₽', '650 тыс.–1 млн ₽', 'Более 1 млн ₽', 'Хочу обсудить бюджет', 'До 150 000 ₽', '150 000–300 000 ₽', '300 000–500 000 ₽', 'От 500 000 ₽', 'Нужна консультация'];

export function validateLead(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return {error: 'Неверный формат данных.'};
  if (input.website) return {error: 'Не удалось отправить заявку.'};
  const str = value => typeof value === 'string' ? value.trim() : '';
  const contact = normalizePhone(input.contact);
  if (!contact) return {error: 'Введите российский телефон полностью: +7 и ещё 10 цифр.'};
  const category = str(input.category), budget = str(input.budget);
  const name = str(input.name), message = str(input.message);
  if (!categories.includes(category) || !budgets.includes(budget)) return {error: 'Выберите мебель и бюджет.'};
  if (input.consent !== true) return {error: 'Подтвердите согласие на обработку обращения.'};
  if (name.length > 80 || message.length > 3000) return {error: 'Сократите имя или описание проекта.'};
  return {value: {category, budget, name, contact, message, consent: true}};
}
