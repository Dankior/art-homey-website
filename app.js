function handleFormSubmit(formId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;

    const nameField = form.querySelector('input[name="name"]');
    const name = nameField ? nameField.value.trim() : '';
    const submitButton = form.querySelector('button[type="submit"]');
    const status = form.querySelector('.form-status');

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.classList.add('is-loading');
      submitButton.setAttribute('aria-busy', 'true');
      submitButton.dataset.originalText = submitButton.textContent;
      submitButton.textContent = 'Отправляем…';
    }

    // Имитация отправки
    setTimeout(() => {
      if (status) {
        status.textContent = name
          ? `Спасибо, ${name}! Мы свяжемся с вами в ближайшее время.`
          : 'Спасибо! Мы свяжемся с вами в ближайшее время.';
        status.classList.add('is-success');
      }
      form.reset();
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
        submitButton.removeAttribute('aria-busy');
        submitButton.textContent = submitButton.dataset.originalText || 'Отправить заявку';
      }
      // Скрыть сообщение через 6 секунд
      if (status) {
        setTimeout(() => {
          status.textContent = '';
          status.classList.remove('is-success');
        }, 6000);
      }
    }, 900);
  });
}

// Единый формат телефона во всех формах сайта.
document.querySelectorAll('input[type="tel"]').forEach((input) => {
  input.inputMode = 'tel';
  input.addEventListener('input', () => {
    const digits = input.value.replace(/\D/g, '').replace(/^8/, '7').slice(0, 11);
    if (!digits) {
      input.value = '';
      return;
    }
    const normalized = digits.padEnd(1, '');
    let formatted = '+7';
    if (normalized.length > 1) formatted += ` (${normalized.slice(1, 4)}`;
    if (normalized.length >= 4) formatted += ')';
    if (normalized.length > 4) formatted += ` ${normalized.slice(4, 7)}`;
    if (normalized.length > 7) formatted += `-${normalized.slice(7, 9)}`;
    if (normalized.length > 9) formatted += `-${normalized.slice(9, 11)}`;
    input.value = formatted;
  });
});

handleFormSubmit('leadForm');
handleFormSubmit('ctaForm');
handleFormSubmit('quizForm');



// Выпадающее меню «Покупателю» на всех страницах.
(function initHeaderBuyerDropdown() {
  const dropdown = document.getElementById('buyerDropdown');
  const trigger = document.getElementById('buyerDropdownTrigger');
  if (!dropdown || !trigger) return;

  function closeDropdown() {
    dropdown.classList.remove('is-open');
    trigger.setAttribute('aria-expanded', 'false');
  }

  trigger.addEventListener('click', event => {
    event.stopPropagation();
    const willOpen = !dropdown.classList.contains('is-open');
    dropdown.classList.toggle('is-open', willOpen);
    trigger.setAttribute('aria-expanded', String(willOpen));
  });

  document.addEventListener('click', event => {
    if (!dropdown.contains(event.target)) closeDropdown();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeDropdown();
  });
  dropdown.querySelectorAll('.hp-header__dropdown-menu a').forEach(link => {
    link.addEventListener('click', closeDropdown);
  });
})();

