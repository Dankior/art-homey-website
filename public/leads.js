(() => {
  const forms = document.querySelectorAll('#ctaForm, #quizForm, #leadForm');
  forms.forEach(form => {
    const button = form.querySelector('[type="submit"]');
    const status = form.querySelector('.form-status');
    let sending = false;
    const phone = form.querySelector('[name="phone"]');
    if (phone) { phone.setAttribute('aria-label', 'Телефон для связи'); phone.maxLength = 25; }
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (sending || !form.reportValidity()) return;
      sending = true;
      const original = button.textContent;
      button.disabled = true; button.textContent = 'Сохраняем заявку…';
      button.setAttribute('aria-busy', 'true');
      status.textContent = ''; status.className = 'form-status is-visible';
      const values = new FormData(form);
      const furniture = String(values.get('furniture') || 'Обсуждение проекта');
      const category = furniture === 'Кухня' ? 'kitchen' : furniture === 'Шкаф или гардеробная' ? 'storage' : 'other';
      const message = [String(values.get('message') || ''), `Задача: ${furniture}`, `Канал: ${values.get('channel') || 'Телефон'}`, `Форма: ${form.id}`].filter(Boolean).join('\n');
      try {
        const result = await fetch('/api/requests', {method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({category, budget: values.get('budget') || 'Нужна консультация', name: String(values.get('name') || '').slice(0,80), contact: values.get('phone'), message, consent: values.get('consent') === 'on'})});
        const data = await result.json();
        if (!result.ok) throw new Error(data.error || 'Не удалось сохранить заявку.');
        status.textContent = `Заявка сохранена. Номер ${data.id.slice(0,8).toUpperCase()}. Для связи со студией: +7 906 056-18-19.`;
        status.className = 'form-status is-visible is-success';
        form.reset();
        // Keep the quiz confirmation on the visible final step.
        status.setAttribute('tabindex','-1'); status.focus({preventScroll:true});
      } catch (error) {
        status.textContent = (error instanceof Error ? error.message : 'Ошибка соединения.') + ' Данные остались в форме. Попробуйте ещё раз или позвоните +7 906 056-18-19.';
        status.className = 'form-status is-visible is-error';
      } finally {
        sending = false; button.disabled = false; button.textContent = original;
        button.removeAttribute('aria-busy');
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
