/**
 * Shared motion state. The boot script (in BaseLayout) has already decided the mode and
 * set classes on <html>: `js-ready`, optional `reduce-motion`, optional `force-motion`.
 * Modules read from here so there is one source of truth and ?motion=on works everywhere.
 */
export const html = document.documentElement;

/** True when the visitor prefers reduced motion and full motion was not forced. */
export const prefersReduced = () => html.classList.contains('reduce-motion');

/** Fine pointer only (used to gate cursor/hover effects off touch). */
export const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

/** Tell the boot's failsafe that the modules ran, so it will not force-reveal. */
export function markMotionRan() {
  html.classList.add('motion-ran');
}
