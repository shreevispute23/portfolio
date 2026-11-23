/**
 * Stats / "Impact in numbers" band. Self-contained, < 4 KB.
 * Only animates transform, opacity and clip-path; IntersectionObserver + rAF.
 *
 * On first view (25% visible, once): band scales/fades in, cards rise with a stagger
 * (all via CSS once `in-view` is set), numbers count up over 1.6s, the dot grid waves.
 * Desktop: cursor spotlight + up to 4deg tilt per card. The drifting blob pauses off screen.
 * Reduced motion: final numbers, dots filled, a quick fade, no tilt/spotlight/blob.
 * Numbers are server-rendered to their final value, so if this script never runs the
 * figures are still correct and everything stays visible.
 */
import { prefersReduced, finePointer } from './env.js';

export function initImpact() {
  const section = document.querySelector('[data-impact]');
  if (!section) return;
  const band = section.querySelector('[data-impact-band]');
  const dots = section.querySelector('[data-dots]');
  const nums = [...section.querySelectorAll('[data-count]')];
  const reduced = prefersReduced();
  const fine = finePointer();

  const runCount = (el) => {
    const to = Number(el.getAttribute('data-count')) || 0;
    const digits = el.querySelector('[data-digits]');
    if (!digits) return;
    if (reduced) {
      digits.textContent = String(to);
      return;
    }
    digits.textContent = '0';
    const dur = 1600;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      digits.textContent = String(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  let revealed = false;
  const reveal = () => {
    if (revealed) return;
    revealed = true;
    band.classList.add('in-view');
    if (dots) dots.classList.add('dots-on');
    nums.forEach(runCount);
  };

  if (reduced || !('IntersectionObserver' in window)) {
    band.classList.add('in-view', 'is-reduced');
    if (dots) dots.classList.add('dots-on');
    nums.forEach(runCount);
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          band.classList.toggle('is-visible', e.isIntersecting); // gates the blob
          if (e.intersectionRatio >= 0.25) reveal();
        });
      },
      { threshold: [0, 0.25] },
    );
    io.observe(section);

    // Replay the dot wave on hover (desktop).
    if (dots && fine) {
      const card = dots.closest('[data-stat-card]');
      card?.addEventListener('pointerenter', () => {
        dots.classList.remove('dots-on');
        void dots.offsetWidth; // restart the staggered transitions
        dots.classList.add('dots-on');
      });
    }

    // Cursor spotlight + gentle 3D tilt (desktop only).
    if (fine) {
      section.querySelectorAll('[data-tilt-inner]').forEach((inner) => {
        let frame = 0;
        inner.addEventListener('pointermove', (ev) => {
          if (frame) return;
          frame = requestAnimationFrame(() => {
            frame = 0;
            const r = inner.getBoundingClientRect();
            const px = (ev.clientX - r.left) / r.width;
            const py = (ev.clientY - r.top) / r.height;
            inner.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
            inner.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
            inner.style.setProperty('--rx', `${((0.5 - py) * 8).toFixed(2)}deg`);
            inner.style.setProperty('--ry', `${((px - 0.5) * 8).toFixed(2)}deg`);
            inner.classList.add('lit');
          });
        });
        inner.addEventListener('pointerleave', () => {
          inner.style.setProperty('--rx', '0deg');
          inner.style.setProperty('--ry', '0deg');
          inner.classList.remove('lit');
        });
      });
    }
  }
}
