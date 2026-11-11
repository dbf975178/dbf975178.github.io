(() => {
  const root = document.documentElement;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];

  /* Tampa clock */
  const clock = $('[data-clock]');
  const tick = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' }).format(new Date());
  };
  tick(); setInterval(tick, 20000);

  /* Counters */
  const countUp = el => {
    const to = +el.dataset.to, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = to + suf; return; }
    const t0 = performance.now(), dur = 1400;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 4))) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* Reveal on scroll */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    $$('[data-to]', e.target).forEach(countUp);
    io.unobserve(e.target);
  }), { threshold: .15 });
  const arm = () => $$('.reveal').forEach(el => io.observe(el));

  /* Curtain intro */
  const curtain = $('.curtain');
  const counter = $('[data-count]');
  const finish = () => {
    root.classList.add('ready');
    arm();
  };
  if (!curtain || reduce) { if (curtain) curtain.classList.add('gone'); finish(); }
  else {
    let n = 0;
    const iv = setInterval(() => {
      n = Math.min(100, n + Math.ceil(Math.random() * 9 + 3));
      counter.textContent = String(n).padStart(2, '0');
      if (n >= 100) {
        clearInterval(iv);
        setTimeout(() => {
          curtain.classList.add('open');
          setTimeout(finish, 450);
          setTimeout(() => curtain.classList.add('gone'), 1300);
        }, 200);
      }
    }, 55);
  }

  /* Spotlight follows pointer */
  const spot = $('.spot');
  addEventListener('pointermove', e => {
    spot.style.setProperty('--mx', e.clientX + 'px');
    spot.style.setProperty('--my', e.clientY + 'px');
  }, { passive: true });

  /* Custom cursor + magnetic buttons (fine pointers only) */
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !reduce) {
    const cur = $('.cursor');
    let cx = 0, cy = 0, tx = 0, ty = 0;
    addEventListener('pointermove', e => { tx = e.clientX; ty = e.clientY; }, { passive: true });
    (function loop() {
      cx += (tx - cx) * .22; cy += (ty - cy) * .22;
      cur.style.transform = `translate(${cx}px,${cy}px)`;
      requestAnimationFrame(loop);
    })();
    $$('a, .btn').forEach(a => {
      a.addEventListener('pointerenter', () => cur.classList.add('big'));
      a.addEventListener('pointerleave', () => cur.classList.remove('big'));
    });
    $$('.magnetic').forEach(b => {
      b.addEventListener('pointermove', e => {
        const r = b.getBoundingClientRect();
        b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .25}px,${(e.clientY - r.top - r.height / 2) * .35}px)`;
      });
      b.addEventListener('pointerleave', () => { b.style.transform = ''; });
    });
  }
})();

/* lightbox */
document.addEventListener('click',e=>{
  const img=e.target.closest('.gal img');if(!img)return;
  const lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-label','Image preview');
  lb.innerHTML='<img alt="">';lb.firstChild.src=img.src;lb.firstChild.alt=img.alt;
  const close=()=>{lb.remove();document.removeEventListener('keydown',k)};
  const k=ev=>{if(ev.key==='Escape')close()};
  lb.addEventListener('click',close);document.addEventListener('keydown',k);document.body.appendChild(lb);
});
