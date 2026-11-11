/* Scroll reveal (hierarchy: content enters in reading order) and image lightbox. */
(() => {
  const els = [...document.querySelectorAll('[data-r]')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
  } else {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      io.unobserve(e.target);
    }), { threshold: .1, rootMargin: '0px 0px -5% 0px' });
    els.forEach(e => io.observe(e));
  }

  document.addEventListener('click', e => {
    const img = e.target.closest('.gal img');
    if (!img) return;
    const lb = document.createElement('div');
    lb.className = 'lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-label', 'Image preview');
    lb.innerHTML = '<img alt="">';
    lb.firstChild.src = img.src;
    lb.firstChild.alt = img.alt;
    const close = () => { lb.remove(); document.removeEventListener('keydown', k); };
    const k = ev => { if (ev.key === 'Escape') close(); };
    lb.addEventListener('click', close);
    document.addEventListener('keydown', k);
    document.body.appendChild(lb);
  });
})();
