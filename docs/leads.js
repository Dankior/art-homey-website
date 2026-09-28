import {normalizePhone} from './lead-validation.mjs';

(() => {
  const forms = document.querySelectorAll('#ctaForm, #quizForm, #leadForm');
  forms.forEach(form => {
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');
    if (!button || !status) return;
    const phone = form.querySelector('[name="phone"]');
    const success = document.createElement('section');
    success.className = 'lead-success'; success.hidden = true;
    success.dataset.leadSuccess = '';
    success.innerHTML = '<h3 tabindex="-1">Заявка принята</h3><p data-success-message></p><p>Если вопрос срочный, позвоните <a href="tel:+79060561819">+7 906 056-18-19</a>.</p><button type="button" class="btn-outline" data-new-lead>Новая заявка</button>';
    form.append(success);
    let sending = false, complete = false, submissionId, lastPayload;
    let previousChildren = [];
    if (phone) {
      phone.setAttribute('aria-label', 'Телефон для связи'); phone.maxLength = 25;
      phone.addEventListener('input', () => phone.setCustomValidity(''));
    }
    success.querySelector('[data-new-lead]').addEventListener('click', () => {
      complete = false; submissionId = lastPayload = undefined;
      form.reset(); phone?.setCustomValidity('');
      previousChildren.forEach(([child, hidden]) => {child.hidden = hidden;});
      success.hidden = true;
      status.textContent = ''; status.className = 'form-status';
      form.dispatchEvent(new CustomEvent('lead-restart'));
      if (form.id !== 'quizForm') form.querySelector('input:not([tabindex="-1"])')?.focus();
    });
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || complete) return;
      phone?.setCustomValidity(normalizePhone(phone.value) ? '' : 'Введите российский телефон полностью: +7 и ещё 10 цифр.');
      if (!form.reportValidity()) return;
      const values = new FormData(form);
      if (form.id === 'quizForm' && (!values.get('furniture') || !values.get('budget'))) {
        form.dispatchEvent(new CustomEvent('lead-restart')); return;
      }
      sending = true;
      const original = button.textContent;
      button.disabled = true; button.textContent = 'Отправляем…'; button.setAttribute('aria-busy', 'true');
      status.textContent = ''; status.className = 'form-status is-visible';
      const furniture = String(values.get('furniture') || 'Обсуждение проекта');
      const category = furniture === 'Кухня' ? 'kitchen' : furniture === 'Шкаф или гардеробная' ? 'storage' : 'other';
      const channel = String(values.get('channel') || 'Телефон');
      const messengerContact = String(values.get('messenger_contact') || '').trim();
      const message = [String(values.get('message') || ''), `Задача: ${furniture}`, `Канал: ${channel}`, messengerContact ? `Контакт в мессенджере: ${messengerContact}` : '', `Форма: ${form.id}`].filter(Boolean).join('\n');
      const payload = {category, budget: values.get('budget') || 'Нужна консультация', name: String(values.get('name') || ''), contact: normalizePhone(phone.value), message, consent: values.get('consent') === 'on', website: String(values.get('website') || '')};
      const serialized = JSON.stringify(payload);
      if (serialized !== lastPayload) {submissionId = crypto.randomUUID(); lastPayload = serialized;}
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      try {
        const result = await fetch('/api/requests', {method: 'POST', headers: {'Content-Type':'application/json'}, signal: controller.signal, body: JSON.stringify({...payload, submissionId})});
        const data = await result.json().catch(() => null);
        if (!result.ok) throw new Error(data?.error || 'Не удалось сохранить заявку.');
        if (!data || typeof data.id !== 'string') throw new Error('Сервер не подтвердил приём заявки.');
        complete = true;
        previousChildren = [...form.children].filter(child => child !== success).map(child => [child, child.hidden]);
        previousChildren.forEach(([child]) => {child.hidden = true;});
        success.querySelector('[data-success-message]').textContent = `Номер ${data.id.slice(0,8).toUpperCase()}. Мы свяжемся с вами по указанному контакту, чтобы обсудить проект.`;
        success.hidden = false;
        success.querySelector('h3').focus({preventScroll:true});
        form.dispatchEvent(new CustomEvent('lead-saved'));
      } catch (error) {
        const detail = error?.name === 'AbortError' ? 'Ответ сервера задерживается.' : error instanceof Error ? error.message : 'Ошибка соединения.';
        status.textContent = detail + ' Данные остались в форме. Повторите отправку или позвоните +7 906 056-18-19.';
        status.className = 'form-status is-visible is-error';
      } finally {
        clearTimeout(timeout); sending = false; button.disabled = false; button.textContent = original; button.removeAttribute('aria-busy');
      }
    });
  });
  // Link category interest to the short form without sending personal data.
  const context = document.modelContext;
  if (context?.registerTool && document.getElementById('ctaForm')) {
    const lifecycle = new AbortController();
    try { Promise.resolve(context.registerTool({name:'prepare_furniture_request',title:'Подготовить обращение в ART HOMEY',description:'Заполняет тему в короткой форме. Не отправляет заявку.',inputSchema:{type:'object',properties:{category:{type:'string',enum:['kitchen','storage','apartment','other']}},required:['category'],additionalProperties:false},annotations:{readOnlyHint:false},execute(input){const names={kitchen:'Кухня',storage:'Шкаф или гардеробная',apartment:'Мебель для квартиры',other:'Другой проект'};if(!input||!Object.hasOwn(names,input.category))throw new Error('Неизвестная категория');const field=document.querySelector('#cta-message');field.value=names[input.category];document.getElementById('order').scrollIntoView();field.focus({preventScroll:true});return{category:input.category,submitted:false};}},{signal:lifecycle.signal})).catch(()=>{}); } catch {}
    window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  }
})();
