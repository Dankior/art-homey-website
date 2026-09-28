(() => {
  const targets = [...document.querySelectorAll('.project-card .slider__slide img, .case-study__main-photo, .case-study__gallery > div, .work-project__main, .service__photo, .production-photos img')];
  if (!targets.length) return;
  const dialog = document.createElement('dialog');
  dialog.className = 'photo-viewer';
  dialog.setAttribute('aria-label', 'Просмотр фотографий');
  dialog.innerHTML = '<button type="button" class="photo-viewer__close" aria-label="Закрыть просмотр" autofocus>×</button><button type="button" class="photo-viewer__prev" aria-label="Предыдущее фото">‹</button><figure><img alt=""><figcaption aria-live="polite"></figcaption></figure><button type="button" class="photo-viewer__next" aria-label="Следующее фото">›</button>';
  document.body.append(dialog);
  const image = dialog.querySelector('img'), caption = dialog.querySelector('figcaption');
  const prev = dialog.querySelector('.photo-viewer__prev'), next = dialog.querySelector('.photo-viewer__next');
  let photos = [], current = 0, trigger, oldOverflow;
  const source = el => el.tagName === 'IMG' ? el.currentSrc || el.src : (getComputedStyle(el).backgroundImage.match(/url\(["']?(.*?)["']?\)/)?.[1]);
  const info = el => ({src: source(el), alt: el.alt || el.getAttribute('aria-label') || 'Фото проекта ART HOMEY'});
  function show(n) {
    current = (n + photos.length) % photos.length;
    image.src = photos[current].src; image.alt = photos[current].alt;
    caption.textContent = `${photos[current].alt} · ${current + 1} / ${photos.length}`;
    prev.hidden = next.hidden = photos.length < 2;
  }
  function open(el) {
    trigger = el;
    const project = el.closest('[data-work-project]');
    const group = el.closest('.project-card, .case-study__visual, .production-photos');
    photos = project ? [...project.querySelectorAll('[data-project-image]')].map(b => ({src:b.dataset.projectImage, alt:b.getAttribute('aria-label')})) : group ? [...group.querySelectorAll('.slider__slide img, .case-study__main-photo, .case-study__gallery > div, .production-photos img')].map(info) : [info(el)];
    photos = photos.filter(p => p.src);
    if (!photos.length) return;
    const selected = source(el);
    const n = photos.findIndex(p => new URL(p.src, location.href).href === new URL(selected, location.href).href);
    show(Math.max(0,n)); oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; dialog.showModal();
  }
  targets.forEach(el => {
    el.classList.add('photo-zoomable'); el.tabIndex = 0; el.setAttribute('role','button');
    const label = el.alt || el.getAttribute('aria-label') || 'Фото проекта';
    el.setAttribute('aria-label', label); el.setAttribute('aria-haspopup','dialog');
    el.addEventListener('click', () => open(el));
    el.addEventListener('keydown', e => {if (e.key === 'Enter' || e.key === ' ') {e.preventDefault(); open(el);}});
  });
  dialog.querySelector('.photo-viewer__close').onclick = () => dialog.close();
  prev.onclick = () => show(current-1); next.onclick = () => show(current+1);
  dialog.addEventListener('click', e => {if(e.target === dialog) dialog.close();});
  dialog.addEventListener('keydown', e => {if(e.key === 'ArrowLeft') {e.preventDefault();show(current-1);} if(e.key === 'ArrowRight') {e.preventDefault();show(current+1);}});
  dialog.addEventListener('close', () => {document.body.style.overflow = oldOverflow;trigger?.focus({preventScroll:true});});
})();
