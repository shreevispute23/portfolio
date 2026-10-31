/**
 * Motion and small enhancements shared by every page. Everything stays visible and usable
 * without JavaScript, and motion is skipped for visitors who prefer reduced motion.
 *
 *  data-reveal   fade and rise when scrolled into view
 *  data-mask     image frame opens from a smaller rounded mask while the image settles
 *  data-split    headline words slide up from behind a mask, one after another
 *  data-count    a figure such as "15+" counts up once
 *  data-magnetic a button eases toward the pointer
 *  img[data-fade] images fade in once loaded, with an "unavailable" state if they fail
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');

/* ---------- Split headlines ---------- */
function splitWords(el: HTMLElement) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = 'true';
  const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  let index = 0;

  const build = (source: Node, target: Node, topLevel: boolean) => {
    source.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        (node.textContent ?? '').split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            target.appendChild(document.createTextNode(' '));
            return;
          }
          const outer = document.createElement('span');
          outer.className = 'split-w';
          if (topLevel) outer.setAttribute('aria-hidden', 'true');
          const inner = document.createElement('span');
          inner.className = 'split-i';
          inner.style.setProperty('--i', String(index++));
          inner.textContent = part;
          outer.appendChild(inner);
          target.appendChild(outer);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = (node as Element).cloneNode(false) as HTMLElement;
        clone.removeAttribute('id');
        if (topLevel) clone.setAttribute('aria-hidden', 'true');
        build(node, clone, false);
        target.appendChild(clone);
      }
    });
  };

  const fragment = document.createDocumentFragment();
  const readable = document.createElement('span');
  readable.className = 'visually-hidden';
  readable.textContent = label;
  fragment.appendChild(readable);
  build(el, fragment, true);
  el.replaceChildren(fragment);
}

/* ---------- Count-up figures ---------- */
function prepareCount(el: HTMLElement) {
  const text = (el.textContent ?? '').trim();
  const match = text.match(/^(\d+)(.*)$/);
  if (!match) return false;
  // Screen readers get the final figure; the animated copy is hidden from them.
  const readable = document.createElement('span');
  readable.className = 'visually-hidden';
  readable.textContent = text;
  const display = document.createElement('span');
  display.setAttribute('aria-hidden', 'true');
  display.dataset.countDisplay = '';
  display.textContent = `0${match[2]}`;
  el.replaceChildren(readable, display);
  el.dataset.countTo = match[1];
  el.dataset.countSuffix = match[2];
  return true;
}

function runCount(el: HTMLElement) {
  const to = Number(el.dataset.countTo);
  const suffix = el.dataset.countSuffix ?? '';
  const display = el.querySelector<HTMLElement>('[data-count-display]');
  if (!Number.isFinite(to) || !display) return;
  const duration = 1100 + Math.min(900, to * 6);
  const start = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    display.textContent = `${Math.round(to * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* ---------- Scroll-triggered states ---------- */
function show(el: HTMLElement) {
  if (el.classList.contains('is-visible')) return;
  el.classList.add('is-visible');
  if (el.dataset.countTo) runCount(el);
  if (el.hasAttribute('data-mask')) {
    // Drop the mask once it has opened, so focus outlines and hover shadows are never clipped.
    const done = () => el.classList.add('mask-done');
    el.addEventListener('transitionend', (event) => event.propertyName === 'clip-path' && done(), { once: true });
    window.setTimeout(done, 1500);
  }
}

function initScrollStates() {
  const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal], [data-mask], [data-split], [data-count]')];

  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  targets.forEach((el) => {
    if (el.hasAttribute('data-split')) splitWords(el);
    if (el.hasAttribute('data-count') && !prepareCount(el)) el.removeAttribute('data-count');
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target as HTMLElement);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  targets.forEach((el) => observer.observe(el));

  const revealAll = () => targets.forEach(show);
  window.addEventListener('beforeprint', revealAll);

  // Content reached through an in-page link (e.g. #experience-fotoowl) is shown straight away.
  const revealTarget = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    [target, ...target.querySelectorAll<HTMLElement>('[data-reveal], [data-mask], [data-split], [data-count]')].forEach(show);
  };
  window.addEventListener('hashchange', revealTarget);
  revealTarget();
}

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

initScrollStates();
initMagnetic();
initImages();