/* Mobile drawer menu — escapes backdrop-filter containing block */
(function initMobileDrawer() {
  const burgerBtn = document.getElementById('burgerBtn');
  const sourceNav = document.getElementById('nav');
  if (!burgerBtn || !sourceNav) return;

  const MQ = window.matchMedia('(max-width: 880px)');

  function buildDrawer() {
    if (document.querySelector('.hp-mobile-drawer')) return document.querySelector('.hp-mobile-drawer');

    const drawer = document.createElement('div');
    drawer.className = 'hp-mobile-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Меню');

    const links = [];
    sourceNav.querySelectorAll(':scope > a:not(.hp-header__logo)').forEach((a) => {
      links.push({ href: a.getAttribute('href'), text: a.textContent.trim(), current: a.getAttribute('aria-current') === 'page' });
    });

    const dropdown = sourceNav.querySelector('.hp-header__dropdown-menu');
    const subItems = [];
    if (dropdown) {
      dropdown.querySelectorAll('a').forEach((a) => {
        subItems.push({ href: a.getAttribute('href'), text: a.textContent.trim(), current: a.getAttribute('aria-current') === 'page' });
      });
    }

    const navHtml = links.map((l) =>
      `<a href="${l.href}"${l.current ? ' aria-current="page"' : ''}>${l.text}</a>`
    ).join('');

    const subHtml = subItems.length
      ? `<div class="hp-mobile-drawer__group">
          <button type="button" class="hp-mobile-drawer__trigger" aria-expanded="false">
            Покупателю <span aria-hidden="true">⌄</span>
          </button>
          <div class="hp-mobile-drawer__sub">
            ${subItems.map((s) => `<a href="${s.href}"${s.current ? ' aria-current="page"' : ''}>${s.text}</a>`).join('')}
          </div>
        </div>`
      : '';

    drawer.innerHTML = `
      <div class="hp-mobile-drawer__backdrop" data-close></div>
      <div class="hp-mobile-drawer__panel">
        <div class="hp-mobile-drawer__head">
          <span class="hp-mobile-drawer__brand">ART HOMEY</span>
          <button type="button" class="hp-mobile-drawer__close" data-close aria-label="Закрыть меню">×</button>
        </div>
        <nav class="hp-mobile-drawer__nav">
          ${navHtml}
          ${subHtml}
        </nav>
        <div class="hp-mobile-drawer__footer">
          <a class="hp-mobile-drawer__phone" href="tel:+79060561819">+7 906 056-18-19</a>
          <div class="hp-mobile-drawer__messengers">
            <a href="https://t.me/arthomey" target="_blank" rel="noopener noreferrer">TG</a>
            <a href="https://wa.me/79060561819" target="_blank" rel="noopener noreferrer">WA</a>
            <a href="https://max.ru/u/f9LHodD0cOIM9zp4Ho-Bn4nSWSp5nrVu4DwpDjRow3obhmcMdmAD5RWX0Aw" target="_blank" rel="noopener noreferrer">MAX</a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(drawer);

    const group = drawer.querySelector('.hp-mobile-drawer__group');
    const trigger = drawer.querySelector('.hp-mobile-drawer__trigger');
    if (group && trigger) {
      trigger.addEventListener('click', () => {
        const open = group.classList.toggle('is-open');
        trigger.setAttribute('aria-expanded', String(open));
      });
    }

    drawer.querySelectorAll('[data-close]').forEach((el) => {
      el.addEventListener('click', closeMenu);
    });

    drawer.querySelectorAll('.hp-mobile-drawer__nav a').forEach((a) => {
      a.addEventListener('click', closeMenu);
    });

    return drawer;
  }

  function openMenu() {
    const drawer = buildDrawer();
    drawer.classList.add('is-open');
    burgerBtn.classList.add('open');
    burgerBtn.setAttribute('aria-expanded', 'true');
    document.body.classList.add('hp-menu-open');
  }

  function closeMenu() {
    const drawer = document.querySelector('.hp-mobile-drawer');
    if (drawer) drawer.classList.remove('is-open');
    burgerBtn.classList.remove('open');
    burgerBtn.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('hp-menu-open');
  }

  burgerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!MQ.matches) {
      const isOpen = burgerBtn.classList.toggle('open');
      sourceNav.classList.toggle('open');
      burgerBtn.setAttribute('aria-expanded', String(isOpen));
      return;
    }
    if (document.body.classList.contains('hp-menu-open')) closeMenu();
    else openMenu();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  MQ.addEventListener('change', () => {
    if (!MQ.matches) closeMenu();
  });
})();


function smoothScrollTo(targetY, duration = 700) {
  const startY = window.scrollY;
  const distance = targetY - startY;
  const startTime = performance.now();

  function easeInOutCubic(t) {
    return t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeInOutCubic(progress);

    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    const target = document.querySelector(targetId);
    if (!target) return;

    e.preventDefault();

    const headerOffset = 80;
    const targetY = target.getBoundingClientRect().top + window.scrollY - headerOffset;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      window.scrollTo(0, targetY);
    } else {
      smoothScrollTo(targetY);
    }
  });
});

function initSliders() {
  document.querySelectorAll('[data-slider]').forEach(slider => {
    const track = slider.querySelector('.slider__track');
    const slides = slider.querySelectorAll('.slider__slide');
    const dotsContainer = slider.querySelector('[data-dots]');
    const prevBtn = slider.querySelector('[data-prev]');
    const nextBtn = slider.querySelector('[data-next]');
    let currentIndex = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.classList.add('slider__dot');
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goToSlide(i));
      dotsContainer.appendChild(dot);
    });

    const dots = dotsContainer.querySelectorAll('.slider__dot');

    function goToSlide(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;

      dots.forEach(dot => dot.classList.remove('active'));
      dots[currentIndex].classList.add('active');
    }

    prevBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
    nextBtn.addEventListener('click', () => goToSlide(currentIndex + 1));
  });
}

initSliders();

function initShowcase() {
  const track = document.getElementById('showcaseTrack');
  const pauseBtn = document.getElementById('showcasePause');
  const nextBtn = document.getElementById('showcaseNext');
  const prevBtn = document.getElementById('showcasePrev');
  const dotsContainer = document.getElementById('showcaseDots');

  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.showcase__card'));
  if (!cards.length) return;

  let activeIndex = 0;
  let isPaused = false;
  let isScrolling = false;
  let autoplayTimer = null;
  let scrollRaf = null;

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.classList.add('showcase__dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => manualGoTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.showcase__dot'));
  cards[0].classList.add('is-active');

  cards.forEach((card, i) => {
    card.addEventListener('click', (e) => {
      if (e.target.closest('.showcase__btn')) return;
      manualGoTo(i);
    });
  });

  function updateEdgePadding() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const pad = Math.max(24, (track.clientWidth - cardWidth) / 2);
    track.style.paddingLeft = `${pad}px`;
    track.style.paddingRight = `${pad}px`;
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function getTargetScroll(index) {
    const card = cards[index];
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const maxScroll = track.scrollWidth - track.clientWidth;
    return Math.max(0, Math.min(maxScroll, cardCenter - track.clientWidth / 2));
  }

  function smoothScrollTo(targetLeft, duration) {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);

    const startLeft = track.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) {
      isScrolling = false;
      return;
    }

    const startTime = performance.now();
    isScrolling = true;

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = startLeft + distance * easeOutCubic(t);

      if (t < 1) {
        scrollRaf = requestAnimationFrame(step);
      } else {
        scrollRaf = null;
        track.scrollLeft = targetLeft;
        isScrolling = false;
      }
    }

    scrollRaf = requestAnimationFrame(step);
  }

  function scrollToCard(index) {
    if (index < 0) index = 0;
    if (index >= cards.length) index = cards.length - 1;

    activeIndex = index;
    updateDots();
    smoothScrollTo(getTargetScroll(activeIndex), 800);
  }

  function manualGoTo(index) {
    scrollToCard(index);
    if (!isPaused) startAutoplay();
  }

  function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
    cards.forEach((card, i) => card.classList.toggle('is-active', i === activeIndex));
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (isScrolling) return;
      if (activeIndex + 1 >= cards.length) scrollToCard(0);
      else scrollToCard(activeIndex + 1);
    }, 4500);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.innerHTML = isPaused
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      pauseBtn.setAttribute('aria-label', isPaused ? 'Воспроизвести' : 'Пауза');
      if (isPaused) stopAutoplay();
      else startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      manualGoTo(Math.min(activeIndex + 1, cards.length - 1));
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      manualGoTo(Math.max(activeIndex - 1, 0));
    });
  }

  startAutoplay();
}

initShowcase();

function initTestimonials() {
  const track = document.getElementById('testimonialsTrack');
  const pauseBtn = document.getElementById('testimonialsPause');
  const nextBtn = document.getElementById('testimonialsNext');
  const prevBtn = document.getElementById('testimonialsPrev');
  const dotsContainer = document.getElementById('testimonialsDots');

  if (!track) return;

  const cards = Array.from(track.querySelectorAll('.testimonial-card'));
  if (!cards.length) return;

  let activeIndex = 0;
  let isPaused = false;
  let isScrolling = false;
  let autoplayTimer = null;
  let scrollRaf = null;

  function updateEdgePadding() {
    const cardWidth = cards[0].getBoundingClientRect().width;
    const pad = Math.max(24, (track.clientWidth - cardWidth) / 2);
    track.style.paddingLeft = `${pad}px`;
    track.style.paddingRight = `${pad}px`;
  }

  cards.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.classList.add('testimonials__dot');
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => manualGoTo(i));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.testimonials__dot'));

  cards.forEach((card, i) => {
    card.addEventListener('click', () => manualGoTo(i));
  });

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function getTargetScroll(index) {
    const card = cards[index];
    const cardCenter = card.offsetLeft + card.offsetWidth / 2;
    const maxScroll = track.scrollWidth - track.clientWidth;
    return Math.max(0, Math.min(maxScroll, cardCenter - track.clientWidth / 2));
  }

  function smoothScrollTo(targetLeft, duration) {
    if (scrollRaf) cancelAnimationFrame(scrollRaf);

    const startLeft = track.scrollLeft;
    const distance = targetLeft - startLeft;
    if (Math.abs(distance) < 1) {
      isScrolling = false;
      return;
    }

    const startTime = performance.now();
    isScrolling = true;

    function step(now) {
      const t = Math.min((now - startTime) / duration, 1);
      track.scrollLeft = startLeft + distance * easeOutCubic(t);

      if (t < 1) {
        scrollRaf = requestAnimationFrame(step);
      } else {
        scrollRaf = null;
        track.scrollLeft = targetLeft;
        isScrolling = false;
      }
    }

    scrollRaf = requestAnimationFrame(step);
  }

  function scrollToCard(index) {
    if (index < 0) index = 0;
    if (index >= cards.length) index = cards.length - 1;

    activeIndex = index;
    updateDots();
    smoothScrollTo(getTargetScroll(activeIndex), 700);
  }

  function manualGoTo(index) {
    scrollToCard(index);
    if (!isPaused) startAutoplay();
  }

  function updateDots() {
    dots.forEach((dot, i) => dot.classList.toggle('active', i === activeIndex));
    cards.forEach((card, i) => card.classList.toggle('is-active', i === activeIndex));

    if (prevBtn) prevBtn.classList.toggle('is-hidden', activeIndex === 0);
    if (nextBtn) nextBtn.classList.toggle('is-hidden', activeIndex === cards.length - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(() => {
      if (isScrolling) return;
      if (activeIndex + 1 >= cards.length) scrollToCard(0);
      else scrollToCard(activeIndex + 1);
    }, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = null;
  }

  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.innerHTML = isPaused
        ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
        : '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>';
      pauseBtn.setAttribute('aria-label', isPaused ? 'Воспроизвести' : 'Пауза');
      if (isPaused) stopAutoplay();
      else startAutoplay();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      manualGoTo(Math.min(activeIndex + 1, cards.length - 1));
    });
  }
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      manualGoTo(Math.max(activeIndex - 1, 0));
    });
  }

  updateEdgePadding();
  updateDots();
  startAutoplay();

  window.addEventListener('resize', () => {
    updateEdgePadding();
    scrollToCard(activeIndex);
  });
}

initTestimonials();

function initFirstScrollHeroReveal() {
  const hero = document.querySelector('.hero');
  if (!hero) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = [
    hero.querySelector('.eyebrow'),
    hero.querySelector('h1'),
    hero.querySelector('.hero__lead'),
    hero.querySelector('.hero__form'),
    hero.querySelector('.hero__image')
  ].filter(Boolean);

  targets.forEach((element, index) => {
    element.classList.add('first-scroll-item');
    if (element.classList.contains('hero__image')) element.classList.add('first-scroll-image');
    element.style.setProperty('--first-scroll-delay', `${index * 110}ms`);
  });

  let revealed = false;

  function revealHero() {
    if (revealed) return;
    revealed = true;
    targets.forEach(element => element.classList.add('is-visible'));
    window.removeEventListener('scroll', revealHero);
    window.removeEventListener('wheel', revealHero);
    window.removeEventListener('touchmove', revealHero);
    window.removeEventListener('keydown', handleKeydown);
  }

  function handleKeydown(event) {
    if (['ArrowDown', 'PageDown', ' ', 'End'].includes(event.key)) revealHero();
  }

  if (reduceMotion || window.scrollY > 4) {
    revealHero();
    return;
  }

  window.addEventListener('scroll', revealHero, { passive: true });
  window.addEventListener('wheel', revealHero, { passive: true });
  window.addEventListener('touchmove', revealHero, { passive: true });
  window.addEventListener('keydown', handleKeydown);
}

initFirstScrollHeroReveal();

function initEstimateQuiz() {
  const form = document.getElementById('quizForm');
  if (!form) return;

  const steps = Array.from(form.querySelectorAll('[data-quiz-step]'));
  const progress = document.getElementById('quizProgress');
  const counter = document.getElementById('quizCounter');
  let currentStep = 0;
  let transitionTimer = null;

  function updateQuiz({ moveFocus = false } = {}) {
    steps.forEach((step, index) => {
      const isActive = index === currentStep;
      step.hidden = !isActive;
      step.classList.toggle('is-active', isActive);
    });

    if (progress) progress.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
    if (counter) counter.textContent = `Шаг ${currentStep + 1} из ${steps.length}`;

    if (moveFocus) {
      const legend = steps[currentStep].querySelector('legend');
      if (legend) {
        legend.tabIndex = -1;
        legend.focus({ preventScroll: true });
      }
    }
  }

  form.addEventListener('change', (event) => {
    const selected = event.target;
    const activeStep = steps[currentStep];
    const shouldAdvance = selected?.matches?.('input[type="radio"]')
      && activeStep.contains(selected)
      && currentStep < steps.length - 1;

    if (shouldAdvance) {
      if (transitionTimer) window.clearTimeout(transitionTimer);
      transitionTimer = window.setTimeout(() => {
        currentStep += 1;
        updateQuiz({ moveFocus: true });
        transitionTimer = null;
      }, 180);
    }
  });

  form.querySelectorAll('.quiz-back').forEach(button => {
    button.addEventListener('click', () => {
      currentStep = Math.max(currentStep - 1, 0);
      updateQuiz({ moveFocus: true });
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const name = form.querySelector('input[name="name"]').value.trim();
    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Отправляем…';
    }
    setTimeout(() => {
      if (status) {
        status.textContent = name
          ? `Спасибо, ${name}! Мы получили ваши ответы и свяжемся с вами.`
          : 'Спасибо! Мы получили ваши ответы и свяжемся с вами.';
        status.classList.add('is-visible');
      }
      form.reset();
      currentStep = 0;
      updateQuiz();
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Получить расчёт';
      }
      if (status) {
        setTimeout(() => {
          status.textContent = '';
          status.classList.remove('is-visible');
        }, 6000);
      }
    }, 800);
  });

  updateQuiz();
}

initEstimateQuiz();

function initProjectGalleries() {
  const extraProjectImages = [
    'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1600566752229-250ed79470f8?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&h=900&fit=crop',
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&h=900&fit=crop'
  ];

  document.querySelectorAll('[data-work-project]').forEach((project, projectIndex) => {
    const mainImage = project.querySelector('.work-project__main');
    const buttons = project.querySelectorAll('[data-project-position]');
    if (!mainImage || !buttons.length) return;

    const primaryImage = getComputedStyle(project).getPropertyValue('--project-image').trim();
    const normalizeProjectImage = image => image.replace('w=1200&h=900', 'w=1200&h=900');
    const normalizedPrimaryImage = normalizeProjectImage(primaryImage);
    const galleryImages = [
      normalizedPrimaryImage,
      `url('${normalizeProjectImage(extraProjectImages[(projectIndex * 2) % extraProjectImages.length])}')`,
      `url('${normalizeProjectImage(extraProjectImages[(projectIndex * 2 + 1) % extraProjectImages.length])}')`
    ];
    mainImage.style.backgroundImage = normalizedPrimaryImage;

    buttons.forEach((button, imageIndex) => {
      const image = galleryImages[imageIndex] || normalizedPrimaryImage;
      button.style.backgroundImage = image;
      button.addEventListener('click', () => {
        mainImage.style.backgroundImage = image;
        mainImage.style.backgroundPosition = 'center';
        buttons.forEach(item => item.classList.toggle('is-active', item === button));
      });
    });
  });
}

initProjectGalleries();

function initScrollReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const groups = [
    { selector: '.subhero--materials .subhero__inner',
    variant: 'reveal-up'},
    { selector: '.materials-catalog .materials-group__head',
      variant: 'reveal-left' },
    { selector: '.materials-catalog .materials-options article',
      variant: 'reveal-up' },
    { selector: '.materials-catalog .hardware-grid article',
      variant: 'reveal-up' },
    { selector: '.projects h2, .projects .section-lead, .link-more', variant: 'reveal-up' },
    { selector: '.materials-intro .eyebrow, .materials-intro h1, .materials-intro__lead',
      variant: 'reveal-up' },
    { selector: '.project-card, .projects__grid--full > *', variant: 'reveal-up' },
    { selector: '.case-study__heading, .case-study__main-photo, .case-study__gallery > *, .case-study__content', variant: 'reveal-up' },
    { selector: '.materials__heading, .material-card', variant: 'reveal-up' },
    { selector: '.process h2, .process .section-lead', variant: 'reveal-left' },
    { selector: '.process__item', variant: 'reveal-up' },
    { selector: '.about__title, .about__subtitle, .about__photo', variant: 'reveal-left' },
    { selector: '.about__content', variant: 'reveal-right' },
    { selector: '.experience .about__photo', variant: 'reveal-left' },
    { selector: '.experience .about__content', variant: 'reveal-right' },
    { selector: '.production h2, .production__lead', variant: 'reveal-left' },
    { selector: '.production__photo', variant: 'reveal-scale' },
    { selector: '.service__content h2, .service__lead, .service__step, .service__link', variant: 'reveal-up' },
    { selector: '.service__photo', variant: 'reveal-right' },
    { selector: '.showcase h2, .showcase__stage, .testimonials h2, .testimonials__stage', variant: 'reveal-up' },
    { selector: '.faq__intro, .faq__list, .estimate-quiz__intro, .quiz-form', variant: 'reveal-up' },
    { selector: '.subhero__inner, .cta__inner, .legal__content, .page-hero__image h1', variant: 'reveal-up' },
    { selector: '.timeline__item, .legal__content h2, .legal__content p, .cooperation-step, .process-step, .category', variant: 'reveal-up' }
  ];

  const items = [];

  groups.forEach(({ selector, variant }) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (element.classList.contains('reveal-item')) return;
      element.classList.add('reveal-item', variant);
      element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 90}ms`);
      items.push(element);
    });
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    items.forEach(element => element.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px'
  });

  requestAnimationFrame(() => items.forEach(element => observer.observe(element)));
}

