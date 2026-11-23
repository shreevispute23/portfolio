/**
 * Scroll reveals for everything below the hero.
 *
 *   data-reveal              fade-up (default); variants: fade-in, scale-in, mask-up
 *   data-reveal-group        auto-staggers its [data-reveal] children by --stagger, capped at 6
 *   data-split               headline words rise from a mask; a two-part heading's grey
 *                            second half (.tone) fades in just after the black half
 *   data-mask                an image frame opens from a rounded mask
 *
 * Reveals run once, when ~15% of the element is in view. Content is fully visible
 * without JavaScript (the initial hidden state needs the .js class on <html>), and
 * reduced motion shows everything immediately.
 */
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

/** Wrap each word of a headline in spans so it can slide up line by line. */
function splitWords(el) {
  if (el.dataset.splitDone) return;
  el.dataset.splitDone = 'true';
  const label = (el.textContent ?? '').replace(/\s+/g, ' ').trim();
  let index = 0;

  const build = (source, target, topLevel, tone) => {
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
          inner.className = tone ? 'split-i is-tone' : 'split-i';
          inner.style.setProperty('--i', String(index++));
          inner.textContent = part;
          outer.appendChild(inner);
          target.appendChild(outer);
        });
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const clone = node.cloneNode(false);
        clone.removeAttribute('id');
        if (topLevel) clone.setAttribute('aria-hidden', 'true');
        const isTone = tone || (node.classList && node.classList.contains('tone'));
        build(node, clone, false, isTone);
        target.appendChild(clone);
      }
    });
  };

  const fragment = document.createDocumentFragment();
  const readable = document.createElement('span');
  readable.className = 'visually-hidden';
  readable.textContent = label;
  fragment.appendChild(readable);
  build(el, fragment, true, false);
  el.replaceChildren(fragment);
}

function show(el) {
  if (el.classList.contains('is-visible')) return;
  el.classList.add('is-visible');
  if (el.hasAttribute('data-mask')) {
    // Drop the clip once it has opened so focus rings and hover shadows are never clipped.
    const done = () => el.classList.add('mask-done');
    el.addEventListener('transitionend', (event) => event.propertyName === 'clip-path' && done(), { once: true });
    window.setTimeout(done, 1500);
  }
}

export function initReveal() {
  const targets = [...document.querySelectorAll('[data-reveal], [data-mask], [data-split]')];
  if (!targets.length) return;

  // Auto-stagger direct reveal children of a group (70ms steps, max 6 per batch).
  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    const items = [...group.querySelectorAll('[data-reveal]')].filter(
      (item) => item.closest('[data-reveal-group]') === group,
    );
    items.forEach((item, i) => {
      if (!item.style.getPropertyValue('--reveal-delay')) {
        item.style.setProperty('--reveal-delay', `calc(${i % 6} * var(--stagger))`);
      }
    });
  });

  // No motion, or no observer: reveal everything up front.
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    targets.forEach((el) => {
      if (el.hasAttribute('data-split')) splitWords(el);
      el.classList.add('is-visible');
    });
    return;
  }

  targets.forEach((el) => {
    if (el.hasAttribute('data-split')) splitWords(el);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        show(entry.target);
        observer.unobserve(entry.target); // once only; never re-runs on scroll up
      });
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.15 },
  );
  targets.forEach((el) => observer.observe(el));

  window.addEventListener('beforeprint', () => targets.forEach(show));

  // Content reached by an in-page link is shown straight away.
  const revealTarget = () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    [target, ...target.querySelectorAll('[data-reveal], [data-mask], [data-split]')].forEach(show);
  };
  window.addEventListener('hashchange', revealTarget);
  revealTarget();
}
