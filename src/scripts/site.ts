/**
 * Small enhancements not yet moved into src/scripts/motion/. Everything stays usable
 * without JavaScript, and motion is skipped for visitors who prefer reduced motion.
 *
 *  data-magnetic a button eases toward the pointer
 *  data-tilt     a card tilts gently toward the pointer (fine pointers only)
 *  data-to-top   a floating control that appears past the first screen and returns to the top
 *  img[data-fade] images fade in once loaded, with an "unavailable" state if they fail
 *
 *  Scroll reveals, headline splits and count-up figures now live in src/scripts/motion/.
 *  The reading-progress bar is CSS-driven where scroll timelines exist, with the JS
 *  fallback below otherwise.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ---------- Magnetic buttons ---------- */
function initMagnetic() {
  document.querySelectorAll<HTMLElement>('[data-magnetic]').forEach((el) => {
    let frame = 0;
    el.addEventListener('pointermove', (event) => {
      if (!finePointer.matches || reduceMotion.matches || frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const x = (event.clientX - rect.left - rect.width / 2) * 0.22;
        const y = (event.clientY - rect.top - rect.height / 2) * 0.3;
        el.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
      });
    });
    el.addEventListener('pointerleave', () => {
      el.style.translate = '';
    });
  });
}

/* ---------- Image loading states ---------- */
function initImages() {
  document.querySelectorAll<HTMLImageElement>('img[data-fade]').forEach((img) => {
    const done = () => img.classList.add('is-loaded');
    const fail = () => {
      img.classList.add('is-loaded');
      img.closest('.media-frame')?.classList.add('is-broken');
    };
    if (img.complete) {
      if (img.naturalWidth > 0) done();
      else fail();
      return;
    }
    img.addEventListener('load', done, { once: true });
    img.addEventListener('error', fail, { once: true });
  });
}

/* ---------- Reading progress (fallback for browsers without scroll-timeline) ---------- */
function initScrollProgress() {
  const bar = document.querySelector<HTMLElement>('.scroll-progress');
  if (!bar || reduceMotion.matches) return;
  const nativeTimeline =
    typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && CSS.supports('animation-timeline: scroll()');
  if (nativeTimeline) return;

  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    bar.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
  };
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}

/* ---------- Back-to-top ---------- */
function initToTop() {
  const btn = document.querySelector<HTMLButtonElement>('[data-to-top]');
  if (!btn) return;
  btn.hidden = false;
  let ticking = false;
  const update = () => {
    ticking = false;
    btn.classList.toggle('is-shown', window.scrollY > window.innerHeight * 0.9);
  };
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    },
    { passive: true },
  );
  update();
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
  });
}

/* ---------- Pointer tilt (fine pointer only) ---------- */
function initTilt() {
  if (!finePointer.matches || reduceMotion.matches) return;
  document.querySelectorAll<HTMLElement>('[data-tilt]').forEach((el) => {
    let frame = 0;
    el.addEventListener('pointermove', (event) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const rect = el.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        el.style.transform = `perspective(900px) rotateX(${(-py * 5).toFixed(2)}deg) rotateY(${(px * 5).toFixed(
          2,
        )}deg) translateY(-3px)`;
      });
    });
    el.addEventListener('pointerleave', () => {
      el.style.transform = '';
    });
  });
}

/* ---------- Home work-grid filter tabs ---------- */
function initWorkTabs() {
  const root = document.querySelector<HTMLElement>('[data-work-tabs]');
  const grid = document.querySelector<HTMLElement>('[data-work-grid-home]');
  if (!root || !grid) return;
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('button[data-filter]')];
  const items = [...grid.querySelectorAll<HTMLElement>(':scope > li')];
  const status = root.querySelector<HTMLElement>('[data-tab-status]');

  const apply = (value: string) => {
    const filter = buttons.some((b) => b.dataset.filter === value) ? value : 'all';
    let shown = 0;
    items.forEach((item) => {
      const match = filter === 'all' || (item.dataset.group ?? '').split(' ').includes(filter);
      item.hidden = !match;
      if (match) shown++;
    });
    buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filter === filter)));
    if (status) status.textContent = `Showing ${shown} ${shown === 1 ? 'project' : 'projects'}.`;
  };

  buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filter ?? 'all')));
}

initMagnetic();
initImages();
initScrollProgress();
initToTop();
initTilt();
initWorkTabs();
