/* Progressive enhancement: existing articles remain available if the CMS is offline. */
(async () => {
  const targets = [...document.querySelectorAll('[data-journal-latest]')];
  if (!targets.length) return;
  function localUrl(value) {
    const url = new URL(value, location.origin);
    if (url.origin !== location.origin || !url.pathname.startsWith('/journal/')) throw new Error('Unexpected article URL');
    return url.href;
  }
  try {
    const response = await fetch('/journal/?rest_route=/art-homey/v1/articles', {signal: AbortSignal.timeout(5000)});
    if (!response.ok) return;
    const posts = await response.json();
    if (!Array.isArray(posts) || !posts.length) return;
    const cards = posts.slice(0, 3).map(post => {
      if (typeof post.title !== 'string' || typeof post.excerpt !== 'string' || typeof post.url !== 'string') throw new Error('Invalid article');
      const url = localUrl(post.url);
      const card = document.createElement('article'); card.className = 'advice-card';
      const heading = document.createElement('h3'); const title = document.createElement('a');
      title.href = url; title.textContent = post.title; heading.append(title);
      const excerpt = document.createElement('p'); excerpt.textContent = post.excerpt;
      const link = document.createElement('a'); link.className = 'advice-card__link'; link.href = url; link.textContent = 'Читать статью →';
      card.append(heading, excerpt, link); return card;
    });
    for (const target of targets) {
      target.replaceChildren(...cards.map(card => card.cloneNode(true)));
      const section = target.closest('[data-journal-section]'); if (section) section.hidden = false;
    }
  } catch { /* Keep the static fallback on timeout, invalid data or unavailable WordPress. */ }
})();