initScrollReveal();

const projectFilters = document.querySelector('.project-filters');
if (projectFilters) {
  const projects = [...document.querySelectorAll('[data-work-project]')];
  const selected = { type: 'all', wood: 'all' };
  const classify = (project) => {
    const text = project.textContent.toLowerCase();
    return { type: text.includes('гардероб') ? 'wardrobe' : (text.includes('кух') ? 'kitchen' : (text.includes('шкаф') || text.includes('хранен') ? 'storage' : 'other')), wood: text.includes('шпон') ? 'veneer' : (text.includes('массив') ? 'solid' : (text.includes('мдф') || text.includes('эмаль') ? 'mdf' : (text.includes('пластик') ? 'plastic' : 'other'))) };
  };
  const updateProjects = () => {
    let visible = 0;
    projects.forEach((project) => { const tags = classify(project); const matches = (selected.type === 'all' || tags.type === selected.type) && (selected.wood === 'all' || tags.wood === selected.wood); project.classList.toggle('is-hidden', !matches); if (matches) visible++; });
    const empty = document.querySelector('.project-filter-empty');
    if (empty) empty.hidden = visible !== 0;
  };
  projectFilters.addEventListener('click', (event) => { const button = event.target.closest('[data-filter-group]'); if (!button) return; const group = button.dataset.filterGroup; selected[group] = button.dataset.filter; projectFilters.querySelectorAll('[data-filter-group="' + group + '"]').forEach((item) => item.classList.toggle('is-active', item === button)); updateProjects(); });
  updateProjects();
}


