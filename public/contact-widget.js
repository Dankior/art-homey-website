(() => {
  const widget = document.getElementById('contact-widget');
  if (!widget) return;
  const toggle = widget.querySelector('summary');
  const panel = widget.querySelector('nav');
  const sync = () => {
    toggle.setAttribute('aria-expanded', String(widget.open));
    toggle.setAttribute('aria-label', widget.open ? 'Закрыть способы связи' : 'Открыть способы связи');
  };
  function close(restoreFocus) {
    if (!widget.open) return;
    widget.open = false;
    sync();
    if (restoreFocus) toggle.focus({preventScroll:true});
  }
  widget.addEventListener('toggle',sync);
  document.addEventListener('pointerdown',event => {
    if (!widget.contains(event.target)) close(widget.contains(document.activeElement));
  });
  document.addEventListener('keydown',event => {
    if (event.key === 'Escape' && widget.open) { event.preventDefault(); close(true); }
  });
  document.addEventListener('focusin',event => { if (!widget.contains(event.target)) close(false); });
  panel.addEventListener('click',event => { if (event.target.closest('a')) close(true); });
  sync();
})();
