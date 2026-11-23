/**
 * Count-up figures. A [data-count] element whose text begins with a number (e.g. "15+")
 * animates from 0 to that number over 1.2s with an ease-out curve when it enters view,
 * keeping any suffix. Screen readers get the final value; reduced motion shows it as-is.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

function prepareCount(el) {
  // An explicit target wins; otherwise read it from the visible text.
  const text = (el.textContent ?? '').trim();
  const attr = el.getAttribute('data-count');
  const source = attr && attr.trim() ? attr.trim() : text;
  const match = source.match(/^(\d+)(.*)$/);
  if (!match) return false;

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

function runCount(el) {
  const to = Number(el.dataset.countTo);
  const suffix = el.dataset.countSuffix ?? '';
  const display = el.querySelector('[data-count-display]');
  if (!Number.isFinite(to) || !display) return;
  const duration = 1200;
  const start = performance.now();
  const step = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3); // ease-out
    display.textContent = `${Math.round(to * eased)}${suffix}`;
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export function initCounters() {
  const els = [...document.querySelectorAll('[data-count]')];
  if (!els.length) return;
  // Reduced motion / no observer: leave the final figure in place.
  if (reduceMotion.matches || !('IntersectionObserver' in window)) return;

  const prepared = els.filter(prepareCount);
  if (!prepared.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        runCount(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
  );
  prepared.forEach((el) => observer.observe(el));
}