/* ========== Cost Popup (unexpected moment) ========== */
(function initCostPopup() {
  const overlay = document.getElementById('costPopup');
  if (!overlay) return;

  const closeBtn = document.getElementById('popupClose');
  const form = document.getElementById('popupForm');
  const STORAGE_KEY = 'arthomey_popup_shown';

  // Не показываем повторно в этой сессии
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  let shown = false;
  let scrollTriggered = false;
  let timerTriggered = false;

  function openPopup() {
    if (shown) return;
    shown = true;
    sessionStorage.setItem(STORAGE_KEY, '1');
    overlay.classList.add('is-open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    // Фокус на первое поле
    setTimeout(() => {
      const firstInput = form && form.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 320);
  }

  function closePopup() {
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Закрытие
  if (closeBtn) closeBtn.addEventListener('click', closePopup);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePopup();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('is-open')) closePopup();
  });

  // Триггер 1: после 28 секунд на сайте
  setTimeout(() => {
    timerTriggered = true;
    if (!shown) openPopup();
  }, 28000);

  // Триггер 2: когда проскроллили ~48% страницы (неожиданно в середине)
  function onScroll() {
    if (shown) return;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const progress = scrollTop / docHeight;
    if (progress >= 0.48) {
      scrollTriggered = true;
      openPopup();
      window.removeEventListener('scroll', onScroll);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  // Обработка формы попапа
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.reportValidity()) return;

      const nameField = form.querySelector('input[name="name"]');
      const name = nameField ? nameField.value.trim() : '';
      const btn = form.querySelector('button[type="submit"]');
      const status = form.querySelector('.form-status');

      if (btn) {
        btn.disabled = true;
        btn.classList.add('is-loading');
        btn.textContent = 'Отправляем…';
      }

      setTimeout(() => {
        if (status) {
          status.textContent = name
            ? `Спасибо, ${name}! Мы свяжемся с вами в ближайшее время.`
            : 'Спасибо! Мы свяжемся с вами в ближайшее время.';
          status.classList.add('is-visible');
        }
        form.reset();
        if (btn) {
          btn.disabled = false;
          btn.classList.remove('is-loading');
          btn.textContent = 'Отправить заявку';
        }
        // Закрываем через 2.8 сек после успеха
        setTimeout(closePopup, 2800);
      }, 900);
    });
  }
})();

/* Shared footer for all inner pages */
(function initSharedFooter() {
  const footer = document.querySelector('.site-footer, .footer');
  if (!footer) return;
  footer.className = 'footer';
  footer.innerHTML = `<div class="container footer__inner footer__grid"><div class="footer__brand"><a href="index.html" class="logo"><img src="images/logo.png" alt="ART HOMEY — студия индивидуальной мебели"></a><p>Москва и область</p><small>Индивидуальная мебель в Москве и области</small></div><div><h3>Услуги</h3><a href="process.html">Этапы работы</a><a href="projects.html">Портфолио</a><a href="about.html">О нас и производство</a></div><div><h3>Покупателю</h3><a href="index.html#order">Бесплатная консультация</a><a href="materials.html">Материалы и фурнитура</a><a href="faq.html">Частые вопросы</a><a href="privacy.html">Политика конфиденциальности</a><a href="warranty.html">Гарантия</a></div><div class="footer__contacts"><h3>Контакты</h3><a href="tel:+79060561819">+7 906 056-18-19</a><a href="mailto:arthomey@yandex.ru">arthomey@yandex.ru</a><span>Ежедневно, 09:00–21:00</span></div></div><div class="container footer__bottom"><span>© 2026 ART HOMEY</span><a class="footer__legal-link" href="privacy.html">Политика конфиденциальности</a><span>Информация не является публичной офертой</span></div>`;
})();

(function initSharedMessengers() {
  if (document.querySelector('.desktop-messengers')) return;
  const node = document.createElement('div');
  node.className = 'desktop-messengers';
  node.setAttribute('aria-label', 'Написать в мессенджер');
  node.innerHTML = '<a href="https://wa.me/79060561819" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">WA</a><a href="https://t.me/arthomey" target="_blank" rel="noopener noreferrer" aria-label="Telegram">TG</a><a href="https://max.ru/u/f9LHodD0cOIM9zp4Ho-Bn4nSWSp5nrVu4DwpDjRow3obhmcMdmAD5RWX0Aw" target="_blank" rel="noopener noreferrer" aria-label="MAX">MAX</a>';
  document.body.appendChild(node);
})();

(function initBuyerMenu() {
  document.querySelectorAll('.nav').forEach((nav) => {
    if (nav.querySelector('.nav-tree')) return;
    const item = document.createElement('div');
    item.className = 'nav-tree';
    item.innerHTML = `<button class="nav-tree__trigger" type="button" aria-expanded="false">Покупателю <span>⌄</span></button><ul class="nav-tree__menu"><li><a href="index.html#order">Бесплатная консультация</a></li><li><a href="materials.html">Материалы и фурнитура</a></li><li><a href="faq.html">Частые вопросы</a></li><li><a href="privacy.html">Политика конфиденциальности</a></li><li><a href="warranty.html">Гарантия</a></li></ul>`;
    nav.insertBefore(item, nav.querySelector('.nav__cta') || null);
    const trigger = item.querySelector('.nav-tree__trigger');
    trigger.addEventListener('click', () => {
      const open = item.classList.toggle('is-open');
      trigger.setAttribute('aria-expanded', String(open));
    });
  });
})();

(function moveConsultationAction() {
  document.querySelectorAll('.nav__cta').forEach((link) => link.remove());
  const rail = document.querySelector('.desktop-messengers');
  if (!rail || rail.querySelector('.messenger-consultation')) return;
  const link = document.createElement('a');
  link.className = 'messenger-consultation';
  link.href = 'index.html#order';
  link.setAttribute('aria-label', 'Позвонить и получить консультацию');
  link.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="currentColor" d="M6.6 2.5 9.2 2c.6-.1 1.1.2 1.3.8l1.2 3.1c.2.5 0 .9-.4 1.2L9.8 8.3a14.8 14.8 0 0 0 5.9 5.9l1.2-1.5c.3-.4.8-.6 1.2-.4l3.1 1.2c.6.2.9.7.8 1.3l-.5 2.6c-.1.7-.7 1.1-1.4 1.1C11.4 18.5 5.5 12.6 5.5 5.9c0-.7.4-1.3 1.1-1.4Z"/></svg>';
  rail.insertBefore(link, rail.firstChild);
})();


/* Header solid on scroll (Mr.Doors style) */
(function initHeaderScroll() {
  const header = document.querySelector('.header');
  if (!header) return;
  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
